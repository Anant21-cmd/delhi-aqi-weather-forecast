from fastapi import APIRouter
from app.schemas.all_schemas import ChatRequest, ChatResponse
from app.services.chat_service import answer_user_chat

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])

@router.post("", response_model=ChatResponse)
def chat_with_assistant(payload: ChatRequest):
    """Processes natural-language user queries grounded in real-time environmental metrics."""
    result = answer_user_chat(
        message=payload.message,
        location_name=payload.location_name or "Delhi (Anand Vihar)"
    )
    return result
