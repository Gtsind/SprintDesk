import pytest
import os
from typing import Generator
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session
from sqlmodel.pool import StaticPool
from src.main import app
from src.database import get_db_session
from src.models import User, Project, Issue, Comment, Label
from src.security.security import get_password_hash
from src.models.enums import UserRole, ProjectStatus, IssueStatus, IssuePriority
from datetime import datetime, timezone

# Use SQLite in-memory database for tests
TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="session")
def test_engine():
    """Create test database engine"""
    engine = create_engine(
        TEST_DATABASE_URL, 
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    return engine

@pytest.fixture(scope="function")
def test_session(test_engine) -> Generator[Session, None, None]:
    """Create test database session"""
    # Create all tables
    SQLModel.metadata.create_all(test_engine)
    
    with Session(test_engine) as session:
        yield session
    
    # Clean up - drop all tables after each test
    SQLModel.metadata.drop_all(test_engine)

@pytest.fixture(scope="function")
def client(test_session: Session) -> TestClient:
    """Create FastAPI test client with test database"""
    def get_test_db_session():
        return test_session
    
    app.dependency_overrides[get_db_session] = get_test_db_session
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()

@pytest.fixture
def admin_user(test_session: Session) -> User:
    """Create admin user for testing"""
    user = User(
        firstname="Admin",
        lastname="User",
        username="admin",
        email="admin@example.com",
        title="System Administrator",
        role=UserRole.ADMIN,
        password_hash=get_password_hash("adminpass123"),
        is_active=True,
        created_at=datetime.now(timezone.utc)
    )
    test_session.add(user)
    test_session.commit()
    test_session.refresh(user)
    return user

@pytest.fixture
def regular_user(test_session: Session) -> User:
    """Create regular user for testing"""
    user = User(
        firstname="John",
        lastname="Doe",
        username="johndoe",
        email="john@example.com",
        title="Developer",
        role=UserRole.CONTRIBUTOR,
        password_hash=get_password_hash("userpass123"),
        is_active=True,
        created_at=datetime.now(timezone.utc)
    )
    test_session.add(user)
    test_session.commit()
    test_session.refresh(user)
    return user

@pytest.fixture
def inactive_user(test_session: Session) -> User:
    """Create inactive user for testing"""
    user = User(
        firstname="Inactive",
        lastname="User",
        username="inactive",
        email="inactive@example.com",
        title="Former Employee",
        role=UserRole.CONTRIBUTOR,
        password_hash=get_password_hash("inactivepass123"),
        is_active=False,
        created_at=datetime.now(timezone.utc)
    )
    test_session.add(user)
    test_session.commit()
    test_session.refresh(user)
    return user

@pytest.fixture
def project_manager_user(test_session: Session) -> User:
    """Create project manager user for testing"""
    user = User(
        firstname="Project",
        lastname="Manager",
        username="pm",
        email="pm@example.com",
        title="Project Manager",
        role=UserRole.PROJECT_MANAGER,
        password_hash=get_password_hash("pmpass123"),
        is_active=True,
        created_at=datetime.now(timezone.utc)
    )
    test_session.add(user)
    test_session.commit()
    test_session.refresh(user)
    return user

@pytest.fixture
def sample_project(test_session: Session, admin_user: User) -> Project:
    """Create sample project for testing"""
    project = Project(
        name="Test Project",
        description="A test project",
        status=ProjectStatus.ACTIVE,
        created_by=admin_user.id,
        created_at=datetime.now(timezone.utc)
    )
    test_session.add(project)
    test_session.commit()
    test_session.refresh(project)
    return project

@pytest.fixture
def sample_issue(test_session: Session, sample_project: Project, regular_user: User) -> Issue:
    """Create sample issue for testing"""
    issue = Issue(
        title="Test Issue",
        description="A test issue",
        status=IssueStatus.OPEN,
        priority=IssuePriority.MEDIUM,
        project_id=sample_project.id,
        author_id=regular_user.id,
        assignee_id=regular_user.id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    test_session.add(issue)
    test_session.commit()
    test_session.refresh(issue)
    return issue

@pytest.fixture
def sample_label(test_session: Session) -> Label:
    """Create sample label for testing"""
    label = Label(
        name="bug",
        is_active=True
    )
    test_session.add(label)
    test_session.commit()
    test_session.refresh(label)
    return label

@pytest.fixture
def sample_comment(test_session: Session, sample_issue: Issue, regular_user: User) -> Comment:
    """Create sample comment for testing"""
    comment = Comment(
        content="This is a test comment",
        issue_id=sample_issue.id,
        author_id=regular_user.id,
        created_at=datetime.now(timezone.utc)
    )
    test_session.add(comment)
    test_session.commit()
    test_session.refresh(comment)
    return comment

def get_auth_token(client: TestClient, username: str, password: str) -> str:
    """Helper function to get JWT token for authentication"""
    login_data = {
        "username": username,
        "password": password
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    if response.status_code == 200:
        return response.json()["access_token"]
    raise ValueError(f"Failed to get auth token: {response.json()}")

def get_auth_headers(token: str) -> dict:
    """Helper function to create authorization headers"""
    return {"Authorization": f"Bearer {token}"}