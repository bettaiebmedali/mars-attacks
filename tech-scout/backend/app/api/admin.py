from fastapi import APIRouter, Depends

from app.security.permissions import require_role

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"]
)


@router.get("/dashboard")
def dashboard(
    current_user=Depends(
        require_role("ADMIN")
    )
):

    return {
        "message": "Welcome Admin",
        "user": current_user.email
    }