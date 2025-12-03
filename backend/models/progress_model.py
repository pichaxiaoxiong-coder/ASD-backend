from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ProgressLog(BaseModel):
    """进度日志记录请求体 & 统一 Schema"""

    user_id: str = Field(..., description="用户 ID")
    note: str = Field(..., description="记录内容/备注")
    category: Optional[str] = Field(
        "general", description="分类标签，如 emotion / social / task 等"
    )
    status: Optional[str] = Field("open", description="状态：open/closed 等")
    mood: Optional[str] = Field(None, description="当时心情（可选）")
    tags: Optional[List[str]] = Field(None, description="标签列表")


class ProgressUpdate(BaseModel):
    """进度日志更新请求"""

    entry_id: str = Field(..., description="进度条目 ID")
    status: str = Field(..., description="更新后的状态")
    note: Optional[str] = Field(None, description="补充备注")


class ProgressEntry(BaseModel):
    """存入日志库的进度条目结构"""

    user_id: str = Field(..., description="用户 ID")
    note: str = Field(..., description="记录内容")
    category: str = Field(..., description="分类")
    status: str = Field(..., description="状态")
    mood: Optional[str] = Field(None, description="心情")
    tags: Optional[List[str]] = Field(None, description="标签")
    timestamp: datetime = Field(..., description="创建时间")
    type: str = Field("progress_log", description="日志类型标记")


__all__ = ["ProgressLog", "ProgressUpdate", "ProgressEntry"]


