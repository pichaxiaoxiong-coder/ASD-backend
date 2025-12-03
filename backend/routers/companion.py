from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    user_id: Optional[str] = None
    message: str
    context: Optional[dict] = None


router = APIRouter()


@router.post("/chat")
async def chat(payload: ChatRequest):
    """AI 陪伴对话"""
    from services.companion_service import CompanionService
    
    service = CompanionService()
    result = await service.chat(
        user_id=payload.user_id or "u1",
        message=payload.message,
        style=payload.context.get("style") if payload.context else None
    )
    
    # 处理返回结果，提取回复文本
    if isinstance(result, dict):
        reply_text = result.get("reply") or result.get("response") or result.get("message") or str(result)
    else:
        reply_text = str(result)
    
    return {
        "reply": reply_text,
        "response": reply_text,  # 兼容前端字段名
        "message": reply_text,   # 兼容前端字段名
        "data": result,  # 保留完整数据
    }


@router.get("/history")
async def get_chat_history(
    user_id: str = Query(..., description="用户ID"),
    limit: int = Query(50, ge=1, le=200, description="返回数量")
):
    """获取对话历史"""
    from services.companion_service import CompanionService
    
    service = CompanionService()
    history_result = await service.list_history(user_id, limit=limit)
    
    # 处理返回结果
    if isinstance(history_result, dict):
        history = history_result.get("history") or history_result.get("messages") or []
    else:
        history = history_result if isinstance(history_result, list) else []
    
    return {
        "count": len(history),
        "history": history
    }
