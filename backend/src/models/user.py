from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
from utils.enums import UserRole
from typing import ClassVar

class User(SQLModel, table=True):
    __tablename__: ClassVar[str] = "users"

    id: int | None = Field(default=None, primary_key=True)
    firstname: str = Field(max_length=50)
    lastname: str = Field(max_length=50)
    username: str = Field(unique=True, max_length=50, index=True)
    password_hash: str = Field(max_length=100)
    email: str = Field(unique=True, max_length=100, index=True)
    role: UserRole = Field(nullable=False, default=UserRole.CONTRIBUTOR)
    title: str | None = Field(default=None, max_length=100)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = Field(default=True)
    # Relationships
    created_projects: list["Project"] = Relationship(back_populates="creator")
    