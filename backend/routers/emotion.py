from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional, List

from dependencies.auth import get_current_user, ensure_can_read_user
from models.user_model import User


class EmotionRequest(BaseModel):
    text: str
    user_id: Optional[str] = None  # 用户ID（用于记录情绪历史）


class ReminderRequest(BaseModel):
    user_id: str
    frequency: str  # daily / weekly / custom
    time: str  # HH:MM
    channels: Optional[List[str]] = None
    days_of_week: Optional[List[str]] = None


router = APIRouter()


@router.post("/detect")
async def detect_emotion(payload: EmotionRequest):
    """检测用户当前情绪状态"""
    from services.emotion_service import EmotionService
    
    service = EmotionService()
    result = await service.detect_user_emotion(payload.text, user_id=payload.user_id)
    return result


@router.get("/history")
async def get_emotion_history(
    user_id: str = Query(..., description="用户ID"),
    days: int = Query(7, ge=1, le=30, description="查询天数"),
    limit: int = Query(100, ge=1, le=500, description="返回数量"),
    current_user: User = Depends(get_current_user),
):
    """获取用户情绪历史记录"""
    from services.emotion_service import EmotionService

    ensure_can_read_user(current_user, user_id)
    service = EmotionService()
    records = await service.get_emotion_history(user_id, days=days, limit=limit)
    return {
        "count": len(records),
        "records": records
    }


@router.get("/trend")
async def analyze_emotion_trend(
    user_id: str = Query(..., description="用户ID"),
    days: int = Query(7, ge=1, le=30, description="分析天数"),
    current_user: User = Depends(get_current_user),
):
    """分析用户情绪趋势"""
    from services.emotion_service import EmotionService

    ensure_can_read_user(current_user, user_id)
    service = EmotionService()
    trend = await service.analyze_emotion_trend(user_id, days=days)
    return trend


@router.get("/intervention")
async def get_intervention_suggestion(
    user_id: str = Query(..., description="用户ID"),
    current_emotion: Optional[str] = Query(None, description="当前情绪（可选）"),
    current_user: User = Depends(get_current_user),
):
    """获取情绪干预建议"""
    from services.emotion_service import EmotionService

    ensure_can_read_user(current_user, user_id)
    service = EmotionService()
    suggestion = await service.get_intervention_suggestion(user_id, current_emotion)
    return suggestion


@router.get("/health")
async def assess_emotion_health(
    user_id: str = Query(..., description="用户ID"),
    current_user: User = Depends(get_current_user),
):
    """评估用户情绪健康状态"""
    from services.emotion_service import EmotionService

    ensure_can_read_user(current_user, user_id)
    service = EmotionService()
    health = await service.assess_emotion_health(user_id)
    return health


@router.post("/diary")
async def create_emotion_diary(
    user_id: str = Query(..., description="用户ID"),
    text: str = Query(..., description="日记内容"),
    emotion: Optional[str] = Query(None, description="情绪类型（可选，自动检测）"),
    tags: Optional[str] = Query(None, description="标签（逗号分隔）"),
    context: Optional[str] = Query(None, description="上下文信息"),
    current_user: User = Depends(get_current_user),
):
    """创建情绪日记条目"""
    from services.emotion_service import EmotionService

    # 写入：孩子只能记录自己的情绪日记；其他角色沿用读取权限规则
    ensure_can_read_user(current_user, user_id)
    service = EmotionService()
    tag_list = tags.split(",") if tags else None
    result = await service.create_emotion_diary(
        user_id=user_id,
        text=text,
        emotion=emotion,
        tags=tag_list,
        context=context
    )
    return result


@router.get("/diary")
async def get_emotion_diary(
    user_id: str = Query(..., description="用户ID"),
    emotion: Optional[str] = Query(None, description="情绪过滤"),
    limit: int = Query(50, ge=1, le=200, description="返回数量"),
    current_user: User = Depends(get_current_user),
):
    """获取情绪日记"""
    from services.emotion_service import EmotionService

    ensure_can_read_user(current_user, user_id)
    service = EmotionService()
    result = await service.get_emotion_diary(
        user_id=user_id,
        emotion_filter=emotion,
        limit=limit
    )
    return result


