from src.exceptions.base_exception import AppException

class ProjectNotFoundError(AppException):
    """Raised when trying to find a project that doesn't exist in the database."""
    def __init__(self, message: str = "Project not found."):
        super().__init__(message)

class AlreadyProjectMemberError(AppException):
    """Raised when trying to add a member to a project they are already a member of."""
    def __init__(self, message: str = "User is already a member of this project."):
        super().__init__(message)

class ProjectCreatorRemoveError(AppException):
    """Raised when trying to remove the project creator from the project."""
    def __init__(self, message: str = "Cannot remove the project creator"):
        super().__init__(message)

class NotProjectMemberError(AppException):
    """Raised when trying to remove a user from a project they are not a member of."""
    def __init__(self, message: str = "User is not a member of this project."):
        super().__init__(message)

class InvalidProjectStatusError(AppException):
    """Raised when trying to filter projects by an invalid status name."""
    def __init__(self, message: str = "Invalid status name."):
        super().__init__(message)