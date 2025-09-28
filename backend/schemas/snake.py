from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any

class SnakeBase(BaseModel):
    snakeenglishname: str
    snakesinhalaname: Optional[str] = None
    snakeenglishdescription: Optional[str] = None
    snakesinhaladescription: Optional[str] = None
    # snakeimage is binary data, handled separately
    snakeimage_type: Optional[str] = None
    class_label: Optional[str] = None  # Made optional for related species

    @validator('class_label')
    def validate_class_label(cls, v):
        if v is not None and v not in ['0', '1', '2', '3', '4']:
            raise ValueError('class_label must be one of: 0, 1, 2, 3, 4')
        return v

class SnakeCreate(SnakeBase):
    pass

class SnakeUpdate(BaseModel):
    snakeenglishname: Optional[str] = None
    snakesinhalaname: Optional[str] = None
    snakeenglishdescription: Optional[str] = None
    snakesinhaladescription: Optional[str] = None
    # snakeimage is binary data, handled separately
    snakeimage_type: Optional[str] = None
    class_label: Optional[str] = None

    @validator('class_label')
    def validate_class_label(cls, v):
        if v is not None and v not in ['0', '1', '2', '3', '4']:
            raise ValueError('class_label must be one of: 0, 1, 2, 3, 4')
        return v

class SnakeResponse(BaseModel):
    snakeid: int
    snakeenglishname: str
    snakesinhalaname: Optional[str] = None
    snakeenglishdescription: Optional[str] = None
    snakesinhaladescription: Optional[str] = None
    # image data will be returned as base64 when appropriate
    snakeimage_type: Optional[str] = None
    class_label: Optional[str] = None  # Changed to Optional for related species

    class Config:
        orm_mode = True

class RelatedSpeciesCreate(BaseModel):
    snakeenglishname: str
    snakesinhalaname: Optional[str] = None
    snakeenglishdescription: Optional[str] = None
    snakesinhaladescription: Optional[str] = None
    
    # No class_label for related species
    
class SnakeRelationCreate(BaseModel):
    snakeid: int
    relatedsnakeid: int
    
class SnakeRelationResponse(BaseModel):
    snakeid: int
    main_snake_name: str
    relatedsnakeid: int
    related_snake_name: str
    
class BatchRelationCreate(BaseModel):
    relation_data_list: List[SnakeRelationCreate]
