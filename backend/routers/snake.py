from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import numpy as np
import tensorflow as tf
import joblib

router = APIRouter()

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
