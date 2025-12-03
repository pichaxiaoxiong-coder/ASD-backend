"""Decoder协调器：整合3级分类器 + ASD简化引擎"""
from typing import Dict, Any, Optional
from services.decoder.behavior_classifier import BehaviorClassifier
from services.decoder.emotion_direction import EmotionDirectionClassifier
from services.decoder.ai_refiner import AIRefiner
from services.decoder.asd_simplifier import ASDSimplifier
from services.risk_detection import RiskDetectionService


class DecoderOrchestrator:
    """Decoder协调器：显式3级分类 + ASD降复杂度引擎"""
    
    def __init__(self):
        self.behavior_classifier = BehaviorClassifier()
        self.emotion_classifier = EmotionDirectionClassifier()
        self.ai_refiner = AIRefiner()
        self.asd_simplifier = ASDSimplifier()
        self.risk_detection = RiskDetectionService()
    
    async def decode(
        self, 
        text: str, 
        use_ai: bool = True,
        enable_asd_simplification: bool = True,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        完整的社交解码流程
        
        Args:
            text: 原始文本
            use_ai: 是否使用AI（三级分类和ASD简化）
            enable_asd_simplification: 是否启用ASD降复杂度处理
            user_id: 用户ID（用于Profile个性化风险检测）
        
        Returns:
            {
                "text": "原始文本",
                "classification_trace": {
                    "level1_behavior": {...},  # 一级分类结果
                    "level2_emotion": {...},   # 二级分类结果
                    "level3_refinement": {...} # 三级分类结果
                },
                "final_scene": "最终场景类型",
                "confidence": 0.0-1.0,
                "asd_translation": {...},      # ASD降复杂度结果
                "risk_analysis": {...},        # 风险检测
                "suggestion": {...},           # 行为建议
                "analysis": {...}              # 基础分析（统计、关键词等）
            }
        """
        # 一级分类：行为类别
        level1_result = self.behavior_classifier.classify(text)
        
        # 二级分类：情绪方向
        level2_result = self.emotion_classifier.classify(text)
        
        # 三级分类：AI精炼（如果启用）
        if use_ai:
            level3_result = self.ai_refiner.refine(text, level1_result, level2_result)
            final_scene = level3_result.get("final_scene", level1_result.get("category", "未知"))
            final_confidence = level3_result.get("confidence", level1_result.get("confidence", 0.5))
        else:
            level3_result = {
                "final_scene": level1_result.get("category", "未知"),
                "confidence": level1_result.get("confidence", 0.5),
                "reason": "AI未启用，使用一级分类结果",
                "refinements": {
                    "category_changed": False,
                    "original_category": level1_result.get("category", "未知"),
                    "final_category": level1_result.get("category", "未知"),
                    "confidence_boost": 0.0
                }
            }
            final_scene = level1_result.get("category", "未知")
            final_confidence = level1_result.get("confidence", 0.5)
        
        # ASD降复杂度处理（如果启用）
        asd_translation = None
        if enable_asd_simplification:
            emotion_direction = level2_result.get("direction", "neutral")
            asd_translation = self.asd_simplifier.simplify(
                text, 
                final_scene, 
                emotion_direction
            )
        
        # 风险检测（如果提供了user_id，会使用Profile进行个性化检测）
        risk_analysis = await self.risk_detection.detect(text, use_ai=use_ai, user_id=user_id)
        
        # 行为建议（从模板获取）
        from services.template_service import TemplateService
        template_service = TemplateService()
        suggestion = template_service.get_suggestion(final_scene, text)
        
        # 基础分析（统计、关键词等）
        # 避免循环导入，直接调用基础方法
        basic_analysis = self._analyze_basic(text, use_ai)
        
        return {
            "text": text,
            "classification_trace": {
                "level1_behavior": level1_result,
                "level2_emotion": level2_result,
                "level3_refinement": level3_result
            },
            "final_scene": final_scene,
            "confidence": final_confidence,
            "asd_translation": asd_translation,
            "risk_analysis": risk_analysis,
            "suggestion": suggestion,
            "analysis": {
                "stats": basic_analysis.get("stats", {}),
                "keywords": basic_analysis.get("keywords", []),
                "sentiment": basic_analysis.get("sentiment", {})
            }
        }
    
    def get_classification_explanation(self, classification_trace: Dict[str, Any]) -> str:
        """生成分类解释（用于后台展示）"""
        level1 = classification_trace.get("level1_behavior", {})
        level2 = classification_trace.get("level2_emotion", {})
        level3 = classification_trace.get("level3_refinement", {})
        
        lines = []
        lines.append("## 分类过程说明")
        lines.append(f"\n**一级分类（行为类别）**：{level1.get('category', '未知')}")
        lines.append(f"- 方法：{level1.get('method', '')}")
        lines.append(f"- 置信度：{level1.get('confidence', 0.0):.2f}")
        lines.append(f"- 说明：{level1.get('explanation', '')}")
        
        lines.append(f"\n**二级分类（情绪方向）**：{level2.get('direction', 'neutral')}")
        lines.append(f"- 情绪类型：{level2.get('emotion_type', '平静')}")
        lines.append(f"- 强度：{level2.get('intensity', 0.5):.2f}")
        lines.append(f"- 说明：{level2.get('explanation', '')}")
        
        lines.append(f"\n**三级分类（AI精炼）**：{level3.get('final_scene', '未知')}")
        lines.append(f"- 最终置信度：{level3.get('confidence', 0.0):.2f}")
        lines.append(f"- 修正原因：{level3.get('reason', '')}")
        
        refinements = level3.get("refinements", {})
        if refinements.get("category_changed"):
            lines.append(f"- ⚠️ 分类已修正：{refinements.get('original_category')} → {refinements.get('final_category')}")
        
        return "\n".join(lines)
    
    def _analyze_basic(self, text: str, use_ai: bool) -> Dict[str, Any]:
        """基础分析（避免循环导入）"""
        import re
        from collections import Counter
        
        # 文本统计
        chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', text))
        english_words = len(re.findall(r'[a-zA-Z]+', text))
        total_chars = len(text)
        total_words = len(text.split())
        
        stats = {
            "total_chars": total_chars,
            "total_words": total_words,
            "chinese_chars": chinese_chars,
            "english_words": english_words,
            "avg_word_length": total_chars / total_words if total_words > 0 else 0
        }
        
        # 简单关键词提取（词频）
        words = re.findall(r'\w+', text.lower())
        word_freq = Counter(words)
        stop_words = {'的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'}
        filtered = {w: f for w, f in word_freq.items() if len(w) > 1 and w not in stop_words}
        sorted_words = sorted(filtered.items(), key=lambda x: x[1], reverse=True)[:10]
        keywords = [{"word": word, "weight": float(freq) / len(words) if words else 0.0} for word, freq in sorted_words]
        
        # 情感倾向（使用二级分类器的结果）
        sentiment = self.emotion_classifier._detect_sentiment_tendency(text)
        
        return {
            "stats": stats,
            "keywords": keywords,
            "sentiment": sentiment
        }



