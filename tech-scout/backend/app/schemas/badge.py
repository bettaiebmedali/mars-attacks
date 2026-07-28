from pydantic import BaseModel


class BadgeBase(BaseModel):
    name: str
    description: str | None = None
    level: str


class BadgeCreate(BadgeBase):
    pass


class BadgeResponse(BadgeBase):
    id: int

    class Config:
        from_attributes = True