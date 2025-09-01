from src.exceptions.base_exception import AppException

class LabelNotFoundError(AppException):
    """Raised when trying to find a label that doesn't exist in the database."""
    def __init__(self, message: str = "Label not found."):
        super().__init__(message)

class LabelAlreadyAddedError(AppException):
    """Raised when trying to add an already assigned label to an issue."""
    def __init__(self, message: str = "Label is already assigned to this issue."):
        super().__init__(message)

class LabelAlreadyExistsError(AppException):
    """Raised when trying to create a label with the same name as an existing label."""
    def __init__(self, message: str = "A label with that name already exists."):
        super().__init__(message)