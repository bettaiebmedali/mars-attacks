from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base


class Badge(Base):

    __tablename__ = "badges"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        unique=True,
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    level = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


    user_badges = relationship(
        "UserBadge",
        back_populates="badge"
    )