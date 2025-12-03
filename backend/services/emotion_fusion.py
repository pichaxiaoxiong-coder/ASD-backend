"""情绪融合模块：多模态情绪融合理论实现"""
from typing import Dict, Any, List, Optional
from enum import Enum
from statistics import mean
from collections import Counter


class FusionStrategy(str, Enum):
    """融合策略枚举"""
    WEIGHTED = "weighted"  # 加权融合
    NEGATIVE_PRIORITY = "negative_priority"  # 负面优先
    DYNAMIC_WEIGHT = "dynamic_weight"  # 动态权重
    VOTING = "voting"  # 投票（默认）


class EmotionFusionModule:
    """情绪融合模块：实现多种融合策略"""
    
    # 默认权重配置
    DEFAULT_WEIGHTS = {
        "text": 0.5,
        "voice": 0.3,
        "face": 0.2
    }
    
    # 情绪优先级（负面情绪优先级更高）
    EMOTION_PRIORITY = {
        "sad": 5,
        "angry": 5,
        "anxious": 4,
        "fear": 4,
        "tired": 3,
        "neutral": 2,
        "happy": 1,
        "excited": 1,
        "surprised": 2
    }
    
    def __init__(
        self,
        strategy: FusionStrategy = FusionStrategy.WEIGHTED,
        weights: Optional[Dict[str, float]] = None
    ):
        """
        初始化融合模块
        
        Args:
            strategy: 融合策略
            weights: 自定义权重（如果为None，使用默认权重）
        """
        self.strategy = strategy
        self.weights = weights or self.DEFAULT_WEIGHTS.copy()
        self._normalize_weights()
    
    def _normalize_weights(self):
        """归一化权重（确保总和为1）"""
        total = sum(self.weights.values())
        if total > 0:
            self.weights = {k: v / total for k, v in self.weights.items()}
    
    async def fuse(
        self,
        text_emotion: Optional[Dict[str, Any]] = None,
        voice_emotion: Optional[Dict[str, Any]] = None,
        face_emotion: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
        historical_weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        融合多模态情绪结果
        
        Args:
            text_emotion: 文本情绪结果
            voice_emotion: 语音情绪结果
            face_emotion: 面部情绪结果
            user_id: 用户ID（用于动态权重计算）
            historical_weights: 历史权重（用于动态权重策略）
        
        Returns:
            {
                "emotion": "最终情绪",
                "confidence": 0.0-1.0,
                "intensity": 0.0-1.0,
                "sources": [...],
                "fusion_method": "使用的融合方法",
                "weights_used": {...},
                "details": {...}
            }
        """
        # 收集所有有效结果
        results = []
        if text_emotion:
            results.append({**text_emotion, "modality": "text"})
        if voice_emotion:
            results.append({**voice_emotion, "modality": "voice"})
        if face_emotion:
            results.append({**face_emotion, "modality": "face"})
        
        if not results:
            return {
                "emotion": "unknown",
                "confidence": 0.0,
                "intensity": 0.0,
                "sources": [],
                "fusion_method": self.strategy.value,
                "weights_used": {},
                "details": {}
            }
        
        # 根据策略选择融合方法
        if self.strategy == FusionStrategy.WEIGHTED:
            return self._weighted_fusion(results)
        elif self.strategy == FusionStrategy.NEGATIVE_PRIORITY:
            return self._negative_priority_fusion(results)
        elif self.strategy == FusionStrategy.DYNAMIC_WEIGHT:
            # 动态权重需要异步调用
            import asyncio
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    # 如果已经在事件循环中，需要特殊处理
                    # 这里简化处理，使用同步方式
                    return self._dynamic_weight_fusion_sync(results, user_id, historical_weights)
                else:
                    return loop.run_until_complete(
                        self._dynamic_weight_fusion(results, user_id, historical_weights)
                    )
            except RuntimeError:
                # 没有事件循环，使用同步方式
                return self._dynamic_weight_fusion_sync(results, user_id, historical_weights)
        else:  # VOTING
            return self._voting_fusion(results)
    
    def _dynamic_weight_fusion_sync(
        self,
        results: List[Dict[str, Any]],
        user_id: Optional[str],
        historical_weights: Optional[Dict[str, float]]
    ) -> Dict[str, Any]:
        """动态权重融合（同步版本，用于没有事件循环的情况）"""
        # 如果提供了历史权重，使用历史权重
        if historical_weights:
            dynamic_weights = historical_weights.copy()
        else:
            # 回退到默认权重（无法异步计算时）
            dynamic_weights = self.weights.copy()
    
    def _weighted_fusion(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """加权融合：W1 * text + W2 * voice + W3 * face"""
        emotion_scores: Dict[str, float] = {}
        emotion_intensities: Dict[str, List[float]] = {}
        total_confidence = 0.0
        
        for result in results:
            modality = result.get("modality", "unknown")
            emotion = result.get("emotion", "neutral")
            confidence = result.get("confidence", 0.5)
            intensity = result.get("intensity", confidence)  # 如果没有intensity，使用confidence
            
            # 获取该模态的权重
            weight = self.weights.get(modality, 0.0)
            
            # 加权累加
            if emotion not in emotion_scores:
                emotion_scores[emotion] = 0.0
                emotion_intensities[emotion] = []
            
            emotion_scores[emotion] += weight * confidence
            emotion_intensities[emotion].append(intensity)
            total_confidence += weight * confidence
        
        # 选择得分最高的情绪
        if not emotion_scores:
            final_emotion = "neutral"
            final_confidence = 0.5
        else:
            final_emotion = max(emotion_scores.items(), key=lambda x: x[1])[0]
            final_confidence = emotion_scores[final_emotion]
        
        # 计算平均强度
        final_intensity = mean(emotion_intensities.get(final_emotion, [0.5]))
        
        return {
            "emotion": final_emotion,
            "confidence": round(final_confidence, 2),
            "intensity": round(final_intensity, 2),
            "sources": results,
            "fusion_method": "weighted",
            "weights_used": self.weights.copy(),
            "details": {
                "emotion_scores": {k: round(v, 2) for k, v in emotion_scores.items()},
                "total_confidence": round(total_confidence, 2)
            }
        }
    
    def _negative_priority_fusion(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """负面优先融合：negative 最高优先"""
        # 首先按优先级排序
        prioritized_results = []
        for result in results:
            emotion = result.get("emotion", "neutral")
            priority = self.EMOTION_PRIORITY.get(emotion, 2)
            prioritized_results.append({
                **result,
                "priority": priority
            })
        
        # 按优先级降序排序（优先级高的在前）
        prioritized_results.sort(key=lambda x: x["priority"], reverse=True)
        
        # 选择优先级最高的情绪
        top_result = prioritized_results[0]
        final_emotion = top_result.get("emotion", "neutral")
        final_confidence = top_result.get("confidence", 0.5)
        final_intensity = top_result.get("intensity", final_confidence)
        
        # 如果有多个相同优先级的情绪，计算加权平均
        same_priority = [r for r in prioritized_results if r["priority"] == top_result["priority"]]
        if len(same_priority) > 1:
            confidences = [r.get("confidence", 0.5) for r in same_priority]
            intensities = [r.get("intensity", r.get("confidence", 0.5)) for r in same_priority]
            final_confidence = mean(confidences)
            final_intensity = mean(intensities)
        
        return {
            "emotion": final_emotion,
            "confidence": round(final_confidence, 2),
            "intensity": round(final_intensity, 2),
            "sources": results,
            "fusion_method": "negative_priority",
            "weights_used": {},
            "details": {
                "priority_used": top_result["priority"],
                "same_priority_count": len(same_priority)
            }
        }
    
    async def _dynamic_weight_fusion(
        self,
        results: List[Dict[str, Any]],
        user_id: Optional[str],
        historical_weights: Optional[Dict[str, float]]
    ) -> Dict[str, Any]:
        """动态权重融合：根据历史数据调整权重"""
        # 如果提供了历史权重，使用历史权重
        if historical_weights:
            dynamic_weights = historical_weights.copy()
        elif user_id:
            # 尝试从用户历史数据计算动态权重
            dynamic_weights = await self._calculate_dynamic_weights(user_id, results)
        else:
            # 回退到默认权重
            dynamic_weights = self.weights.copy()
        
        # 归一化动态权重
        total = sum(dynamic_weights.values())
        if total > 0:
            dynamic_weights = {k: v / total for k, v in dynamic_weights.items()}
        else:
            dynamic_weights = self.weights.copy()
        
        # 使用加权融合，但使用动态权重
        original_weights = self.weights.copy()
        self.weights = dynamic_weights
        result = self._weighted_fusion(results)
        self.weights = original_weights  # 恢复原权重
        
        result["fusion_method"] = "dynamic_weight"
        result["weights_used"] = dynamic_weights.copy()
        result["details"]["dynamic_weights"] = dynamic_weights.copy()
        
        return result
    
    def _dynamic_weight_fusion_sync(
        self,
        results: List[Dict[str, Any]],
        user_id: Optional[str],
        historical_weights: Optional[Dict[str, float]]
    ) -> Dict[str, Any]:
        """动态权重融合（同步版本，用于没有事件循环的情况）"""
        # 如果提供了历史权重，使用历史权重
        if historical_weights:
            dynamic_weights = historical_weights.copy()
        else:
            # 回退到默认权重（无法异步计算时）
            dynamic_weights = self.weights.copy()
        
        # 归一化动态权重
        total = sum(dynamic_weights.values())
        if total > 0:
            dynamic_weights = {k: v / total for k, v in dynamic_weights.items()}
        else:
            dynamic_weights = self.weights.copy()
        
        # 使用加权融合，但使用动态权重
        original_weights = self.weights.copy()
        self.weights = dynamic_weights
        result = self._weighted_fusion(results)
        self.weights = original_weights  # 恢复原权重
        
        result["fusion_method"] = "dynamic_weight"
        result["weights_used"] = dynamic_weights.copy()
        result["details"]["dynamic_weights"] = dynamic_weights.copy()
        
        return result
    
    async def _calculate_dynamic_weights(
        self,
        user_id: str,
        current_results: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """
        根据用户历史数据计算动态权重
        
        策略：
        1. 分析历史记录中每个模态的准确度
        2. 准确度高的模态权重更高
        3. 如果某个模态经常检测到负面情绪，增加其权重
        """
        try:
            from services.emotion_profile_service import EmotionProfileService
            from services.emotion_service import EmotionService
            
            profile_service = EmotionProfileService()
            emotion_service = EmotionService()
            
            # 获取用户Profile和历史记录
            profile = await profile_service.get_profile(user_id)
            history = await emotion_service.get_emotion_history(user_id, days=7, limit=100)
            
            if not history:
                return self.weights.copy()
            
            # 统计每个模态的准确度（简化：基于情绪一致性）
            modality_scores = {"text": 0.0, "voice": 0.0, "face": 0.0}
            modality_counts = {"text": 0, "voice": 0, "face": 0}
            
            # 分析历史记录（简化处理）
            # 实际应该分析每个模态的预测准确度
            for record in history:
                source = record.get("source", "")
                if "text" in source:
                    modality_scores["text"] += 1.0
                    modality_counts["text"] += 1
                elif "voice" in source:
                    modality_scores["voice"] += 1.0
                    modality_counts["voice"] += 1
                elif "face" in source:
                    modality_scores["face"] += 1.0
                    modality_counts["face"] += 1
            
            # 计算权重（基于使用频率和准确度）
            dynamic_weights = {}
            for modality in ["text", "voice", "face"]:
                if modality_counts[modality] > 0:
                    # 使用频率越高，权重越高
                    frequency_score = modality_counts[modality] / len(history)
                    # 准确度（简化：假设使用频率高的更准确）
                    accuracy_score = modality_scores[modality] / modality_counts[modality]
                    dynamic_weights[modality] = frequency_score * accuracy_score
                else:
                    dynamic_weights[modality] = self.weights.get(modality, 0.0)
            
            # 如果用户敏感度高，增加文本权重（文本更可靠）
            if profile.sensitivity > 0.7:
                dynamic_weights["text"] = dynamic_weights.get("text", 0.0) * 1.2
                # 重新归一化
                total = sum(dynamic_weights.values())
                if total > 0:
                    dynamic_weights = {k: v / total for k, v in dynamic_weights.items()}
            
            return dynamic_weights
            
        except Exception:
            # 出错时返回默认权重
            return self.weights.copy()
    
    def _voting_fusion(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """投票融合：简单投票 + 置信度平均（原方法）"""
        emotion_scores: Dict[str, List[float]] = {}
        emotion_intensities: Dict[str, List[float]] = {}
        
        for result in results:
            emotion = result.get("emotion", "neutral")
            confidence = result.get("confidence", 0.5)
            intensity = result.get("intensity", confidence)
            
            if emotion not in emotion_scores:
                emotion_scores[emotion] = []
                emotion_intensities[emotion] = []
            
            emotion_scores[emotion].append(confidence)
            emotion_intensities[emotion].append(intensity)
        
        # 选择得票最多的情绪
        if not emotion_scores:
            final_emotion = "neutral"
            final_confidence = 0.5
            final_intensity = 0.5
        else:
            # 按得票数（列表长度）和总置信度排序
            emotion_votes = {
                emotion: (len(scores), sum(scores))
                for emotion, scores in emotion_scores.items()
            }
            final_emotion = max(emotion_votes.items(), key=lambda x: (x[1][0], x[1][1]))[0]
            final_confidence = mean(emotion_scores[final_emotion])
            final_intensity = mean(emotion_intensities.get(final_emotion, [0.5]))
        
        return {
            "emotion": final_emotion,
            "confidence": round(final_confidence, 2),
            "intensity": round(final_intensity, 2),
            "sources": results,
            "fusion_method": "voting",
            "weights_used": {},
            "details": {
                "emotion_votes": {k: len(v) for k, v in emotion_scores.items()}
            }
        }
    
    def update_weights(self, weights: Dict[str, float]):
        """更新权重配置"""
        self.weights.update(weights)
        self._normalize_weights()
    
    def set_strategy(self, strategy: FusionStrategy):
        """设置融合策略"""
        self.strategy = strategy



