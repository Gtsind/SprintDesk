from fastapi import APIRouter
from src.api.routes import auth, users, projects, issues, comments, labels

# Create main API router
api_router = APIRouter(prefix="/api/v1")

# Include all route modules
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(projects.router)
api_router.include_router(issues.router)
api_router.include_router(comments.router)
api_router.include_router(labels.router)