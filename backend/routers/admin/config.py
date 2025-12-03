"""管理员配置管理API"""
from fastapi import APIRouter, Depends, Query, Body
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from dependencies.auth import admin_auth
from services.config_service import ConfigService, ConfigCategory

# 注意：这个router会被包含在admin.router中，所以不需要单独的dependencies
router = APIRouter()


class ConfigUpdateRequest(BaseModel):
    """配置更新请求"""
    category: str
    key: str
    value: Dict[str, Any]
    description: Optional[str] = None


class ConfigDeleteRequest(BaseModel):
    """配置删除请求"""
    category: str
    key: str


@router.get("/config")
async def list_all_configs(
    category: Optional[str] = Query(None, description="配置类别（可选）")
):
    """列出所有配置"""
    service = ConfigService()
    
    if category:
        try:
            config_category = ConfigCategory(category)
            configs = await service.list_configs(category=config_category)
        except ValueError:
            return {"error": f"Invalid category: {category}"}
    else:
        configs = await service.list_configs()
    
    return configs


@router.get("/config/{category}")
async def get_config_category(
    category: str,
    key: Optional[str] = Query(None, description="配置键（可选）")
):
    """获取指定类别的配置"""
    service = ConfigService()
    
    try:
        config_category = ConfigCategory(category)
        config = await service.get_config(config_category, key=key)
        return {
            "category": category,
            "key": key,
            "config": config
        }
    except ValueError:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")


@router.get("/config/{category}/{key}")
async def get_config_item(
    category: str,
    key: str
):
    """获取单个配置项"""
    service = ConfigService()
    
    try:
        config_category = ConfigCategory(category)
        config = await service.get_config(config_category, key=key)
        return {
            "category": category,
            "key": key,
            "value": config
        }
    except ValueError:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")


@router.put("/config/{category}/{key}")
async def update_config(
    category: str,
    key: str,
    value: Dict[str, Any] = Body(...),
    description: Optional[str] = Body(None)
):
    """更新配置"""
    service = ConfigService()
    
    try:
        config_category = ConfigCategory(category)
        result = await service.set_config(
            category=config_category,
            key=key,
            value=value,
            description=description
        )
        return result
    except ValueError:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")


@router.post("/config")
async def create_config(payload: ConfigUpdateRequest):
    """创建配置"""
    service = ConfigService()
    
    try:
        config_category = ConfigCategory(payload.category)
        result = await service.set_config(
            category=config_category,
            key=payload.key,
            value=payload.value,
            description=payload.description
        )
        return result
    except ValueError:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Invalid category: {payload.category}")


@router.delete("/config/{category}/{key}")
async def delete_config(
    category: str,
    key: str
):
    """删除配置"""
    service = ConfigService()
    
    try:
        config_category = ConfigCategory(category)
        result = await service.delete_config(config_category, key)
        return result
    except ValueError:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")


@router.post("/config/cache/clear")
async def clear_config_cache():
    """清除配置缓存"""
    service = ConfigService()
    service.clear_all_cache()
    return {"message": "Config cache cleared"}


# ========== 便捷端点：特定配置管理 ==========

@router.get("/config/risk-keywords")
async def get_risk_keywords():
    """获取风险词库"""
    service = ConfigService()
    keywords = await service.get_risk_keywords()
    return keywords


@router.put("/config/risk-keywords")
async def update_risk_keywords(
    high_risk: Optional[List[str]] = Body(None, description="高风险词汇列表"),
    medium_risk: Optional[List[str]] = Body(None, description="中风险词汇列表")
):
    """更新风险词库"""
    service = ConfigService()
    
    updates = {}
    
    if high_risk is not None:
        await service.set_config(ConfigCategory.RISK_KEYWORDS, "high_risk", {"words": high_risk})
        updates["high_risk"] = high_risk
    
    if medium_risk is not None:
        await service.set_config(ConfigCategory.RISK_KEYWORDS, "medium_risk", {"words": medium_risk})
        updates["medium_risk"] = medium_risk
    
    return {
        "message": "Risk keywords updated",
        "updates": updates
    }


@router.get("/config/behavior-classification")
async def get_behavior_classification():
    """获取行为分类规则"""
    service = ConfigService()
    rules = await service.get_behavior_classification_rules()
    return rules


