from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import Session
from src.database import get_db_session
from src.repositories import UserRepository
from src.services.auth_service import AuthService
from src.dto.auth import LoginRequest, TokenResponse
from src.dto.user import UserCreate, UserPublic
from src.exceptions.user_exceptions import UsernameAlreadyExistsError, EmailAlreadyExistsError, InvalidUsernameError, InactiveUserAccountError, IncorrectPasswordError
from src.exceptions.auth_exceptions import InvalidTokenError

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(
    user_create: UserCreate,
    session: Session = Depends(get_db_session)
):
    """Register a new user"""
    user_repository = UserRepository(session)
    auth_service = AuthService(user_repository)

    try:
        return auth_service.register_user(user_create)
    
    except (UsernameAlreadyExistsError, EmailAlreadyExistsError) as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)

@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(
    login_request: LoginRequest,
    session: Session = Depends(get_db_session)
):
    """Login and get access token"""
    user_repository = UserRepository(session)
    auth_service = AuthService(user_repository)

    try:
        return auth_service.authenticate_user(login_request)
    
    except (InvalidUsernameError, IncorrectPasswordError, InactiveUserAccountError) as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.message)
    except InvalidTokenError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.message)
