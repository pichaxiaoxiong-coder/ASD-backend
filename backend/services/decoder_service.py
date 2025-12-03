from typing import Dict, List, Any, Optional
import re
from collections import Counter

try:
    import jieba
    import jieba.analyse
    JIEBA_AVAILABLE = True
except Exception:
    JIEBA_AVAILABLE = False

from services.ai_service import AIService
from services.classifier_service import ClassifierService
from services.template_service import TemplateService
from services.prompt_service import get_prompt_service
from services.risk_detection import RiskDetectionService
from services.decoder.decoder_orchestrator import DecoderOrchestrator


class DecoderService:
    """社交解码服务：分析文本中的社交信号、关键词、语义等，专为 ASD 用户设计"""
    
    def __init__(self):
        self.ai_service = AIService()
        self.classifier = ClassifierService()
        self.template_service = TemplateService()
        self.prompt_service = get_prompt_service()
        self.risk_detection = RiskDetectionService()
        # 新的协调器（显式3级分类 + ASD降复杂度）
        self.orchestrator = DecoderOrchestrator()
        if JIEBA_AVAILABLE:
            # 初始化 jieba
            jieba.initialize()
    
    def extract_keywords(self, text: str, top_k: int = 10) -> List[Dict[str, Any]]:
        """提取关键词"""
        if JIEBA_AVAILABLE:
            # 使用 TF-IDF 提取关键词
            keywords = jieba.analyse.extract_tags(text, topK=top_k, withWeight=True)
            return [{"word": word, "weight": float(weight)} for word, weight in keywords]
        else:
            # 降级：简单分词和词频统计
            words = re.findall(r'\w+', text.lower())
            word_freq = Counter(words)
            # 过滤停用词和单字符
            stop_words = {'的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'}
            filtered = {w: f for w, f in word_freq.items() if len(w) > 1 and w not in stop_words}
            sorted_words = sorted(filtered.items(), key=lambda x: x[1], reverse=True)[:top_k]
            return [{"word": word, "weight": float(freq) / len(words) if words else 0.0} for word, freq in sorted_words]
    
    def analyze_text_stats(self, text: str) -> Dict[str, Any]:
        """分析文本基础统计信息"""
        # 中文字符数
        chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', text))
        # 英文单词数
        english_words = len(re.findall(r'[a-zA-Z]+', text))
        # 数字
        numbers = len(re.findall(r'\d+', text))
        # 标点符号
        punctuation = len(re.findall(r'[^\w\s]', text))
        # 总字符数
        total_chars = len(text)
        # 总词数（简单估算）
        total_words = len(text.split())
        
        return {
            "total_chars": total_chars,
            "total_words": total_words,
            "chinese_chars": chinese_chars,
            "english_words": english_words,
            "numbers": numbers,
            "punctuation": punctuation,
            "avg_word_length": total_chars / total_words if total_words > 0 else 0
        }
    
    def detect_sentiment_tendency(self, text: str) -> Dict[str, Any]:
        """检测情感倾向（简单规则）"""
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
            "negative_score": negative_count
        }
    
    def analyze_semantic(self, text: str) -> Dict[str, Any]:
        """语义分析（使用 AI 服务）"""
        if self.ai_service._client is None:
            # 无 AI 服务时返回基础分析
            return {
                "intent": "unknown",
                "topics": [],
                "summary": text[:50] + "..." if len(text) > 50 else text
            }
        
        try:
            prompt = f"""分析以下文本的语义信息，包括：
1. 主要意图（intent）
2. 涉及的主题（topics，3-5个）
3. 简要总结（summary，50字以内）

文本：{text}

请以JSON格式返回，格式：
{{
    "intent": "意图描述",
    "topics": ["主题1", "主题2", ...],
    "summary": "简要总结"
}}"""
            
            resp = self.ai_service._client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "你是一个文本分析专家，擅长分析文本的语义、意图和主题。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=200,
                response_format={"type": "json_object"}
            )
            
            import json
            result = json.loads(resp.choices[0].message.content or "{}")
            return result
        except Exception:
            # 出错时返回基础分析
            return {
                "intent": "unknown",
                "topics": [],
                "summary": text[:50] + "..." if len(text) > 50 else text
            }
    
    def translate_for_asd(self, text: str, scene: str) -> Dict[str, Any]:
        """ASD 社交翻译引擎：将复杂语言转换为简明表达"""
        # 获取场景对应的模板
        template = self.template_service.get_template(scene)
        
        # 如果 AI 可用，可以进一步优化翻译
        if self.ai_service._client:
            try:
                prompt = f"""将以下文本翻译为自闭症患者容易理解的简明表达。
要求：
1. 禁用比喻、隐喻、抽象表达
2. 使用短句、明确、无歧义
3. 说明"对方的意图"和"你该怎么做"
4. 保持友好和尊重

原文：{text}
场景类型：{scene}

请以JSON格式返回：
{{
    "simple_explanation": "简单解释（对方在做什么）",
    "why": "原因说明（为什么这样说）",
    "what_to_do": "你应该怎么做（具体步骤）"
}}"""
                
                resp = self.ai_service._client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "你是一个专门为自闭症患者提供社交理解的专家，擅长将复杂语言转换为简明、清晰的表达。"},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=300,
                    response_format={"type": "json_object"}
                )
                
                import json
                ai_translation = json.loads(resp.choices[0].message.content or "{}")
                
                # 合并模板和 AI 翻译
                return {
                    "simple_explanation": ai_translation.get("simple_explanation", template.get("simple_explanation", "")),
                    "why": ai_translation.get("why", template.get("why", "")),
                    "suggestions": template.get("suggestions", []),
                    "what_to_do": ai_translation.get("what_to_do", ""),
                    "do_not": template.get("do_not", [])
                }
            except Exception:
                pass  # 出错时使用模板
        
        # 无 AI 或出错时，直接使用模板
        return {
            "simple_explanation": template.get("simple_explanation", ""),
            "why": template.get("why", ""),
            "suggestions": template.get("suggestions", []),
            "do_not": template.get("do_not", [])
        }
    
    def analyze_social_signal(self, text: str, use_ai: bool = False) -> Dict[str, Any]:
        """综合分析社交信号（基础版本）"""
        # 基础统计
        stats = self.analyze_text_stats(text)
        
        # 关键词提取
        keywords = self.extract_keywords(text, top_k=10)
        
        # 情感倾向
        sentiment = self.detect_sentiment_tendency(text)
        
        # 语义分析（可选，使用 AI）
        semantic = {}
        if use_ai:
            semantic = self.analyze_semantic(text)
        
        return {
            "text": text,
            "stats": stats,
            "keywords": keywords,
            "sentiment": sentiment,
            "semantic": semantic if semantic else None
        }
    
    async def decode_social_signal(self, text: str, use_ai: bool = True, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        完整的社交解码：使用新的3级分类器 + ASD降复杂度引擎
        
        保持向后兼容：返回结构与原API相同，但内部使用新的架构
        """
        # 使用新的协调器进行解码
        result = await self.orchestrator.decode(text, use_ai=use_ai, enable_asd_simplification=True, user_id=user_id)
        
        # 转换为原有API格式（保持向后兼容）
        classification_trace = result.get("classification_trace", {})
        level1 = classification_trace.get("level1_behavior", {})
        level3 = classification_trace.get("level3_refinement", {})
        
        # 场景分析（兼容原有格式）
        scene_analysis = {
            "scene": result.get("final_scene", "未知"),
            "confidence": result.get("confidence", 0.5),
            "method": level1.get("method", "规则"),
            "reason": level3.get("reason", level1.get("explanation", "")),
            # 新增：分类追踪信息
            "classification_trace": classification_trace
        }
        
        # ASD翻译（兼容原有格式，但使用新的5步流水线结果）
        asd_translation_raw = result.get("asd_translation", {})
        asd_translation = {
            "simple_explanation": asd_translation_raw.get("simplified", ""),
            "why": asd_translation_raw.get("contextual_reason", ""),
            "suggestions": asd_translation_raw.get("suggested_actions", []),
            "what_to_do": "\n".join(asd_translation_raw.get("suggested_actions", [])),
            "do_not": asd_translation_raw.get("do_not", []),
            # 新增：5步流水线详情
            "pipeline_steps": asd_translation_raw.get("pipeline_steps", {}),
            "translation": asd_translation_raw.get("translation", ""),
            "clarification": asd_translation_raw.get("clarification", "")
        }
        
        # 获取prompt模板
        prompt_template = None
        try:
            prompt_template = self.prompt_service.load_template(result.get("final_scene", "未知"))
        except FileNotFoundError:
            prompt_template = None
        
        return {
            "text": text,
            "scene": scene_analysis,
            "asd_translation": asd_translation,
            "suggestion": result.get("suggestion", {}),
            "risk": result.get("risk_analysis", {}),
            "analysis": result.get("analysis", {}),
            "prompt_template": prompt_template,
            # 新增：完整的分类追踪（用于后台展示）
            "classification_trace": classification_trace,
            # 新增：分类解释（用于后台展示）
            "classification_explanation": self.orchestrator.get_classification_explanation(classification_trace)
        }



