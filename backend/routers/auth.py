from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

from models import models
from models.database import get_db
from schemas.auth import UserCreate, UserLogin, UserOut, Token

# routers/auth.py
from fastapi.middleware.cors import CORSMiddleware
router = APIRouter(tags=["Authentication"])

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT config - importing from core.config
from core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


# Utility functions
def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Using the create_access_token function from core.security

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Print the token for debugging
        print(f"Validating token: {token[:20]}...")
        
        # Decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            print("No username in token payload")
            raise credentials_exception
        print(f"Token decoded successfully, username: {username}")
        
    except JWTError as e:
        print(f"JWT Error: {str(e)}")
        raise credentials_exception
    except Exception as e:
        print(f"Unexpected error decoding token: {str(e)}")
        raise credentials_exception
        
    try:
        # Query user by username
        user = db.query(models.User).filter(models.User.username == username).first()
        if user is None:
            print(f"User not found: {username}")
            raise credentials_exception
            
        print(f"User found: {user.username}, admin: {user.is_admin}")
        return user
        
    except Exception as e:
        print(f"Database error: {str(e)}")
        raise credentials_exception

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    print(f"Login attempt for email: {user.email}")
    
    # Find user by email
    db_user = db.query(models.User).filter(models.User.username == user.email).first()
    if not db_user:
        print(f"User not found: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(user.password, db_user.password):
        print(f"Password verification failed for: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check admin status
    is_admin = bool(db_user.is_admin)
    print(f"User authenticated: {db_user.username}, admin: {is_admin}")
    
    # Generate access token
    from datetime import timedelta, datetime
    
    # Create JWT token with expiration
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + expires_delta
    
    # Create payload
    to_encode = {
        "sub": db_user.username,
        "exp": expire,
        "is_admin": is_admin
    }
    
    # Encode token
    print(f"Creating token with payload: {to_encode}")
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    # Store token in user record
    db_user.token = encoded_jwt
    db.commit()
    
    print(f"Login successful for {db_user.username}")
    
    # Return token information
    return {
        "access_token": encoded_jwt,
        "token_type": "bearer",
        "is_admin": is_admin
    }


# --- Routes ---
@router.post("/register", status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(models.User).filter(models.User.username == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user with hashed password
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        username=user.email,  # username field stores email
        password=hashed_password,
        is_admin=False,  # default to regular user
        token=None  # initialize token as None
    )
    
    try:
        db.add(new_user)
        db.commit()
        return {"message": "User created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    return new_user

async def admin_required(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Dependency to check if the current user is an admin"""
    user = await get_current_user(token, db)
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can perform this action"
        )
    return user