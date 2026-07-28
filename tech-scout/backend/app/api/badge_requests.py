from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.user_badge import UserBadge
from app.security.dependencies import get_current_user
from app.security.dependencies import require_role
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

@router.get("/pending")
def get_pending_requests(
    db: Session = Depends(get_db),
    current_user = Depends(
        require_role("MENTOR", "ADMIN")
    )
):

    requests = (
        db.query(BadgeRequest)
        .filter(
            BadgeRequest.status == "PENDING"
        )
        .all()
    )

    result = []

    for request in requests:
        result.append(
            {
                "id": request.id,
                "user": request.user.email,
                "badge": request.badge.name,
                "status": request.status,
                "comment": request.comment,
                "requested_at": request.requested_at
            }
        )

    return result



@router.post("/{request_id}/approve")
def approve_request(

    request_id: int,

    db: Session = Depends(get_db),

    current_user = Depends(
        require_role("MENTOR", "ADMIN")
    )
):

    badge_request = (
        db.query(BadgeRequest)
        .filter(
            BadgeRequest.id == request_id
        )
        .first()
    )


    if not badge_request:
        raise HTTPException(
            404,
            "Request not found"
        )


    if badge_request.status != "PENDING":
        raise HTTPException(
            400,
            "Request already processed"
        )


    # Vérification doublon badge
    existing_badge = (
        db.query(UserBadge)
        .filter(
            UserBadge.user_id == badge_request.user_id,
            UserBadge.badge_id == badge_request.badge_id
        )
        .first()
    )


    if existing_badge:
        raise HTTPException(
            status_code=400,
            detail="User already owns this badge"
        )


    # Attribution du badge
    user_badge = UserBadge(

        user_id=badge_request.user_id,

        badge_id=badge_request.badge_id,

        assigned_by=current_user.id,

        comment="Approved by mentor"
    )


    db.add(user_badge)


    badge_request.status = "APPROVED"

    badge_request.validated_by = current_user.id


    db.commit()


    return {

        "message": "Badge approved",

        "user": badge_request.user.email,

        "badge": badge_request.badge.name

    }


@router.post("/{request_id}/reject")
def reject_request(

    request_id: int,

    db: Session = Depends(get_db),

    current_user = Depends(
        require_role("MENTOR", "ADMIN")
    )
):

    badge_request = (
        db.query(BadgeRequest)
        .filter(
            BadgeRequest.id == request_id
        )
        .first()
    )


    if not badge_request:
        raise HTTPException(
            404,
            "Request not found"
        )


    if badge_request.status != "PENDING":
        raise HTTPException(
            400,
            "Request already processed"
        )


    badge_request.status = "REJECTED"

    badge_request.validated_by = current_user.id


    db.commit()


    return {

        "message":"Badge request rejected"

    }

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