from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from contextbase.core import settings, init_db
from contextbase.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


def create_app():
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="RAG chat API with document management",
        docs_url="/docs", redoc_url="/redoc",
        lifespan=lifespan
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.include_router(api_router)
    
    @app.get("/")
    def root():
        return {"status": "ok", "service": settings.APP_NAME}
    
    @app.get("/health")
    def health():
        return {"status": "healthy", "version": settings.APP_VERSION}
    
    return app


app = create_app()
