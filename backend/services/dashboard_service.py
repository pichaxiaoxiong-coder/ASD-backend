from __future__ import annotations

from typing import Dict, Any

from services.emotion_service import EmotionService
from services.progress_service import ProgressService
from services.intervention_service import InterventionService
from services.companion_service import CompanionService
from services.decoder_service import DecoderService


class DashboardService:
    """聚合情绪 / 社交 / 干预等核心指标，供仪表盘使用"""

    def __init__(self):
        self.emotion_service = EmotionService()
        self.progress_service = ProgressService()
        self.intervention_service = InterventionService()
        self.companion_service = CompanionService()
        self.decoder_service = DecoderService()

    async def user_overview(self, user_id: str) -> Dict[str, Any]:
        emotion_stats = await self.emotion_service.get_emotion_statistics(user_id, days=30)
        emotion_trend = await self.emotion_service.analyze_emotion_trend(user_id, days=14)
        progress_summary = await self.progress_service.get_summary(user_id, days=14)
        plans = await self.intervention_service.list_plans(user_id, limit=5)
        history = await self.companion_service.list_history(user_id, limit=5)
        
        # 获取情绪Profile（显示敏感项）
        from services.emotion_profile_service import EmotionProfileService
        profile_service = EmotionProfileService()
        profile_summary = await profile_service.get_profile_summary(user_id)

        overview = {
            "user_id": user_id,
            "emotion": {
                "trend": emotion_trend,
                "stats": emotion_stats,
            },
            "profile": profile_summary,  # 新增：Profile信息（包含敏感项）
            "progress": progress_summary,
            "intervention": plans,
            "recent_conversations": history,
        }
        return overview

    async def global_overview(self) -> Dict[str, Any]:
        # Placeholder for global metrics; can be extended with database aggregation
        data = {
            "status": "ok",
            "tips": "Add global metrics once aggregation requirements are finalized.",
        }
        return data



