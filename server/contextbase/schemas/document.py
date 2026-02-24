from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CollectionCreate(BaseModel):
    name: Optional[str] = None


class CollectionResponse(BaseModel):
    id: str
    name: Optional[str]
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    id: str
    collection_id: str
    filename: Optional[str]
    file_path: str
    file_size: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentUploadResponse(BaseModel):
    message: str
    documents: List[DocumentResponse]
