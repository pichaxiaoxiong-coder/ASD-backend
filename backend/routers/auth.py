from __future__ import annotations

from datetime import timedelta
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field

from core.config import settings
from dependencies.auth import get_current_user
from models.user_model import Role, User
from services.auth_service import AuthService


router = APIRouter()


class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT 访问令牌")
    token_type: str = Field("bearer", description="令牌类型")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class MeResponse(BaseModel):
    id: str
    email: EmailStr
    role: Role
    nickname: str | None = None


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> TokenResponse:
    """
    用户登录（OAuth2 Password Flow 风格）

    - 使用 email 作为 username 字段
    - 返回 access_token（JWT）
    """
    auth_service = AuthService()
    # OAuth2PasswordRequestForm 中的 username 字段用作 email
    user = await auth_service.authenticate_user(
        email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(
        minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )
    access_token = auth_service.create_access_token(
        data=auth_service.build_user_payload(user),
        expires_delta=access_token_expires,
    )
    return TokenResponse(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=MeResponse)
async def read_me(current_user: User = Depends(get_current_user)) -> MeResponse:
    """获取当前登录用户信息"""
    return MeResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        nickname=current_user.nickname,
    )



