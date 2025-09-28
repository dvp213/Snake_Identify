from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form, Request, status
from fastapi.responses import JSONResponse, Response
from PIL import Image
import numpy as np
import tensorflow as tf
import joblib
import os
import json
import io
import traceback
from typing import Optional
from sqlalchemy.orm import Session
import base64

from models import models
from models.database import get_db
from routers.auth import get_current_user
from routers.debug import record_error

router = APIRouter()

# Valid snake class mappings
SNAKE_CLASSES = {
    "0": "Ceylonkrait",  # මුදු කරවලා
    "1": "Cobra",        # නයා
    "2": "Commonkrait",  # තෙල් කරවලා
    "3": "Russellsviper", # තිත් පොළඟා
    "4": "Sawscaledviper" # වැලි පොළඟා
}

# ------------------------
# Load models at startup
# ------------------------
try:
    # Feature extractor
    mobilenet = tf.keras.models.load_model("models/mobilenet.h5")
    print("✅ MobileNet loaded")
except Exception as e:
    print(f"❌ MobileNet load error: {e}")
    mobilenet = None

try:
    # PCA transformer
    pca = joblib.load("models/pca_model.pkl")
    print("✅ PCA loaded")
except Exception as e:
    print(f"❌ PCA load error: {e}")
    pca = None

try:
    # Classifier
    classifier = tf.keras.models.load_model("models/classifier.h5")
    print("✅ Classifier loaded")
except Exception as e:
    print(f"❌ Classifier load error: {e}")
    classifier = None

# ------------------------
# Helper: preprocess image
# ------------------------
def preprocess_image(image: UploadFile):
    img = Image.open(image.file).convert("RGB").resize((224, 224))
    arr = np.array(img) / 255.0
    arr = arr[np.newaxis, ...]  # add batch dim
    features = mobilenet.predict(arr)
    features = features.reshape(features.shape[0], -1)
    reduced_features = pca.transform(features)
    return reduced_features

# ------------------------
# Endpoint: predict snake
# ------------------------
@router.post("/identify-snake")
async def identify_snake(image: UploadFile = File(...)):
    if not (mobilenet and pca and classifier):
        raise HTTPException(status_code=500, detail="Models not loaded")
    
    try:
        reduced_features = preprocess_image(image)
        preds = classifier.predict(reduced_features)
        class_idx = int(np.argmax(preds, axis=1)[0])
        confidence = float(np.max(preds))
        return JSONResponse({"class_index": class_idx, "confidence": confidence})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ------------------------
# Test endpoint
# ------------------------
@router.get("/test")
async def test_endpoint():
    """Simple test endpoint to verify the server is working"""
    return {"status": "ok", "message": "Snake API is working"}

