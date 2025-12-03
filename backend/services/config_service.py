"""配置管理服务：管理可配置规则"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from enum import Enum
from functools import lru_cache
from services.db_service import DBService
from core.utils import utc_now_iso


class ConfigCategory(str, Enum):
    """配置类别"""
    RISK_KEYWORDS = "risk_keywords"  # 风险词库
    BEHAVIOR_CLASSIFICATION = "behavior_classification"  # 行为分类规则
    ALERT_THRESHOLDS = "alert_thresholds"  # 提醒阈值
    INTERVENTION_TEMPLATES = "intervention_templates"  # 干预模板
    GPT_INSTRUCTIONS = "gpt_instructions"  # GPT 指令模板
    LLM_PROVIDER = "llm_provider"  # LLM Provider 配置
    EMOTION_FUSION = "emotion_fusion"  # 情绪融合配置
    CLASSIFIER_RULES = "classifier_rules"  # 分类器规则


class ConfigService:
    """配置管理服务：管理可配置规则"""
    
    def __init__(self):
        self.db = DBService()
        self._config_cache: Dict[str, Dict[str, Any]] = {}
    
    async def get_config(
        self,
        category: ConfigCategory,
        key: Optional[str] = None,
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """
        获取配置
        
        Args:
            category: 配置类别
            key: 配置键（可选，如果不提供则返回整个类别）
            use_cache: 是否使用缓存
        
        Returns:
            配置字典
        """
        cache_key = f"{category.value}:{key or 'all'}"
        
        if use_cache and cache_key in self._config_cache:
            return self._config_cache[cache_key]
        
        # 从数据库加载
        query = {"type": "admin_config", "category": category.value}
        if key:
            query["key"] = key
        
        configs = await self.db.fetch_logs(query, limit=100)
        
        if not configs:
            # 返回默认配置
            default = self._get_default_config(category, key)
            if default:
                return default
            return {}
        
        # 转换为字典格式
        if key:
            # 单个配置
            config = configs[0] if configs else {}
            result = config.get("value", {})
        else:
            # 整个类别
            result = {cfg.get("key"): cfg.get("value", {}) for cfg in configs}
        
        # 缓存
        if use_cache:
            self._config_cache[cache_key] = result
        
        return result
    
    async def set_config(
        self,
        category: ConfigCategory,
        key: str,
        value: Dict[str, Any],
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        设置配置
        
        Args:
            category: 配置类别
            key: 配置键
            value: 配置值
            description: 配置描述
        """
        config_entry = {
            "type": "admin_config",
            "category": category.value,
            "key": key,
            "value": value,
            "description": description,
            "updated_at": utc_now_iso(),
            "updated_by": "admin"  # 可以从请求中获取
        }
        
        # 检查是否已存在
        existing = await self.db.fetch_logs(
            {"type": "admin_config", "category": category.value, "key": key},
            limit=1
        )
        
        if existing:
            # 更新
            config_entry["_id"] = existing[0].get("_id")
            config_entry["created_at"] = existing[0].get("created_at", utc_now_iso())
        else:
            # 新建
            config_entry["created_at"] = utc_now_iso()
        
        await self.db.add_log(config_entry)
        
        # 清除缓存
        self._clear_cache(category, key)
        
        return {
            "message": "Config updated",
            "category": category.value,
            "key": key,
            "value": value
        }
    
    async def delete_config(
        self,
        category: ConfigCategory,
        key: str
    ) -> Dict[str, Any]:
        """删除配置"""
        # 这里简化处理，实际应该从数据库删除
        # 由于当前DBService没有delete方法，这里标记为已删除
        await self.set_config(category, key, {"_deleted": True})
        
        # 清除缓存
        self._clear_cache(category, key)
        
        return {
            "message": "Config deleted",
            "category": category.value,
            "key": key
        }
    
    async def list_configs(
        self,
        category: Optional[ConfigCategory] = None
    ) -> Dict[str, Any]:
        """列出所有配置"""
        query = {"type": "admin_config"}
        if category:
            query["category"] = category.value
        
        configs = await self.db.fetch_logs(query, limit=1000)
        
        # 按类别分组
        grouped = {}
        for config in configs:
            cat = config.get("category", "unknown")
            if cat not in grouped:
                grouped[cat] = []
            grouped[cat].append({
                "key": config.get("key"),
                "description": config.get("description"),
                "updated_at": config.get("updated_at"),
                "value_preview": str(config.get("value", {}))[:100]  # 预览
            })
        
        return {
            "categories": list(grouped.keys()),
            "configs": grouped
        }
    
    def _get_default_config(
        self,
        category: ConfigCategory,
        key: Optional[str]
    ) -> Optional[Dict[str, Any]]:
        """获取默认配置"""
        defaults = {
            ConfigCategory.RISK_KEYWORDS: {
                "high_risk": {"words": ["想死", "不想活了", "绝望", "崩溃", "自杀", "自残"]},
                "medium_risk": {"words": ["难过", "痛苦", "受不了", "压力大", "焦虑", "害怕"]}
            },
            ConfigCategory.BEHAVIOR_CLASSIFICATION: {
                "scene_keywords": {
                    "拒绝": ["算了", "改天", "不方便", "下次", "以后", "不用了"],
                    "冲突": ["烦", "讨厌", "又这样", "够了", "别说了", "闭嘴"],
                    "暗示": ["可能", "也许", "或者", "考虑", "看看", "再说"]
                }
            },
            ConfigCategory.ALERT_THRESHOLDS: {
                "emotion_intensity_high": 0.7,
                "emotion_intensity_critical": 0.9,
                "consecutive_negative_count": 3,
                "risk_level_high": 0.8
            },
            ConfigCategory.LLM_PROVIDER: {
                "default_provider": "openai",
                "openai": {
                    "model": "gpt-4o-mini",
                    "temperature": 0.3,
                    "max_tokens": 500
                },
                "deepseek": {
                    "model": "deepseek-chat",
                    "temperature": 0.3,
                    "max_tokens": 500,
                    "api_key": None
                }
            },
            ConfigCategory.EMOTION_FUSION: {
                "default_strategy": "weighted",
                "default_weights": {
                    "text": 0.5,
                    "voice": 0.3,
                    "face": 0.2
                }
            },
            ConfigCategory.CLASSIFIER_RULES: {
                "confidence_threshold": 0.7,
                "use_ai_refinement": True
            }
        }
        
        if category in defaults:
            if key:
                return defaults[category].get(key)
            return defaults[category]
        
        return None
    
    def _clear_cache(self, category: ConfigCategory, key: Optional[str] = None):
        """清除缓存"""
        if key:
            cache_key = f"{category.value}:{key}"
            self._config_cache.pop(cache_key, None)
        else:
            # 清除整个类别的缓存
            keys_to_remove = [
                k for k in self._config_cache.keys()
                if k.startswith(f"{category.value}:")
            ]
            for k in keys_to_remove:
                self._config_cache.pop(k, None)
    
    def clear_all_cache(self):
        """清除所有缓存"""
        self._config_cache.clear()
    
    # ========== 便捷方法：获取特定配置 ==========
    
    async def get_risk_keywords(self) -> Dict[str, List[str]]:
        """获取风险词库"""
        config = await self.get_config(ConfigCategory.RISK_KEYWORDS)
        # 转换为统一格式
        result = {}
        if "high_risk" in config:
            high_risk = config["high_risk"]
            result["high_risk"] = high_risk.get("words", []) if isinstance(high_risk, dict) else high_risk
        if "medium_risk" in config:
            medium_risk = config["medium_risk"]
            result["medium_risk"] = medium_risk.get("words", []) if isinstance(medium_risk, dict) else medium_risk
        return result
    
    async def get_behavior_classification_rules(self) -> Dict[str, Any]:
        """获取行为分类规则"""
        return await self.get_config(ConfigCategory.BEHAVIOR_CLASSIFICATION)
    
    async def get_alert_thresholds(self) -> Dict[str, float]:
        """获取提醒阈值"""
        return await self.get_config(ConfigCategory.ALERT_THRESHOLDS)
    
    async def get_llm_provider_config(self) -> Dict[str, Any]:
        """获取LLM Provider配置"""
        return await self.get_config(ConfigCategory.LLM_PROVIDER)
    
    async def get_emotion_fusion_config(self) -> Dict[str, Any]:
        """获取情绪融合配置"""
        return await self.get_config(ConfigCategory.EMOTION_FUSION)
    
    async def get_classifier_rules(self) -> Dict[str, Any]:
        """获取分类器规则"""
        return await self.get_config(ConfigCategory.CLASSIFIER_RULES)


# 单例实例
_config_service_instance: Optional[ConfigService] = None


def get_config_service() -> ConfigService:
    """获取配置服务单例"""
    global _config_service_instance
    if _config_service_instance is None:
        _config_service_instance = ConfigService()
    return _config_service_instance



