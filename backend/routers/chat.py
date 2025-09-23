from fastapi import APIRouter

router = APIRouter()

@router.get("/test")
def test_chat():
    return {"message": "Chat router works!"}
