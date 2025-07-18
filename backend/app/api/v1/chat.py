"""
Chat API endpoints for AI conversations
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.models.chat import ChatRequest, ChatResponse, ChatMessage
from app.services.ai_service import AIService
from app.services.langgraph_service import LangGraphService

router = APIRouter()

# Initialize services
ai_service = AIService()
langgraph_service = LangGraphService()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process a chat message and return AI response
    """
    try:
        # Process the message through LangGraph workflow
        response = await langgraph_service.process_chat_message(
            message=request.message,
            context=request.context,
            session_id=request.session_id
        )
        
        return ChatResponse(
            response=response.content,
            actions=response.actions,
            session_id=response.session_id
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


@router.get("/chat/history/{session_id}", response_model=List[ChatMessage])
async def get_chat_history(session_id: str):
    """
    Get chat history for a session
    """
    try:
        history = await ai_service.get_chat_history(session_id)
        return history
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat history: {str(e)}")


@router.delete("/chat/history/{session_id}")
async def clear_chat_history(session_id: str):
    """
    Clear chat history for a session
    """
    try:
        await ai_service.clear_chat_history(session_id)
        return {"message": "Chat history cleared successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing chat history: {str(e)}") 