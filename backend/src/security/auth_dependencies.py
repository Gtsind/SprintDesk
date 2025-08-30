from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from src.database import get_db_session
from src.repositories.user_repository import UserRepository
from src.services.auth_service import AuthService
from src.models.user import User
from src.exceptions.user_exceptions import InvalidUsernameError, UserNotFoundError
from src.exceptions.auth_exceptions import InvalidTokenError, InvalidTokenPayloadError

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_db_session)
) -> User:
    """
    Get current user from JWT token
    """
    user_repository = UserRepository(session)
    auth_service = AuthService(user_repository)
    
    try:
        token_data = auth_service.get_current_user_data(credentials.credentials)
        if not token_data.user_id:
            raise InvalidTokenPayloadError()
        
        user = user_repository.get_by_id(token_data.user_id)
        if not user:
            raise InvalidUsernameError()
        
        return user
    
    except (InvalidUsernameError, InvalidTokenError, InvalidTokenPayloadError, UserNotFoundError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message,
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to ensure user is active
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user"
            )
    return current_user