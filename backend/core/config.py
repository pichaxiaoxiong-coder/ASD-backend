import os
from typing import List


class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "Rehab AI Backend")
    CORS_ALLOW_ORIGINS: List[str] = (
        os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
        .split(",")
    )
    MONGO_URI: str | None = os.getenv("MONGO_URI")
    MONGO_DB: str = os.getenv("MONGO_DB", "app")
    CHROMA_PATH: str = os.getenv("CHROMA_PATH", "./.chroma")
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")
    TEXT_EMOTION_PROVIDER: str = os.getenv("TEXT_EMOTION_PROVIDER", "heuristic")
    VOICE_EMOTION_PROVIDER: str = os.getenv("VOICE_EMOTION_PROVIDER", "heuristic")
    FACE_EMOTION_PROVIDER: str = os.getenv("FACE_EMOTION_PROVIDER", "heuristic")
    EMOTION_MODEL_ENDPOINT: str | None = os.getenv("EMOTION_MODEL_ENDPOINT")
    EMOTION_MODEL_API_KEY: str | None = os.getenv("EMOTION_MODEL_API_KEY")
    ADMIN_API_KEY: str | None = os.getenv("ADMIN_API_KEY")

    # 认证 / 安全配置
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-this-secret-key")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    )
    
    # 情绪融合配置
    EMOTION_FUSION_STRATEGY: str = os.getenv("EMOTION_FUSION_STRATEGY", "weighted")  # weighted/negative_priority/dynamic_weight/voting
    EMOTION_FUSION_WEIGHT_TEXT: float = float(os.getenv("EMOTION_FUSION_WEIGHT_TEXT", "0.5"))
    EMOTION_FUSION_WEIGHT_VOICE: float = float(os.getenv("EMOTION_FUSION_WEIGHT_VOICE", "0.3"))
    EMOTION_FUSION_WEIGHT_FACE: float = float(os.getenv("EMOTION_FUSION_WEIGHT_FACE", "0.2"))


settings = Settings()



