from fastapi import FastAPI

from app.models.user import User
from app.models.role import Role

from app.api.auth import router as auth_router


app = FastAPI(
    title="Tech Scout API",
    version="1.0"
)


app.include_router(auth_router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "application": "Tech Scout"
    }