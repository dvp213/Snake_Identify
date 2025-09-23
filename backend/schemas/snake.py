from pydantic import BaseModel
from typing import Optional

class SnakeBase(BaseModel):
    name_en: str
    name_si: str
    description_en: str
    description_si: str
    image_url: str

class SnakeCreate(SnakeBase):
    pass

class SnakeUpdate(SnakeBase):
    pass

class SnakeResponse(SnakeBase):
    id: int

    class Config:
        orm_mode = True
