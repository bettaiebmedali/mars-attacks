from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.models.badge_request import BadgeRequest
from app.models.badge import Badge
from app.security.dependencies import get_current_user

from app.schemas.badge_request import (
    BadgeRequestCreate,
    BadgeRequestResponse
)


router = APIRouter(
    prefix="/api/badge-requests",
    tags=["Badge Requests"]
)


@router.post(
    "/",
    response_model=BadgeRequestResponse
)
def request_badge(
    data: BadgeRequestCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    badge = (
        db.query(Badge)
        .filter(Badge.id == data.badge_id)
        .first()
    )


    if not badge:
        raise HTTPException(
            404,
            "Badge not found"
        )


    request = BadgeRequest(
        user_id=current_user.id,
        badge_id=data.badge_id,
        comment=data.comment
    )


    db.add(request)
    db.commit()
    db.refresh(request)


    return request