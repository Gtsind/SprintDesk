from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from src.models import Project, ProjectMembership, User
from src.dto.project import ProjectUpdate
from .base_repository import BaseRepository

class ProjectRepository(BaseRepository[Project]):
    """Repository for Project operations"""
    
    def __init__(self, session: Session):
        super().__init__(Project, session)

    def create(self, project: Project) -> Project:
        """Create a new project"""
        try:
            self.session.add(project)
            self.session.commit()
            self.session.refresh(project)
            return project
        except IntegrityError:
            self.session.rollback()
            raise

    def update(self, project_id: int, project_update: ProjectUpdate) -> Project | None:
        """Update existing project"""
        db_project = self.get_by_id(project_id)
        if not db_project:
            return None
        
        update_data = project_update.model_dump(exclude_unset=True)
        
        try:
            db_project.sqlmodel_update(update_data)
            self.session.add(db_project)
            self.session.commit()
            self.session.refresh(db_project)
            return db_project
        except (ValueError, IntegrityError):
            self.session.rollback()
            raise

    def get_projects_by_creator(self, creator_id: int) -> list[Project]:
        """Get projects created by a specific user"""
        return self.get_all_by_field("created_by", creator_id)

    def get_projects_by_status(self, status: str) -> list[Project]:
        """Get projects by status"""
        return self.get_all_by_field("status", status)

    def get_user_projects(self, user_id: int) -> list[Project]:
        """Get projects where user is a member"""
        statement = (
            select(Project)
            .join(ProjectMembership)
            .where(ProjectMembership.user_id == user_id)
        )
        return list(self.session.exec(statement).all())

    def add_member(self, project_id: int, user_id: int) -> None:
        """Add a member to a project"""
        membership = ProjectMembership(project_id=project_id, user_id=user_id)
        try:
            self.session.add(membership)
            self.session.commit()
        except IntegrityError:
            self.session.rollback()
            raise

    def remove_member(self, project_id: int, user_id: int) -> None:
        """Remove a member from a project"""
        try:
            statement = select(ProjectMembership).where(
                ProjectMembership.project_id == project_id,
                ProjectMembership.user_id == user_id
            )
            membership = self.session.exec(statement).first()
            if membership:
                self.session.delete(membership)
                self.session.commit()
        except IntegrityError:
            self.session.rollback()
            raise

    def is_member(self, project_id: int, user_id: int) -> bool:
        """Check if user is a member of the project"""
        statement = select(ProjectMembership).where(
            ProjectMembership.project_id == project_id,
            ProjectMembership.user_id == user_id
        )
        return self.session.exec(statement).first() is not None

    def get_project_members(self, project_id: int) -> list[User]:
        """Get all members of a project"""
        statement = (
            select(User)
            .join(ProjectMembership)
            .where(ProjectMembership.project_id == project_id)
        )
        return list(self.session.exec(statement).all())