@router.get("/report")
async def generate_emotion_report(
    user_id: str = Query(..., description="用户ID"),
    period: str = Query("week", description="报告周期：week/month"),
    current_user: User = Depends(get_current_user),
):
    """生成情绪报告"""
    from services.emotion_service import EmotionService

    ensure_can_read_user(current_user, user_id)
    service = EmotionService()
    report = await service.generate_emotion_report(user_id, period=period)
    return report


@router.get("/alert")
async def check_emotion_alert(
    user_id: str = Query(..., description="用户ID"),
    current_emotion: str = Query(..., description="当前情绪"),
    intensity: float = Query(..., ge=0.0, le=1.0, description="情绪强度"),
    current_user: User = Depends(get_current_user),
):
    """检查情绪预警"""
    from services.emotion_service import EmotionService

    ensure_can_read_user(current_user, user_id)
    service = EmotionService()
    alert = await service.check_emotion_alert(user_id, current_emotion, intensity)
    return alert


@router.get("/insights")
async def get_emotion_insights(
    user_id: str = Query(..., description="用户ID"),
    days: int = Query(7, ge=1, le=30, description="分析天数"),
    current_user: User = Depends(get_current_user),
):
    """获取情绪洞察（结合社交解码数据）"""
    from services.emotion_service import EmotionService

    ensure_can_read_user(current_user, user_id)
    service = EmotionService()
    insights = await service.get_emotion_insights(user_id, days=days)
    return insights


@router.get("/summary")
async def get_emotion_summary(
    user_id: str = Query(..., description="用户ID"),
    days: int = Query(1, ge=1, le=14, description="摘要天数"),
    current_user: User = Depends(get_current_user),
):
    """获取情绪摘要（自然语言）"""
    from services.emotion_service import EmotionService

    ensure_can_read_user(current_user, user_id)
    service = EmotionService()
    summary = await service.generate_emotion_summary(user_id, days=days)
    return summary


@router.get("/visualization")
async def get_emotion_visualization(
    user_id: str = Query(..., description="用户ID"),
    days: int = Query(7, ge=1, le=30, description="分析天数"),
    current_user: User = Depends(get_current_user),
):
    """获取情绪可视化数据（用于图表展示）"""
    from services.emotion_service import EmotionService

    ensure_can_read_user(current_user, user_id)
    service = EmotionService()
    data = await service.get_emotion_visualization_data(user_id, days=days)
    return data


@router.post("/goal")
async def set_emotion_goal(
    user_id: str = Query(..., description="用户ID"),
    goal_type: str = Query(..., description="目标类型：reduce_negative/increase_positive/maintain_stable"),
    target_emotion: Optional[str] = Query(None, description="目标情绪"),
    target_value: Optional[float] = Query(None, description="目标值"),
    deadline: Optional[str] = Query(None, description="截止日期"),
    current_user: User = Depends(get_current_user),
):
    """设置情绪目标"""
    from services.emotion_service import EmotionService

    ensure_can_read_user(current_user, user_id)
    service = EmotionService()
    result = await service.set_emotion_goal(
        user_id=user_id,
        goal_type=goal_type,
        target_emotion=target_emotion,
        target_value=target_value,
        deadline=deadline
    )
    return result


@router.get("/goal/track")
async def track_emotion_goal(
    user_id: str = Query(..., description="用户ID"),
    goal_id: Optional[str] = Query(None, description="目标ID"),
    current_user: User = Depends(get_current_user),
):
    """追踪情绪目标进度"""
    from services.emotion_service import EmotionService

    ensure_can_read_user(current_user, user_id)
    service = EmotionService()
    result = await service.track_emotion_goal(user_id, goal_id=goal_id)
    return result


