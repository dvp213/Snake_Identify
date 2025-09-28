from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from sqlalchemy.orm import Session
from models import models
from models.database import get_db
from routers.auth import get_current_user, admin_required
import schemas.snake as schemas
import json
import base64
from typing import Dict, Any, Optional

router = APIRouter()

@router.post("/add-relation")
async def add_snake_relation(
    relation_data: Dict[str, Any],
    current_user: models.User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Add a relation between a main snake and a related snake"""
    try:
        # Validate input
        if not relation_data.get("snakeid") or not relation_data.get("relatedsnakeid"):
            raise HTTPException(
                status_code=400, 
                detail="Both snakeid and relatedsnakeid are required"
            )
        
        # Check if the IDs are the same
        if relation_data["snakeid"] == relation_data["relatedsnakeid"]:
            raise HTTPException(
                status_code=400,
                detail="A snake cannot be related to itself"
            )
        
        # Check if both snakes exist
        main_snake = db.query(models.Snake).filter(models.Snake.snakeid == relation_data["snakeid"]).first()
        related_snake = db.query(models.Snake).filter(models.Snake.snakeid == relation_data["relatedsnakeid"]).first()
        
        if not main_snake:
            raise HTTPException(status_code=404, detail=f"Main snake with ID {relation_data['snakeid']} not found")
        if not related_snake:
            raise HTTPException(status_code=404, detail=f"Related snake with ID {relation_data['relatedsnakeid']} not found")
        
        # Print debug info
        print(f"Adding relation: {main_snake.snakeenglishname} (ID: {main_snake.snakeid}, class: {main_snake.class_label}) -> " +
              f"{related_snake.snakeenglishname} (ID: {related_snake.snakeid}, class: {related_snake.class_label})")
        
        # Check if the relation already exists
        existing_relation = db.query(models.SnakeRelated).filter(
            models.SnakeRelated.snakeid == relation_data["snakeid"],
            models.SnakeRelated.relatedsnakeid == relation_data["relatedsnakeid"]
        ).first()
        
        if existing_relation:
            raise HTTPException(status_code=400, detail="This relation already exists")
        
        # Create the relation
        new_relation = models.SnakeRelated(
            snakeid=relation_data["snakeid"],
            relatedsnakeid=relation_data["relatedsnakeid"]
        )
        
        db.add(new_relation)
        db.commit()
        
        return {"message": "Relation added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/add-related-species", status_code=status.HTTP_201_CREATED)
async def add_related_species(
    snake_data: str = Form(...),
    image: UploadFile = File(...),
    parent_snake_id: int = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(admin_required)
):
    """Add a new related species (admin only)"""
    try:
        # Parse snake data
        data = json.loads(snake_data)
        
        # Check if the parent snake exists
        parent_snake = db.query(models.Snake).filter(models.Snake.snakeid == parent_snake_id).first()
        if not parent_snake:
            raise HTTPException(status_code=404, detail=f"Parent snake with ID {parent_snake_id} not found")
        
        # Read image data
        image_content = await image.read()
        
        # Determine image MIME type
        image_type = image.content_type or "image/jpeg"
        
        # Create snake record with image data - NOTE: class_label is explicitly set to NULL
        new_snake = models.Snake(
            snakeenglishname=data.get("snakeenglishname", ""),
            snakesinhalaname=data.get("snakesinhalaname", ""),
            snakeenglishdescription=data.get("snakeenglishdescription", ""),
            snakesinhaladescription=data.get("snakesinhaladescription", ""),
            snakeimage=image_content,
            snakeimage_type=image_type,
            class_label=None  # Important: class_label is explicitly NULL for related species
        )
        
        # Add the new snake
        db.add(new_snake)
        db.flush()  # Flush to get the ID but don\'t commit yet
        
        # Create relation with parent snake
        try:
            db.add(new_snake)
            db.flush()  # Get the ID but don't commit yet
            
            new_relation = models.SnakeRelated(
                snakeid=parent_snake_id,
                relatedsnakeid=new_snake.snakeid
            )
            
            db.add(new_relation)
            db.commit()
            db.refresh(new_snake)
            
            return {
                "message": "Related species added successfully", 
                "snakeid": new_snake.snakeid,
                "parent_snakeid": parent_snake_id,
                "snake_details": {
                    "name": new_snake.snakeenglishname,
                    "class_label": new_snake.class_label  # Should be None
                }
            }
        except Exception as db_error:
            db.rollback()
            # Log detailed error
            import traceback
            print(f"Database error in add_related_species: {str(db_error)}")
            print(traceback.format_exc())
            raise HTTPException(
                status_code=500, 
                detail=f"Database error: {str(db_error)}"
            )
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in snake_data")
    except Exception as e:
        db.rollback()
        # Log general error
        import traceback
        print(f"General error in add_related_species: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/related/{snake_id}")
async def get_related_snakes(
    snake_id: int,
    db: Session = Depends(get_db)
):
    """Get all related snakes for a specific snake"""
    try:
        # Check if the snake exists
        main_snake = db.query(models.Snake).filter(models.Snake.snakeid == snake_id).first()
        if not main_snake:
            raise HTTPException(status_code=404, detail=f"Snake with ID {snake_id} not found")
        
        # Get all related snake IDs
        relations = db.query(models.SnakeRelated).filter(models.SnakeRelated.snakeid == snake_id).all()
        related_snake_ids = [relation.relatedsnakeid for relation in relations]
        
        # Get the snake details for each related snake
        related_snakes = []
        for related_id in related_snake_ids:
            snake = db.query(models.Snake).filter(models.Snake.snakeid == related_id).first()
            if snake:
                snake_data = {
                    "snakeid": snake.snakeid,
                    "snakeenglishname": snake.snakeenglishname,
                    "snakesinhalaname": snake.snakesinhalaname,
                    "snakeenglishdescription": snake.snakeenglishdescription,
                    "snakesinhaladescription": snake.snakesinhaladescription,
                    "class_label": str(snake.class_label) if snake.class_label is not None else None
                }
                
                # Add image data if it exists
                if snake.snakeimage:
                    import base64
                    image_type = snake.snakeimage_type or 'image/jpeg'
                    image_base64 = base64.b64encode(snake.snakeimage).decode('utf-8')
                    snake_data["image_data"] = f"data:{image_type};base64,{image_base64}"
                
                related_snakes.append(snake_data)
        
        return related_snakes
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/remove-relation")
async def remove_snake_relation(
    relation_data: Dict[str, Any],
    current_user: models.User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Remove a relation between two snakes (admin only)"""
    try:
        # Validate input
        if not relation_data.get("snakeid") or not relation_data.get("relatedsnakeid"):
            raise HTTPException(
                status_code=400, 
                detail="Both snakeid and relatedsnakeid are required"
            )
        
        # Find the relation
        relation = db.query(models.SnakeRelated).filter(
            models.SnakeRelated.snakeid == relation_data["snakeid"],
            models.SnakeRelated.relatedsnakeid == relation_data["relatedsnakeid"]
        ).first()
        
        if not relation:
            raise HTTPException(status_code=404, detail="Relation not found")
        
        # Delete the relation
        db.delete(relation)
        db.commit()
        
        return {"message": "Relation removed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all-relations")
async def get_all_relations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all snake relations (admin only)"""
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can view all relations")
    
    try:
        # Get all relations
        relations = db.query(models.SnakeRelated).all()
        
        result = []
        for relation in relations:
            # Get snake details for more readable output
            main_snake = db.query(models.Snake).filter(models.Snake.snakeid == relation.snakeid).first()
            related_snake = db.query(models.Snake).filter(models.Snake.snakeid == relation.relatedsnakeid).first()
            
            if main_snake and related_snake:
                result.append({
                    "snakeid": relation.snakeid,
                    "main_snake_name": main_snake.snakeenglishname,
                    "relatedsnakeid": relation.relatedsnakeid,
                    "related_snake_name": related_snake.snakeenglishname
                })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch-add-relations")
async def batch_add_snake_relations(
    relation_data_list: list,
    current_user: models.User = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """Add multiple snake relations at once (admin only)"""
    try:
        added_count = 0
        skipped_count = 0
        errors = []
        
        for relation_data in relation_data_list:
            # Validate input
            if not relation_data.get("snakeid") or not relation_data.get("relatedsnakeid"):
                errors.append(f"Invalid data: missing snakeid or relatedsnakeid in {relation_data}")
                continue
            
            # Check if both snakes exist
            main_snake = db.query(models.Snake).filter(models.Snake.snakeid == relation_data["snakeid"]).first()
            related_snake = db.query(models.Snake).filter(models.Snake.snakeid == relation_data["relatedsnakeid"]).first()
            
            if not main_snake:
                errors.append(f"Main snake with ID {relation_data['snakeid']} not found")
                continue
            if not related_snake:
                errors.append(f"Related snake with ID {relation_data['relatedsnakeid']} not found")
                continue
            
            # Check if the relation already exists
            existing_relation = db.query(models.SnakeRelated).filter(
                models.SnakeRelated.snakeid == relation_data["snakeid"],
                models.SnakeRelated.relatedsnakeid == relation_data["relatedsnakeid"]
            ).first()
            
            if existing_relation:
                skipped_count += 1
                continue
            
            # Create the relation
            new_relation = models.SnakeRelated(
                snakeid=relation_data["snakeid"],
                relatedsnakeid=relation_data["relatedsnakeid"]
            )
            
            db.add(new_relation)
            added_count += 1
        
        db.commit()
        
        return {
            "message": "Batch processing completed",
            "added": added_count,
            "skipped": skipped_count,
            "errors": errors
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
