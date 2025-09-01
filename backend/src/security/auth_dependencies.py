from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from src.database import get_db_session
from src.repositories import UserRepository, ProjectRepository, IssueRepository, LabelRepository, CommentRepository
from src.services.auth_service import AuthService
from src.services.user_service import UserService
from src.services.issue_service import IssueService
from src.services.project_service import ProjectService
from src.services.comment_service import CommentService
from src.services.label_service import LabelService
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

def get_project_service(session: Session = Depends(get_db_session)) -> ProjectService:
    project_repository = ProjectRepository(session)
    user_repository = UserRepository(session)
    return ProjectService(project_repository, user_repository)

def get_user_service(session: Session = Depends(get_db_session)) -> UserService:
    user_repository = UserRepository(session)
    return UserService(user_repository)

def get_issue_service(session: Session = Depends(get_db_session)) -> IssueService:
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    user_repository = UserRepository(session)
    label_repository = LabelRepository(session)
    return IssueService(issue_repository, project_repository, user_repository, label_repository)

def get_comment_service(session: Session = Depends(get_db_session)) -> CommentService:
    comment_repository = CommentRepository(session)
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    return CommentService(comment_repository, issue_repository, project_repository)

def get_label_service(session: Session = Depends(get_db_session)) -> LabelService:
    label_repository = LabelRepository(session)
    return LabelService(label_repository)

