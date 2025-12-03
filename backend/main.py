"""
FastAPI 应用主入口
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings

# 导入所有路由
from routers import (
    companion,
    decoder,
    emotion,
    intervention,
    progress,
    prompt,
    realtime,
    dashboard,
    admin,
    recovery,
    auth,
)

# 创建 FastAPI 应用
app = FastAPI(
    title=settings.APP_NAME,
    description="ASD 康复辅助应用后端 API",
    version="1.0.0",
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(companion.router, prefix="/companion", tags=["companion"])
app.include_router(decoder.router, prefix="/decoder", tags=["decoder"])
app.include_router(emotion.router, prefix="/emotion", tags=["emotion"])
app.include_router(intervention.router, prefix="/intervention", tags=["intervention"])
app.include_router(progress.router, prefix="/progress", tags=["progress"])
app.include_router(prompt.router, prefix="/prompt", tags=["prompt"])
app.include_router(realtime.router, prefix="/realtime", tags=["realtime"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(recovery.router, prefix="/recovery", tags=["recovery"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])


@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "ASD 康复辅助应用后端 API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """健康检查"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
