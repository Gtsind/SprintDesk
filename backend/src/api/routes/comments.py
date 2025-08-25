from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from src.database import get_db_session
from src.repositories import CommentRepository, IssueRepository, ProjectRepository
from src.services.comment_service import CommentService
from src.dto.comment import CommentCreate, CommentUpdate, CommentPublic
from src.models.user import User
from src.security.auth_dependencies import get_current_active_user

router = APIRouter(prefix="/comments", tags=["Comments"])

@router.post("/", response_model=CommentPublic, status_code=status.HTTP_201_CREATED)
def create_comment(
    comment_create: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Create a new comment"""
    comment_repository = CommentRepository(session)
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    comment_service = CommentService(comment_repository, issue_repository, project_repository)
    
    return comment_service.create_comment(comment_create, current_user.id, current_user.role) # type: ignore

@router.get("/{comment_id}", response_model=CommentPublic)
def get_comment_by_id(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get comment by ID"""
    comment_repository = CommentRepository(session)
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    comment_service = CommentService(comment_repository, issue_repository, project_repository)
    
    return comment_service.get_comment_by_id(comment_id, current_user.id, current_user.role) # type: ignore

@router.put("/{comment_id}", response_model=CommentPublic)
def update_comment(
    comment_id: int,
    comment_update: CommentUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Update comment"""
    comment_repository = CommentRepository(session)
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    comment_service = CommentService(comment_repository, issue_repository, project_repository)
    
    return comment_service.update_comment(comment_id, comment_update, current_user.id, current_user.role) # type: ignore

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Delete comment"""
    comment_repository = CommentRepository(session)
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    comment_service = CommentService(comment_repository, issue_repository, project_repository)
    
    success = comment_service.delete_comment(comment_id, current_user.id, current_user.role) # type: ignore
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found or unauthorized")

@router.get("/issue/{issue_id}", response_model=list[CommentPublic])
def get_comments_by_issue(
    issue_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get all comments for an issue"""
    comment_repository = CommentRepository(session)
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    comment_service = CommentService(comment_repository, issue_repository, project_repository)
    
    return comment_service.get_comments_by_issue(issue_id, current_user.id, current_user.role) # type: ignore

@router.get("/author/{author_id}", response_model=list[CommentPublic])
def get_comments_by_author(
    author_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get all comments by a specific author"""
    comment_repository = CommentRepository(session)
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    comment_service = CommentService(comment_repository, issue_repository, project_repository)
    
    return comment_service.get_comments_by_author(author_id, current_user.id, current_user.role) # type: ignore