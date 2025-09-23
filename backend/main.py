from fastapi import FastAPI
from models.database import engine, Base
from models import models
from routers import auth, chat, snake

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Snake Identification API")

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(snake.router, prefix="/snake", tags=["Snakes"])

@app.get("/")
def read_root():
    return {"message": "Snake Identification API is running!"}