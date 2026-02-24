from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
import uuid

from contextbase.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(40), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
