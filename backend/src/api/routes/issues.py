from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import cast
from src.database import get_db_session
from src.repositories import IssueRepository, ProjectRepository, UserRepository
from src.services.issue_service import IssueService
from src.dto.issue import IssueCreate, IssueUpdate, IssuePublic
from src.models.user import User
from src.security.auth_dependencies import get_current_active_user, get_issue_service
from src.exceptions.user_exceptions import UserNotFoundError, InactiveUserAccountError
from src.exceptions.project_exceptions import ProjectNotFoundError
from src.exceptions.issue_exceptions import IssueAssigneeError, IssueNotFoundError
from src.exceptions.auth_exceptions import NotAuthorizedError

router = APIRouter(prefix="/issues", tags=["Issues"])

@router.post("/", response_model=IssuePublic, status_code=status.HTTP_201_CREATED)
def create_issue(
    issue_create: IssueCreate,
    current_user: User = Depends(get_current_active_user),
    issue_service: IssueService = Depends(get_issue_service)
):
    """Create a new issue"""
    # At runtime this is never None, but type checker complains without this line
    current_user_id = cast(int, current_user.id)
    
    try:
        return issue_service.create_issue(issue_create, current_user_id, current_user.role)
    except (UserNotFoundError, ProjectNotFoundError) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except (IssueAssigneeError, InactiveUserAccountError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)

@router.get("/", response_model=list[IssuePublic], status_code=status.HTTP_200_OK)
def get_all_issues(
    current_user: User = Depends(get_current_active_user),
    issue_service: IssueService = Depends(get_issue_service)
):
    """Get all issues based on user permissions"""
    current_user_id = cast(int, current_user.id)
    return issue_service.get_all_issues(current_user_id, current_user.role)

@router.get("/{issue_id}", response_model=IssuePublic, status_code=status.HTTP_200_OK)
def get_issue_by_id(
    issue_id: int,
    current_user: User = Depends(get_current_active_user),
    issue_service: IssueService = Depends(get_issue_service)
):
    """Get issue by ID"""
    current_user_id = cast(int, current_user.id)
    
    try:
        return issue_service.get_issue_by_id(issue_id, current_user_id, current_user.role)
    except IssueNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)

@router.patch("/{issue_id}", response_model=IssuePublic, status_code=status.HTTP_200_OK)
def update_issue(
    issue_id: int,
    issue_update: IssueUpdate,
    current_user: User = Depends(get_current_active_user),
    issue_service: IssueService = Depends(get_issue_service)
):
    """Update issue"""
    current_user_id = cast(int, current_user.id)
    try:
        return issue_service.update_issue(issue_id, issue_update, current_user_id, current_user.role)
    except (IssueNotFoundError, ProjectNotFoundError, UserNotFoundError) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)
    except InactiveUserAccountError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.message)
    except IssueAssigneeError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)

@router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(
    issue_id: int,
    current_user: User = Depends(get_current_active_user),
    issue_service: IssueService = Depends(get_issue_service)
):
    """Delete issue"""
    current_user_id = cast(int, current_user.id)

    try:
        issue_service.delete_issue(issue_id, current_user_id, current_user.role)
    except IssueNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)

@router.get("/project/{project_id}", response_model=list[IssuePublic], status_code=status.HTTP_200_OK)
def get_issues_by_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    issue_service: IssueService = Depends(get_issue_service)
):
    """Get issues by project"""
    current_user_id = cast(int, current_user.id)
    
    try:
        return issue_service.get_issues_by_project(project_id, current_user_id, current_user.role)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)
    except ProjectNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)

@router.get("/assignee/{assignee_id}", response_model=list[IssuePublic], status_code=status.HTTP_200_OK)
def get_issues_by_assignee(
    assignee_id: int,
    current_user: User = Depends(get_current_active_user),
    issue_service: IssueService = Depends(get_issue_service)
):
    """Get issues by assignee"""
    current_user_id = cast(int, current_user.id)
    
    try:
        return issue_service.get_issues_by_assignee(assignee_id, current_user_id, current_user.role)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)
    except (ProjectNotFoundError, UserNotFoundError) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)

@router.get("/author/{author_id}", response_model=list[IssuePublic])
def get_issues_by_author(
    author_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get issues by author"""
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    user_repository = UserRepository(session)
    issue_service = IssueService(issue_repository, project_repository, user_repository)
    
    return issue_service.get_issues_by_author(author_id, current_user.id, current_user.role) # type: ignore

@router.patch("/{issue_id}/assign/{assignee_id}", response_model=IssuePublic, status_code=status.HTTP_200_OK)
def assign_issue(
    issue_id: int,
    assignee_id: int,
    current_user: User = Depends(get_current_active_user),
    issue_service: IssueService = Depends(get_issue_service)
):
    """Assign or unassign issue"""
    current_user_id = cast(int, current_user.id)
    try:
        actual_assignee_id = None if assignee_id == 0 else assignee_id
        
        return issue_service.assign_issue(issue_id, actual_assignee_id, current_user_id, current_user.role)
    except (ProjectNotFoundError, UserNotFoundError, IssueNotFoundError) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except InactiveUserAccountError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.message)
    except IssueAssigneeError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except NotAuthorizedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)

@router.patch("/{issue_id}/close", response_model=IssuePublic)
def close_issue(
    issue_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Close issue"""
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    user_repository = UserRepository(session)
    issue_service = IssueService(issue_repository, project_repository, user_repository)
    
    return issue_service.close_issue(issue_id, current_user.id, current_user.role) # type: ignore

@router.patch("/{issue_id}/reopen", response_model=IssuePublic)
def reopen_issue(
    issue_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Reopen issue"""
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    user_repository = UserRepository(session)
    issue_service = IssueService(issue_repository, project_repository, user_repository)
    
    return issue_service.reopen_issue(issue_id, current_user.id, current_user.role) # type: ignore

@router.post("/{issue_id}/labels/{label_id}", status_code=status.HTTP_201_CREATED)
def add_label_to_issue(
    issue_id: int,
    label_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Add label to issue"""
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    user_repository = UserRepository(session)
    issue_service = IssueService(issue_repository, project_repository, user_repository)
    
    success = issue_service.add_label_to_issue(issue_id, label_id, current_user.id, current_user.role) # type: ignore
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not add label")
    
    return {"message": "Label added successfully"}

@router.delete("/{issue_id}/labels/{label_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_label_from_issue(
    issue_id: int,
    label_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Remove label from issue"""
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    user_repository = UserRepository(session)
    issue_service = IssueService(issue_repository, project_repository, user_repository)
    
    success = issue_service.remove_label_from_issue(issue_id, label_id, current_user.id, current_user.role) # type: ignore
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Label not found on issue")