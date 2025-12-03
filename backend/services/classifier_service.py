from typing import Dict, Any, List, Tuple
import re

try:
    from services.ai_service import AIService
    AI_AVAILABLE = True
except Exception:
    AI_AVAILABLE = False

from services.config_service import get_config_service


class ClassifierService:
    """社交场景分类器：识别拒绝、冲突、暗示、情绪、请求等场景"""
    
    def __init__(self):
        self.ai_service = None
        if AI_AVAILABLE:
            from services.ai_service import AIService
            self.ai_service = AIService()
        
        self.config_service = get_config_service()
        
        # 规则关键词库（第一层：快速分类）
        # 默认关键词，可以从配置服务加载
        self.scene_keywords = {
            "拒绝": ["算了", "改天", "不方便", "下次", "以后", "不用了", "不用", "不必", "不需要", "不用麻烦"],
            "冲突": ["烦", "讨厌", "又这样", "够了", "别说了", "闭嘴", "走开", "滚", "烦死了"],
            "暗示": ["可能", "也许", "或者", "考虑", "看看", "再说", "到时候", "如果"],
            "情绪": ["开心", "高兴", "难过", "伤心", "生气", "愤怒", "失望", "担心", "害怕"],
            "请求": ["可以", "能不能", "请", "帮", "麻烦", "希望", "想要", "需要"],
            "请求帮助": ["帮帮我", "能帮我", "可以帮我", "需要帮助", "求助", "帮忙"],
            "提出改进建议": ["建议", "可以改进", "最好", "应该", "不如", "试试"],
            "失望": ["失望", "没想到", "以为", "可惜", "遗憾"],
            "无聊": ["无聊", "没意思", "没劲", "好无聊", "真无聊"],
            "高兴": ["高兴", "开心", "快乐", "愉快", "兴奋", "太棒了"],
            "尴尬": ["尴尬", "不好意思", "难为情", "不好意思", "有点尴尬"],
            "恐惧": ["害怕", "恐惧", "担心", "担心", "不安", "害怕"],
            "惊讶": ["惊讶", "没想到", "居然", "竟然", "天哪", "哇"],
            "回应感谢": ["谢谢", "感谢", "多谢", "太感谢了", "谢谢你"],
            "安慰": ["别难过", "没关系", "会好的", "别担心", "我理解"],
            "抱怨": ["抱怨", "真烦", "太糟糕", "受不了", "真麻烦"],
            "赞美": ["好", "棒", "优秀", "厉害", "不错", "很好", "太好了", "真棒"],
            "批评": ["不好", "差", "糟糕", "不行", "不对", "错了", "不应该"]
        }
    
    async def _load_classification_rules(self):
        """从配置服务加载分类规则"""
        try:
            rules = await self.config_service.get_behavior_classification_rules()
            scene_keywords = rules.get("scene_keywords", {})
            if scene_keywords:
                # 合并配置的关键词（保留默认值作为fallback）
                for scene, keywords in scene_keywords.items():
                    if scene in self.scene_keywords:
                        # 合并关键词列表
                        existing = set(self.scene_keywords[scene])
                        new = set(keywords)
                        self.scene_keywords[scene] = list(existing | new)
                    else:
                        self.scene_keywords[scene] = keywords
        except Exception:
            pass  # 使用默认关键词
    
    def classify_by_rules(self, text: str) -> Tuple[str, float]:
        """第一层：基于规则关键词的快速分类（优化版）"""
        text_lower = text.lower()
        scores = {}
        
        for scene, keywords in self.scene_keywords.items():
            score = 0
            # 计算关键词匹配（考虑词频和位置）
            for keyword in keywords:
                if keyword in text_lower:
                    # 长关键词权重更高
                    weight = len(keyword) / 10.0 + 1.0
                    score += weight
                    # 如果关键词在句子开头，额外加分
                    if text_lower.startswith(keyword) or text_lower.find(f" {keyword}") >= 0:
                        score += 0.5
            
            if score > 0:
                scores[scene] = score
        
        if not scores:
            return "未知", 0.0
        
        # 返回得分最高的场景
        best_scene = max(scores.items(), key=lambda x: x[1])
        # 归一化置信度（基于最高分和总分）
        total_score = sum(scores.values())
        confidence = min(0.85, 0.5 + (best_scene[1] / max(total_score, 1)) * 0.35)
        return best_scene[0], confidence
    
    def classify_by_sentiment_and_keywords(self, text: str) -> Tuple[str, float]:
        """第二层：情感 + 关键词加权分类"""
        from services.decoder_service import DecoderService
        
        decoder = DecoderService()
        sentiment = decoder.detect_sentiment_tendency(text)
        keywords = decoder.extract_keywords(text, top_k=5)
        
        # 结合情感和关键词
        sentiment_type = sentiment["sentiment"]
        positive_score = sentiment["positive_score"]
        negative_score = sentiment["negative_score"]
        
        # 情感导向的场景判断
        if negative_score > positive_score and negative_score > 2:
            # 负面情绪 + 冲突关键词
            if any(kw in text for kw in self.scene_keywords["冲突"]):
                return "冲突", 0.75
            return "情绪", 0.7
        
        if positive_score > negative_score and positive_score > 2:
            return "情绪", 0.7
        
        # 关键词加权
        rule_scene, rule_conf = self.classify_by_rules(text)
        if rule_conf > 0.6:
            return rule_scene, rule_conf
        
        return "未知", 0.5
    
    def classify_by_ai(self, text: str) -> Tuple[str, float]:
        """第三层：GPT 语义分类（最高精度）"""
        if not self.ai_service or not self.ai_service._client:
            return "未知", 0.0
        
        try:
            prompt = f"""分析以下文本的社交场景类型，从以下类别中选择最合适的一个：
- 拒绝：礼貌或直接的拒绝
- 冲突：争吵、不满、对抗
- 暗示：间接表达、暗示性语言
- 情绪：表达情感状态
- 请求：提出要求
- 请求帮助：请求他人帮助
- 提出改进建议：提出改进建议
- 失望：表达失望情绪
- 无聊：表达无聊感受
- 高兴：表达高兴情绪
- 尴尬：表达尴尬感受
- 恐惧：表达恐惧或担心
- 惊讶：表达惊讶
- 回应感谢：回应他人的感谢
- 安慰：安慰他人
- 抱怨：抱怨某些事情
- 赞美：表扬、肯定
- 批评：批评、否定
- 其他：不属于以上类别

文本：{text}

请以JSON格式返回：
{{
    "scene": "场景类型",
    "confidence": 0.0-1.0之间的置信度,
    "reason": "简要说明原因"
}}"""
            
            resp = self.ai_service._client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "你是一个社交场景分析专家，擅长识别对话中的社交场景类型。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=150,
                response_format={"type": "json_object"}
            )
            
            import json
            result = json.loads(resp.choices[0].message.content or "{}")
            scene = result.get("scene", "未知")
            confidence = float(result.get("confidence", 0.5))
            return scene, confidence
        except Exception:
            return "未知", 0.0
    
    def classify(self, text: str, use_ai: bool = True) -> Dict[str, Any]:
        """综合分类：三层识别框架"""
        # 第一层：规则分类（最快）
        rule_scene, rule_conf = self.classify_by_rules(text)
        
        if rule_conf >= 0.7:
            # 规则分类置信度高，直接返回
            return {
                "scene": rule_scene,
                "confidence": rule_conf,
                "method": "规则",
                "reason": f"检测到{rule_scene}相关关键词"
            }
        
        # 第二层：情感+关键词加权
        sentiment_scene, sentiment_conf = self.classify_by_sentiment_and_keywords(text)
        
        if sentiment_conf >= 0.7:
            return {
                "scene": sentiment_scene,
                "confidence": sentiment_conf,
                "method": "情感+关键词",
                "reason": "基于情感和关键词分析"
            }
        
        # 第三层：AI 分类（如果启用）
        if use_ai:
            ai_scene, ai_conf = self.classify_by_ai(text)
            if ai_conf > sentiment_conf:
                return {
                    "scene": ai_scene,
                    "confidence": ai_conf,
                    "method": "AI语义分析",
                    "reason": "基于GPT语义理解"
                }
        
        # 返回第二层结果
        return {
            "scene": sentiment_scene,
            "confidence": sentiment_conf,
            "method": "情感+关键词",
            "reason": "基于情感和关键词分析"
        }















