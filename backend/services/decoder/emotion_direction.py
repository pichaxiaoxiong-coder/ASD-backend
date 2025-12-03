"""二级分类器：情绪方向（positive / neutral / negative / risky）"""
from typing import Dict, Any
import re
from collections import Counter


class EmotionDirectionClassifier:
    """二级分类器：情绪方向识别"""
    
    def __init__(self):
        pass
    
    def classify(self, text: str) -> Dict[str, Any]:
        """
        二级分类：情绪方向识别
        
        Returns:
            {
                "direction": "positive" | "neutral" | "negative" | "risky",
                "confidence": 0.0-1.0,
                "sentiment_score": {...},
                "emotion_type": "具体情绪类型",
                "intensity": 0.0-1.0,
                "explanation": "分类原因说明"
            }
        """
        # 1. 基础情感倾向（直接实现，避免循环导入）
        sentiment_result = self._detect_sentiment_tendency(text)
        
        # 2. 情绪类型识别
        emotion_result = self._classify_emotion_type(text, sentiment_result)
        
        # 3. 风险检测（负面情绪 + 高强度）
        is_risky = self._detect_risk(sentiment_result, emotion_result)
        
        # 4. 确定情绪方向
        direction = self._determine_direction(sentiment_result, emotion_result, is_risky)
        
        # 5. 计算置信度
        confidence = self._calculate_confidence(sentiment_result, emotion_result, is_risky)
        
        return {
            "direction": direction,
            "confidence": confidence,
            "sentiment_score": sentiment_result,
            "emotion_type": emotion_result.get("emotion_type", "平静"),
            "intensity": emotion_result.get("intensity", 0.5),
            "is_risky": is_risky,
            "explanation": self._generate_explanation(direction, sentiment_result, emotion_result, is_risky)
        }
    
    def _detect_sentiment_tendency(self, text: str) -> Dict[str, Any]:
        """检测情感倾向（避免循环导入，直接实现）"""
        # 积极词汇
        positive_words = ['好', '棒', '开心', '高兴', '喜欢', '爱', '满意', '成功', '优秀', '美好', '快乐', '幸福']
        # 消极词汇
        negative_words = ['坏', '差', '难过', '伤心', '讨厌', '恨', '失望', '失败', '糟糕', '痛苦', '悲伤', '愤怒']
        
        positive_count = sum(1 for word in positive_words if word in text)
        negative_count = sum(1 for word in negative_words if word in text)
        
        if positive_count > negative_count:
            sentiment = "positive"
            confidence = min(0.9, 0.5 + (positive_count - negative_count) * 0.1)
        elif negative_count > positive_count:
            sentiment = "negative"
            confidence = min(0.9, 0.5 + (negative_count - positive_count) * 0.1)
        else:
            sentiment = "neutral"
            confidence = 0.5
        
        return {
            "sentiment": sentiment,
            "confidence": confidence,
            "positive_score": positive_count,
            "negative_score": negative_count,
            "text": text  # 保存文本用于后续处理
        }
    
    def _classify_emotion_type(self, text: str, sentiment: Dict[str, Any]) -> Dict[str, Any]:
        """分类情绪类型（复用EmotionService逻辑）"""
        text_lower = text.lower()
        
        # 情绪关键词映射
        emotion_keywords = {
            "开心": ["开心", "高兴", "快乐", "愉快", "兴奋", "太棒了", "太好了", "真棒"],
            "难过": ["难过", "伤心", "悲伤", "沮丧", "失落", "想哭"],
            "生气": ["生气", "愤怒", "恼火", "烦躁", "讨厌", "烦死了"],
            "焦虑": ["焦虑", "担心", "不安", "紧张", "害怕", "恐惧"],
            "平静": ["平静", "放松", "舒服", "安心", "稳定"],
            "疲惫": ["累", "疲惫", "疲倦", "困", "没精神"],
            "失望": ["失望", "绝望", "无奈", "遗憾"],
            "尴尬": ["尴尬", "不好意思", "难为情"],
            "惊讶": ["惊讶", "震惊", "没想到", "居然"],
            "无聊": ["无聊", "没意思", "空虚"]
        }
        
        # 匹配情绪关键词
        emotion_type = "平静"
        intensity = 0.5
        
        for emotion, keywords in emotion_keywords.items():
            matches = sum(1 for keyword in keywords if keyword in text_lower)
            if matches > 0:
                emotion_type = emotion
                intensity = min(1.0, 0.5 + matches * 0.15)
                break
        
        # 如果没有匹配到，基于情感倾向推断
        if emotion_type == "平静":
            sentiment_type = sentiment.get("sentiment", "neutral")
            if sentiment_type == "positive":
                emotion_type = "开心"
                intensity = 0.6
            elif sentiment_type == "negative":
                emotion_type = "难过"
                intensity = 0.6
        
        return {
            "emotion_type": emotion_type,
            "intensity": intensity
        }
    
    def _detect_risk(self, sentiment: Dict[str, Any], emotion: Dict[str, Any]) -> bool:
        """检测是否为风险情绪（负面 + 高强度）"""
        negative_emotions = ["难过", "生气", "焦虑", "失望", "疲惫"]
        emotion_type = emotion.get("emotion_type", "平静")
        intensity = emotion.get("intensity", 0.5)
        sentiment_type = sentiment.get("sentiment", "neutral")
        
        # 负面情绪 + 高强度
        if emotion_type in negative_emotions and intensity > 0.7:
            return True
        
        # 负面情感倾向 + 高负面分数
        if sentiment_type == "negative" and sentiment.get("negative_score", 0) >= 3:
            return True
        
        # 极端负面词汇
        extreme_words = ["绝望", "想死", "不想活了", "崩溃", "受不了"]
        # 从sentiment中获取text，如果没有则使用空字符串
        text_lower = sentiment.get("text", "").lower() if isinstance(sentiment, dict) and "text" in sentiment else ""
        if text_lower and any(word in text_lower for word in extreme_words):
            return True
        
        return False
    
    def _determine_direction(
        self, 
        sentiment: Dict[str, Any], 
        emotion: Dict[str, Any], 
        is_risky: bool
    ) -> str:
        """确定情绪方向"""
        if is_risky:
            return "risky"
        
        sentiment_type = sentiment.get("sentiment", "neutral")
        emotion_type = emotion.get("emotion_type", "平静")
        
        # 正面情绪
        positive_emotions = ["开心", "高兴", "快乐", "愉快", "兴奋"]
        if emotion_type in positive_emotions or sentiment_type == "positive":
            return "positive"
        
        # 负面情绪
        negative_emotions = ["难过", "生气", "焦虑", "失望", "疲惫", "尴尬"]
        if emotion_type in negative_emotions or sentiment_type == "negative":
            return "negative"
        
        # 中性
        return "neutral"
    
    def _calculate_confidence(
        self, 
        sentiment: Dict[str, Any], 
        emotion: Dict[str, Any], 
        is_risky: bool
    ) -> float:
        """计算置信度"""
        sentiment_conf = sentiment.get("confidence", 0.5)
        intensity = emotion.get("intensity", 0.5)
        
        # 基础置信度
        base_conf = (sentiment_conf + intensity) / 2
        
        # 如果检测到风险，置信度提升
        if is_risky:
            base_conf = min(0.95, base_conf + 0.2)
        
        return round(base_conf, 2)
    
    def _generate_explanation(
        self, 
        direction: str, 
        sentiment: Dict[str, Any], 
        emotion: Dict[str, Any], 
        is_risky: bool
    ) -> str:
        """生成分类原因说明"""
        emotion_type = emotion.get("emotion_type", "平静")
        intensity = emotion.get("intensity", 0.5)
        
        if is_risky:
            return f"检测到高风险情绪：{emotion_type}（强度{intensity:.1f}），需要关注"
        elif direction == "positive":
            return f"正面情绪：{emotion_type}（强度{intensity:.1f}）"
        elif direction == "negative":
            return f"负面情绪：{emotion_type}（强度{intensity:.1f}）"
        else:
            return f"中性情绪：{emotion_type}（强度{intensity:.1f}）"



