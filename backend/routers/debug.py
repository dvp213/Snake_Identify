from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import traceback
import sys

from models import models
from models.database import get_db
from routers.auth import get_current_user

# Global variable to store the last error
last_error = {"error": "No errors logged yet", "traceback": ""}

# Function to record errors that can be called from other routers
def record_error(error, route=None):
    global last_error
    last_error = {
        "error": str(error),
        "traceback": traceback.format_exc(),
        "route": route
    }
    print(f"Recorded error: {str(error)}")
    print(f"Route: {route}")
    print(f"Traceback: {traceback.format_exc()}")

debug_router = APIRouter(prefix="/debug", tags=["Debug"])

@debug_router.get("/auth-test")
async def test_auth(current_user: models.User = Depends(get_current_user)):
    """Simple endpoint to test authentication"""
    return {
        "status": "ok",
        "message": "Authentication successful",
        "user": {
            "username": current_user.username,
            "is_admin": current_user.is_admin
        }
    }

@debug_router.get("/admin-test")
async def test_admin(current_user: models.User = Depends(get_current_user)):
    """Test admin authorization"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint")
    
    return {
        "status": "ok",
        "message": "Admin authorization successful",
        "user": {
            "username": current_user.username,
            "is_admin": current_user.is_admin
        }
    }
    
@debug_router.get("/last_error")
async def get_last_error():
    """Get the last error that occurred in the API"""
    global last_error
    return last_error