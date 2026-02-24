from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List
import asyncio
import json

from contextbase.core import get_db, get_current_user
from contextbase.models import User, Chat, Message, Collection, Document
from contextbase.schemas import ChatCreate, ChatUpdate, ChatResponse, MessageCreate, MessageResponse, ChatWithMessages, AIResponse
from contextbase.services import save_upload, format_size, index_document, delete_vector_collection, chat_with_rag, chat_simple, generate_chat_title

router = APIRouter(prefix="/chats", tags=["Chats"])


@router.post("/")
async def create_chat(data: str = Form(None), files: List[UploadFile] = None, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat_data = None
    if data:
        try:
            parsed = json.loads(data)
            chat_data = ChatCreate(**parsed)
        except json.JSONDecodeError:
            pass

    collection_id = None
    docs = []
    
    if files and len(files) > 0:
        collection = Collection(user_id=user.id, name=chat_data.name if chat_data and chat_data.name else "Documents")
        db.add(collection)
        db.commit()
        db.refresh(collection)
        collection_id = collection.id
        
        for f in files:
            path, name, size = save_upload(f)
            doc = Document(collection_id=collection_id, file_path=path, filename=name, file_size=format_size(size))
            db.add(doc)
            db.commit()
            db.refresh(doc)
            docs.append(doc)
            await asyncio.to_thread(index_document, path, collection_id)
    
    chat = Chat(name=chat_data.name if chat_data and chat_data.name else "New Chat", user_id=user.id, collection_id=collection_id)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    
    return {"message": "Chat created", "chat": chat, "documents": docs}


@router.get("/", response_model=List[ChatResponse])
def list_chats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Chat).filter(Chat.user_id == user.id).order_by(Chat.created_at.desc()).all()


@router.get("/{chat_id}", response_model=ChatWithMessages)
def get_chat(chat_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()
    return {"chat": chat, "messages": messages}


@router.put("/{chat_id}", response_model=ChatResponse)
def update_chat(chat_id: str, data: ChatUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    if data.name is not None:
        chat.name = data.name
    if data.description is not None:
        chat.description = data.description
    db.commit()
    db.refresh(chat)
    return chat


@router.delete("/{chat_id}")
def delete_chat(chat_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Save collection_id before deleting chat
    collection_id = chat.collection_id
    
    # Delete messages logic
    db.query(Message).filter(Message.chat_id == chat_id).delete()
    
    # Delete the chat first to remove the foreign key reference
    db.delete(chat)
    db.commit()
    
    # Now check if we should delete the collection
    if collection_id:
        # Check if any other chats use this collection
        other_chats_count = db.query(Chat).filter(Chat.collection_id == collection_id).count()
        
        if other_chats_count == 0:
            # Safe to delete collection + documents + vector store
            delete_vector_collection(collection_id)
            db.query(Document).filter(Document.collection_id == collection_id).delete()
            db.query(Collection).filter(Collection.id == collection_id).delete()
            db.commit()
            
    return {"message": "deleted"}


@router.post("/{chat_id}/messages", response_model=AIResponse)
async def send_message(chat_id: str, data: MessageCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Check if this is the first message (for auto-rename)
    existing_messages = db.query(Message).filter(Message.chat_id == chat_id).count()
    is_first_message = existing_messages == 0
    
    user_msg = Message(chat_id=chat_id, content=data.content, role="user")
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)
    
    history = [{"role": m.role, "content": m.content} for m in db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()]
    
    if chat.collection_id:
        resp = await asyncio.to_thread(chat_with_rag, data.content, chat.collection_id, history)
    else:
        resp = await asyncio.to_thread(chat_simple, data.content, history)
    
    ai_msg = Message(chat_id=chat_id, content=resp["content"], role="assistant", sources=resp.get("sources"))
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)
    
    # Auto-rename chat after first Q&A if it has a generic name
    chat_name = None
    if is_first_message and chat.name in ["New Chat", "Documents", ""]:
        try:
            new_title = await asyncio.to_thread(generate_chat_title, data.content, resp["content"])
            chat.name = new_title
            db.commit()
            db.refresh(chat)
            chat_name = new_title
        except Exception:
            pass  # Keep existing name on error
    
    return {"user_message": user_msg, "ai_message": ai_msg, "chat_name": chat_name}


@router.get("/{chat_id}/messages", response_model=List[MessageResponse])
def get_messages(chat_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    return db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()


@router.post("/{chat_id}/upload")
async def upload_to_chat(chat_id: str, files: List[UploadFile], user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    if not chat.collection_id:
        collection = Collection(user_id=user.id, name=f"Chat docs")
        db.add(collection)
        db.commit()
        db.refresh(collection)
        chat.collection_id = collection.id
        db.commit()
    
    docs = []
    for f in files:
        path, name, size = save_upload(f)
        doc = Document(collection_id=chat.collection_id, file_path=path, filename=name, file_size=format_size(size))
        db.add(doc)
        db.commit()
        db.refresh(doc)
        docs.append(doc)
        await asyncio.to_thread(index_document, path, chat.collection_id)
    
    return {"message": "Uploaded", "documents": docs}
