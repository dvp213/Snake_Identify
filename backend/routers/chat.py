from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.database import get_db
from models.models import Chat, User
from routers.auth import get_current_user
from schemas.chat import ChatCreate, ChatResponse

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/", response_model=ChatResponse)
async def create_chat(
    chat: ChatCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new chat message. Only authenticated users can access this endpoint.
    """
    db_chat = Chat(
        chatrequest=chat.request,
        chatresponse=chat.response,
        userid=current_user.userid
    )
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat

@router.get("/history", response_model=list[ChatResponse])
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get chat history for the current user. Only authenticated users can access this endpoint.
    """
    chats = db.query(Chat).filter(Chat.userid == current_user.userid).all()
    return chats
