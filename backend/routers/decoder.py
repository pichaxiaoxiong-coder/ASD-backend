from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional, List


class DecodeRequest(BaseModel):
    text: str
    user_id: Optional[str] = None  # 用户 ID（用于记录日志）
    use_ai: Optional[bool] = False  # 是否使用 AI 进行深度语义分析
    save_log: Optional[bool] = False  # 是否保存到数据库


class BatchDecodeRequest(BaseModel):
    texts: List[str]  # 批量文本列表
    user_id: Optional[str] = None
    use_ai: Optional[bool] = False
    save_log: Optional[bool] = False


class FeedbackRequest(BaseModel):
    log_id: Optional[str] = None  # 日志ID（如果提供）
    user_id: str
    input_text: str
    scene_category: str
    feedback_type: str  # "correct", "incorrect", "helpful", "not_helpful"
    comment: Optional[str] = None


router = APIRouter()


@router.post("/analyze")
def analyze_social_signal(payload: DecodeRequest):
    """分析社交信号：关键词、情感、语义等（基础版本）"""
    from services.decoder_service import DecoderService
    
    decoder = DecoderService()
    result = decoder.analyze_social_signal(payload.text, use_ai=payload.use_ai)
    return result


@router.post("/decode")
async def decode_social_signal(payload: DecodeRequest):
    """完整的社交解码：场景分类 + ASD 翻译 + 行为建议 + 风险检测 + 个性化建议"""
    from services.decoder_service import DecoderService
    from services.db_service import DBService
    from services.personalization_service import PersonalizationService
    from core.utils import utc_now_iso
    
    decoder = DecoderService()
    result = await decoder.decode_social_signal(payload.text, use_ai=payload.use_ai, user_id=payload.user_id)
    
    # 添加个性化建议（如果有用户ID）
    if payload.user_id:
        personalization_service = PersonalizationService()
        scene = result.get("scene", {}).get("scene", "未知")
        personalized = await personalization_service.get_personalized_suggestion(
            payload.user_id, scene
        )
        result["personalization"] = personalized
    
    # 记录到数据库（如果启用）
    if payload.save_log and payload.user_id:
        db = DBService()
        log_entry = {
            "user_id": payload.user_id,
            "input_text": payload.text,
            "scene_category": result.get("scene", {}).get("scene", "未知"),
            "scene_confidence": result.get("scene", {}).get("confidence", 0.0),
            "translation": result.get("asd_translation", {}),
            "suggestion": result.get("suggestion", {}),
            "risk": result.get("risk", {}),
            "analysis": result.get("analysis", {}),
            "timestamp": utc_now_iso()
        }
        await db.add_log(log_entry)
    
    return result


@router.get("/keywords")
def extract_keywords(
    text: str = Query(..., description="要分析的文本"),
    top_k: int = Query(10, ge=1, le=50, description="返回关键词数量")
):
    """提取关键词"""
    from services.decoder_service import DecoderService
    
    decoder = DecoderService()
    keywords = decoder.extract_keywords(text, top_k=top_k)
    return {"text": text, "keywords": keywords}


@router.get("/sentiment")
def detect_sentiment(text: str = Query(..., description="要分析的文本")):
    """检测情感倾向"""
    from services.decoder_service import DecoderService
    
    decoder = DecoderService()
    sentiment = decoder.detect_sentiment_tendency(text)
    return {"text": text, "sentiment": sentiment}


@router.get("/history")
async def get_conversation_history(
    user_id: Optional[str] = Query(None, description="用户ID"),
    scene: Optional[str] = Query(None, description="场景类型过滤"),
    limit: int = Query(50, ge=1, le=200, description="返回数量")
):
    """获取社交解码历史记录"""
    from services.db_service import DBService
    
    db = DBService()
    logs = await db.get_conversation_logs(user_id=user_id, scene_category=scene, limit=limit)
    return {"count": len(logs), "logs": logs}


@router.get("/statistics")
async def get_statistics(
    user_id: Optional[str] = Query(None, description="用户ID（可选，不提供则返回全局统计）")
):
    """获取场景统计信息"""
    from services.db_service import DBService
    
    db = DBService()
    stats = await db.get_scene_statistics(user_id=user_id)
    return stats


@router.get("/personalization/{user_id}")
async def get_personalization(user_id: str):
    """获取用户个性化学习数据"""
    from services.personalization_service import PersonalizationService
    
    service = PersonalizationService()
    patterns = await service.get_user_patterns(user_id)
    return patterns


@router.get("/personalized-suggestion")
async def get_personalized_suggestion(
    user_id: str = Query(..., description="用户ID"),
    scene: str = Query(..., description="当前场景类型")
):
    """获取个性化建议"""
    from services.personalization_service import PersonalizationService
    
    service = PersonalizationService()
    suggestion = await service.get_personalized_suggestion(user_id, scene)
    return suggestion