@router.put("/config/behavior-classification")
async def update_behavior_classification(
    scene_keywords: Dict[str, List[str]] = Body(...)
):
    """更新行为分类规则"""
    service = ConfigService()
    
    result = await service.set_config(
        ConfigCategory.BEHAVIOR_CLASSIFICATION,
        "scene_keywords",
        scene_keywords
    )
    return result


@router.get("/config/alert-thresholds")
async def get_alert_thresholds():
    """获取提醒阈值"""
    service = ConfigService()
    thresholds = await service.get_alert_thresholds()
    return thresholds


@router.put("/config/alert-thresholds")
async def update_alert_thresholds(
    emotion_intensity_high: Optional[float] = Body(None),
    emotion_intensity_critical: Optional[float] = Body(None),
    consecutive_negative_count: Optional[int] = Body(None),
    risk_level_high: Optional[float] = Body(None)
):
    """更新提醒阈值"""
    service = ConfigService()
    
    current = await service.get_alert_thresholds()
    updates = current.copy()
    
    if emotion_intensity_high is not None:
        updates["emotion_intensity_high"] = emotion_intensity_high
    if emotion_intensity_critical is not None:
        updates["emotion_intensity_critical"] = emotion_intensity_critical
    if consecutive_negative_count is not None:
        updates["consecutive_negative_count"] = consecutive_negative_count
    if risk_level_high is not None:
        updates["risk_level_high"] = risk_level_high
    
    result = await service.set_config(
        ConfigCategory.ALERT_THRESHOLDS,
        "thresholds",
        updates
    )
    return result


@router.get("/config/llm-provider")
async def get_llm_provider_config():
    """获取LLM Provider配置"""
    service = ConfigService()
    config = await service.get_llm_provider_config()
    return config


@router.put("/config/llm-provider")
async def update_llm_provider_config(
    default_provider: Optional[str] = Body(None, description="默认provider：openai/deepseek"),
    openai_config: Optional[Dict[str, Any]] = Body(None),
    deepseek_config: Optional[Dict[str, Any]] = Body(None)
):
    """更新LLM Provider配置"""
    service = ConfigService()
    
    current = await service.get_llm_provider_config()
    updates = current.copy()
    
    if default_provider is not None:
        updates["default_provider"] = default_provider
    if openai_config is not None:
        updates["openai"] = {**updates.get("openai", {}), **openai_config}
    if deepseek_config is not None:
        updates["deepseek"] = {**updates.get("deepseek", {}), **deepseek_config}
    
    result = await service.set_config(
        ConfigCategory.LLM_PROVIDER,
        "provider_config",
        updates
    )
    return result


@router.get("/config/emotion-fusion")
async def get_emotion_fusion_config():
    """获取情绪融合配置"""
    service = ConfigService()
    config = await service.get_emotion_fusion_config()
    return config


@router.put("/config/emotion-fusion")
async def update_emotion_fusion_config(
    default_strategy: Optional[str] = Body(None),
    default_weights: Optional[Dict[str, float]] = Body(None)
):
    """更新情绪融合配置"""
    service = ConfigService()
    
    current = await service.get_emotion_fusion_config()
    updates = current.copy()
    
    if default_strategy is not None:
        updates["default_strategy"] = default_strategy
    if default_weights is not None:
        updates["default_weights"] = default_weights
    
    result = await service.set_config(
        ConfigCategory.EMOTION_FUSION,
        "fusion_config",
        updates
    )
    return result


@router.get("/config/classifier-rules")
async def get_classifier_rules():
    """获取分类器规则"""
    service = ConfigService()
    rules = await service.get_classifier_rules()
    return rules


@router.put("/config/classifier-rules")
async def update_classifier_rules(
    confidence_threshold: Optional[float] = Body(None),
    use_ai_refinement: Optional[bool] = Body(None)
):
    """更新分类器规则"""
    service = ConfigService()
    
    current = await service.get_classifier_rules()
    updates = current.copy()
    
    if confidence_threshold is not None:
        updates["confidence_threshold"] = confidence_threshold
    if use_ai_refinement is not None:
        updates["use_ai_refinement"] = use_ai_refinement
    
    result = await service.set_config(
        ConfigCategory.CLASSIFIER_RULES,
        "rules",
        updates
    )
    return result



