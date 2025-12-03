from fastapi import APIRouter, Depends, Query, HTTPException

from dependencies.auth import require_roles
# 注意：config 路由在 admin 子包中，不能直接从 routers 包导入，否则会触发
# `from . import config` 解析为 `routers.config`，导致部分初始化的模块错误
from .admin import config as config_router


router = APIRouter(dependencies=[Depends(require_roles(["admin"]))])

# 包含配置管理路由
router.include_router(config_router.router, prefix="/config", tags=["admin-config"])


@router.get("/users")
async def list_users(
    keyword: str | None = Query(None, description="搜索关键字"),
    limit: int = Query(20, ge=1, le=100),
):
    from services.admin_service import AdminService

    service = AdminService()
    users = await service.list_users(keyword=keyword, limit=limit)
    return users


@router.post("/users/block")
async def block_user(user_id: str, reason: str | None = None):
    from services.admin_service import AdminService

    service = AdminService()
    result = await service.block_user(user_id, reason)
    return result


@router.get("/emotion/logs")
async def admin_emotion_logs(
    user_id: str | None = Query(None),
    risk: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
):
    from services.admin_service import AdminService

    service = AdminService()
    logs = await service.emotion_logs(user_id=user_id, risk=risk, limit=limit)
    return logs


@router.get("/interventions")
async def admin_interventions(user_id: str | None = None, limit: int = 50):
    from services.admin_service import AdminService

    service = AdminService()
    plans = await service.list_interventions(user_id=user_id, limit=limit)
    return plans


@router.post("/templates/reload")
async def reload_templates():
    from services.admin_service import AdminService

    service = AdminService()
    service.reload_templates_cache()
    return {"message": "Templates reloaded"}



