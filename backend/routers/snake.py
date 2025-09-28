from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form, Request, status
from fastapi.responses import JSONResponse, Response
from PIL import Image
import numpy as np
import tensorflow as tf
import joblib
import os
import json
import io
from typing import Optional
from sqlalchemy.orm import Session
import base64

from models import models
from models.database import get_db
from routers.auth import get_current_user

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
    """Add a new snake (admin only)"""
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can add snakes")
    
    try:
        # Parse snake data
        data = json.loads(snake_data)
        
        # Validate class_label is in the allowed range (0-4)
        class_label = data.get("class_label")
        if not class_label or class_label not in ["0", "1", "2", "3", "4"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid class_label. Must be one of: 0, 1, 2, 3, 4"
            )
        
        # Read image data
        image_content = await image.read()
        
        # Determine image MIME type
        image_type = image.content_type or "image/jpeg"
        
        # Create snake record with image data
        new_snake = models.Snake(
            snakeenglishname=data.get("snakeenglishname") or SNAKE_CLASSES[class_label],
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
        
        return {"message": "Snake added successfully", "snakeid": new_snake.snakeid}
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in snake_data")
    except Exception as e:
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
