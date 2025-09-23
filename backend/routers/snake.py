from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
def test_snake():
    return {"message": "Snake router works!"}
