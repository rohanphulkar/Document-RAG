from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

from contextbase.core.config import settings
from contextbase.services.llm import get_embedding_model


def index_document(file_path, collection_name):
    """chunk pdf and store in qdrant"""
    try:
        loader = PyPDFLoader(file_path)
        docs = loader.load()
        if not docs:
            return False
        
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=400)
        chunks = splitter.split_documents(docs)
        
        if chunks:
            QdrantVectorStore.from_documents(
                documents=chunks,
                embedding=get_embedding_model(),
                url=settings.QDRANT_URL,
                collection_name=collection_name
            )
        return True
    except Exception as e:
        print(f"indexing error: {e}")
        return False


def search_documents(query, collection_name, top_k=5):
    """search qdrant for similar chunks"""
    try:
        store = QdrantVectorStore.from_existing_collection(
            collection_name=collection_name,
            url=settings.QDRANT_URL,
            embedding=get_embedding_model()
        )
        return store.similarity_search(query, k=top_k)
    except:
        return []


def delete_vector_collection(collection_name):
    try:
        client = QdrantClient(url=settings.QDRANT_URL)
        client.delete_collection(collection_name)
        return True
    except:
        return False
