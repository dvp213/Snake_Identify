from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatBase(BaseModel):
    user_id: int
    message: str

class ChatCreate(ChatBase):
    pass

class ChatResponse(ChatBase):
    id: int
    response: str
    timestamp: datetime

    class Config:
        orm_mode = True
