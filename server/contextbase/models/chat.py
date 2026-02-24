from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
import uuid

from contextbase.core.database import Base


class Chat(Base):
    __tablename__ = "chats"
    
    id = Column(String(40), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    user_id = Column(String(40), ForeignKey("users.id"), nullable=False)
    collection_id = Column(String(40), ForeignKey("collections.id"), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String(40), primary_key=True, default=lambda: str(uuid.uuid4()))
    chat_id = Column(String(40), ForeignKey("chats.id"), nullable=False)
    content = Column(Text, nullable=False)
    role = Column(String(20), default="user")
    sources = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
