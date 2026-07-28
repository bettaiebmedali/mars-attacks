from fastapi import FastAPI
from app.api.badges import router as badge_router

from app.api.auth import router as auth_router
from app.api.admin import router as admin_router

# Import des modèles pour qu'ils soient enregistrés par SQLAlchemy
from app.models.user import User
from app.models.role import Role

app = FastAPI(
    title="Tech Scout API",
    version="1.0"
)

# Enregistrement des routes
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(badge_router)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "application": "Tech Scout"
    }