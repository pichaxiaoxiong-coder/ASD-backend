"""风险检测服务：检测情绪风险和安全问题"""
from typing import Dict, Any, Optional
from services.ai_service import AIService
from services.emotion_profile_service import EmotionProfileService
from services.config_service import get_config_service


class RiskDetectionService:
    """风险检测服务：检测情绪风险和安全问题"""
    
    def __init__(self):
        self.ai_service = AIService()
        self.profile_service = EmotionProfileService()
        self.config_service = get_config_service()
    
    async def detect(self, text: str, use_ai: bool = True, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        检测风险
        
        Args:
            text: 文本内容
            use_ai: 是否使用AI
            user_id: 用户ID（用于获取Profile）
        
        Returns:
            {
                "risk_level": "low" | "medium" | "high",
                "risk_type": "情绪风险" | "安全风险" | "无风险",
                "confidence": 0.0-1.0,
                "reasons": ["原因1", "原因2"],
                "suggestions": ["建议1", "建议2"]
            }
        """
        # 基础风险检测
        base_risk = await self._detect_base_risk(text)
        
        # 如果提供了用户ID，使用Profile进行个性化风险检测
        if user_id:
            profile_risk = await self._detect_with_profile(text, user_id)
            # 合并结果
            risk_level = self._merge_risk_levels(base_risk["risk_level"], profile_risk["risk_level"])
            reasons = base_risk["reasons"] + profile_risk["reasons"]
            suggestions = base_risk["suggestions"] + profile_risk["suggestions"]
        else:
            risk_level = base_risk["risk_level"]
            reasons = base_risk["reasons"]
            suggestions = base_risk["suggestions"]
        
        # AI增强检测（如果启用）
        if use_ai and self.ai_service._client:
            ai_risk = await self._detect_with_ai(text)
            if ai_risk["risk_level"] == "high" or risk_level == "low":
                risk_level = ai_risk["risk_level"]
                reasons.extend(ai_risk["reasons"])
                suggestions.extend(ai_risk["suggestions"])
        
        return {
            "risk_level": risk_level,
            "risk_type": "情绪风险" if risk_level != "low" else "无风险",
            "confidence": 0.7 if risk_level != "low" else 0.5,
            "reasons": list(set(reasons)),  # 去重
            "suggestions": list(set(suggestions))[:5]  # 去重并限制数量
        }
    
    async def _detect_base_risk(self, text: str) -> Dict[str, Any]:
        """基础风险检测（规则，使用可配置的风险词库）"""
        text_lower = text.lower()
        
        # 从配置服务获取风险词库
        try:
            risk_keywords = await self.config_service.get_risk_keywords()
            high_risk_words = risk_keywords.get("high_risk", [])
            medium_risk_words = risk_keywords.get("medium_risk", [])
            
            # 如果配置中没有，使用默认值
            if not high_risk_words:
                high_risk_words = ["想死", "不想活了", "绝望", "崩溃", "自杀", "自残"]
            if not medium_risk_words:
                medium_risk_words = ["难过", "痛苦", "受不了", "压力大", "焦虑", "害怕"]
        except Exception:
            # 降级到默认值
            high_risk_words = ["想死", "不想活了", "绝望", "崩溃", "自杀", "自残"]
            medium_risk_words = ["难过", "痛苦", "受不了", "压力大", "焦虑", "害怕"]
        
        risk_level = "low"
        reasons = []
        suggestions = []
        
        # 检测高风险词汇
        for word in high_risk_words:
            if word in text_lower:
                risk_level = "high"
                reasons.append(f"检测到高风险词汇：{word}")
                suggestions.append("建议立即寻求专业帮助或联系紧急支持")
                break
        
        # 检测中风险词汇
        if risk_level == "low":
            for word in medium_risk_words:
                if word in text_lower:
                    risk_level = "medium"
                    reasons.append(f"检测到负面情绪词汇：{word}")
                    suggestions.append("建议关注情绪变化，考虑寻求支持")
                    break
        
        return {
            "risk_level": risk_level,
            "reasons": reasons,
            "suggestions": suggestions
        }
    
    async def _detect_with_profile(self, text: str, user_id: str) -> Dict[str, Any]:
        """基于Profile的个性化风险检测"""
        try:
            profile = await self.profile_service.get_profile(user_id)
            
            risk_level = "low"
            reasons = []
            suggestions = []
            
            # 检查触发词
            text_lower = text.lower()
            matched_triggers = [word for word in profile.trigger_words if word in text_lower]
            
            if matched_triggers:
                risk_level = "medium"
                reasons.append(f"检测到你的触发词：{', '.join(matched_triggers)}")
                suggestions.append("检测到可能引起情绪波动的内容，建议采取放松措施")
            
            # 检查敏感度阈值
            # 如果用户敏感度高，且检测到负面内容，提升风险等级
            if profile.sensitivity > 0.7 and any(word in text_lower for word in ["拒绝", "批评", "冲突"]):
                if risk_level == "low":
                    risk_level = "medium"
                reasons.append(f"基于你的敏感度（{profile.sensitivity}），检测到可能引起情绪波动的内容")
            
            # 检查最近趋势
            if profile.recent_trend == "declining":
                if risk_level == "low":
                    risk_level = "medium"
                reasons.append("你最近的情绪趋势呈下降状态，需要额外关注")
                suggestions.append("建议采取情绪管理措施，或寻求专业支持")
            
            # 检查风险阈值
            # 这里可以根据Profile的风险阈值进行更精细的判断
            # 简化处理：如果敏感度高且趋势下降，提升风险等级
            if profile.sensitivity > profile.risk_threshold and profile.recent_trend in ["declining", "slightly_negative"]:
                if risk_level == "medium":
                    risk_level = "high"
                reasons.append("基于你的情绪Profile，当前情况需要高度关注")
                suggestions.append("强烈建议寻求专业支持或采取紧急干预措施")
            
            return {
                "risk_level": risk_level,
                "reasons": reasons,
                "suggestions": suggestions
            }
        except Exception:
            return {
                "risk_level": "low",
                "reasons": [],
                "suggestions": []
            }
    
    async def _detect_with_ai(self, text: str) -> Dict[str, Any]:
        """使用AI进行风险检测"""
        try:
            prompt = f"""分析以下文本是否存在情绪风险或安全问题。

文本：{text}

请判断风险等级（low/medium/high），并提供原因和建议。

请以JSON格式返回：
{{
    "risk_level": "low" | "medium" | "high",
    "reasons": ["原因1", "原因2"],
    "suggestions": ["建议1", "建议2"]
}}"""
            
            resp = self.ai_service._client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "你是一个情绪风险检测专家，擅长识别文本中的情绪风险和安全问题。"
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=200,
                response_format={"type": "json_object"}
            )
            
            import json
            result = json.loads(resp.choices[0].message.content or "{}")
            
            return {
                "risk_level": result.get("risk_level", "low"),
                "reasons": result.get("reasons", []),
                "suggestions": result.get("suggestions", [])
            }
        except Exception:
            return {
                "risk_level": "low",
                "reasons": [],
                "suggestions": []
            }
    
    def _merge_risk_levels(self, level1: str, level2: str) -> str:
        """合并风险等级（取较高者）"""
        risk_order = {"low": 0, "medium": 1, "high": 2}
        return max(level1, level2, key=lambda x: risk_order.get(x, 0))



