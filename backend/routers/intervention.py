from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional


class PlanRequest(BaseModel):
    user_id: str
    goal: str
    focus_scene: str | None = None
    duration_days: int = 7
    auto_match_template: bool = True  # 是否自动匹配干预模板


class PlanProgressRequest(BaseModel):
    plan_id: str
    status: str
    note: str | None = None


router = APIRouter()


@router.post("/plan")
async def generate_plan(payload: PlanRequest):
    from services.intervention_service import InterventionService

    service = InterventionService()
    plan = await service.generate_plan(
        user_id=payload.user_id,
        goal=payload.goal,
        focus_scene=payload.focus_scene,
        duration_days=payload.duration_days,
        auto_match_template=payload.auto_match_template,
    )
    return plan


@router.get("/plans")
async def list_plans(
    user_id: str = Query(..., description="用户 ID"),
    limit: int = Query(10, ge=1, le=50, description="返回数量"),
):
    from services.intervention_service import InterventionService

    service = InterventionService()
    return await service.list_plans(user_id, limit=limit)


@router.post("/plan/progress")
async def update_plan_progress(payload: PlanProgressRequest):
    from services.intervention_service import InterventionService

    service = InterventionService()
    result = await service.record_progress(
        plan_id=payload.plan_id,
        status=payload.status,
        note=payload.note,
    )
    return result


# ========== 干预模板相关 API ==========

@router.get("/templates")
async def list_intervention_templates():
    """列出所有可用的干预模板"""
    from services.intervention_template_service import get_intervention_template_service
    
    service = get_intervention_template_service()
    templates = service.list_templates()
    return {"count": len(templates), "templates": templates}


@router.get("/template/{template_id}")
async def get_intervention_template(template_id: str):
    """获取指定的干预模板"""
    from services.intervention_template_service import get_intervention_template_service
    from fastapi import HTTPException
    
    service = get_intervention_template_service()
    try:
        template = service.load_template(template_id)
        return template
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Template not found: {template_id}")


@router.post("/auto-match")
async def auto_match_intervention(
    user_id: str = Query(..., description="用户ID"),
    emotion: str = Query(..., description="当前情绪"),
    intensity: float = Query(..., ge=0.0, le=1.0, description="情绪强度"),
    scene: Optional[str] = Query(None, description="社交场景"),
    text: Optional[str] = Query(None, description="原始文本")
):
    """自动匹配干预模板（用于实时检测）"""
    from services.intervention_service import InterventionService
    
    service = InterventionService()
    result = await service.auto_match_intervention(
        user_id=user_id,
        emotion=emotion,
        intensity=intensity,
        scene=scene,
        text=text
    )
    
    if result:
        return {
            "matched": True,
            "intervention": result
        }
    else:
        return {
            "matched": False,
            "message": "未匹配到合适的干预模板"
        }






