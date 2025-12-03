"""一级分类器：行为类别（规则 + 模板匹配）"""
from typing import Dict, Any, Tuple, List
import re
from services.classifier_service import ClassifierService
from services.template_service import TemplateService
from services.prompt_service import get_prompt_service
from services.config_service import get_config_service


class BehaviorClassifier:
    """一级分类器：基于规则关键词和模板匹配的行为类别识别"""
    
    def __init__(self):
        self.classifier = ClassifierService()
        self.template_service = TemplateService()
        self.prompt_service = get_prompt_service()
        self.config_service = get_config_service()
    
    def classify(self, text: str) -> Dict[str, Any]:
        """
        一级分类：行为类别识别
        
        Returns:
            {
                "category": "场景类型",
                "confidence": 0.0-1.0,
                "method": "规则" | "模板匹配" | "规则+模板",
                "matched_keywords": ["关键词1", "关键词2"],
                "matched_template": "模板名称",
                "explanation": "分类原因说明"
            }
        """
        text_lower = text.lower()
        
        # 1. 规则关键词匹配
        rule_result = self._classify_by_rules(text_lower)
        
        # 2. 模板匹配（从PromptService加载的模板）
        template_result = self._classify_by_template(text_lower)
        
        # 3. 综合判断
        if rule_result["confidence"] >= 0.7 and template_result["confidence"] >= 0.7:
            # 两者都高置信度，取规则结果（更快）
            return {
                "category": rule_result["category"],
                "confidence": min(0.95, (rule_result["confidence"] + template_result["confidence"]) / 2),
                "method": "规则+模板",
                "matched_keywords": rule_result.get("matched_keywords", []),
                "matched_template": template_result.get("matched_template"),
                "explanation": f"规则匹配到「{rule_result['category']}」关键词，同时模板也匹配到「{template_result.get('matched_template', '')}」"
            }
        elif rule_result["confidence"] >= 0.7:
            return {
                **rule_result,
                "method": "规则",
                "matched_template": None
            }
        elif template_result["confidence"] >= 0.7:
            return {
                **template_result,
                "method": "模板匹配",
                "matched_keywords": []
            }
        else:
            # 两者置信度都不高，取较高的
            if rule_result["confidence"] >= template_result["confidence"]:
                return {
                    **rule_result,
                    "method": "规则（低置信度）",
                    "matched_template": None
                }
            else:
                return {
                    **template_result,
                    "method": "模板匹配（低置信度）",
                    "matched_keywords": []
                }
    
    def _classify_by_rules(self, text_lower: str) -> Dict[str, Any]:
        """基于规则关键词分类（复用ClassifierService）"""
        scene, confidence = self.classifier.classify_by_rules(text_lower)
        
        # 提取匹配的关键词
        matched_keywords = []
        scene_keywords = self.classifier.scene_keywords.get(scene, [])
        for keyword in scene_keywords:
            if keyword in text_lower:
                matched_keywords.append(keyword)
        
        return {
            "category": scene,
            "confidence": confidence,
            "matched_keywords": matched_keywords,
            "explanation": f"检测到「{scene}」相关关键词：{', '.join(matched_keywords[:3])}" if matched_keywords else "未匹配到明确关键词"
        }
    
    def _classify_by_template(self, text_lower: str) -> Dict[str, Any]:
        """基于PromptService模板匹配"""
        best_match = None
        best_score = 0.0
        best_template_name = None
        
        try:
            # 获取所有模板
            templates = self.prompt_service.list_templates()
            
            for template_info in templates:
                template_name = template_info["name"]
                try:
                    template = self.prompt_service.load_template(template_name)
                    
                    # 检查模板中的patterns
                    sub_scenes = template.get("sub_scenes", [])
                    for sub_scene in sub_scenes:
                        patterns = sub_scene.get("patterns", [])
                        scene_type = sub_scene.get("type", "")
                        
                        # 计算匹配分数
                        score = 0.0
                        matched_patterns = []
                        
                        for pattern in patterns:
                            if pattern.lower() in text_lower:
                                # 长模式权重更高
                                weight = len(pattern) / 10.0 + 1.0
                                score += weight
                                matched_patterns.append(pattern)
                        
                        if score > best_score:
                            best_score = score
                            best_match = scene_type or template_name
                            best_template_name = template_name
                            
                except FileNotFoundError:
                    continue
                except Exception:
                    continue
            
            # 归一化置信度
            if best_score > 0:
                confidence = min(0.9, 0.5 + (best_score / 10.0) * 0.4)
            else:
                confidence = 0.0
                best_match = "未知"
            
            return {
                "category": best_match,
                "confidence": confidence,
                "matched_template": best_template_name,
                "explanation": f"模板匹配到「{best_match}」场景" if best_match != "未知" else "未匹配到模板"
            }
            
        except Exception:
            return {
                "category": "未知",
                "confidence": 0.0,
                "matched_template": None,
                "explanation": "模板匹配失败"
            }



