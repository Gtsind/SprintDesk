from sqlmodel import SQLModel, Field
from src.models.base import LabelBase

class LabelCreate(LabelBase):
    """DTO for label creation"""
    is_active: bool = Field(default=True)

class LabelUpdate(SQLModel):
    """DTO for label updates"""
    name: str | None = None
    is_active: bool | None = None

class LabelPublic(LabelBase):
    """DTO for label responses"""
    id: int
    is_active: bool