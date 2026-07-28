from pydantic import BaseModel
from datetime import datetime


class UserBadgeResponse(BaseModel):
    user_id: int
    badge_id: int
    assigned_at: datetime | None

    class Config:
        from_attributes = True