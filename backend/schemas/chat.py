from pydantic import BaseModel
from datetime import datetime

class ChatBase(BaseModel):
    request: str

class ChatCreate(ChatBase):
    pass

class ChatResponse(ChatBase):
    chatid: int
    userid: int
    chatresponse: str
    createddate: datetime

    class Config:
        from_attributes = True  # replaces orm_mode in Pydantic v2
