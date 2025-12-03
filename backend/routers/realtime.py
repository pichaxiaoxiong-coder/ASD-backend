from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from pydantic import BaseModel


class VoiceFeaturePayload(BaseModel):
    pitch: Optional[float] = 150.0
    energy: Optional[float] = 0.5
    speaking_rate: Optional[float] = 4.0
    spectral_centroid: Optional[float] = None


class FaceFeaturePayload(BaseModel):
    smile_score: Optional[float] = 0.0
    brow_raise: Optional[float] = 0.0
    eye_openness: Optional[float] = 0.5
    frown_score: Optional[float] = 0.0


class RealTimeEmotionRequest(BaseModel):
    user_id: Optional[str] = None
    text: Optional[str] = None
    voice_features: Optional[VoiceFeaturePayload] = None
    face_features: Optional[FaceFeaturePayload] = None


router = APIRouter()


@router.post("/analyze")
async def analyze_realtime_emotion(
    payload: RealTimeEmotionRequest,
    fusion_strategy: Optional[str] = Query(None, description="融合策略：weighted/negative_priority/dynamic_weight/voting"),
    fusion_weights: Optional[str] = Query(None, description="融合权重（JSON格式，如：{\"text\":0.5,\"voice\":0.3,\"face\":0.2}）")
):
    """实时情绪识别入口：支持文本/语音/人脸多模态"""
    from services.realtime_emotion_service import RealTimeEmotionService
    from services.emotion_fusion import FusionStrategy
    import json

    # 解析融合策略
    strategy = None
    if fusion_strategy:
        try:
            strategy = FusionStrategy(fusion_strategy.lower())
        except ValueError:
            strategy = None
    
    # 解析融合权重
    weights = None
    if fusion_weights:
        try:
            weights = json.loads(fusion_weights)
        except json.JSONDecodeError:
            weights = None

    service = RealTimeEmotionService(fusion_strategy=strategy, fusion_weights=weights)
    result = await service.analyze(
        user_id=payload.user_id,
        text=payload.text,
        voice_features=payload.voice_features.dict() if payload.voice_features else None,
        face_features=payload.face_features.dict() if payload.face_features else None,
    )
    return result


@router.websocket("/ws/emotion/{user_id}")
async def emotion_ws(user_id: str, websocket: WebSocket):
    from services.ws_manager import ws_manager

    await ws_manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await ws_manager.disconnect(user_id, websocket)
    except Exception:
        await ws_manager.disconnect(user_id, websocket)



