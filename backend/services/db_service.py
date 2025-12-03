from typing import Any, Dict, List, Optional, Iterable, Tuple
from datetime import datetime
from core.config import settings

try:
    from motor.motor_asyncio import AsyncIOMotorClient
    from pymongo import ASCENDING, DESCENDING
except Exception:  # motor 未安装时兜底
    AsyncIOMotorClient = None  # type: ignore


# 全局内存存储（用于单例模式）
_memory_logs: List[Dict[str, Any]] = []


class DBService:
    _indexes_initialized: bool = False

    def __init__(self):
        self._client: Optional[AsyncIOMotorClient] = None
        self._db = None
        if settings.MONGO_URI and AsyncIOMotorClient is not None:
            self._client = AsyncIOMotorClient(settings.MONGO_URI)
            self._db = self._client[settings.MONGO_DB]

    async def ensure_indexes(self) -> None:
        if self._db is None or DBService._indexes_initialized:
            return
        # 日志索引
        await self._db.logs.create_indexes(
            [
                [("user_id", ASCENDING)],
                [("user_id", ASCENDING), ("type", ASCENDING)],
                [("timestamp", DESCENDING)],
            ]
        )
        # 用户索引（按邮箱）
        await self._db.users.create_indexes(
            [
                [("email", ASCENDING)],
            ]
        )
        DBService._indexes_initialized = True

    async def add_log(self, item: Dict[str, Any]) -> Dict[str, Any]:
        if self._db is not None:
            result = await self._db.logs.insert_one(item)
            # 返回插入后的文档，包含 _id
            item['_id'] = str(result.inserted_id)
            return item
        else:
            # 使用全局内存存储
            global _memory_logs
            _memory_logs.append(item)
            return item

    async def list_logs(self, user_id: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """列出日志（支持按用户ID过滤）"""
        if self._db is not None:
            query = {}
            if user_id:
                query["user_id"] = user_id
            cursor = self._db.logs.find(query).sort("timestamp", -1).limit(limit)
            docs = []
            async for doc in cursor:
                # 将 ObjectId 转换为字符串
                if '_id' in doc:
                    doc['_id'] = str(doc['_id'])
                docs.append(doc)
            return docs
        # 使用全局内存存储
        global _memory_logs
        filtered = _memory_logs
        if user_id:
            filtered = [log for log in _memory_logs if log.get("user_id") == user_id]
        return list(filtered[-limit:]) if limit > 0 else list(filtered)
    
    async def get_conversation_logs(
        self, 
        user_id: Optional[str] = None,
        scene_category: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """获取社交解码对话日志"""
        if self._db is not None:
            query = {}
            if user_id:
                query["user_id"] = user_id
            if scene_category:
                query["scene_category"] = scene_category
            cursor = self._db.logs.find(query).sort("timestamp", -1).limit(limit)
            docs = []
            async for doc in cursor:
                if '_id' in doc:
                    doc['_id'] = str(doc['_id'])
                docs.append(doc)
            return docs
        # 内存模式
        global _memory_logs
        filtered = _memory_logs
        if user_id:
            filtered = [log for log in filtered if log.get("user_id") == user_id]
        if scene_category:
            filtered = [log for log in filtered if log.get("scene_category") == scene_category]
        return list(filtered[-limit:]) if limit > 0 else list(filtered)

    async def fetch_logs(
        self,
        query: Dict[str, Any],
        limit: int = 100,
        projection: Optional[Dict[str, int]] = None,
        sort: Optional[List[Tuple[str, int]]] = None,
        skip: int = 0,
    ) -> List[Dict[str, Any]]:
        """
        通用日志查询工具：
        - 支持 Mongo / 内存双模式
        - 支持 sort / limit / skip（用于分页）
        """
        if self._db is not None:
            await self.ensure_indexes()
            cursor = self._db.logs.find(query, projection or None)
            if sort:
                cursor = cursor.sort(sort)
            if skip:
                cursor = cursor.skip(skip)
            if limit:
                cursor = cursor.limit(limit)
            docs: List[Dict[str, Any]] = []
            async for doc in cursor:
                if "_id" in doc:
                    doc["_id"] = str(doc["_id"])
                docs.append(doc)
            return docs
        # 内存模式
        global _memory_logs
        filtered = [log for log in _memory_logs if self._match_memory_log(log, query)]
        if sort:
            for key, direction in reversed(sort):
                reverse = direction == DESCENDING if "DESCENDING" in globals() else direction == -1
                filtered.sort(key=lambda x, k=key: x.get(k), reverse=reverse)
        if skip:
            filtered = filtered[skip:]
        return filtered[:limit] if limit else filtered

    async def aggregate_logs(self, pipeline: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if self._db is None:
            return []
        await self.ensure_indexes()
        cursor = self._db.logs.aggregate(pipeline, allowDiskUse=True)
        return await cursor.to_list(length=None)

    def _match_memory_log(self, log: Dict[str, Any], query: Dict[str, Any]) -> bool:
        for key, value in query.items():
            log_value = log.get(key)
            if isinstance(value, dict):
                if "$in" in value and log_value not in value["$in"]:
                    return False
                if "$gte" in value and log_value < value["$gte"]:
                    return False
            else:
                if log_value != value:
                    return False
        return True
    
    async def get_scene_statistics(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """获取场景统计信息"""
        logs = await self.get_conversation_logs(user_id=user_id, limit=1000)
        
        scene_counts = {}
        total = len(logs)
        
        for log in logs:
            scene = log.get("scene_category", "未知")
            scene_counts[scene] = scene_counts.get(scene, 0) + 1
        
        return {
            "total": total,
            "scene_distribution": scene_counts,
            "most_common_scene": max(scene_counts.items(), key=lambda x: x[1])[0] if scene_counts else None
        }

    @property
    def db(self):
        """底层数据库句柄（Mongo 模式下为 AsyncIOMotorDatabase，内存模式为 None）"""
        return self._db



