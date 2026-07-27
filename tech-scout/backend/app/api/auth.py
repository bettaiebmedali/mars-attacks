from app.security.dependencies import get_current_user
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserLogin,
    Token,
)

from app.security.password import (
    hash_password,
    verify_password,
)

from app.security.jwt import create_access_token

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db

from app.models.user import User
from app.models.role import Role

from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserLogin
)

from app.security.password import (
    hash_password,
    verify_password
)

from app.security.jwt import (
    create_access_token
)


router = APIRouter(
    prefix="/api/auth",
    tags=["auth"]
)

@router.get("/me", response_model=UserResponse)
def me(
    current_user: User = Depends(get_current_user),
):
    return current_user

@router.post(
    "/register",
    response_model=UserResponse
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(
            User.email == user.email
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password_hash=hash_password(
            user.password
        ),
        role_id=3
    )


    db.add(new_user)
    db.commit()
    db.refresh(new_user)


    return new_user

@router.post(
    "/login",
    response_model=Token
)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == credentials.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not verify_password(
        credentials.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token(
        {
            "sub": user.email,
            "user_id": user.id,
            "role_id": user.role_id,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }

@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    db_user = (
        db.query(User)
        .filter(
            User.email == user.email
        )
        .first()
    )


    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )


    if not verify_password(
        user.password,
        db_user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )


    access_token = create_access_token(
        {
            "sub": str(db_user.id),
            "email": db_user.email,
            "role_id": db_user.role_id
        }
    )


    return {
        "access_token": access_token,
        "token_type": "bearer"
    }