from pydantic import BaseModel
from datetime import datetime


class AssignBadgeRequest(BaseModel):

    assigned_by: int | None = None

    comment: str | None = None



class UserBadgeResponse(BaseModel):

    id: int

    user_id: int

    badge_id: int

    assigned_by: int | None = None

    comment: str | None = None

    assigned_at: datetime | None = None


    class Config:
        from_attributes = True