from fastapi import APIRouter, Depends, HTTPException, status
from typing import cast
from src.services.comment_service import CommentService
from src.dto.comment import CommentCreate, CommentUpdate, CommentPublic
from src.models.user import User
from src.security.auth_dependencies import get_current_active_user, get_comment_service
from src.exceptions.issue_exceptions import IssueNotFoundError
from src.exceptions.project_exceptions import ProjectNotFoundError
from src.exceptions.auth_exceptions import NotAuthorizedError
from src.exceptions.comment_exceptions import CommentNotFoundError

router = APIRouter(prefix="/comments", tags=["Comments"])

@router.post("/", response_model=CommentPublic, status_code=status.HTTP_201_CREATED)
def create_comment(
    comment_create: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    comment_service: CommentService = Depends(get_comment_service)
):
    """Create a new comment"""
    # At runtime this is never None, but type checker complains without this line
    current_user_id = cast(int, current_user.id)

    try:
        return comment_service.create_comment(comment_create, current_user_id, current_user.role)
    except (IssueNotFoundError, ProjectNotFoundError) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)

@router.get("/{comment_id}", response_model=CommentPublic, status_code=status.HTTP_200_OK)
def get_comment_by_id(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    comment_service: CommentService = Depends(get_comment_service)
):
    """Get comment by ID"""
    current_user_id = cast(int, current_user.id)
    
    try:
        return comment_service.get_comment_by_id(comment_id, current_user_id, current_user.role)
    except (CommentNotFoundError, IssueNotFoundError, ProjectNotFoundError) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)


@router.patch("/{comment_id}", response_model=CommentPublic, status_code=status.HTTP_200_OK)
def update_comment(
    comment_id: int,
    comment_update: CommentUpdate,
    current_user: User = Depends(get_current_active_user),
    comment_service: CommentService = Depends(get_comment_service)
):
    """Update comment"""
    current_user_id = cast(int, current_user.id)

    try:
        return comment_service.update_comment(comment_id, comment_update, current_user_id, current_user.role)
    except (CommentNotFoundError, IssueNotFoundError, ProjectNotFoundError) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    comment_service: CommentService = Depends(get_comment_service)
):
    """Delete comment"""
    current_user_id = cast(int, current_user.id)
    
    try:
        comment_service.delete_comment(comment_id, current_user_id, current_user.role)
    except (CommentNotFoundError, IssueNotFoundError, ProjectNotFoundError) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)

@router.get("/issue/{issue_id}", response_model=list[CommentPublic], status_code=status.HTTP_200_OK)
def get_comments_by_issue(
    issue_id: int,
    current_user: User = Depends(get_current_active_user),
    comment_service: CommentService = Depends(get_comment_service)
):
    """Get all comments for an issue"""
    current_user_id = cast(int, current_user.id)
    
    try:
        return comment_service.get_comments_by_issue(issue_id, current_user_id, current_user.role)
    except (IssueNotFoundError, ProjectNotFoundError) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)


@router.get("/author/{author_id}", response_model=list[CommentPublic], status_code=status.HTTP_200_OK)
def get_comments_by_author(
    author_id: int,
    current_user: User = Depends(get_current_active_user),
    comment_service: CommentService = Depends(get_comment_service)
):
    """Get all comments by a specific author"""
    current_user_id = cast(int, current_user.id)
    
    try:
        return comment_service.get_comments_by_author(author_id, current_user_id, current_user.role)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)