from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.models.badge import Badge
from app.models.user import User
from app.models.user_badge import UserBadge

from app.schemas.badge import BadgeCreate, BadgeResponse


router = APIRouter(
    prefix="/api/badges",
    tags=["Badges"]
)


# GET ALL BADGES
@router.get("/", response_model=list[BadgeResponse])
def get_badges(
    db: Session = Depends(get_db)
):
    return db.query(Badge).all()



# GET ONE BADGE
@router.get("/{badge_id}", response_model=BadgeResponse)
def get_badge(
    badge_id: int,
    db: Session = Depends(get_db)
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



# CREATE BADGE
@router.post("/", response_model=BadgeResponse)
def create_badge(
    badge: BadgeCreate,
    db: Session = Depends(get_db)
):

    new_badge = Badge(
        name=badge.name,
        description=badge.description,
        level=badge.level
    )

    db.add(new_badge)
    db.commit()
    db.refresh(new_badge)

    return new_badge



# ASSIGN BADGE
@router.post("/{badge_id}/assign/{user_id}")
def assign_badge(
    badge_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):

    user = db.query(User)\
        .filter(User.id == user_id)\
        .first()

    if not user:
        raise HTTPException(
            404,
            "User not found"
        )


    badge = db.query(Badge)\
        .filter(Badge.id == badge_id)\
        .first()

    if not badge:
        raise HTTPException(
            404,
            "Badge not found"
        )


    existing = db.query(UserBadge)\
        .filter(
            UserBadge.user_id == user_id,
            UserBadge.badge_id == badge_id
        ).first()


    if existing:
        raise HTTPException(
            400,
            "Badge already assigned"
        )


    user_badge = UserBadge(
        user_id=user_id,
        badge_id=badge_id
    )


    db.add(user_badge)
    db.commit()


    return {
        "message":"Badge assigned",
        "user":user.email,
        "badge":badge.name
    }