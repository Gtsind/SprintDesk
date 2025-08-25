from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from src.database import get_db_session
from src.repositories import UserRepository
from src.services.auth_service import AuthService
from src.dto.auth import LoginRequest, TokenResponse
from src.dto.user import UserCreate, UserPublic

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(
    user_create: UserCreate,
    session: Session = Depends(get_db_session)
):
    """Register a new user"""
    user_repository = UserRepository(session)
    auth_service = AuthService(user_repository)
    
    return auth_service.register_user(user_create)

@router.post("/login", response_model=TokenResponse)
def login(
    login_request: LoginRequest,
    session: Session = Depends(get_db_session)
):
    """Login and get access token"""
    user_repository = UserRepository(session)
    auth_service = AuthService(user_repository)
    
    return auth_service.authenticate_user(login_request)