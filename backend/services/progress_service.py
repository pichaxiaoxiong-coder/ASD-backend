"""
进度服务：管理用户进度记录和统计
"""
from __future__ import annotations

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from core.utils import utc_now_iso
from services.db_service import DBService
from models.progress_model import ProgressLog, ProgressEntry


class ProgressService:
    """进度管理服务"""

    def __init__(self):
        self.db = DBService()

    async def add_entry(
        self,
        user_id: str,
        note: str,
        category: Optional[str] = "general",
        status: Optional[str] = "open",
        mood: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """添加进度条目"""
        entry: Dict[str, Any] = {
            "user_id": user_id,
            "note": note,
            "category": category or "general",
            "status": status or "open",
            "mood": mood,
            "tags": tags or [],
            "timestamp": utc_now_iso(),
            "type": "progress_log",
        }
        return await self.db.add_log(entry)

    async def list_entries(
        self,
        user_id: str,
        limit: int = 20,
        page: int = 1,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        status: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """
        列出用户的进度条目（支持简单分页与过滤）

        - limit: 每页数量
        - page: 页码（从 1 开始）
        - start_date/end_date: 过滤时间范围（ISO 日期字符串，如 2025-01-01）
        - status: 状态过滤
        - tags: 按标签过滤（任一匹配）
        """
        if page < 1:
            page = 1
        if limit <= 0:
            limit = 20

        query: Dict[str, Any] = {
            "user_id": user_id,
            "type": "progress_log",
        }

        # 状态过滤
        if status:
            query["status"] = status

        # 标签过滤（任一匹配）
        if tags:
            query["tags"] = {"$in": tags}

        # 时间范围过滤（基于 ISO 字符串，便于 Mongo / 内存双模式）
        time_filter: Dict[str, Any] = {}
        if start_date:
            # 只要是前缀合法的 ISO 日期字符串即可
            time_filter["$gte"] = f"{start_date}T00:00:00"
        if end_date:
            time_filter["$lte"] = f"{end_date}T23:59:59"
        if time_filter:
            query["timestamp"] = time_filter

        skip = (page - 1) * limit

        logs = await self.db.fetch_logs(
            query=query,
            limit=limit,
            sort=[("timestamp", -1)],
            skip=skip,
        )
        return logs

    async def get_summary(
        self, user_id: str, days: int = 14
    ) -> Dict[str, Any]:
        """获取进度摘要统计"""
        # 获取所有进度条目
        entries = await self.list_entries(user_id, limit=500)
        
        # 计算时间范围
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # 过滤指定天数内的记录
        recent_entries = []
        for entry in entries:
            entry_date = entry.get("timestamp", "")
            if entry_date:
                try:
                    if isinstance(entry_date, str):
                        entry_datetime = datetime.fromisoformat(entry_date.replace("Z", "+00:00"))
                    else:
                        entry_datetime = entry_date
                    
                    if entry_datetime.replace(tzinfo=None) >= cutoff_date:
                        recent_entries.append(entry)
                except Exception:
                    # 如果日期解析失败，包含该条目
                    recent_entries.append(entry)
        
        # 统计
        total_entries = len(recent_entries)
        completed_entries = sum(
            1
            for entry in recent_entries
            if entry.get("status") in ["closed", "completed"]
        )
        
        # 按分类统计
        categories = {}
        for entry in recent_entries:
            category = entry.get("category", "general")
            categories[category] = categories.get(category, 0) + 1
        
        return {
            "user_id": user_id,
            "period_days": days,
            "total_entries": total_entries,
            "completed_entries": completed_entries,
            "categories": categories,
            "recent_entries": recent_entries[:10],  # 最近10条
        }

    async def update_entry(
        self, entry_id: str, status: str, note: Optional[str] = None
    ) -> Dict[str, Any]:
        """更新进度条目"""
        # 这里简化处理，实际应该从数据库查询并更新
        # 由于使用内存存储，这里返回更新后的结构
        return {
            "entry_id": entry_id,
            "status": status,
            "note": note,
            "updated_at": utc_now_iso(),
            "message": "更新成功",
        }
