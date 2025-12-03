from __future__ import annotations

from typing import Dict, Any, Optional, List
from statistics import mean

from services.emotion_providers import (
    build_text_provider,
    build_voice_provider,
    build_face_provider,
    HeuristicTextProvider,
    HeuristicVoiceProvider,
    HeuristicFaceProvider,
)
from services.emotion_service import EmotionService
from services.emotion_fusion import EmotionFusionModule, FusionStrategy
from core.config import settings


class RealTimeEmotionService:
    """实时情绪识别服务：支持文本、语音、面部微表情等多模态输入。"""

    def __init__(
        self,
        fusion_strategy: Optional[FusionStrategy] = None,
        fusion_weights: Optional[Dict[str, float]] = None
    ):
        self.emotion_service = EmotionService()
        self.text_provider = build_text_provider()
        self.voice_provider = build_voice_provider()
        self.face_provider = build_face_provider()
        self.text_fallback = HeuristicTextProvider()
        self.voice_fallback = HeuristicVoiceProvider()
        self.face_fallback = HeuristicFaceProvider()
        
        # 初始化融合模块（从配置或参数获取）
        if fusion_strategy is None:
            strategy_name = settings.EMOTION_FUSION_STRATEGY.lower()
            fusion_strategy = FusionStrategy(strategy_name) if strategy_name in [s.value for s in FusionStrategy] else FusionStrategy.WEIGHTED
        
        if fusion_weights is None:
            fusion_weights = {
                "text": settings.EMOTION_FUSION_WEIGHT_TEXT,
                "voice": settings.EMOTION_FUSION_WEIGHT_VOICE,
                "face": settings.EMOTION_FUSION_WEIGHT_FACE
            }
        
        self.fusion_module = EmotionFusionModule(
            strategy=fusion_strategy,
            weights=fusion_weights
        )

    def _run_provider(
        self,
        provider,
        payload: Dict[str, Any],
        fallback,
        source: str,
    ) -> Dict[str, Any]:
        try:
            result = provider.analyze(payload)
        except Exception:
            result = fallback.analyze(payload)
        result.setdefault("details", payload)
        result.setdefault("source", source)
        return result

    def analyze_text(self, text: str) -> Dict[str, Any]:
        return self._run_provider(
            self.text_provider,
            {"text": text},
            self.text_fallback,
            source="text",
        )

    def analyze_voice(self, voice_features: Dict[str, float]) -> Dict[str, Any]:
        return self._run_provider(
            self.voice_provider,
            voice_features,
            self.voice_fallback,
            source="voice",
        )

    def analyze_face(self, face_features: Dict[str, float]) -> Dict[str, Any]:
        return self._run_provider(
            self.face_provider,
            face_features,
            self.face_fallback,
            source="face",
        )

    async def fuse_results(
        self,
        results: List[Dict[str, Any]],
        user_id: Optional[str] = None,
        historical_weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        多模态融合：使用融合模块进行融合
        
        Args:
            results: 多模态结果列表
            user_id: 用户ID（用于动态权重计算）
            historical_weights: 历史权重（用于动态权重策略）
        """
        if not results:
            return {
                "emotion": "unknown",
                "confidence": 0.0,
                "intensity": 0.0,
                "sources": [],
                "fusion_method": "none",
                "weights_used": {},
                "details": {}
            }
        
        # 分离不同模态的结果
        text_emotion = None
        voice_emotion = None
        face_emotion = None
        
        for result in results:
            source = result.get("source", "")
            if "text" in source:
                text_emotion = result
            elif "voice" in source:
                voice_emotion = result
            elif "face" in source:
                face_emotion = result
        
        # 使用融合模块进行融合
        fused = await self.fusion_module.fuse(
            text_emotion=text_emotion,
            voice_emotion=voice_emotion,
            face_emotion=face_emotion,
            user_id=user_id,
            historical_weights=historical_weights
        )
        
        return fused

    async def analyze(
        self,
        user_id: Optional[str] = None,
        text: Optional[str] = None,
        voice_features: Optional[Dict[str, float]] = None,
        face_features: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """综合分析入口。"""
        modality_results: List[Dict[str, Any]] = []

        if text:
            modality_results.append(self.analyze_text(text))

        if voice_features:
            modality_results.append(self.analyze_voice(voice_features))

        if face_features:
            modality_results.append(self.analyze_face(face_features))

        fused = await self.fuse_results(modality_results, user_id=user_id)

        # 联动情感导师：同步记录情绪
        if user_id and text:
            await self.emotion_service.detect_user_emotion(text, user_id=user_id)

        # 推送到 WebSocket 订阅者
        if user_id:
            try:
                from services.ws_manager import ws_manager

                await ws_manager.broadcast(
                    user_id,
                    {
                        "type": "emotion_update",
                        "user_id": user_id,
                        "data": fused,
                    },
                )
            except Exception:
                pass

        return fused



