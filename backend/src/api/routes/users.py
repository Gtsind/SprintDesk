from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from src.database import get_db_session
from src.repositories import UserRepository
from src.services.user_service import UserService
from src.services.auth_service import AuthService
from src.dto.user import UserCreate, UserUpdate, UserPublic
from src.models.user import User
from src.security.auth_dependencies import get_current_active_user
from src.exceptions.auth_exceptions import NotAuthorizedError
from src.exceptions.user_exceptions import UsernameAlreadyExistsError, EmailAlreadyExistsError, UserNotFoundError

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def create_user(
    user_create: UserCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Create a new user (Admin only)"""
    user_repository = UserRepository(session)
    user_service = UserService(user_repository, AuthService(user_repository))
    
    try:
        return user_service.create_user(user_create, current_user.role)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)
    except (UsernameAlreadyExistsError, EmailAlreadyExistsError) as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)

@router.get("/me", response_model=UserPublic, status_code=status.HTTP_200_OK)
def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's profile"""
    try:
        return current_user
    except UserNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)

@router.get("/", response_model=list[UserPublic], status_code=status.HTTP_200_OK)
def get_all_users(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get all users (Admin only)"""
    user_repository = UserRepository(session)
    user_service = UserService(user_repository, AuthService(user_repository))
    
    try:
        return user_service.get_all_users(current_user.role)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)

@router.get("/active", response_model=list[UserPublic], status_code=status.HTTP_200_OK)
def get_active_users(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get all active users (Admin only)"""
    user_repository = UserRepository(session)
    user_service = UserService(user_repository, AuthService(user_repository))

    try:
        return user_service.get_active_users(current_user.role)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)

@router.get("/{user_id}", response_model=UserPublic, status_code=status.HTTP_200_OK)
def get_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get user by ID"""
    user_repository = UserRepository(session)
    user_service = UserService(user_repository, AuthService(user_repository))

    if current_user.id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error: current user has no ID."
        )

    try:
        return user_service.get_user_by_id(user_id, current_user.role, current_user.id)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)
    except UserNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.patch("/{user_id}", response_model=UserPublic, status_code=status.HTTP_200_OK)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Update user"""
    user_repository = UserRepository(session)
    user_service = UserService(user_repository, AuthService(user_repository))

    if current_user.id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error: current user has no ID."
        )
    
    try:
        return user_service.update_user(user_id, user_update, current_user.role, current_user.id)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)
    except UserNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except (UsernameAlreadyExistsError, EmailAlreadyExistsError) as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Delete user (Admin only)"""
    user_repository = UserRepository(session)
    user_service = UserService(user_repository, AuthService(user_repository))
    
    try:
        user_service.delete_user(user_id, current_user.role)
        return None
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)
    except UserNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)

@router.patch("/{user_id}/deactivate", response_model=UserPublic, status_code=status.HTTP_200_OK)
def deactivate_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Deactivate user (Admin only)"""
    user_repository = UserRepository(session)
    user_service = UserService(user_repository, AuthService(user_repository))

    try:
        return user_service.deactivate_user(user_id, current_user.role)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)
    except UserNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)

@router.patch("/{user_id}/activate", response_model=UserPublic, status_code=status.HTTP_200_OK)
def activate_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Activate user (Admin only)"""
    user_repository = UserRepository(session)
    user_service = UserService(user_repository, AuthService(user_repository))
    
    try:
        return user_service.activate_user(user_id, current_user.role)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)
    except UserNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)

@router.get("/role/{role}", response_model=list[UserPublic], status_code=status.HTTP_200_OK)
def get_users_by_role(
    role: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get users by role (Admin only)"""
    user_repository = UserRepository(session)
    user_service = UserService(user_repository, AuthService(user_repository))
    
    try:
        return user_service.get_users_by_role(role, current_user.role)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)