from sqlmodel import Field, Relationship
from src.models.base import LabelBase
from typing import ClassVar, TYPE_CHECKING

if TYPE_CHECKING:
    from src.models import IssueLabel

class Label(LabelBase, table=True):
    __tablename__:ClassVar[str] = "labels"

    id: int | None = Field(default=None, primary_key=True)
    is_active: bool = Field(default=True)
    color_hash: int = Field(default=0, index=True)
    # Relationships
    issue_labels: list["IssueLabel"] = Relationship(back_populates="label", cascade_delete=True)
