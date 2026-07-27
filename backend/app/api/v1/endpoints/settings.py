from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional

from app.core.config import settings
from app.ai.service import ai_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


class AIConfigUpdate(BaseModel):
    gemini_api_key: str


class AIConfigResponse(BaseModel):
    has_api_key: bool
    model_name: str
    mode: str  # "Live Gemini LLM" or "Heuristic Fallback"


@router.get("/ai-config", response_model=AIConfigResponse)
async def get_ai_config(current_user: User = Depends(get_current_user)):
    has_key = bool(ai_service.api_key and ai_service.api_key != "your_gemini_api_key_here")
    return AIConfigResponse(
        has_api_key=has_key,
        model_name=ai_service.model_name,
        mode="Live Gemini LLM" if has_key else "Heuristic Fallback",
    )


@router.post("/ai-config", response_model=AIConfigResponse)
async def update_ai_config(
    config_in: AIConfigUpdate,
    current_user: User = Depends(get_current_user),
):
    key = config_in.gemini_api_key.strip()
    if not key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="API key cannot be empty",
        )

    # Dynamically update settings & re-initialize AI service at runtime
    settings.GEMINI_API_KEY = key
    ai_service.init_sdk(key)

    return AIConfigResponse(
        has_api_key=True,
        model_name=ai_service.model_name,
        mode="Live Gemini LLM",
    )
