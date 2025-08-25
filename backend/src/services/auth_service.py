from fastapi import HTTPException, status
from datetime import timedelta
from src.dto.auth import LoginRequest, TokenResponse, TokenData
from src.dto.user import UserCreate, UserPublic
from src.models import User, UserRole
from src.repositories.user_repository import UserRepository
from src.security.security import verify_password, get_password_hash, create_access_token, decode_token
from src.config import settings

class AuthService:
    """Service for authentication operations"""
    
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def register_user(self, user_create: UserCreate) -> UserPublic:
        """Register a new user"""
        # Check if username already exists
        if self.user_repository.get_by_username(user_create.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists."
            )
        
        # Check if email already exists
        if self.user_repository.get_by_email(user_create.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists."
            )
        
        # Hash password
        extra_data = {"password_hash": get_password_hash(user_create.password)}
        db_user = User.model_validate(user_create, update=extra_data)
        
        return self.user_repository.create(db_user)

    def authenticate_user(self, login_request: LoginRequest) -> TokenResponse:
        """Authenticate user and return access token"""
        # Get user by username
        user = self.user_repository.get_by_username(login_request.username)
        
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or inactive account"
            )
        
        # Verify password
        if not verify_password(login_request.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            subject=user.id, 
            expires_delta=access_token_expires
        )
        
        return TokenResponse(
            access_token=access_token,
            expires_in=settings.access_token_expire_minutes * 60  # convert to seconds
        )

    def get_current_user_data(self, token: str) -> TokenData:
        """Get current user data from token"""
        payload = decode_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        # Get user from database
        user = self.user_repository.get_by_id(int(user_id))
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        return TokenData(
            user_id=user.id,
            username=user.username,
            role=user.role
        )

    # Role & Permission checks
    def is_admin(self, user_role: UserRole) -> bool:
        """Check if user is admin"""
        return user_role == UserRole.ADMIN

    def is_project_manager(self, user_role: UserRole) -> bool:
        """Check if user is project manager"""
        return user_role == UserRole.PROJECT_MANAGER

    def is_contributor(self, user_role: UserRole) -> bool:
        """Check if user is contributor"""
        return user_role == UserRole.CONTRIBUTOR

    def can_manage_users(self, user_role: UserRole) -> bool:
        """Check if user can manage other users"""
        return user_role == UserRole.ADMIN

    def can_create_projects(self, user_role: UserRole) -> bool:
        """Check if user can create projects"""
        return user_role in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]

    def can_manage_project(self, user_role: UserRole, user_id: int, project_creator_id: int) -> bool:
        """
        Check if user can manage a specific project.
        Project Managers can manage only their own projects.
        Admins can manage everything.
        Contributors cannot manage projects.
        """
        if user_role == UserRole.ADMIN:
            return True
        if user_role == UserRole.PROJECT_MANAGER:
            return user_id == project_creator_id
        return False