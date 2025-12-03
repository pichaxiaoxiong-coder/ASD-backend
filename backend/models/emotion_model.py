from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class EmotionDetectionResult(BaseModel):
    """单次情绪检测结果（对应 EmotionService.detect_user_emotion 的返回结构）"""

    emotion: str = Field(..., description="情绪标签，如 开心/难过/焦虑 等")
    sentiment: str = Field(..., description="情感倾向：positive / negative / neutral")
    confidence: float = Field(..., ge=0.0, le=1.0, description="整体分析置信度")
    intensity: float = Field(..., ge=0.0, le=1.0, description="情绪强度")
    positive_score: float = Field(0, description="模型给出的正向得分（原始值）")
    negative_score: float = Field(0, description="模型给出的负向得分（原始值）")
    keywords: List[str] = Field(default_factory=list, description="从文本中提取的关键词")


class EmotionRecord(BaseModel):
    """情绪历史记录条目（存入日志的规范结构）"""

    user_id: str
    text: str
    emotion: str = Field(..., description="情绪标签")
    sentiment: str = Field("neutral", description="情感倾向")
    intensity: float = Field(0.0, ge=0.0, le=1.0, description="情绪强度")
    timestamp: datetime = Field(..., description="记录时间（UTC ISO）")
    keywords: List[str] = Field(default_factory=list)
    type: str = Field("emotion_record", description="日志类型标记")


class EmotionTrend(BaseModel):
    """情绪趋势分析结果（对应 EmotionService.analyze_emotion_trend）"""

    trend: str = Field(..., description="趋势：improving / declining / stable 等")
    average_emotion: str = Field(..., description="一段时间内最常见情绪")
    average_intensity: float = Field(..., ge=0.0, le=1.0, description="平均情绪强度")
    emotion_distribution: Dict[str, int] = Field(
        default_factory=dict, description="各情绪出现次数分布"
    )
    positive_ratio: float = Field(0.0, ge=0.0, le=1.0)
    negative_ratio: float = Field(0.0, ge=0.0, le=1.0)
    total_records: int = 0
    recommendation: str = Field("", description="给用户的自然语言建议")


class EmotionHealthAssessment(BaseModel):
    """情绪健康评估（对应 EmotionService.assess_emotion_health）"""

    health_score: int = Field(..., ge=0, le=100, description="0-100 情绪健康分数")
    health_level: str = Field(..., description="等级英文：excellent/good/fair/needs_attention")
    health_level_cn: str = Field(..., description="等级中文描述")
    trend_analysis: EmotionTrend
    recommendations: List[str] = Field(default_factory=list)


class EmotionDiaryEntry(BaseModel):
    """情绪日记条目（对应 EmotionService.create_emotion_diary 存入的结构）"""

    user_id: str
    text: str
    emotion: str
    emotion_data: EmotionDetectionResult
    tags: List[str] = Field(default_factory=list)
    context: Optional[str] = None
    timestamp: datetime
    type: str = Field("diary", const=True)


class EmotionGoal(BaseModel):
    """情绪目标设置（对应 EmotionService.set_emotion_goal）"""

    user_id: str
    goal_type: str = Field(
        ...,
        description="目标类型：reduce_negative / increase_positive / maintain_stable",
    )
    target_emotion: Optional[str] = Field(
        None, description="目标情绪（例如 希望减少的情绪或希望增加的情绪）"
    )
    target_value: Optional[float] = Field(
        None, description="目标数值（如负面占比阈值等）"
    )
    deadline: Optional[str] = Field(None, description="截止日期（ISO 字符串）")
    created_at: datetime
    status: str = Field("active", description="目标状态")
    progress: float = Field(0.0, ge=0.0, le=100.0, description="完成进度（0-100）")


__all__ = [
    "EmotionDetectionResult",
    "EmotionRecord",
    "EmotionTrend",
    "EmotionHealthAssessment",
    "EmotionDiaryEntry",
    "EmotionGoal",
]


