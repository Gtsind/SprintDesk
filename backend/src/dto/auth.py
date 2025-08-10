from sqlmodel import SQLModel

class LoginRequest(SQLModel):
    """DTO for login request"""
    username: str
    password: str

class TokenResponse(SQLModel):
    """DTO for token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenData(SQLModel):
    """DTO for token data"""
    user_id: int | None = None
    username: str | None = None
    role: str | None = None