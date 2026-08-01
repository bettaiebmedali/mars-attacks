from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.models.badge import Badge
from app.models.user import User
from app.models.user_badge import UserBadge

from app.schemas.badge import BadgeCreate, BadgeResponse
from app.schemas.user_badge import AssignBadgeRequest

from app.security.dependencies import get_current_user
from app.security.dependencies import require_role

router = APIRouter(
    prefix="/api/badges",
    tags=["Badges"]
)


# GET ALL BADGES
@router.get(
    "/",
    response_model=list[BadgeResponse]
)
def get_badges(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Badge).all()



# GET BADGES EARNED BY THE CURRENT USER
@router.get("/me/earned")
def get_my_earned_badges(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user_badges = (
        db.query(UserBadge)
        .filter(UserBadge.user_id == current_user.id)
        .order_by(UserBadge.assigned_at.desc())
        .all()
    )

    result = []

    for user_badge in user_badges:
        result.append(
            {
                "id": user_badge.id,
                "badge_id": user_badge.badge_id,
                "name": user_badge.badge.name,
                "description": user_badge.badge.description,
                "level": user_badge.badge.level,
                "comment": user_badge.comment,
                "assigned_at": user_badge.assigned_at
            }
        )

    return result



# GET ONE BADGE
@router.get(
    "/{badge_id}",
    response_model=BadgeResponse
)
def get_badge(
    badge_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    badge = db.query(Badge)\
        .filter(Badge.id == badge_id)\
        .first()

    if not badge:
        raise HTTPException(
            status_code=404,
            detail="Badge not found"
        )

    return badge



# CREATE BADGE ADMIN ONLY
@router.post(
    "/",
    response_model=BadgeResponse
)
def create_badge(
    badge: BadgeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role("ADMIN")
    )
):

    existing = db.query(Badge)\
        .filter(Badge.name == badge.name)\
        .first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Badge already exists"
        )


    new_badge = Badge(
        name=badge.name,
        description=badge.description,
        level=badge.level
    )


    db.add(new_badge)
    db.commit()
    db.refresh(new_badge)

    return new_badge



# ASSIGN BADGE ADMIN + MENTOR
@router.post(
    "/{badge_id}/assign/{user_id}"
)
def assign_badge(
    badge_id: int,
    user_id: int,
    data: AssignBadgeRequest,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role("ADMIN", "MENTOR")
    )
):


    user = db.query(User)\
        .filter(User.id == user_id)\
        .first()


    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    badge = db.query(Badge)\
        .filter(Badge.id == badge_id)\
        .first()


    if not badge:
        raise HTTPException(
            status_code=404,
            detail="Badge not found"
        )


    existing = db.query(UserBadge)\
        .filter(
            UserBadge.user_id == user_id,
            UserBadge.badge_id == badge_id
        )\
        .first()


    if existing:
        raise HTTPException(
            status_code=400,
            detail="Badge already assigned"
        )


    user_badge = UserBadge(

        user_id=user_id,

        badge_id=badge_id,

        assigned_by=current_user.id,

        comment=data.comment
    )


    db.add(user_badge)

    db.commit()

    db.refresh(user_badge)


    return {

        "message": "Badge assigned",

        "assigned_by": current_user.email,

        "user": user.email,

        "badge": badge.name,

        "comment": data.comment

    }