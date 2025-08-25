from sqlmodel import SQLModel, Field
from src.models.enums import UserRole, ProjectStatus, IssuePriority, IssueStatus

class UserBase(SQLModel):
    """Base user fields"""
    firstname: str = Field(min_length=1, max_length=50)
    lastname: str = Field(min_length=1, max_length=50)
    username: str = Field(unique=True, index=True, min_length=3, max_length=50)
    email: str = Field(unique=True, index=True, max_length=255)
    title: str | None = Field(default=None, max_length=100)
    role: UserRole = Field(default=UserRole.CONTRIBUTOR)

class ProjectBase(SQLModel):
    """Base project fields"""
    name: str = Field(min_length=1, max_length=50)
    description: str | None = Field(default=None, max_length=255)
    status: ProjectStatus = Field(default=ProjectStatus.ACTIVE)

class IssueBase(SQLModel):
    """Base issue fields"""
    title: str = Field(min_length=1, max_length=100, index=True)
    description: str | None = Field(default=None, max_length=255)
    status: IssueStatus = Field(default=IssueStatus.OPEN, index=True)
    priority: IssuePriority = Field(default=IssuePriority.MEDIUM, index=True)
    time_estimate: int | None = Field(default=None, description="Estimated time in hours")

class CommentBase(SQLModel):
    """Base comment fields"""
    content: str = Field(min_length=1, max_length=2000)

class LabelBase(SQLModel):
    """Base label fields"""
    name: str = Field(unique=True, min_length=1, max_length=50, index=True)