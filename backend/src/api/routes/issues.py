from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from src.database import get_db_session
from src.repositories import IssueRepository, ProjectRepository, UserRepository
from src.services.issue_service import IssueService
from src.dto.issue import IssueCreate, IssueUpdate, IssuePublic
from src.models.user import User
from src.security.auth_dependencies import get_current_active_user

router = APIRouter(prefix="/issues", tags=["Issues"])

@router.post("/", response_model=IssuePublic, status_code=status.HTTP_201_CREATED)
def create_issue(
    issue_create: IssueCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Create a new issue"""
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    user_repository = UserRepository(session)
    issue_service = IssueService(issue_repository, project_repository, user_repository)
    
    return issue_service.create_issue(issue_create, current_user.id, current_user.role) # type: ignore

@router.get("/", response_model=list[IssuePublic])
def get_all_issues(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get all issues based on user permissions"""
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    user_repository = UserRepository(session)
    issue_service = IssueService(issue_repository, project_repository, user_repository)
    
    return issue_service.get_all_issues(current_user.id, current_user.role) # type: ignore

@router.get("/{issue_id}", response_model=IssuePublic)
def get_issue_by_id(
    issue_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get issue by ID"""
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    user_repository = UserRepository(session)
    issue_service = IssueService(issue_repository, project_repository, user_repository)
    
    return issue_service.get_issue_by_id(issue_id, current_user.id, current_user.role) # type: ignore

@router.put("/{issue_id}", response_model=IssuePublic)
def update_issue(
    issue_id: int,
    issue_update: IssueUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Update issue"""
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    user_repository = UserRepository(session)
    issue_service = IssueService(issue_repository, project_repository, user_repository)
    
    return issue_service.update_issue(issue_id, issue_update, current_user.id, current_user.role) # type: ignore

@router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(
    issue_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Delete issue"""
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    user_repository = UserRepository(session)
    issue_service = IssueService(issue_repository, project_repository, user_repository)
    
    success = issue_service.delete_issue(issue_id, current_user.id, current_user.role) # type: ignore
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found or unauthorized")

@router.get("/project/{project_id}", response_model=list[IssuePublic])
def get_issues_by_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get issues by project"""
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    user_repository = UserRepository(session)
    issue_service = IssueService(issue_repository, project_repository, user_repository)
    
    return issue_service.get_issues_by_project(project_id, current_user.id, current_user.role) # type: ignore

@router.get("/assignee/{assignee_id}", response_model=list[IssuePublic])
def get_issues_by_assignee(
    assignee_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Get issues by assignee"""
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    user_repository = UserRepository(session)
    issue_service = IssueService(issue_repository, project_repository, user_repository)
    
    return issue_service.get_issues_by_assignee(assignee_id, current_user.id, current_user.role) # type: ignore

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

@router.patch("/{issue_id}/assign", response_model=IssuePublic)
def assign_issue(
    issue_id: int,
    assignee_id: int | None,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_db_session)
):
    """Assign or unassign issue"""
    issue_repository = IssueRepository(session)
    project_repository = ProjectRepository(session)
    user_repository = UserRepository(session)
    issue_service = IssueService(issue_repository, project_repository, user_repository)
    
    return issue_service.assign_issue(issue_id, assignee_id, current_user.id, current_user.role) # type: ignore

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