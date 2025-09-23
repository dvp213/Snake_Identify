from .auth import router as auth_router
from .chat import router as chat_router
from .snake import router as snake_router

routers = [auth_router, chat_router, snake_router]
