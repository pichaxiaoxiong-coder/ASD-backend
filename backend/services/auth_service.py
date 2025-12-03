from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import jwt
from passlib.context import CryptContext

from core.config import settings
from core.utils import utc_now_iso
from models.user_model import Role, User, UserInDB
from services.db_service import DBService


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """JWT 认证与用户管理服务"""

    def __init__(self) -> None:
        self.db_service = DBService()

    # ========== 密码相关 ==========

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    # ========== 用户相关 ==========

    async def _get_user_collection(self):
        if self.db_service.db is not None:
            return self.db_service.db["users"]
        # 内存模式：使用 DBService 内部的全局存储
        # 简单起见，挂在 db_service 上
        if not hasattr(self.db_service, "_memory_users"):
            self.db_service._memory_users = []  # type: ignore[attr-defined]
        return None

    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        col = await self._get_user_collection()
        if col is not None:
            doc = await col.find_one({"email": email})
            if not doc:
                return None
            doc["id"] = str(doc.get("_id")) if doc.get("_id") else str(doc.get("id"))
            # children_ids 在 Mongo 中可能不存在，统一为 list[str]
            children_ids = doc.get("children_ids") or []
            return UserInDB(
                id=str(doc["id"]),
                email=doc["email"],
                role=doc.get("role", "parent"),
                nickname=doc.get("nickname"),
                avatar_url=doc.get("avatar_url"),
                created_at=doc.get("created_at"),
                parent_id=doc.get("parent_id"),
                children_ids=children_ids,
                hashed_password=doc["hashed_password"],
                is_active=doc.get("is_active", True),
            )
        # 内存模式
        users: list[Dict[str, Any]] = getattr(self.db_service, "_memory_users", [])  # type: ignore[attr-defined]
        for u in users:
            if u.get("email") == email:
                return UserInDB(**u)
        return None

    async def create_user(
        self,
        email: str,
        password: str,
        role: Role = "parent",
        nickname: Optional[str] = None,
        parent_id: Optional[str] = None,
    ) -> UserInDB:
        col = await self._get_user_collection()
        hashed_password = self.get_password_hash(password)
        now = datetime.now(timezone.utc)

        user_doc: Dict[str, Any] = {
            "email": email,
            "role": role,
            "nickname": nickname,
            "avatar_url": None,
            "created_at": now,
            "parent_id": parent_id,
            "children_ids": [],
            "hashed_password": hashed_password,
            "is_active": True,
        }

        if col is not None:
            result = await col.insert_one(user_doc)
            user_doc["id"] = str(result.inserted_id)
        else:
            # 内存模式
            if not hasattr(self.db_service, "_memory_users"):
                self.db_service._memory_users = []  # type: ignore[attr-defined]
            user_doc["id"] = f"u_{len(self.db_service._memory_users) + 1}"  # type: ignore[attr-defined]
            self.db_service._memory_users.append(user_doc)  # type: ignore[attr-defined]

        return UserInDB(**user_doc)

    async def authenticate_user(self, email: str, password: str) -> Optional[UserInDB]:
        """
        简化的认证逻辑：
        - 如果用户存在，则校验密码
        - 如果用户不存在，则自动创建一个 parent 角色用户（演示用）
        """
        user = await self.get_user_by_email(email)
        if user is None:
            # 自动创建新用户，默认 parent 角色
            user = await self.create_user(email=email, password=password, role="parent")
            return user

        if not user.is_active:
            return None

        if not self.verify_password(password, user.hashed_password):
            return None
        return user

    # ========== JWT 相关 ==========

    def create_access_token(
        self,
        data: Dict[str, Any],
        expires_delta: Optional[timedelta] = None,
    ) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + (
            expires_delta
            if expires_delta
            else timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt

    def build_user_payload(self, user: UserInDB) -> Dict[str, Any]:
        return {
            "sub": user.id,
            "email": user.email,
            "role": user.role,
            "parent_id": user.parent_id,
            "children_ids": user.children_ids,
        }

    def user_from_token_payload(self, payload: Dict[str, Any]) -> User:
        return User(
            id=str(payload.get("sub")),
            email=str(payload.get("email")),
            role=payload.get("role", "parent"),
            nickname=payload.get("nickname"),
            avatar_url=payload.get("avatar_url"),
            parent_id=payload.get("parent_id"),
            children_ids=payload.get("children_ids") or [],
        )


