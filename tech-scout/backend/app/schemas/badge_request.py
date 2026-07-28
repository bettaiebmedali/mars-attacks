from pydantic import BaseModel
from datetime import datetime


class BadgeRequestCreate(BaseModel):

    badge_id: int
    comment: str | None = None



class BadgeRequestResponse(BaseModel):

    id: int
    user_id: int
    badge_id: int
    status: str
    comment: str | None
    requested_at: datetime

    class Config:
        from_attributes = True