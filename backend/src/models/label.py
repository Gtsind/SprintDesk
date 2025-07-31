from sqlmodel import SQLModel, Field

class Label(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, unique=True, index=True)