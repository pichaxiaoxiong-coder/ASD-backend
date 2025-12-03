from __future__ import annotations

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, EmailStr, Field


Role = Literal["parent", "child", "therapist", "admin"]


class User(BaseModel):
    """对外返回的用户基础信息"""

    id: str = Field(..., description="用户唯一标识（如 user_id）")
    email: EmailStr = Field(..., description="登录邮箱")
    role: Role = Field("parent", description="用户角色")
    nickname: Optional[str] = Field(None, description="用户昵称")
    avatar_url: Optional[str] = Field(None, description="头像地址")
    created_at: Optional[datetime] = Field(
        None, description="用户创建时间（UTC 时间）"
    )
    # 关系字段：用于权限判断
    parent_id: Optional[str] = Field(
        None, description="孩子账号对应的家长用户 ID（仅 role=child 时使用）"
    )
    children_ids: List[str] = Field(
        default_factory=list,
        description="家长/治疗师名下的孩子用户 ID 列表（仅 role=parent/therapist 时使用）",
    )


class UserInDB(User):
    """数据库中的用户模型（包含密码等敏感字段）"""

    hashed_password: str = Field(..., description="加盐哈希后的密码")
    is_active: bool = Field(True, description="是否启用")


__all__ = ["User", "UserInDB", "Role"]


