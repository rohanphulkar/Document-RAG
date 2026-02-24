from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
import json

from contextbase.services.llm import get_llm
from contextbase.services.vector_store import search_documents

SYSTEM_PROMPT = """You are a helpful assistant that answers questions based on the provided context. 
Be concise and cite the documents when relevant. If context doesn't help, say so."""


def _format_context(docs):
    if not docs:
        return "No relevant documents found."
    parts = []
    for i, doc in enumerate(docs, 1):
        content = doc.page_content if hasattr(doc, 'page_content') else str(doc)
        parts.append(f"[{i}]: {content}")
    return "\n\n".join(parts)


def chat_with_rag(query, collection_id, history=None):
    """rag chat - gets context from docs"""
    docs = search_documents(query, collection_id, top_k=4)
    context = _format_context(docs)
    
    messages = [SystemMessage(content=SYSTEM_PROMPT)]
    
    if history:
        for m in history[-10:]:
            if m.get("role") == "user":
                messages.append(HumanMessage(content=m.get("content", "")))
            elif m.get("role") == "assistant":
                messages.append(AIMessage(content=m.get("content", "")))
    
    prompt = f"Context:\n{context}\n\nQuestion: {query}"
    messages.append(HumanMessage(content=prompt))
    
    try:
        resp = get_llm().invoke(messages)
        sources = [doc.metadata for doc in docs] if docs else []
        return {"content": resp.content, "sources": json.dumps(sources)}
    except Exception as e:
        return {"content": f"Error: {e}", "sources": "[]"}


def generate_chat_title(user_message: str, ai_response: str) -> str:
    """Generate a concise title for a chat based on the first Q&A exchange"""
    prompt = f"""Based on this conversation, generate a very short, concise title (3-6 words max).
The title should capture the main topic or question being discussed.
Do NOT include quotes, periods, or any punctuation at the end.
Just return the title text, nothing else.

User: {user_message[:500]}
Assistant: {ai_response[:500]}

Title:"""
    
    try:
        messages = [HumanMessage(content=prompt)]
        resp = get_llm().invoke(messages)
        title = resp.content.strip().strip('"\'').strip('.')
        # Limit length and clean up
        if len(title) > 50:
            title = title[:47] + "..."
        return title if title else "New Chat"
    except Exception:
        # Fallback: use first few words of user message
        words = user_message.split()[:5]
        return " ".join(words)[:50] if words else "New Chat"


def chat_simple(query, history=None):
    """simple chat without rag"""
    messages = [SystemMessage(content="You are a helpful assistant. Be concise.")]
    
    if history:
        for m in history[-10:]:
            if m.get("role") == "user":
                messages.append(HumanMessage(content=m.get("content", "")))
            elif m.get("role") == "assistant":
                messages.append(AIMessage(content=m.get("content", "")))
    
    messages.append(HumanMessage(content=query))
    
    try:
        resp = get_llm().invoke(messages)
        return {"content": resp.content, "sources": "[]"}
    except Exception as e:
        return {"content": f"Error: {e}", "sources": "[]"}
