from fastapi import Depends, HTTPException

from app.security.dependencies import get_current_user


def require_role(*allowed_roles):

    def role_checker(
        current_user=Depends(get_current_user)
    ):

        if current_user.role is None:
            raise HTTPException(
                status_code=403,
                detail="User has no role"
            )


        if current_user.role.name not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions"
            )


        return current_user

    return role_checker