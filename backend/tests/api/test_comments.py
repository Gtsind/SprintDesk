import pytest
from fastapi.testclient import TestClient
from src.models import User, Issue, Comment
from tests.conftest import get_auth_token, get_auth_headers

class TestCommentEndpoints:
    """Test comment management endpoints"""

    def test_create_comment_as_member(self, client: TestClient, regular_user: User, sample_issue: Issue, test_session):
        """Test creating comment as project member"""
        # Add regular_user as member to the project
        from src.models.intermediate_tables import ProjectMembership
        membership = ProjectMembership(project_id=sample_issue.project_id, user_id=regular_user.id)
        test_session.add(membership)
        test_session.commit()
        
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        comment_data = {
            "content": "This is a test comment",
            "issue_id": sample_issue.id
        }
        
        response = client.post("/api/v1/comments/", json=comment_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["content"] == "This is a test comment"
        assert data["issue_id"] == sample_issue.id
        assert data["author_id"] == regular_user.id
        assert "id" in data
        assert "created_at" in data

    def test_create_comment_as_admin(self, client: TestClient, admin_user: User, sample_issue: Issue):
        """Test creating comment as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        comment_data = {
            "content": "Admin comment",
            "issue_id": sample_issue.id
        }
        
        response = client.post("/api/v1/comments/", json=comment_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["content"] == "Admin comment"
        assert data["author_id"] == admin_user.id

    def test_create_comment_as_non_member(self, client: TestClient, sample_issue: Issue, test_session):
        """Test creating comment as non-member (should fail)"""
        # Create new user who is not a project member
        client.post("/api/v1/auth/register", json={
            "firstname": "Non", "lastname": "Member", "username": "nonmember", 
            "email": "nonmember@example.com", "password": "password123"
        })
        
        token = get_auth_token(client, "nonmember", "password123")
        headers = get_auth_headers(token)
        
        comment_data = {
            "content": "Should fail",
            "issue_id": sample_issue.id
        }
        
        response = client.post("/api/v1/comments/", json=comment_data, headers=headers)
        
        assert response.status_code == 403

    def test_create_comment_nonexistent_issue(self, client: TestClient, admin_user: User):
        """Test creating comment for non-existent issue"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        comment_data = {
            "content": "Comment on nonexistent issue",
            "issue_id": 99999
        }
        
        response = client.post("/api/v1/comments/", json=comment_data, headers=headers)
        
        assert response.status_code == 404

    def test_get_comment_by_id_as_admin(self, client: TestClient, admin_user: User, sample_comment: Comment):
        """Test getting comment by ID as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/comments/{sample_comment.id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_comment.id
        assert data["content"] == "This is a test comment"
        assert data["issue_id"] == sample_comment.issue_id

    def test_get_comment_by_id_as_member(self, client: TestClient, regular_user: User, sample_comment: Comment, test_session):
        """Test getting comment by ID as project member"""
        # Add regular_user as member to the project
        from src.models.intermediate_tables import ProjectMembership
        membership = ProjectMembership(project_id=sample_comment.issue.project_id, user_id=regular_user.id)
        test_session.add(membership)
        test_session.commit()
        
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/comments/{sample_comment.id}", headers=headers)
        
        assert response.status_code == 200

    def test_get_comment_by_id_unauthorized(self, client: TestClient, sample_comment: Comment):
        """Test getting comment by ID as non-member"""
        # Create new user who is not a project member
        client.post("/api/v1/auth/register", json={
            "firstname": "Non", "lastname": "Member", "username": "nonmember2", 
            "email": "nonmember2@example.com", "password": "password123"
        })
        
        token = get_auth_token(client, "nonmember2", "password123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/comments/{sample_comment.id}", headers=headers)
        
        assert response.status_code == 403

    def test_update_comment_as_author(self, client: TestClient, regular_user: User, sample_comment: Comment):
        """Test updating comment as author"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        update_data = {
            "content": "Updated comment content"
        }
        
        response = client.patch(f"/api/v1/comments/{sample_comment.id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["content"] == "Updated comment content"

    def test_update_comment_as_admin(self, client: TestClient, admin_user: User, sample_comment: Comment):
        """Test updating comment as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        update_data = {
            "content": "Admin updated comment"
        }
        
        response = client.patch(f"/api/v1/comments/{sample_comment.id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["content"] == "Admin updated comment"

    def test_update_comment_unauthorized(self, client: TestClient, sample_comment: Comment):
        """Test updating comment as unauthorized user"""
        # Create new user who is not the author
        client.post("/api/v1/auth/register", json={
            "firstname": "Other", "lastname": "User", "username": "otheruser", 
            "email": "otheruser@example.com", "password": "password123"
        })
        
        token = get_auth_token(client, "otheruser", "password123")
        headers = get_auth_headers(token)
        
        update_data = {
            "content": "Should not update"
        }
        
        response = client.patch(f"/api/v1/comments/{sample_comment.id}", json=update_data, headers=headers)
        
        assert response.status_code == 403

    def test_delete_comment_as_author(self, client: TestClient, regular_user: User, sample_comment: Comment):
        """Test deleting comment as author"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.delete(f"/api/v1/comments/{sample_comment.id}", headers=headers)
        
        assert response.status_code == 204

    def test_delete_comment_as_admin(self, client: TestClient, admin_user: User, sample_comment: Comment):
        """Test deleting comment as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.delete(f"/api/v1/comments/{sample_comment.id}", headers=headers)
        
        assert response.status_code == 204

    def test_delete_comment_unauthorized(self, client: TestClient, sample_comment: Comment):
        """Test deleting comment as unauthorized user"""
        # Create new user who is not the author
        client.post("/api/v1/auth/register", json={
            "firstname": "Other", "lastname": "User", "username": "otheruser2", 
            "email": "otheruser2@example.com", "password": "password123"
        })
        
        token = get_auth_token(client, "otheruser2", "password123")
        headers = get_auth_headers(token)
        
        response = client.delete(f"/api/v1/comments/{sample_comment.id}", headers=headers)
        
        assert response.status_code == 403

    def test_get_comments_by_issue_as_admin(self, client: TestClient, admin_user: User, sample_issue: Issue, sample_comment: Comment):
        """Test getting comments by issue as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/comments/issue/{sample_issue.id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        comment_ids = [comment["id"] for comment in data]
        assert sample_comment.id in comment_ids

    def test_get_comments_by_issue_as_member(self, client: TestClient, regular_user: User, sample_issue: Issue, test_session):
        """Test getting comments by issue as project member"""
        # Add regular_user as member to the project
        from src.models.intermediate_tables import ProjectMembership
        membership = ProjectMembership(project_id=sample_issue.project_id, user_id=regular_user.id)
        test_session.add(membership)
        test_session.commit()
        
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/comments/issue/{sample_issue.id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_comments_by_issue_unauthorized(self, client: TestClient, sample_issue: Issue):
        """Test getting comments by issue as non-member"""
        # Create new user who is not a project member
        client.post("/api/v1/auth/register", json={
            "firstname": "Non", "lastname": "Member", "username": "nonmember3", 
            "email": "nonmember3@example.com", "password": "password123"
        })
        
        token = get_auth_token(client, "nonmember3", "password123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/comments/issue/{sample_issue.id}", headers=headers)
        
        assert response.status_code == 403

    def test_get_comments_by_author_as_admin(self, client: TestClient, admin_user: User, regular_user: User, sample_comment: Comment):
        """Test getting comments by author as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/comments/author/{regular_user.id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for comment in data:
            assert comment["author_id"] == regular_user.id

    def test_get_comments_by_author_unauthorized(self, client: TestClient, regular_user: User):
        """Test getting comments by author as non-admin"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/comments/author/{regular_user.id}", headers=headers)
        
        assert response.status_code == 403

    def test_comment_not_found(self, client: TestClient, admin_user: User):
        """Test accessing non-existent comment"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/comments/99999", headers=headers)
        
        assert response.status_code == 404

    def test_unauthorized_access(self, client: TestClient):
        """Test accessing comment endpoints without authentication"""
        response = client.post("/api/v1/comments/", json={})
        assert response.status_code == 403

        response = client.get("/api/v1/comments/1")
        assert response.status_code == 403

    def test_create_comment_validation(self, client: TestClient, admin_user: User, sample_issue: Issue):
        """Test comment creation with invalid data"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        # Test missing content
        comment_data = {
            "issue_id": sample_issue.id
        }
        
        response = client.post("/api/v1/comments/", json=comment_data, headers=headers)
        assert response.status_code == 422

        # Test missing issue_id
        comment_data = {
            "content": "Missing issue ID"
        }
        
        response = client.post("/api/v1/comments/", json=comment_data, headers=headers)
        assert response.status_code == 422

        # Test empty content
        comment_data = {
            "content": "",
            "issue_id": sample_issue.id
        }
        
        response = client.post("/api/v1/comments/", json=comment_data, headers=headers)
        assert response.status_code == 422

        # Test content too long (assuming max 2000 characters)
        comment_data = {
            "content": "x" * 2001,
            "issue_id": sample_issue.id
        }
        
        response = client.post("/api/v1/comments/", json=comment_data, headers=headers)
        assert response.status_code == 422

    def test_update_comment_validation(self, client: TestClient, admin_user: User, sample_comment: Comment):
        """Test comment update with invalid data"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        # Test empty content
        update_data = {
            "content": ""
        }
        
        response = client.patch(f"/api/v1/comments/{sample_comment.id}", json=update_data, headers=headers)
        assert response.status_code == 422

        # Test content too long
        update_data = {
            "content": "x" * 2001
        }
        
        response = client.patch(f"/api/v1/comments/{sample_comment.id}", json=update_data, headers=headers)
        assert response.status_code == 422