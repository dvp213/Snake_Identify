from sqlalchemy import Column, Integer, String, Text, Boolean, TIMESTAMP, ForeignKey
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
    snakeimage = Column(String(500))           # URL or path
    class_label = Column(String(100), unique=True)  # for mapping model predictions

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
