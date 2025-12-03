from __future__ import annotations

from typing import Optional


class StyleController:
    STYLE_MAP = {
        "gentle": "Use a warm, gentle, and validating tone. Prioritize emotional comfort.",
        "coach": "Use an encouraging, coaching tone. Offer clear steps and gentle challenges.",
        "mixed": "Blend empathy with practical coaching. Be both understanding and action-oriented.",
    }
    DEFAULT_STYLE = "mixed"

    def get_instruction(self, style: Optional[str], user_id: Optional[str] = None) -> str:
        """
        获取风格指令
        
        Args:
            style: 指定的风格
            user_id: 用户ID（用于根据Profile自动调整）
        """
        if not style:
            # 如果没有指定风格，根据Profile自动选择
            if user_id:
                style = self._get_auto_style(user_id)
            else:
                style = self.DEFAULT_STYLE
        
        key = style.lower()
        if key not in self.STYLE_MAP:
            key = self.DEFAULT_STYLE
        
        base_instruction = self.STYLE_MAP[key]
        
        # 如果提供了user_id，根据Profile调整语气
        if user_id:
            profile_adjustment = self._get_profile_adjustment(user_id)
            if profile_adjustment:
                base_instruction += f" {profile_adjustment}"
        
        return base_instruction
    
    def _get_auto_style(self, user_id: str) -> str:
        """根据Profile自动选择风格"""
        try:
            from services.emotion_profile_service import EmotionProfileService
            import asyncio
            
            profile_service = EmotionProfileService()
            # 注意：这里需要异步调用，但在同步方法中
            # 简化处理：返回默认风格
            # 实际应该在调用方传入profile
            return self.DEFAULT_STYLE
        except Exception:
            return self.DEFAULT_STYLE
    
    def _get_profile_adjustment(self, user_id: str) -> Optional[str]:
        """根据Profile获取语气调整建议"""
        try:
            from services.emotion_profile_service import EmotionProfileService
            import asyncio
            
            profile_service = EmotionProfileService()
            # 简化处理：返回空
            # 实际应该在调用方传入profile
            return None
        except Exception:
            return None
    
    def get_instruction_with_profile(self, style: Optional[str], profile: Optional[dict] = None) -> str:
        """
        获取风格指令（带Profile）
        
        Args:
            style: 指定的风格
            profile: 用户Profile字典
        """
        if not style:
            # 根据Profile自动选择
            if profile:
                sensitivity = profile.get("sensitivity", 0.5)
                recent_trend = profile.get("recent_trend", "stable")
                
                # 如果敏感度高或趋势下降，使用gentle风格
                if sensitivity > 0.7 or recent_trend in ["declining", "slightly_negative"]:
                    style = "gentle"
                else:
                    style = self.DEFAULT_STYLE
            else:
                style = self.DEFAULT_STYLE
        
        key = style.lower()
        if key not in self.STYLE_MAP:
            key = self.DEFAULT_STYLE
        
        base_instruction = self.STYLE_MAP[key]
        
        # 根据Profile调整语气
        if profile:
            adjustments = []
            
            # 如果敏感度高，语气更柔和
            if profile.get("sensitivity", 0.5) > 0.7:
                adjustments.append("Use extra gentle and patient language.")
            
            # 如果趋势下降，增加支持性
            if profile.get("recent_trend") in ["declining", "slightly_negative"]:
                adjustments.append("Provide additional emotional support and validation.")
            
            # 如果有触发词，避免使用
            trigger_words = profile.get("trigger_words", [])
            if trigger_words:
                adjustments.append(f"Avoid using words that might trigger negative emotions: {', '.join(trigger_words[:3])}.")
            
            if adjustments:
                base_instruction += " " + " ".join(adjustments)
        
        return base_instruction



