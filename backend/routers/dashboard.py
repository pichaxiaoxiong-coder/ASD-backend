from fastapi import APIRouter

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats():
    """获取仪表板统计数据"""
    from services.dashboard_service import DashboardService
    
    service = DashboardService()
    stats = await service.get_stats()
    return stats
