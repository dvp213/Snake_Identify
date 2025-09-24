from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.database import engine, Base
from models import models
from routers import auth, chat, snake

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Snake Identification API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(snake.router, prefix="/snake", tags=["Snakes"])

@app.get("/")
def read_root():
    return {"message": "Snake Identification API is running!"}