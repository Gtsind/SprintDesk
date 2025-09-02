import pytest
from fastapi.testclient import TestClient
from src.models import User
from src.models.enums import UserRole
from tests.conftest import get_auth_token, get_auth_headers

class TestUserEndpoints:
    """Test user management endpoints"""

    def test_create_user_as_admin(self, client: TestClient, admin_user: User):
        """Test creating user as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        user_data = {
            "firstname": "Created",
            "lastname": "User",
            "username": "createduser",
            "email": "created@example.com",
            "title": "New Developer",
            "role": "Contributor",
            "password": "newpass123",
            "is_active": True
        }
        
        response = client.post("/api/v1/users/", json=user_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "createduser"
        assert data["email"] == "created@example.com"
        assert data["role"] == "Contributor"
        assert data["is_active"] is True

    def test_create_user_as_non_admin(self, client: TestClient, regular_user: User):
        """Test creating user as non-admin (should fail)"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        user_data = {
            "firstname": "Should",
            "lastname": "Fail",
            "username": "shouldfail",
            "email": "shouldfail@example.com",
            "password": "password123"
        }
        
        response = client.post("/api/v1/users/", json=user_data, headers=headers)
        
        assert response.status_code == 403
        assert "Only admins can create new users" in response.json()["detail"]

    def test_get_current_user_profile(self, client: TestClient, regular_user: User):
        """Test getting current user's profile"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/users/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "johndoe"
        assert data["email"] == "john@example.com"
        assert data["firstname"] == "John"
        assert data["lastname"] == "Doe"

    def test_get_all_users_as_admin(self, client: TestClient, admin_user: User, regular_user: User):
        """Test getting all users as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/users/", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2  # At least admin and regular user
        usernames = [user["username"] for user in data]
        assert "admin" in usernames
        assert "johndoe" in usernames

    def test_get_all_users_as_non_admin(self, client: TestClient, regular_user: User):
        """Test getting all users as non-admin (should fail)"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/users/", headers=headers)
        
        assert response.status_code == 403

    def test_get_active_users_as_admin(self, client: TestClient, admin_user: User, regular_user: User, inactive_user: User):
        """Test getting active users as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/users/active", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should only return active users
        for user in data:
            assert user["is_active"] is True
        usernames = [user["username"] for user in data]
        assert "admin" in usernames
        assert "johndoe" in usernames
        assert "inactive" not in usernames

    def test_get_user_by_id_as_admin(self, client: TestClient, admin_user: User, regular_user: User):
        """Test getting user by ID as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/users/{regular_user.id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == regular_user.id
        assert data["username"] == "johndoe"

    def test_get_user_by_id_self(self, client: TestClient, regular_user: User):
        """Test getting own user by ID"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/users/{regular_user.id}", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == regular_user.id
        assert data["username"] == "johndoe"

    def test_get_user_by_id_unauthorized(self, client: TestClient, admin_user: User, regular_user: User):
        """Test getting another user by ID as non-admin"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.get(f"/api/v1/users/{admin_user.id}", headers=headers)
        
        assert response.status_code == 403

    def test_update_user_as_admin(self, client: TestClient, admin_user: User, regular_user: User):
        """Test updating user as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        update_data = {
            "firstname": "Updated",
            "title": "Senior Developer"
        }
        
        response = client.patch(f"/api/v1/users/{regular_user.id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["firstname"] == "Updated"
        assert data["title"] == "Senior Developer"
        assert data["lastname"] == "Doe"  # Should remain unchanged

    def test_update_user_self(self, client: TestClient, regular_user: User):
        """Test updating own user"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        update_data = {
            "title": "Lead Developer"
        }
        
        response = client.patch(f"/api/v1/users/{regular_user.id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Lead Developer"

    def test_update_user_unauthorized(self, client: TestClient, admin_user: User, regular_user: User):
        """Test updating another user as non-admin"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        update_data = {
            "firstname": "Should Not Update"
        }
        
        response = client.patch(f"/api/v1/users/{admin_user.id}", json=update_data, headers=headers)
        
        assert response.status_code == 403

    def test_delete_user_as_admin(self, client: TestClient, admin_user: User, regular_user: User):
        """Test deleting user as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.delete(f"/api/v1/users/{regular_user.id}", headers=headers)
        
        assert response.status_code == 204

    def test_delete_user_as_non_admin(self, client: TestClient, admin_user: User, regular_user: User):
        """Test deleting user as non-admin (should fail)"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.delete(f"/api/v1/users/{admin_user.id}", headers=headers)
        
        assert response.status_code == 403

    def test_deactivate_user_as_admin(self, client: TestClient, admin_user: User, regular_user: User):
        """Test deactivating user as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.patch(f"/api/v1/users/{regular_user.id}/deactivate", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is False

    def test_activate_user_as_admin(self, client: TestClient, admin_user: User, inactive_user: User):
        """Test activating user as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.patch(f"/api/v1/users/{inactive_user.id}/activate", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is True

    def test_deactivate_user_as_non_admin(self, client: TestClient, admin_user: User, regular_user: User):
        """Test deactivating user as non-admin (should fail)"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.patch(f"/api/v1/users/{admin_user.id}/deactivate", headers=headers)
        
        assert response.status_code == 403

    def test_get_users_by_role_as_admin(self, client: TestClient, admin_user: User, regular_user: User):
        """Test getting users by role as admin"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/users/role/Contributor", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for user in data:
            assert user["role"] == "Contributor"

    def test_get_users_by_role_as_non_admin(self, client: TestClient, regular_user: User):
        """Test getting users by role as non-admin (should fail)"""
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/users/role/Admin", headers=headers)
        
        assert response.status_code == 403

    def test_user_not_found(self, client: TestClient, admin_user: User):
        """Test accessing non-existent user"""
        token = get_auth_token(client, "admin", "adminpass123")
        headers = get_auth_headers(token)
        
        response = client.get("/api/v1/users/99999", headers=headers)
        
        assert response.status_code == 404

    def test_unauthorized_access(self, client: TestClient):
        """Test accessing user endpoints without authentication"""
        response = client.get("/api/v1/users/me")
        assert response.status_code == 403

        response = client.get("/api/v1/users/")
        assert response.status_code == 403

        response = client.post("/api/v1/users/", json={})
        assert response.status_code == 403