# ------------------------
# Admin snake management
# ------------------------
@router.get("/all")
async def get_all_snakes(db: Session = Depends(get_db)):
    """Get all snakes from the database"""
    try:
        snakes = db.query(models.Snake).all()
        result = []
        for snake in snakes:
            snake_data = {
                "snakeid": snake.snakeid,
                "snakeenglishname": snake.snakeenglishname,
                "snakesinhalaname": snake.snakesinhalaname,
                "snakeenglishdescription": snake.snakeenglishdescription,
                "snakesinhaladescription": snake.snakesinhaladescription,
                "class_label": str(snake.class_label) if snake.class_label is not None else None
            }
            
            # Only include image data when it exists
            if snake.snakeimage:
                image_type = snake.snakeimage_type or 'image/jpeg'  # Default to JPEG if type is missing
                image_base64 = base64.b64encode(snake.snakeimage).decode('utf-8')
                snake_data["image_data"] = f"data:{image_type};base64,{image_base64}"
            
            result.append(snake_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@router.get("/image/{snake_id}")
async def get_snake_image(snake_id: int, db: Session = Depends(get_db)):
    """Get the image of a specific snake"""
    snake = db.query(models.Snake).filter(models.Snake.snakeid == snake_id).first()
    if not snake or not snake.snakeimage:
        raise HTTPException(status_code=404, detail="Snake image not found")
        
    return Response(
        content=snake.snakeimage, 
        media_type=snake.snakeimage_type or "image/jpeg"
    )


@router.post("/add", status_code=status.HTTP_201_CREATED)
async def add_snake(
    snake_data: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Add a new snake or related species (admin only)"""
    # Open a log file for detailed debugging
    with open("snake_add_debug.log", "a", encoding="utf-8") as log_file:
        log_file.write("\n\n==== NEW REQUEST TO /snake/add ====\n")
        log_file.write(f"Time: {__import__('datetime').datetime.now()}\n")
        log_file.write(f"User: {current_user.username}, Admin: {current_user.is_admin}\n")
        log_file.write(f"Image filename: {image.filename}, content_type: {image.content_type}\n")
        try:
            # Safely log the snake data, handling any encoding issues
            log_file.write(f"Snake data received (truncated): {snake_data[:100]}...\n")
        except UnicodeEncodeError:
            log_file.write("Snake data contains characters that could not be encoded\n")
    
    print(f"==== /snake/add endpoint called ====")
    print(f"User: {current_user.username}, Admin: {current_user.is_admin}")
    print(f"Image filename: {image.filename}, content_type: {image.content_type}")
    print(f"Snake data received: {snake_data[:100]}...")  # Print first 100 chars
    
    # Check if user is admin
    if not current_user.is_admin:
        print("Error: User is not admin")
        raise HTTPException(status_code=403, detail="Only admins can add snakes")
    
    try:
        # Parse snake data
        print("Parsing JSON data...")
        try:
            data = json.loads(snake_data)
            print(f"JSON parsed successfully: {data}")
        except json.JSONDecodeError as json_err:
            print(f"JSON parsing failed: {json_err}")
            record_error(json_err, "/snake/add - JSON parsing")
            raise HTTPException(status_code=400, detail=f"Invalid JSON format: {str(json_err)}")
        
        # Parse the class_label from the request
        class_label = data.get("class_label")
        print(f"Received class_label: {class_label}, type: {type(class_label)}")
        
        # Check if this is for adding a related species
        is_related_species = data.get("is_related_species", False) or "related_snake_english_name" in data or "related_snake_sinhala_name" in data
        
        # Read image data
        image_content = await image.read()
        
        # Determine image MIME type
        image_type = image.content_type or "image/jpeg"
        
        # If this is for adding a related species, we'll use the class_label to find the main snake
        # instead of creating a new snake with that class_label
        if is_related_species:
            # Validate class_label is in the allowed range (0-4) for finding the main snake
            if class_label is None or class_label not in ["0", "1", "2", "3", "4"]:
                error_msg = f"Invalid class_label: '{class_label}'. For related species, class_label must be one of: 0, 1, 2, 3, 4 to identify the main snake."
                print(error_msg)
                with open("snake_add_debug.log", "a", encoding="utf-8") as log_file:
                    log_file.write(f"\nVALIDATION ERROR: {error_msg}\n")
                
                raise HTTPException(
                    status_code=400,
                    detail=error_msg
                )
            
            # Find the main snake with the given class_label
            try:
                main_snake = db.query(models.Snake).filter(models.Snake.class_label == class_label).first()
                if not main_snake:
                    error_msg = f"No main snake found with class_label {class_label}."
                    print(error_msg)
                    raise HTTPException(
                        status_code=404,
                        detail=error_msg
                    )
                print(f"Found main snake: {main_snake.snakeenglishname} (ID: {main_snake.snakeid})")
            except Exception as db_err:
                print(f"Error finding main snake: {str(db_err)}")
                record_error(db_err, "/snake/add - finding main snake")
                raise
                
            # Create the related snake with NULL class_label
            related_snake = models.Snake(
                snakeenglishname=data.get("snakeenglishname", ""),
                snakesinhalaname=data.get("snakesinhalaname", ""),
                snakeenglishdescription=data.get("snakeenglishdescription", ""),
                snakesinhaladescription=data.get("snakesinhaladescription", ""),
                snakeimage=image_content,
                snakeimage_type=image_type,
                class_label=None  # NULL class_label for related species
            )
            
            # Add the new related snake
            db.add(related_snake)
            db.flush()  # Get the ID without committing
            
            # Create the relation between main snake and related snake
            relation = models.SnakeRelated(
                snakeid=main_snake.snakeid,
                relatedsnakeid=related_snake.snakeid
            )
            
            db.add(relation)
            db.commit()
            
            return {
                "message": "Related species added successfully",
                "main_snake_id": main_snake.snakeid,
                "related_snake_id": related_snake.snakeid
            }
            
        else:
            # This is a regular snake addition (not a related species)
            # Validate class_label is in the allowed range (0-4)
            if class_label is None or class_label not in ["0", "1", "2", "3", "4"]:
                error_msg = f"Invalid class_label: '{class_label}'. Must be one of: 0, 1, 2, 3, 4"
                print(error_msg)
                with open("snake_add_debug.log", "a", encoding="utf-8") as log_file:
                    log_file.write(f"\nVALIDATION ERROR: {error_msg}\n")
                
                raise HTTPException(
                    status_code=400,
                    detail=error_msg
                )
            
            # Check if the class_label is already in use
            try:
                existing_snake = db.query(models.Snake).filter(models.Snake.class_label == class_label).first()
                if existing_snake:
                    print(f"Found existing snake with class_label {class_label}: {existing_snake.snakeenglishname}")
                    raise HTTPException(
                        status_code=400,
                        detail=f"A snake with class_label {class_label} already exists. Each category must be unique."
                    )
            except Exception as db_err:
                print(f"Error checking existing snake: {str(db_err)}")
                record_error(db_err, "/snake/add - checking existing snake")
                raise
            
            # Create snake record with image data
            snake_english_name = data.get("snakeenglishname", "")
            if not snake_english_name:
                snake_english_name = SNAKE_CLASSES.get(class_label, "Unknown Snake")
                
            print(f"Creating main snake with name: {snake_english_name}, class_label: {class_label}")
            
            new_snake = models.Snake(
                    snakeenglishname=snake_english_name,
                    snakesinhalaname=data.get("snakesinhalaname", ""),
                    snakeenglishdescription=data.get("snakeenglishdescription", ""),
                    snakesinhaladescription=data.get("snakesinhaladescription", ""),
                    snakeimage=image_content,
                    snakeimage_type=image_type,
                    class_label=class_label
            )
            
            db.add(new_snake)
            db.commit()
            db.refresh(new_snake)
        
        # For regular snakes (not related species), just return success
        return {"message": "Snake added successfully", "snakeid": new_snake.snakeid}
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {str(e)}")
        print(f"Raw snake_data: {snake_data}")
        raise HTTPException(status_code=400, detail=f"Invalid JSON in snake_data: {str(e)}")
    except Exception as e:
        error_message = f"Error in add_snake: {str(e)}"
        error_traceback = traceback.format_exc()
        
        print(error_message)
        print(error_traceback)
        
        # Log to file
        with open("snake_add_debug.log", "a", encoding="utf-8") as log_file:
            log_file.write(f"\n\nERROR OCCURRED: {error_message}\n")
            log_file.write(f"Traceback:\n{error_traceback}\n")
        
        record_error(e, "/snake/add")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/update/{snake_id}", status_code=status.HTTP_200_OK)
async def update_snake(
    snake_id: int,
    snake_data: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update an existing snake (admin only)"""
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can update snakes")
    
    # Find the snake
    snake = db.query(models.Snake).filter(models.Snake.snakeid == snake_id).first()
    if not snake:
        raise HTTPException(status_code=404, detail="Snake not found")
    
    try:
        # Parse snake data
        data = json.loads(snake_data)
        
        # Validate class_label if provided
        class_label = data.get("class_label")
        if class_label and class_label not in ["0", "1", "2", "3", "4"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid class_label. Must be one of: 0, 1, 2, 3, 4"
            )
        
        # Update fields
        if class_label:
            snake.class_label = class_label
        
        if "snakeenglishname" in data:
            snake.snakeenglishname = data["snakeenglishname"]
        
        if "snakesinhalaname" in data:
            snake.snakesinhalaname = data["snakesinhalaname"]
        
        if "snakeenglishdescription" in data:
            snake.snakeenglishdescription = data["snakeenglishdescription"]
        
        if "snakesinhaladescription" in data:
            snake.snakesinhaladescription = data["snakesinhaladescription"]
        
        # Handle image upload if provided
        if image and await image.read(1):
            # Reset file position
            await image.seek(0)
            
            # Read the new image data
            image_content = await image.read()
            
            # Update image data and type
            snake.snakeimage = image_content
            snake.snakeimage_type = image.content_type or "image/jpeg"
        
        db.commit()
        return {"message": "Snake updated successfully"}
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in snake_data")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

