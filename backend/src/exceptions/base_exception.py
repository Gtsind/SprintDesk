class AppException(Exception):
    """Base class for all custom app exceptions."""
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message