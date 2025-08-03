from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from src.utils.enums import UserRole

# Base user DTO
class UserBase(BaseModel):
    firstname: str = Field(min_length=1, max_length=50)
    lastname: str = Field(min_length=1, max_length=50)
    username: str = Field(min_length=1, max_length=50)
    email: EmailStr
    title: str | None = Field(default=None, max_length=100)

# DTO for creating a new user
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=100)
    role: UserRole = Field(default=UserRole.CONTRIBUTOR)

# DTO for updating user
class UserUpdate(BaseModel):
    firstname: str | None = Field(default=None, min_length=1, max_length=50)
    lastname: str | None = Field(default=None, min_length=1, max_length=50)
    username: str | None = Field(default=None, min_length=1, max_length=50)
    email: EmailStr | None = Field(default=None)
    title: str | None = Field(default=None, max_length=100)
    role: UserRole | None = Field(default=None)
    is_active: bool | None = Field(default=None)

# DTO for reading user data
class UserRead(UserBase):
    id: int
    role: UserRole
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

# DTO for user list
class UserSummary(BaseModel):
    id: int
    firstname: str
    lastname: str
    username: str
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True