from pydantic import BaseModel, EmailStr

# Schema for creating a new user
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# Schema for login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Schema for returning user info
class UserOut(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True  # replaces orm_mode in Pydantic v2

# Schema for JWT token response
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
