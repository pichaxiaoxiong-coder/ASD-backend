"""
康复监测相关API
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

from dependencies.auth import get_current_user, ensure_can_read_user
from models.user_model import User


router = APIRouter()


@router.get("/statistics")
async def get_recovery_statistics(
    user_id: str = Query(..., description="用户ID"),
    days: int = Query(30, ge=1, le=90, description="统计天数"),
    current_user: User = Depends(get_current_user),
):
    """获取详细的进度统计数据"""
    from services.progress_service import ProgressService
    from services.emotion_service import EmotionService
    from services.decoder_service import DecoderService

    # 统一读取权限判断
    ensure_can_read_user(current_user, user_id)

    progress_service = ProgressService()
    emotion_service = EmotionService()
    decoder_service = DecoderService()
    
    # 获取进度数据
    progress_summary = await progress_service.get_summary(user_id, days=days)
    progress_entries = await progress_service.list_entries(user_id, limit=200)
    
    # 获取情绪数据
    emotion_stats = await emotion_service.get_emotion_statistics(user_id, days=days)
    emotion_trend = await emotion_service.analyze_emotion_trend(user_id, days=days)
    
    # 获取社交解码统计
    from services.db_service import DBService
    db_service = DBService()
    decoder_stats = await db_service.get_scene_statistics(user_id=user_id)
    
    # 计算分类统计
    categories = progress_summary.get("categories", {}) if progress_summary else {}
    total_entries = progress_summary.get("total_entries", 0) if progress_summary else 0
    completed_entries = progress_summary.get("completed_entries", 0) if progress_summary else 0
    
    # 计算完成率
    completion_rate = (completed_entries / total_entries * 100) if total_entries > 0 else 0
    
    # 按类别统计完成率
    category_stats = {}
    for category, count in categories.items():
        category_completed = sum(
            1 for entry in progress_entries 
            if entry.get("category") == category and entry.get("status") in ["closed", "completed"]
        )
        category_stats[category] = {
            "total": count,
            "completed": category_completed,
            "completion_rate": (category_completed / count * 100) if count > 0 else 0
        }
    
    return {
        "user_id": user_id,
        "period_days": days,
        "progress": {
            "total_entries": total_entries,
            "completed_entries": completed_entries,
            "completion_rate": round(completion_rate, 2),
            "categories": category_stats,
        },
        "emotion": {
            "total_records": emotion_stats.get("total_records", 0),
            "trend": emotion_trend.get("trend", "stable"),
            "average_emotion": emotion_trend.get("average_emotion", "平静"),
            "emotion_distribution": emotion_trend.get("emotion_distribution", {}),
        },
        "social": {
            "total_interactions": decoder_stats.get("total", 0),
            "scene_distribution": decoder_stats.get("scene_distribution", {}),
            "most_common_scene": decoder_stats.get("most_common_scene", "未知"),
        }
    }


@router.get("/growth-curve")
async def get_growth_curve(
    user_id: str = Query(..., description="用户ID"),
    days: int = Query(30, ge=7, le=90, description="统计天数"),
    metric: str = Query("completion", description="指标类型：completion/emotion/social"),
    current_user: User = Depends(get_current_user),
):
    """获取成长曲线数据（时间序列）"""
    from services.progress_service import ProgressService
    from services.emotion_service import EmotionService
    from services.db_service import DBService

    ensure_can_read_user(current_user, user_id)

    progress_service = ProgressService()
    emotion_service = EmotionService()
    db_service = DBService()
    
    # 生成日期范围
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # 获取进度数据
    progress_entries = await progress_service.list_entries(user_id, limit=500)
    
    # 获取情绪数据
    emotion_records = await emotion_service.get_emotion_history(user_id, days=days, limit=500)
    
    # 获取社交解码数据
    decoder_logs = await db_service.get_conversation_logs(user_id=user_id, limit=500)
    
    # 按日期分组数据
    daily_data = {}
    current_date = start_date
    
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        daily_data[date_str] = {
            "date": date_str,
            "completion_count": 0,
            "total_tasks": 0,
            "emotion_records": 0,
            "positive_emotions": 0,
            "social_interactions": 0,
        }
        current_date += timedelta(days=1)
    
    # 统计进度数据
    for entry in progress_entries:
        entry_date = entry.get("timestamp", "")
        if isinstance(entry_date, str):
            try:
                entry_datetime = datetime.fromisoformat(entry_date.replace("Z", "+00:00"))
                date_str = entry_datetime.strftime("%Y-%m-%d")
                if date_str in daily_data:
                    daily_data[date_str]["total_tasks"] += 1
                    if entry.get("status") in ["closed", "completed"]:
                        daily_data[date_str]["completion_count"] += 1
            except:
                pass
    
    # 统计情绪数据
    for record in emotion_records:
        record_date = record.get("timestamp", "")
        if isinstance(record_date, str):
            try:
                record_datetime = datetime.fromisoformat(record_date.replace("Z", "+00:00"))
                date_str = record_datetime.strftime("%Y-%m-%d")
                if date_str in daily_data:
                    daily_data[date_str]["emotion_records"] += 1
                    if record.get("sentiment") == "positive":
                        daily_data[date_str]["positive_emotions"] += 1
            except:
                pass
    
    # 统计社交数据
    for log in decoder_logs:
        log_date = log.get("timestamp", "")
        if isinstance(log_date, str):
            try:
                log_datetime = datetime.fromisoformat(log_date.replace("Z", "+00:00"))
                date_str = log_datetime.strftime("%Y-%m-%d")
                if date_str in daily_data:
                    daily_data[date_str]["social_interactions"] += 1
            except:
                pass
    
    # 转换为数组格式
    curve_data = []
    for date_str in sorted(daily_data.keys()):
        day_data = daily_data[date_str]
        completion_rate = (day_data["completion_count"] / day_data["total_tasks"] * 100) if day_data["total_tasks"] > 0 else 0
        
        curve_data.append({
            "date": date_str,
            "completion_rate": round(completion_rate, 2),
            "tasks_completed": day_data["completion_count"],
            "tasks_total": day_data["total_tasks"],
            "emotion_records": day_data["emotion_records"],
            "positive_ratio": (day_data["positive_emotions"] / day_data["emotion_records"] * 100) if day_data["emotion_records"] > 0 else 0,
            "social_interactions": day_data["social_interactions"],
        })
    
    return {
        "user_id": user_id,
        "metric": metric,
        "period_days": days,
        "data": curve_data
    }


@router.get("/activities")
async def get_activity_records(
    user_id: str = Query(..., description="用户ID"),
    limit: int = Query(50, ge=1, le=200, description="返回数量"),
    category: Optional[str] = Query(None, description="分类过滤"),
    current_user: User = Depends(get_current_user),
):
    """获取活动记录"""
    from services.progress_service import ProgressService
    from services.emotion_service import EmotionService
    from services.db_service import DBService

    ensure_can_read_user(current_user, user_id)

    progress_service = ProgressService()
    emotion_service = EmotionService()
    db_service = DBService()
    
    # 获取所有活动数据
    activities = []
    
    # 进度记录
    progress_entries = await progress_service.list_entries(user_id, limit=limit)
    for entry in progress_entries:
        if not category or entry.get("category") == category:
            activities.append({
                "id": entry.get("_id") or entry.get("id"),
                "type": "progress",
                "title": entry.get("note", "进度记录")[:50],
                "category": entry.get("category", "general"),
                "status": entry.get("status", "open"),
                "timestamp": entry.get("timestamp"),
                "mood": entry.get("mood"),
                "tags": entry.get("tags", []),
            })
    
    # 情绪记录
    emotion_records = await emotion_service.get_emotion_history(user_id, days=30, limit=limit)
    for record in emotion_records:
        activities.append({
            "id": record.get("_id") or record.get("id"),
            "type": "emotion",
            "title": f"情绪记录: {record.get('emotion', '未知')}",
            "category": "emotion",
            "emotion": record.get("emotion"),
            "sentiment": record.get("sentiment"),
            "intensity": record.get("intensity", 0),
            "timestamp": record.get("timestamp"),
        })
    
    # 社交解码记录
    decoder_logs = await db_service.get_conversation_logs(user_id=user_id, limit=limit)
    for log in decoder_logs:
        activities.append({
            "id": log.get("_id") or log.get("id"),
            "type": "social",
            "title": f"社交场景: {log.get('scene_category', '未知')}",
            "category": "social",
            "scene": log.get("scene_category"),
            "input_text": log.get("input_text", "")[:50],
            "timestamp": log.get("timestamp"),
        })
    
    # 按时间排序
    activities.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    return {
        "user_id": user_id,
        "count": len(activities[:limit]),
        "activities": activities[:limit]
    }


@router.get("/achievements")
async def get_achievements(
    user_id: str = Query(..., description="用户ID"),
    current_user: User = Depends(get_current_user),
):
    """获取成就徽章"""
    from services.progress_service import ProgressService
    from services.emotion_service import EmotionService
    from services.db_service import DBService

    ensure_can_read_user(current_user, user_id)

    progress_service = ProgressService()
    emotion_service = EmotionService()
    db_service = DBService()
    
    achievements = []
    
    # 获取统计数据
    progress_summary = await progress_service.get_summary(user_id, days=90)
    emotion_stats = await emotion_service.get_emotion_statistics(user_id, days=90)
    emotion_trend = await emotion_service.analyze_emotion_trend(user_id, days=30)
    decoder_stats = await db_service.get_scene_statistics(user_id=user_id)
    
    total_entries = progress_summary.get("total_entries", 0) if progress_summary else 0
    completed_entries = progress_summary.get("completed_entries", 0) if progress_summary else 0
    emotion_records = emotion_stats.get("total_records", 0)
    social_interactions = decoder_stats.get("total", 0)
    
    # 连续学习成就
    progress_entries = await progress_service.list_entries(user_id, limit=100)
    consecutive_days = 0
    if progress_entries:
        current_date = None
        for entry in sorted(progress_entries, key=lambda x: x.get("timestamp", ""), reverse=True):
            entry_date = entry.get("timestamp", "")
            if entry_date:
                try:
                    entry_datetime = datetime.fromisoformat(entry_date.replace("Z", "+00:00"))
                    date_str = entry_datetime.strftime("%Y-%m-%d")
                    if current_date is None:
                        current_date = date_str
                        consecutive_days = 1
                    elif date_str == current_date:
                        continue
                    else:
                        break
                except:
                    pass
    
    # 定义成就规则
    achievement_rules = [
        {
            "id": "first_step",
            "title": "第一步",
            "description": "完成第一次进度记录",
            "icon": "🎯",
            "unlocked": total_entries >= 1,
        },
        {
            "id": "week_warrior",
            "title": "一周战士",
            "description": "连续学习7天",
            "icon": "⭐",
            "unlocked": consecutive_days >= 7,
        },
        {
            "id": "month_master",
            "title": "月度大师",
            "description": "连续学习30天",
            "icon": "🌟",
            "unlocked": consecutive_days >= 30,
        },
        {
            "id": "task_completer",
            "title": "任务完成者",
            "description": "完成10个任务",
            "icon": "✅",
            "unlocked": completed_entries >= 10,
        },
        {
            "id": "task_master",
            "title": "任务大师",
            "description": "完成50个任务",
            "icon": "🏆",
            "unlocked": completed_entries >= 50,
        },
        {
            "id": "emotion_explorer",
            "title": "情绪探索者",
            "description": "记录10次情绪",
            "icon": "😊",
            "unlocked": emotion_records >= 10,
        },
        {
            "id": "emotion_master",
            "title": "情绪大师",
            "description": "记录50次情绪",
            "icon": "🎭",
            "unlocked": emotion_records >= 50,
        },
        {
            "id": "social_butterfly",
            "title": "社交小能手",
            "description": "完成10次社交互动",
            "icon": "👥",
            "unlocked": social_interactions >= 10,
        },
        {
            "id": "positive_thinker",
            "title": "积极思考者",
            "description": "积极情绪占比超过70%",
            "icon": "🌈",
            "unlocked": emotion_trend.get("positive_ratio", 0) >= 0.7,
        },
        {
            "id": "progress_champion",
            "title": "进步冠军",
            "description": "任务完成率超过80%",
            "icon": "👑",
            "unlocked": (completed_entries / total_entries * 100) >= 80 if total_entries > 0 else False,
        },
    ]
    
    # 计算解锁的成就
    unlocked_count = sum(1 for rule in achievement_rules if rule["unlocked"])
    
    return {
        "user_id": user_id,
        "total_achievements": len(achievement_rules),
        "unlocked_count": unlocked_count,
        "progress": round((unlocked_count / len(achievement_rules)) * 100, 2),
        "achievements": achievement_rules
    }

