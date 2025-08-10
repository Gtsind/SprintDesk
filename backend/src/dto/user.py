from sqlmodel import SQLModel, Field
from src.models.base import UserBase
from src.utils.enums import UserRole
from datetime import datetime

class UserCreate(UserBase):
    """DTO for user creation"""
    password: str = Field(min_length=8, max_length=100)
    is_active: bool = Field(default=True)

class UserUpdate(SQLModel):
    """DTO for user updates"""
    firstname: str | None = None
    lastname: str | None = None
    username: str | None = None
    email: str | None = None
    title: str | None = None
    role: UserRole | None = None
    password: str | None = None
    is_active: bool | None = None

class UserPublic(UserBase):
    """DTO for user responses"""
    id: int
    is_active: bool
    created_at: datetime

class UserSummary(SQLModel):
    """DTO for minimal user info"""
    id: int
    username: str
    firstname: str
    lastname: str