"""
Demo Users Creation Script for SprintDesk

Creates three demo users with different roles for testing and demonstration purposes.
Run this script MANUALLY after setting up the database to have users ready for immediate use.

This is a STANDALONE script - it does NOT run automatically with main.py

Usage: python create_demo_users.py
"""

import sys
from pathlib import Path

# Add src to path so we can import modules
sys.path.append(str(Path(__file__).parent / "src"))

from src.database import get_database
from src.models.user import User
from src.models.enums import UserRole
from src.security.security import get_password_hash
from sqlmodel import select

def create_demo_users():
    """Create three demo users with different roles"""

    print("Creating demo users for SprintDesk...")

    # Demo users data - passwords are 8+ characters
    demo_users = [
        {
            "username": "admin",
            "email": "admin@sprintdesk.com",
            "firstname": "Admin",
            "lastname": "User",
            "password": "12345678",
            "role": UserRole.ADMIN,
            "title": "System Administrator"
        },
        {
            "username": "manager",
            "email": "manager@sprintdesk.com",
            "firstname": "Project",
            "lastname": "Manager",
            "password": "12345678",
            "role": UserRole.PROJECT_MANAGER,
            "title": "Senior Project Manager"
        },
        {
            "username": "contributor",
            "email": "contributor@sprintdesk.com",
            "firstname": "John",
            "lastname": "Developer",
            "password": "12345678",
            "role": UserRole.CONTRIBUTOR,
            "title": "Software Developer"
        }
    ]

    try:
        # Get database session
        db = get_database()
        session = db.get_session()

        created_users = []
        skipped_users = []

        for user_data in demo_users:
            # Check if user already exists
            existing_user = session.exec(
                select(User).where(User.username == user_data["username"])
            ).first()

            if existing_user:
                skipped_users.append(user_data["username"])
                continue

            # Create new user
            hashed_password = get_password_hash(user_data["password"])

            user = User(
                username=user_data["username"],
                email=user_data["email"],
                firstname=user_data["firstname"],
                lastname=user_data["lastname"],
                password_hash=hashed_password,
                role=user_data["role"],
                title=user_data["title"],
                is_active=True
            )

            session.add(user)
            created_users.append(user_data["username"])

        session.commit()
        session.close()

        # Print results
        print("\nDemo users creation completed!")
        print("\nSummary:")
        if created_users:
            print(f"   Created: {len(created_users)} users")
            for username in created_users:
                print(f"   + {username}")

        if skipped_users:
            print(f"   Skipped: {len(skipped_users)} users (already exist)")
            for username in skipped_users:
                print(f"   ! {username}")

        print("\nLogin Credentials:")
        print("   Admin User:")
        print("   - Username: admin")
        print("   - Password: admin12345")
        print("   - Role: Admin (can manage users, projects, issues)")
        print()
        print("   Project Manager:")
        print("   - Username: manager")
        print("   - Password: manager12345")
        print("   - Role: Project Manager (can create/manage projects)")
        print()
        print("   Contributor:")
        print("   - Username: contributor")
        print("   - Password: contributor12345")
        print("   - Role: Contributor (can work on assigned issues)")
        print()
        print("You can now log in to SprintDesk with any of these accounts!")
        print("   Frontend: http://localhost:5173")
        print("   Backend API: http://localhost:8000/docs")

    except Exception as e:
        print(f"Error creating demo users: {e}")
        print("Make sure:")
        print("  1. Database is running and accessible")
        print("  2. Environment variables are set correctly")
        print("  3. Backend dependencies are installed")
        print("  4. Backend server was started at least once (to initialize DB)")
        return False

    return True

if __name__ == "__main__":
    print("SprintDesk Demo Users Creator")
    print("=" * 40)
    print("WARNING: This is a STANDALONE script - run it manually when needed")
    print()

    # Check if we're in the right directory
    if not Path("src/main.py").exists():
        print("Error: Please run this script from the backend directory")
        print("   Usage: cd backend && python create_demo_users.py")
        sys.exit(1)

    # Run the function
    success = create_demo_users()

    if success:
        sys.exit(0)
    else:
        sys.exit(1)