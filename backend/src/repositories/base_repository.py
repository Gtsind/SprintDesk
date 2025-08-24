from typing import TypeVar, Generic, Type
from sqlmodel import SQLModel, Session, select

T = TypeVar("T", bound=SQLModel)

class BaseRepository(Generic[T]):
    """Base repository class with common CRUD operations"""
    
    def __init__(self, model: Type[T], session: Session):
        self.model = model
        self.session = session

    def get_by_id(self, id: int) -> T | None:
        """Get record by ID"""
        return self.session.get(self.model, id)

    def get_all(self) -> list[T]:
        """Get all records"""
        statement = select(self.model)
        return list(self.session.exec(statement).all())

    def delete(self, id: int) -> bool:
        """Delete a record by ID"""
        db_obj = self.get_by_id(id)
        if not db_obj:
            return False
            
        self.session.delete(db_obj)
        self.session.commit()
        return True

    def get_by_field(self, field_name: str, value) -> T | None:
        """Get record by any field"""
        statement = select(self.model).where(getattr(self.model, field_name) == value)
        return self.session.exec(statement).first()

    def get_all_by_field(self, field_name: str, value) -> list[T]:
        """Get all records by field value"""
        statement = select(self.model).where(getattr(self.model, field_name) == value)
        return list(self.session.exec(statement).all())