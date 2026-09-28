import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .user import User


class Personnel(SQLModel, table=True):
    __tablename__ = 'personnel'

    id: int | None = Field(default=None, primary_key=True)
    STT: str = Field(default='')
    Ten: str = Field(default='')
    MaNV: str = Field(default='')
    Ngay_sinh: str = Field(default='')
    Noi_sinh: str = Field(default='')
    CCCD: str = Field(default='')
    Ngay_cap: str = Field(default='')
    Noi_cap: str = Field(default='')
    Mail: str = Field(default='')
    Phong_ban: str = Field(default='')
    Chuc_vu: str = Field(default='')
    SDT: str = Field(default='')
    User_IPCAS: str = Field(default='')
    User_AD: str = Field(default='')
    Chi_nhanh: str = Field(default='')
    Ma_CN: str = Field(default='')
    Nhom_CN: str = Field(default='KSV')
    created_by: uuid.UUID = Field(foreign_key='users.id', index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    creator: Optional['User'] = Relationship(back_populates='personnel_records')
