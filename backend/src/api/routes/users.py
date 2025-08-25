from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from src.database import get_db_session
from src.repositories import UserRepository
from src.services.user_service import UserService
from src.dto.user import UserCreate, UserUpdate, UserPublic
from src.models.user import User
from src.security.auth_dependencies import get_current_active_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def create_user(
    user_create: UserCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Create a new user (Admin only)"""
    user_repository = UserRepository(session)
    user_service = UserService(user_repository)
    
    return user_service.create_user(user_create, current_user.role)

@router.get("/me", response_model=UserPublic)
def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's profile"""
    return UserPublic.model_validate(current_user)

@router.get("/", response_model=list[UserPublic])
def get_all_users(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get all users (Admin only)"""
    user_repository = UserRepository(session)
    user_service = UserService(user_repository)
    
    return user_service.get_all_users(current_user.role)

@router.get("/active", response_model=list[UserPublic])
def get_active_users(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get all active users (Admin only)"""
    user_repository = UserRepository(session)
    user_service = UserService(user_repository)
    
    return user_service.get_active_users(current_user.role)

@router.get("/{user_id}", response_model=UserPublic)
def get_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get user by ID"""
    user_repository = UserRepository(session)
    user_service = UserService(user_repository)
    
    return user_service.get_user_by_id(user_id, current_user.role, current_user.id) # type: ignore

@router.patch("/{user_id}", response_model=UserPublic)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Update user"""
    user_repository = UserRepository(session)
    user_service = UserService(user_repository)
    
    return user_service.update_user(user_id, user_update, current_user.role, current_user.id) # type: ignore

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Delete user (Admin only)"""
    user_repository = UserRepository(session)
    user_service = UserService(user_repository)
    
    success = user_service.delete_user(user_id, current_user.role)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

@router.patch("/{user_id}/deactivate", response_model=UserPublic)
def deactivate_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Deactivate user (Admin only)"""
    user_repository = UserRepository(session)
    user_service = UserService(user_repository)
    
    return user_service.deactivate_user(user_id, current_user.role)

@router.patch("/{user_id}/activate", response_model=UserPublic)
def activate_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Activate user (Admin only)"""
    user_repository = UserRepository(session)
    user_service = UserService(user_repository)
    
    return user_service.activate_user(user_id, current_user.role)

@router.get("/role/{role}", response_model=list[UserPublic])
def get_users_by_role(
    role: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get users by role (Admin only)"""
    user_repository = UserRepository(session)
    user_service = UserService(user_repository)
    
    return user_service.get_users_by_role(role, current_user.role)