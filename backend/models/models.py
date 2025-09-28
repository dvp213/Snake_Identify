from sqlalchemy import Column, Integer, String, Text, Boolean, TIMESTAMP, ForeignKey, LargeBinary
from sqlalchemy.sql import func
import models.database


class User(models.database.Base):
    __tablename__ = "users"
    userid = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, nullable=False)   # email
    password = Column(String(255), nullable=False)                # hashed password
    token = Column(Text)
    is_admin = Column(Boolean, default=False)
    createddate = Column(TIMESTAMP, server_default=func.now())

class Snake(models.database.Base):
    __tablename__ = "snakes"
    snakeid = Column(Integer, primary_key=True, index=True)
    snakeenglishname = Column(String(255), nullable=False)
    snakesinhalaname = Column(String(255))
    snakeenglishdescription = Column(Text)
    snakesinhaladescription = Column(Text)
    snakeimage = Column(LargeBinary)           # Binary image data stored directly in DB
    snakeimage_type = Column(String(50))       # Image MIME type (e.g., 'image/jpeg')
    class_label = Column(String(100))  # for mapping model predictions (stores 0-4)

class Chat(models.database.Base):
    __tablename__ = "chats"
    chatid = Column(Integer, primary_key=True, index=True)
    chatrequest = Column(Text, nullable=False)
    chatresponse = Column(Text, nullable=False)
    userid = Column(Integer, ForeignKey("users.userid", ondelete="CASCADE"), nullable=False)
    createddate = Column(TIMESTAMP, server_default=func.now())

class SnakeRelated(models.database.Base):
    __tablename__ = "snake_related"
    snakeid = Column(Integer, ForeignKey("snakes.snakeid", ondelete="CASCADE"), primary_key=True)
    relatedsnakeid = Column(Integer, ForeignKey("snakes.snakeid", ondelete="CASCADE"), primary_key=True)
