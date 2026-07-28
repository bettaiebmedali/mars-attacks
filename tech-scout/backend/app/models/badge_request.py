from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base


class BadgeRequest(Base):

    __tablename__ = "badge_requests"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    badge_id = Column(
        Integer,
        ForeignKey("badges.id"),
        nullable=False
    )

    status = Column(
        String,
        default="PENDING",
        nullable=False
    )

    comment = Column(
        String,
        nullable=True
    )

    requested_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    validated_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )


    user = relationship(
        "User",
        foreign_keys=[user_id]
    )


    badge = relationship(
        "Badge"
    )


    validator = relationship(
        "User",
        foreign_keys=[validated_by]
    )