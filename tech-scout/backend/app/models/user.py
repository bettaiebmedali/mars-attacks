from sqlalchemy import ForeignKey, Column, Integer, String, DateTime
from sqlalchemy.orm import relationship

from pydantic import BaseModel, EmailStr
from datetime import datetime

from app.db.database import Base


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    first_name = Column(
        String,
        nullable=False
    )

    last_name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    password_hash = Column(
        String,
        nullable=False
    )

    role_id = Column(
        Integer,
        ForeignKey("roles.id")
    )

    role = relationship(
        "Role",
        back_populates="users"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    badges = relationship(
        "UserBadge",
        foreign_keys="UserBadge.user_id",
        back_populates="user"
    )