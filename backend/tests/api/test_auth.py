import pytest
from fastapi.testclient import TestClient
from src.models import User
from tests.conftest import get_auth_token

class TestAuthEndpoints:
    """Test authentication endpoints"""

    def test_register_user_success(self, client: TestClient):
        """Test successful user registration"""
        user_data = {
            "firstname": "New",
            "lastname": "User",
            "username": "newuser",
            "email": "newuser@example.com",
            "title": "Developer",
            "role": "Contributor",
            "password": "newpass123",
            "is_active": True
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "newuser@example.com"
        assert data["firstname"] == "New"
        assert data["lastname"] == "User"
        assert data["role"] == "Contributor"
        assert data["is_active"] is True
        assert "id" in data
        assert "created_at" in data
        assert "password" not in data  # Password should not be returned

    def test_register_user_duplicate_username(self, client: TestClient, regular_user: User):
        """Test registration with duplicate username"""
        user_data = {
            "firstname": "Another",
            "lastname": "User",
            "username": "johndoe",  # Same as regular_user
            "email": "another@example.com",
            "password": "password123"
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 409
        assert "Username already exists" in response.json()["detail"]

    def test_register_user_duplicate_email(self, client: TestClient, regular_user: User):
        """Test registration with duplicate email"""
        user_data = {
            "firstname": "Another",
            "lastname": "User",
            "username": "anotheruser",
            "email": "john@example.com",  # Same as regular_user
            "password": "password123"
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 409
        assert "Email already exists" in response.json()["detail"]

    def test_register_user_invalid_data(self, client: TestClient):
        """Test registration with invalid data"""
        # Test missing required fields
        user_data = {
            "firstname": "Test",
            "username": "test"
            # Missing lastname, email, password
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == 422  # Validation error

        # Test password too short
        user_data = {
            "firstname": "Test",
            "lastname": "User",
            "username": "testuser",
            "email": "test@example.com",
            "password": "123"  # Too short
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == 422

    def test_login_success(self, client: TestClient, regular_user: User):
        """Test successful login"""
        login_data = {
            "username": "johndoe",
            "password": "userpass123"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
        assert isinstance(data["expires_in"], int)

    def test_login_invalid_username(self, client: TestClient):
        """Test login with invalid username"""
        login_data = {
            "username": "nonexistent",
            "password": "password123"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "Username does not exist" in response.json()["detail"]

    def test_login_incorrect_password(self, client: TestClient, regular_user: User):
        """Test login with incorrect password"""
        login_data = {
            "username": "johndoe",
            "password": "wrongpassword"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "Incorrect password" in response.json()["detail"]

    def test_login_inactive_user(self, client: TestClient, inactive_user: User):
        """Test login with inactive user"""
        login_data = {
            "username": "inactive",
            "password": "inactivepass123"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "User account is inactive" in response.json()["detail"]

    def test_login_missing_credentials(self, client: TestClient):
        """Test login with missing credentials"""
        # Missing password
        login_data = {
            "username": "johndoe"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 422

        # Missing username
        login_data = {
            "password": "password123"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 422

    def test_token_validation(self, client: TestClient, regular_user: User):
        """Test token validation by accessing protected endpoint"""
        # Get valid token
        token = get_auth_token(client, "johndoe", "userpass123")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Access protected endpoint
        response = client.get("/api/v1/users/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "johndoe"

    def test_invalid_token(self, client: TestClient):
        """Test access with invalid token"""
        headers = {"Authorization": "Bearer invalid_token"}
        
        response = client.get("/api/v1/users/me", headers=headers)
        
        assert response.status_code == 401

    def test_missing_token(self, client: TestClient):
        """Test access without token"""
        response = client.get("/api/v1/users/me")
        
        assert response.status_code == 403  # FastAPI returns 403 for missing auth

    def test_expired_token_format(self, client: TestClient):
        """Test that token response has correct format"""
        # Register a new user first
        user_data = {
            "firstname": "Token",
            "lastname": "Test",
            "username": "tokentest",
            "email": "tokentest@example.com",
            "password": "password123"
        }
        client.post("/api/v1/auth/register", json=user_data)
        
        # Login to get token
        login_data = {
            "username": "tokentest",
            "password": "password123"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify token structure
        assert "access_token" in data
        assert "token_type" in data
        assert "expires_in" in data
        assert data["token_type"] == "bearer"
        assert isinstance(data["access_token"], str)
        assert len(data["access_token"]) > 0
        assert isinstance(data["expires_in"], int)
        assert data["expires_in"] > 0