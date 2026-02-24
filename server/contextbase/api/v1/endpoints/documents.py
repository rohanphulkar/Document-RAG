from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session
from typing import List
import asyncio
import os

from contextbase.core import get_db, get_current_user
from contextbase.models import User, Collection, Document, Chat
from contextbase.schemas import CollectionCreate, CollectionResponse, DocumentResponse, DocumentUploadResponse
from contextbase.services import save_upload, delete_upload, format_size, index_document, delete_vector_collection, download_temp_s3_file

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/collections", response_model=CollectionResponse, status_code=201)
def create_collection(data: CollectionCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    collection = Collection(user_id=user.id, name=data.name)
    db.add(collection)
    db.commit()
    db.refresh(collection)
    return collection


@router.get("/collections", response_model=List[CollectionResponse])
def list_collections(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Collection).filter(Collection.user_id == user.id).all()


@router.get("/collections/{id}", response_model=CollectionResponse)
def get_collection(id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    collection = db.query(Collection).filter(Collection.id == id, Collection.user_id == user.id).first()
    if not collection:
        raise HTTPException(status_code=404, detail="Not found")
    return collection


@router.delete("/collections/{id}")
def delete_collection(id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    collection = db.query(Collection).filter(Collection.id == id, Collection.user_id == user.id).first()
    if not collection:
        raise HTTPException(status_code=404, detail="Not found")
    
    # Nullify collection_id in chats that use this collection
    chats = db.query(Chat).filter(Chat.collection_id == id).all()
    for chat in chats:
        chat.collection_id = None
    
    for doc in db.query(Document).filter(Document.collection_id == id).all():
        delete_upload(doc.file_path)
        db.delete(doc)
    
    delete_vector_collection(id)
    db.delete(collection)
    db.commit()
    return {"message": "deleted"}


@router.post("/collections/{id}/documents", response_model=DocumentUploadResponse)
async def upload_documents(id: str, files: List[UploadFile], user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    collection = db.query(Collection).filter(Collection.id == id, Collection.user_id == user.id).first()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    docs = []
    for f in files:
        file_url, name, size = save_upload(f)
        doc = Document(collection_id=id, file_path=file_url, filename=name, file_size=format_size(size))
        db.add(doc)
        db.commit()
        db.refresh(doc)
        docs.append(doc)
        temp_path = download_temp_s3_file(file_url)
        try:
            await asyncio.to_thread(index_document, temp_path, id)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    return {"message": f"{len(docs)} uploaded", "documents": docs}


@router.get("/collections/{id}/documents", response_model=List[DocumentResponse])
def list_documents(id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    collection = db.query(Collection).filter(Collection.id == id, Collection.user_id == user.id).first()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    return db.query(Document).filter(Document.collection_id == id).all()


@router.delete("/{doc_id}")
def delete_document(doc_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    
    collection = db.query(Collection).filter(Collection.id == doc.collection_id, Collection.user_id == user.id).first()
    if not collection:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    delete_upload(doc.file_path)
    db.delete(doc)
    db.commit()
    return {"message": "deleted"}
