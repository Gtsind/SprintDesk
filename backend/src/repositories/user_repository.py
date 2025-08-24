from sqlmodel import Session
from models.user import User
from dto.user import UserCreate, UserUpdate
from .base import BaseRepository

class UserRepository(BaseRepository[User]):
    """Repository for User operations"""
    
    def __init__(self, session: Session):
        super().__init__(User, session)

    def create(self, user_create: UserCreate) -> User:
        """Create a new user"""
        user_data = user_create.model_dump()
        db_user = User(**user_data)
        self.session.add(db_user)
        self.session.commit()
        self.session.refresh(db_user)
        return db_user

    def update(self, user_id: int, user_update: UserUpdate) -> User | None:
        """Update existing user"""
        db_user = self.get_by_id(user_id)
        if not db_user:
            return None
        
        update_data = user_update.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        self.session.add(db_user)
        self.session.commit()
        self.session.refresh(db_user)
        return db_user

    def get_by_username(self, username: str) -> User | None:
        """Get user by username"""
        return self.get_by_field("username", username)

    def get_by_email(self, email: str) -> User | None:
        """Get user by email"""
        return self.get_by_field("email", email)

    def get_active_users(self) -> list[User]:
        """Get all active users"""
        return self.get_all_by_field("is_active", True)

    def get_users_by_role(self, role: str) -> list[User]:
        """Get users by role"""
        return self.get_all_by_field("role", role)

    def deactivate_user(self, user_id: int) -> User | None:
        """Deactivate a user"""
        user_update = UserUpdate(is_active=False)
        return self.update(user_id, user_update)

    def activate_user(self, user_id: int) -> User | None:
        """Activate a user"""
        user_update = UserUpdate(is_active=True)
        return self.update(user_id, user_update)