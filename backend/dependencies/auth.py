from __future__ import annotations

from typing import List, Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr

from core.config import settings
from models.user_model import Role, User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class TokenData(BaseModel):
    user_id: str
    email: EmailStr
    role: Role
    parent_id: Optional[str] = None
    children_ids: List[str] = []


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """从 JWT 中解析当前用户信息"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭证",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id: Optional[str] = payload.get("sub")
        email: Optional[str] = payload.get("email")
        role: Optional[str] = payload.get("role")
        parent_id: Optional[str] = payload.get("parent_id")
        children_ids = payload.get("children_ids") or []
        if user_id is None or email is None or role is None:
            raise credentials_exception
        token_data = TokenData(  # type: ignore[arg-type]
            user_id=user_id,
            email=email,
            role=role,
            parent_id=parent_id,
            children_ids=children_ids,
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="登录已过期，请重新登录",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise credentials_exception

    # 这里直接使用 token 中的载荷构建 User，避免重复查询数据库
    user = User(
        id=token_data.user_id,
        email=token_data.email,
        role=token_data.role,
        nickname=None,
        avatar_url=None,
        parent_id=token_data.parent_id,
        children_ids=token_data.children_ids,
    )
    return user


def require_roles(roles: List[Role]):
    """基于角色的权限控制依赖"""

    async def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="权限不足，当前角色无法访问该资源",
            )
        return current_user

    return dependency


def ensure_can_read_user(current_user: User, target_user_id: str) -> None:
    """
    通用读取权限判断：
    - child: 只能访问自己的 user_id
    - parent: 可以访问自己 + children_ids
    - therapist/admin: 可以访问任意 user_id
    """
    # therapist 和 admin 可以查看所有人
    if current_user.role in ("therapist", "admin"):
        return

    # child 只能看自己
    if current_user.role == "child":
        if target_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="孩子账号只能访问自己的数据",
            )
        return

    # parent 只能看自己和名下孩子
    if current_user.role == "parent":
        if target_user_id == current_user.id:
            return
        if target_user_id in current_user.children_ids:
            return
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="家长账号只能访问自己或名下孩子的数据",
        )

    # 其他未知角色默认拒绝
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="当前角色无法访问该资源",
    )