@router.post("/batch-decode")
async def batch_decode_social_signal(payload: BatchDecodeRequest):
    """批量解码社交信号"""
    from services.decoder_service import DecoderService
    from services.db_service import DBService
    from services.personalization_service import PersonalizationService
    from core.utils import utc_now_iso
    
    decoder = DecoderService()
    results = []
    
    for text in payload.texts:
        result = await decoder.decode_social_signal(text, use_ai=payload.use_ai, user_id=payload.user_id)
        
        # 添加个性化建议
        if payload.user_id:
            personalization_service = PersonalizationService()
            scene = result.get("scene", {}).get("scene", "未知")
            personalized = await personalization_service.get_personalized_suggestion(
                payload.user_id, scene
            )
            result["personalization"] = personalized
        
        # 保存日志
        if payload.save_log and payload.user_id:
            db = DBService()
            log_entry = {
                "user_id": payload.user_id,
                "input_text": text,
                "scene_category": result.get("scene", {}).get("scene", "未知"),
                "scene_confidence": result.get("scene", {}).get("confidence", 0.0),
                "translation": result.get("asd_translation", {}),
                "suggestion": result.get("suggestion", {}),
                "risk": result.get("risk", {}),
                "analysis": result.get("analysis", {}),
                "timestamp": utc_now_iso()
            }
            await db.add_log(log_entry)
        
        results.append(result)
    
    return {
        "count": len(results),
        "results": results
    }


@router.post("/feedback")
async def submit_feedback(payload: FeedbackRequest):
    """提交用户反馈"""
    from services.db_service import DBService
    from core.utils import utc_now_iso
    
    db = DBService()
    feedback_entry = {
        "user_id": payload.user_id,
        "input_text": payload.input_text,
        "scene_category": payload.scene_category,
        "feedback_type": payload.feedback_type,
        "comment": payload.comment,
        "timestamp": utc_now_iso(),
        "log_id": payload.log_id
    }
    
    # 保存到 feedbacks 集合
    await db.add_log(feedback_entry)  # 可以创建专门的 feedbacks 集合
    
    return {
        "status": "success",
        "message": "反馈已提交",
        "feedback_id": feedback_entry.get("_id")
    }


@router.get("/similar-scenes")
async def find_similar_scenes(
    text: str = Query(..., description="要匹配的文本"),
    user_id: Optional[str] = Query(None, description="用户ID（用于查找历史记录）"),
    top_k: int = Query(5, ge=1, le=20, description="返回相似场景数量")
):
    """查找相似场景（基于历史记录和相似度计算）"""
    from services.decoder_service import DecoderService
    from services.db_service import DBService
    from services.scene_similarity_service import SceneSimilarityService
    from services.template_service import TemplateService
    
    decoder = DecoderService()
    similarity_service = SceneSimilarityService()
    template_service = TemplateService()
    
    current_result = await decoder.decode_social_signal(text, use_ai=False)
    current_scene = current_result.get("scene", {}).get("scene", "未知")
    
    # 获取场景示例
    scene_examples = similarity_service.get_scene_examples(current_scene, limit=top_k)
    
    # 如果提供了用户ID，从历史记录中查找相似文本
    similar_history = []
    if user_id:
        db = DBService()
        history_logs = await db.get_conversation_logs(user_id=user_id, limit=50)
        if history_logs:
            candidate_texts = [log.get("input_text", "") for log in history_logs if log.get("input_text")]
            similar_texts = similarity_service.find_similar_texts(
                text, candidate_texts, threshold=0.3, top_k=top_k
            )
            similar_history = [
                {
                    "text": similar_text,
                    "similarity": similarity,
                    "scene": next(
                        (log.get("scene_category") for log in history_logs if log.get("input_text") == similar_text),
                        "未知"
                    )
                }
                for similar_text, similarity in similar_texts
            ]
    
    template = template_service.get_template(current_scene)
    
    return {
        "input_text": text,
        "current_scene": current_scene,
        "scene_examples": scene_examples,
        "similar_history": similar_history,
        "template_info": {
            "simple_explanation": template.get("simple_explanation", ""),
            "suggestions": template.get("suggestions", [])[:3]
        }
    }


@router.get("/classification-trace")
async def get_classification_trace(
    text: str = Query(..., description="要分析的文本"),
    use_ai: bool = Query(True, description="是否使用AI进行三级分类")
):
    """获取分类追踪信息（用于后台展示和调试）"""
    from services.decoder_service import DecoderService
    
    decoder = DecoderService()
    result = await decoder.decode_social_signal(text, use_ai=use_ai)
    
    # 返回分类追踪信息
    classification_trace = result.get("classification_trace", {})
    classification_explanation = result.get("classification_explanation", "")
    
    return {
        "text": text,
        "classification_trace": classification_trace,
        "classification_explanation": classification_explanation,
        "final_scene": result.get("scene", {}).get("scene", "未知"),
        "final_confidence": result.get("scene", {}).get("confidence", 0.0)
    }





















