import os
from dotenv import load_dotenv

DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", 'root')
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "snake_research")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
# DATABASE_URL = "mysql+pymysql://root:@localhost:3306/snake_research"

load_dotenv()  # read .env file

SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
