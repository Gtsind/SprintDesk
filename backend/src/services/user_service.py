from fastapi import HTTPException, status
from src.dto.user import UserCreate, UserUpdate, UserPublic
from src.repositories.user_repository import UserRepository
from src.utils.security import get_password_hash
from src.utils.enums import UserRole

class UserService:
    """Service for user operations"""
    
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def create_user(self, user_create: UserCreate, current_user_role: UserRole) -> UserPublic:
        """Create a new user (Admin only)"""
        if current_user_role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can create new users."
            )
        
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
        
        hashed_password = get_password_hash(user_create.password)
        db_user = self.user_repository.create(UserCreate(
            **user_create.model_dump(exclude={"password"}),
            password=hashed_password
        ))

        return UserPublic.model_validate(db_user)

    def get_user_by_id(self, user_id: int, current_user_role: UserRole, current_user_id: int) -> UserPublic:
        """Get user by ID"""
        # Admin can see anyone, others can only see themselves
        if current_user_role != UserRole.ADMIN and current_user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own profile."
            )
        
        user = self.user_repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        return UserPublic.model_validate(user)

    def get_all_users(self, current_user_role: UserRole) -> list[UserPublic]:
        """Get all users (Admin only)"""
        if current_user_role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own profile."
            )
        
        users = self.user_repository.get_all()
        return [UserPublic.model_validate(user) for user in users]

    def get_active_users(self, current_user_role: UserRole) -> list[UserPublic]:
        """Get all active users (Admin only)"""
        if current_user_role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own profile."
            )
        
        users = self.user_repository.get_active_users()
        return [UserPublic.model_validate(user) for user in users]

    def update_user(self, user_id: int, user_update: UserUpdate, current_user_role: UserRole, current_user_id: int) -> UserPublic:
        """Update user"""
        # Admin can update anyone, others can only update themselves
        if current_user_role != UserRole.ADMIN and current_user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own profile."
            )
        
        # If updating password, hash it
        update_data = user_update.model_dump(exclude_unset=True)
        if "password" in update_data:
            update_data["password_hash"] = get_password_hash(update_data.pop("password"))
        
        # Non-admins cannot change their role
        if current_user_role != UserRole.ADMIN and "role" in update_data:
            update_data.pop("role")
        
        user_update_processed = UserUpdate(**update_data)
        updated_user = self.user_repository.update(user_id, user_update_processed)
        
        if updated_user:
            return UserPublic.model_validate(updated_user)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    def delete_user(self, user_id: int, current_user_role: UserRole) -> bool:
        """Delete user (Admin only)"""
        if current_user_role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can delete users."
            )
        
        return self.user_repository.delete(user_id)

    def deactivate_user(self, user_id: int, current_user_role: UserRole) -> UserPublic:
        """Deactivate user (Admin only)"""
        if current_user_role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can deactivate users."
            )
        
        user = self.user_repository.deactivate_user(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        return UserPublic.model_validate(user)

    def activate_user(self, user_id: int, current_user_role: UserRole) -> UserPublic:
        """Activate user (Admin only)"""
        if current_user_role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can activate users."
            )
        
        user = self.user_repository.activate_user(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        return UserPublic.model_validate(user)

    def get_users_by_role(self, role: str, current_user_role: UserRole) -> list[UserPublic]:
        """Get users by role (Admin only)"""
        if current_user_role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can view users by role."
            )
        
        users = self.user_repository.get_users_by_role(role)
        return [UserPublic.model_validate(user) for user in users]