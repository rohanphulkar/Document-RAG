from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from contextbase.core.config import settings

_embedding = None
_llm = None


def get_embedding_model():
    global _embedding
    if not _embedding:
        _embedding = OpenAIEmbeddings(model="text-embedding-3-large", openai_api_key=settings.OPENAI_API_KEY)
    return _embedding


def get_llm():
    global _llm
    if not _llm:
        _llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7, openai_api_key=settings.OPENAI_API_KEY)
    return _llm
