from __future__ import annotations

from typing import Any, Dict

from pydantic import BaseModel, Field


class ConversationLog(BaseModel):
    """社交解码对话日志（统一对话/历史记录 Schema）"""

    user_id: str = Field(..., description="用户 ID")
    input_text: str = Field(..., description="输入文本内容")
    scene_category: str = Field(..., description="场景分类")
    scene_confidence: float = Field(
        ..., ge=0.0, le=1.0, description="场景分类置信度"
    )
    translation: Dict[str, Any] = Field(
        default_factory=dict, description="ASD 翻译结果结构"
    )
    suggestion: Dict[str, Any] = Field(
        default_factory=dict, description="行为建议与提示"
    )
    risk: Dict[str, Any] = Field(
        default_factory=dict, description="风险分析结果（如危机预警）"
    )
    analysis: Dict[str, Any] = Field(
        default_factory=dict, description="其他补充分析信息"
    )
    timestamp: str = Field(..., description="记录时间（ISO 字符串）")
    type: str = Field("conversation_log", description="日志类型标记")


__all__ = ["ConversationLog"]


