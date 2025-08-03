from sqlmodel import SQLModel, Field, Relationship
from typing import ClassVar, TYPE_CHECKING

if TYPE_CHECKING:
    from src.models import IssueLabel

class Label(SQLModel, table=True):
    __tablename__:ClassVar[str] = "labels"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, unique=True,max_length=50, index=True)
    is_active: bool = Field(default=True)
    # Relationships
    issue_labels: list["IssueLabel"] = Relationship(back_populates="label")

    def __str__(self) -> str:
        return f"Label: {self.name}"