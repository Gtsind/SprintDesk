from src.exceptions.base_exception import AppException

class CommentNotFoundError(AppException):
    """Raised when trying to find a comment that does not exist in the database."""
    def __init__(self, message: str = "Comment not found."):
        super().__init__(message)