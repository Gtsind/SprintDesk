from src.dto.project import ProjectCreate, ProjectUpdate
from src.repositories import ProjectRepository, UserRepository
from src.models import Project, UserRole, User, ProjectStatus
from src.exceptions.auth_exceptions import NotAuthorizedError
from src.exceptions.project_exceptions import ProjectNotFoundError, AlreadyProjectMemberError, ProjectCreatorRemoveError, NotProjectMemberError, InvalidProjectStatusError
from src.exceptions.user_exceptions import UserNotFoundError, InactiveUserAccountError

class ProjectService:
    """Service for project operations"""
    
    def __init__(self, project_repository: ProjectRepository, user_repository: UserRepository):
        self.project_repository = project_repository
        self.user_repository = user_repository

    def create_project(self, project_create: ProjectCreate, current_user_id: int, current_user_role: UserRole) -> Project:
        """Create a new project (Admin and Project Manager only)"""
        if not current_user_role in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
            raise NotAuthorizedError("Not authorized to create projects.")
        
        db_project = Project.model_validate(project_create, update={"created_by": current_user_id})

        return self.project_repository.create(db_project)

    def get_project_by_id(self, project_id: int, current_user_id: int, current_user_role: UserRole) -> Project:
        """Get project by ID"""
        project = self.project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError()
        
        # Admin can see any project
        if current_user_role == UserRole.ADMIN:
            return project
        
        # Project Manager can see projects they created
        if current_user_role == UserRole.PROJECT_MANAGER and project.created_by == current_user_id:
            return project
        
        # Contributors can only see projects they are members of
        if self.project_repository.is_member(project_id, current_user_id):
            return project
        
        raise NotAuthorizedError("Not authorized to view this project.")

    def get_all_projects(self, current_user_id: int, current_user_role: UserRole) -> list[Project]:
        """Get all projects based on user role"""
        # Admin can see all projects
        if current_user_role == UserRole.ADMIN:
            projects = self.project_repository.get_all()

        # Project Manager can see projects they created
        elif current_user_role == UserRole.PROJECT_MANAGER:
            projects = self.project_repository.get_projects_by_creator(current_user_id)
        else:
            # Contributors can only see projects they are members of
            projects = self.project_repository.get_user_projects(current_user_id)
        
        return projects

    def update_project(self, project_id: int, project_update: ProjectUpdate, current_user_id: int, current_user_role: UserRole) -> Project:
        """Update an existing project with authorization checks"""
        project = self.project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError()
        
        if not (
            # Admin can update any project
            current_user_role == UserRole.ADMIN
            # Project Manager can update projects they created
            or (current_user_role == UserRole.PROJECT_MANAGER and project.created_by == current_user_id)
        ):
            raise NotAuthorizedError("Not authorized to update this project.")
        
        updated_project = self.project_repository.update(project_id, project_update)

        if not updated_project:
            raise ProjectNotFoundError("Project no longer exists.")

        return updated_project

    def delete_project(self, project_id: int, current_user_id: int, current_user_role: UserRole) -> None:
        """Delete existing project with authorization checks"""
        project = self.project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError()
        
        if not (
            # Admin can delete any project
            current_user_role == UserRole.ADMIN
            # Project Manager can delete projects they created
            or (current_user_role == UserRole.PROJECT_MANAGER and project.created_by == current_user_id)
        ):
            raise NotAuthorizedError("Not authorized to delete this project.")

        self.project_repository.delete(project_id)

    def add_member(self, project_id: int, user_id: int, current_user_id: int, current_user_role: UserRole) -> None:
        """Add member to project"""
        # Check if the member we are trying to add to the project exists and is active
        member = self.user_repository.get_by_id(user_id)
        if not member:
            raise UserNotFoundError()
        
        if not member.is_active:
            raise InactiveUserAccountError("Cannot add inactive users to projects.")

        project = self.project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError()
        
        if not (
            # Admin can add members to any project
            current_user_role == UserRole.ADMIN
            # Project Manager can add members to projects they created
            or (current_user_role == UserRole.PROJECT_MANAGER and project.created_by == current_user_id)
        ):
            raise NotAuthorizedError("Not authorized to add members to this project.")

        if self.project_repository.is_member(project_id, user_id):
            raise AlreadyProjectMemberError()

        self.project_repository.add_member(project_id, user_id)

    def remove_member(self, project_id: int, user_id: int, current_user_id: int, current_user_role: UserRole) -> None:
        """Remove member from project"""
        project = self.project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError()
        
        if not self.project_repository.is_member(project_id, user_id):
            raise NotProjectMemberError()
        
        if not (
            # Admin can remove members from any project
            current_user_role == UserRole.ADMIN
            # Project Manager can remove members from projects they created
            or (current_user_role == UserRole.PROJECT_MANAGER and project.created_by == current_user_id)
        ):
            raise NotAuthorizedError("Not authorized to remove members from this project.")

        if user_id == project.created_by:
            raise ProjectCreatorRemoveError()

        self.project_repository.remove_member(project_id, user_id)

    def get_project_members(self, project_id: int, current_user_id: int, current_user_role: UserRole) -> list[User]:
        """Get project members"""
        project = self.project_repository.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError()
        
        # Admin can see members of any project
        if current_user_role == UserRole.ADMIN:
            return self.project_repository.get_project_members(project_id)
        # Project Manager can see members of projects they created
        if current_user_role == UserRole.PROJECT_MANAGER and project.created_by == current_user_id:
            return self.project_repository.get_project_members(project_id)
        # Contributors can see members of projects they are part of
        if self.project_repository.is_member(project_id, current_user_id):
            return self.project_repository.get_project_members(project_id)
        
        raise NotAuthorizedError("Not authorized to view members of this project.")

    def is_member(self, project_id: int, user_id: int) -> bool:
        """Check if user is member of project"""
        return self.project_repository.is_member(project_id, user_id)

    def get_projects_by_status(self, status_name: str, current_user_id: int, current_user_role: UserRole) -> list[Project]:
        """Get projects by status based on user role"""
        try:
            status = status_name.strip().replace("-","_").title()
            status = ProjectStatus(status)
        except ValueError:
            raise InvalidProjectStatusError()

        # Admin can see all projects with this status
        if current_user_role == UserRole.ADMIN:
            projects = self.project_repository.get_projects_by_status(status)

        # Project Manager can see their projects with this status
        elif current_user_role == UserRole.PROJECT_MANAGER:
            all_projects = self.project_repository.get_projects_by_creator(current_user_id)
            projects = [project for project in all_projects if project.status == status]
        else:
            # Contributors can see their member projects with this status
            all_projects = self.project_repository.get_user_projects(current_user_id)
            projects = [project for project in all_projects if project.status == status]
        
        return projects