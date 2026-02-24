from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.sql import func
import uuid

from contextbase.core.database import Base


class Collection(Base):
    __tablename__ = "collections"
    
    id = Column(String(40), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=True)
    user_id = Column(String(40), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String(40), primary_key=True, default=lambda: str(uuid.uuid4()))
    collection_id = Column(String(40), ForeignKey("collections.id"), nullable=False)
    filename = Column(String(255), nullable=True)
    file_path = Column(String(255), nullable=False)
    file_size = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=func.now())
