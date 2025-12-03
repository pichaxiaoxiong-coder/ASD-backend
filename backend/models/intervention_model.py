from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class PlanRequest(BaseModel):
    """干预计划生成请求（来自 /intervention/plan API）"""

    user_id: str = Field(..., description="用户 ID")
    goal: str = Field(..., description="干预目标描述")
    focus_scene: Optional[str] = Field(
        None, description="聚焦的社交场景（如：校园、家庭等）"
    )
    duration_days: int = Field(7, ge=1, le=365, description="计划天数")
    auto_match_template: bool = Field(
        True, description="是否自动匹配干预模板（结合情绪/风险）"
    )


class PlanProgressRequest(BaseModel):
    """干预计划进度上报请求"""

    plan_id: str = Field(..., description="干预计划 ID")
    status: str = Field(..., description="当前状态，如 completed / in_progress")
    note: Optional[str] = Field(None, description="进度备注")


class InterventionPlan(BaseModel):
    """干预计划实体（对应 logs 集合中的 intervention_plan 记录）"""

    plan_id: str = Field(..., description="计划 ID（UUID）")
    user_id: str = Field(..., description="用户 ID")
    goal: str = Field(..., description="干预目标")
    focus_scene: str = Field(..., description="聚焦场景")
    duration_days: int = Field(..., ge=1, le=365, description="计划时长（天）")
    created_at: datetime = Field(..., description="创建时间（UTC）")
    status: str = Field("active", description="计划状态")
    steps: List[Dict[str, Any]] = Field(
        default_factory=list, description="分步干预方案（动作/练习/对话脚本等）"
    )
    emotion_trend: Dict[str, Any] = Field(
        default_factory=dict, description="生成时的情绪趋势快照"
    )
    profile_baseline: Optional[str] = Field(
        None, description="用户情绪基线（来自 EmotionProfile）"
    )
    profile_sensitivity: Optional[float] = Field(
        None, ge=0.0, le=1.0, description="情绪敏感度"
    )
    profile_trigger_words: List[str] = Field(
        default_factory=list, description="触发词列表"
    )
    intervention_template: Optional[str] = Field(
        None, description="匹配到的干预模板 ID"
    )
    intervention_template_name: Optional[str] = Field(
        None, description="干预模板名称"
    )
    risk_level: Optional[str] = Field(
        None, description="风险等级：low / medium / high"
    )
    type: str = Field("intervention_plan", description="日志类型标记")


class InterventionProgressEntry(BaseModel):
    """干预计划进度日志（intervention_progress）"""

    plan_id: str = Field(..., description="计划 ID")
    status: str = Field(..., description="当前状态")
    note: Optional[str] = Field(None, description="进度备注")
    timestamp: str = Field(..., description="记录时间（ISO 字符串）")
    type: str = Field("intervention_progress", description="日志类型标记")


__all__ = [
    "PlanRequest",
    "PlanProgressRequest",
    "InterventionPlan",
    "InterventionProgressEntry",
]


