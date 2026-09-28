import uuid
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .personnel import Personnel


class User(SQLModel, table=True):
    __tablename__ = 'users'
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    employee_code: str = Field(index=True, unique=True, max_length=100)
    username: str = Field(index=True, unique=True, max_length=100)
    password: str = Field(max_length=255)
    fullname: str = Field(default='')
    branch_code: str = Field(default='')
    dept: str = Field(default='')
    role: str = Field(default='GDV', max_length=50)
    status: str = Field(default='active')

    personnel_records: list['Personnel'] = Relationship(back_populates='creator')
