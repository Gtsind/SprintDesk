from src.models import User, UserRole
from src.dto.user import UserCreate, UserUpdate
from src.repositories import UserRepository
from src.security.security import get_password_hash
from src.exceptions.user_exceptions import EmailAlreadyExistsError, UsernameAlreadyExistsError, UserNotFoundError
from src.exceptions.auth_exceptions import NotAuthorizedError

class UserService:
    """Service for user operations"""
    
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def create_user(self, user_create: UserCreate, current_user_role: UserRole) -> User:
        """Create a new user (Admin only)"""
        if current_user_role == UserRole.ADMIN:
            raise NotAuthorizedError("Only admins can create new users.")
        
        # Check if username already exists
        if self.user_repository.get_by_username(user_create.username):
            raise UsernameAlreadyExistsError()
        
        # Check if email already exists
        if self.user_repository.get_by_email(user_create.email):
            raise EmailAlreadyExistsError()
        
        # Hash password
        hashed_password = get_password_hash(user_create.password)
        db_user = User.model_validate(user_create, update={"password_hash": hashed_password})
        
        return self.user_repository.create(db_user)

    def get_user_by_id(self, user_id: int, current_user_role: UserRole, current_user_id: int) -> User:
        """Get user by ID"""
        # Admin can see anyone, others can only see themselves
        if not current_user_role == UserRole.ADMIN and current_user_id != user_id:
            raise NotAuthorizedError("You can only view your own profile.")
        
        user = self.user_repository.get_by_id(user_id)
        if not user:
            raise UserNotFoundError()

        return user

    def get_all_users(self, current_user_role: UserRole) -> list[User]:
        """Get all users (Admin only)"""
        if not current_user_role == UserRole.ADMIN:
            raise NotAuthorizedError("You can only view your own profile.")
        
        return self.user_repository.get_all()

    def get_active_users(self, current_user_role: UserRole) -> list[User]:
        """Get all active users (Admin only)"""
        if not current_user_role == UserRole.ADMIN:
            raise NotAuthorizedError("You can only view your own profile.")
            
        return self.user_repository.get_active_users()

    def update_user(self, user_id: int, user_update: UserUpdate, current_user_role: UserRole, current_user_id: int) -> User:
        """Update user with proper authorization and uniqueness checks."""
        # Admin can update anyone, others can only update themselves
        if not current_user_role == UserRole.ADMIN and current_user_id != user_id:
            raise NotAuthorizedError("You can only update your own profile.")
        
        update_data = user_update.model_dump(exclude_unset=True)
        extra_data = {}

        # Check for uniqueness constraints if username or email is being updated
        if "username" in update_data:
            existing_user = self.user_repository.get_by_username(update_data["username"])
            if existing_user and existing_user.id != user_id:
                raise UsernameAlreadyExistsError()
            
        if "email" in update_data:
            existing_user = self.user_repository.get_by_email(update_data["email"])
            if existing_user and existing_user.id != user_id:
                raise EmailAlreadyExistsError()

        # If updating password, hash it
        if "password" in update_data:
            hashed_password = get_password_hash(update_data.pop("password"))
            extra_data["password_hash"] = hashed_password
        
        # Non-admins cannot change their role
        if not current_user_role == UserRole.ADMIN and "role" in update_data:
            update_data.pop("role")

        # If there are other fields to update besides password
        if update_data:
            validated_update = UserUpdate.model_validate(update_data)
            updated_user = self.user_repository.update(
                user_id=user_id,
                user_update=validated_update,
                extra_data=extra_data
            )
        else: # If only password is being updated (update_data is now empty after popping "password")
            updated_user = self.user_repository.update(
                user_id=user_id,
                user_update=None,
                extra_data=extra_data
            )
        
        if not updated_user:
            raise UserNotFoundError()
            
        return updated_user
        

    def delete_user(self, user_id: int, current_user_role: UserRole) -> None:
        """Delete user (Admin only)"""
        if not current_user_role == UserRole.ADMIN:
            raise NotAuthorizedError("Only admins can delete users.")
        
        if not self.user_repository.delete(user_id):
            raise UserNotFoundError()

    def deactivate_user(self, user_id: int, current_user_role: UserRole) -> User:
        """Deactivate user (Admin only)"""
        if not current_user_role == UserRole.ADMIN:
            raise NotAuthorizedError("Only admins can deactivate users.")
        
        user = self.user_repository.deactivate_user(user_id)
        if not user:
            raise UserNotFoundError()
        
        return user
        
    def activate_user(self, user_id: int, current_user_role: UserRole) -> User:
        """Activate user (Admin only)"""
        if not current_user_role == UserRole.ADMIN:
            raise NotAuthorizedError("Only admins can activate users.")
        
        user = self.user_repository.activate_user(user_id)
        if not user:
            raise UserNotFoundError()
        
        return user

    def get_users_by_role(self, role: str, current_user_role: UserRole) -> list[User]:
        """Get users by role (Admin only)"""
        if not current_user_role == UserRole.ADMIN:
            raise NotAuthorizedError("Only admins can view users by role.")
        
        return self.user_repository.get_users_by_role(role)