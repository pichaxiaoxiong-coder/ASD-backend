from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class DecodeRequest(BaseModel):
    """社交解码请求体（统一 Schema）"""

    text: str = Field(..., description="待分析的文本")
    user_id: Optional[str] = Field(
        None, description="用户 ID，用于个性化分析与日志记录"
    )
    use_ai: Optional[bool] = Field(
        False, description="是否使用 AI 进行深度语义分析与三级分类"
    )
    save_log: Optional[bool] = Field(
        False, description="是否将本次解码结果保存到日志库"
    )


class BatchDecodeRequest(BaseModel):
    """批量社交解码请求"""

    texts: List[str] = Field(..., description="待分析文本列表")
    user_id: Optional[str] = Field(None, description="用户 ID")
    use_ai: Optional[bool] = Field(False, description="是否使用 AI")
    save_log: Optional[bool] = Field(False, description="是否保存日志")


class FeedbackRequest(BaseModel):
    """社交解码结果反馈结构（统一反馈 Schema）"""

    log_id: Optional[str] = Field(None, description="关联的日志 ID（可选）")
    user_id: str = Field(..., description="用户 ID")
    input_text: str = Field(..., description="用户原始输入文本")
    scene_category: str = Field(..., description="场景类型")
    feedback_type: str = Field(
        ...,
        description='反馈类型："correct", "incorrect", "helpful", "not_helpful" 等',
    )
    comment: Optional[str] = Field(None, description="补充说明/评论")


__all__ = [
    "DecodeRequest",
    "BatchDecodeRequest",
    "FeedbackRequest",
]


