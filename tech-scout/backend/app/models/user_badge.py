from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base


class UserBadge(Base):

    __tablename__ = "user_badges"

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

    assigned_at = Column(
        DateTime,
        default=datetime.utcnow
    )


    user = relationship(
        "User",
        back_populates="badges"
    )

    badge = relationship(
        "Badge"
    )