from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatCreate(BaseModel):
    name: Optional[str] = "New Chat"


class ChatUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ChatResponse(BaseModel):
    id: str
    name: Optional[str]
    description: Optional[str]
    user_id: str
    collection_id: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: str
    chat_id: str
    content: str
    role: str
    sources: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatWithMessages(BaseModel):
    chat: ChatResponse
    messages: List[MessageResponse]


class AIResponse(BaseModel):
    user_message: MessageResponse
    ai_message: MessageResponse
    chat_name: Optional[str] = None

