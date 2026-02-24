from fastapi import APIRouter
from .endpoints import auth_router, chats_router, documents_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(chats_router)
api_router.include_router(documents_router)
