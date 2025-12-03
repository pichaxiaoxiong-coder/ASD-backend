from fastapi import APIRouter, Depends, HTTPException, Query, status

from dependencies.auth import get_current_user, ensure_can_read_user
from models.progress_model import ProgressLog, ProgressUpdate
from models.user_model import User


router = APIRouter()


@router.post("/log")
async def log_progress(
    payload: ProgressLog,
    current_user: User = Depends(get_current_user),
):
    from services.progress_service import ProgressService

    # child 只能写自己的日志
    if current_user.role == "child" and payload.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="孩子账号只能记录自己的进度",
        )

    service = ProgressService()
    entry = await service.add_entry(
        user_id=payload.user_id,
        note=payload.note,
        category=payload.category,
        status=payload.status,
        mood=payload.mood,
        tags=payload.tags,
    )
    return entry


@router.get("/logs")
async def list_progress(
    user_id: str = Query(..., description="用户 ID"),
    limit: int = Query(20, ge=1, le=100, description="每页数量"),
    page: int = Query(1, ge=1, description="页码，从 1 开始"),
    start_date: str | None = Query(
        None, description="起始日期（YYYY-MM-DD，可选，用于过滤）"
    ),
    end_date: str | None = Query(
        None, description="结束日期（YYYY-MM-DD，可选，用于过滤）"
    ),
    status: str | None = Query(None, description="状态过滤：open/closed/completed 等"),
    tags: str | None = Query(
        None, description="标签过滤，逗号分隔（任一匹配即可，如 tag1,tag2）"
    ),
    current_user: User = Depends(get_current_user),
):
    """
    获取进度列表（支持简单分页 + 过滤）

    为保持兼容，当前仍直接返回条目列表，前端如需分页信息，可在后续版本扩展返回结构。
    """
    from services.progress_service import ProgressService

    # 按角色判断读取权限（child/parent/therapist/admin）
    ensure_can_read_user(current_user, user_id)
    service = ProgressService()
    tag_list = [t.strip() for t in tags.split(",")] if tags else None
    entries = await service.list_entries(
        user_id=user_id,
        limit=limit,
        page=page,
        start_date=start_date,
        end_date=end_date,
        status=status,
        tags=tag_list,
    )
    return entries


@router.get("/summary")
async def progress_summary(
    user_id: str = Query(..., description="用户 ID"),
    days: int = Query(14, ge=1, le=60, description="统计天数"),
    current_user: User = Depends(get_current_user),
):
    from services.progress_service import ProgressService

    ensure_can_read_user(current_user, user_id)
    service = ProgressService()
    summary = await service.get_summary(user_id, days=days)
    return summary


@router.post("/update")
async def update_progress(payload: ProgressUpdate):
    from services.progress_service import ProgressService

    service = ProgressService()
    result = await service.update_entry(payload.entry_id, payload.status, payload.note)
    return result