@router.get("/compare")
async def compare_emotion_periods(
    user_id: str = Query(..., description="用户ID"),
    period1_days: int = Query(7, ge=1, le=30, description="第一个时间段（天数）"),
    period2_days: int = Query(7, ge=1, le=30, description="第二个时间段（天数）"),
    current_user: User = Depends(get_current_user),
):
    """对比两个时间段的情绪状态"""
    from services.emotion_service import EmotionService

    ensure_can_read_user(current_user, user_id)
    service = EmotionService()
    result = await service.compare_emotion_periods(user_id, period1_days, period2_days)
    return result


@router.get("/statistics")
async def get_emotion_statistics(
    user_id: str = Query(..., description="用户ID"),
    days: int = Query(30, ge=1, le=90, description="统计天数"),
    current_user: User = Depends(get_current_user),
):
    """获取情绪统计数据（综合）"""
    from services.emotion_service import EmotionService

    ensure_can_read_user(current_user, user_id)
    service = EmotionService()
    stats = await service.get_emotion_statistics(user_id, days=days)
    return stats


@router.post("/reminder")
async def create_emotion_reminder(payload: ReminderRequest):
    """设置情绪提醒"""
    from services.emotion_service import EmotionService
    
    service = EmotionService()
    reminder = await service.set_emotion_reminder(
        user_id=payload.user_id,
        frequency=payload.frequency,
        reminder_time=payload.time,
        channels=payload.channels,
        days_of_week=payload.days_of_week
    )
    return reminder


@router.get("/reminder")
async def list_emotion_reminders(
    user_id: str = Query(..., description="用户ID")
):
    """列出情绪提醒"""
    from services.emotion_service import EmotionService
    
    service = EmotionService()
    reminders = await service.list_emotion_reminders(user_id)
    return {"count": len(reminders), "reminders": reminders}


@router.get("/reminder/check")
async def check_emotion_reminders(
    user_id: str = Query(..., description="用户ID")
):
    """检查是否需要提醒"""
    from services.emotion_service import EmotionService
    
    service = EmotionService()
    result = await service.check_emotion_reminders(user_id)
    return result


# ========== 情绪 Profile 相关 API ==========

@router.get("/profile")
async def get_emotion_profile(
    user_id: str = Query(..., description="用户ID"),
    force_refresh: bool = Query(False, description="是否强制刷新")
):
    """获取用户情绪Profile"""
    from services.emotion_profile_service import EmotionProfileService
    
    service = EmotionProfileService()
    profile = await service.get_profile(user_id, force_refresh=force_refresh)
    return profile.model_dump()


@router.get("/profile/summary")
async def get_emotion_profile_summary(
    user_id: str = Query(..., description="用户ID")
):
    """获取情绪Profile摘要（用于Dashboard展示）"""
    from services.emotion_profile_service import EmotionProfileService
    
    service = EmotionProfileService()
    summary = await service.get_profile_summary(user_id)
    return summary


@router.put("/profile")
async def update_emotion_profile(
    user_id: str = Query(..., description="用户ID"),
    baseline: Optional[str] = Query(None, description="基线情绪"),
    sensitivity: Optional[float] = Query(None, ge=0.0, le=1.0, description="敏感度"),
    trigger_words: Optional[str] = Query(None, description="触发词（逗号分隔）"),
    risk_threshold: Optional[float] = Query(None, ge=0.0, le=1.0, description="风险阈值")
):
    """手动更新情绪Profile（允许用户或管理员调整）"""
    from services.emotion_profile_service import EmotionProfileService
    
    service = EmotionProfileService()
    
    updates = {}
    if baseline is not None:
        updates["baseline"] = baseline
    if sensitivity is not None:
        updates["sensitivity"] = sensitivity
    if trigger_words is not None:
        updates["trigger_words"] = [w.strip() for w in trigger_words.split(",") if w.strip()]
    if risk_threshold is not None:
        updates["risk_threshold"] = risk_threshold
    
    profile = await service.update_profile_manually(user_id, updates)
    return profile.model_dump()
















