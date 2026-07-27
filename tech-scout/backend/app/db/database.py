from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


DATABASE_URL = (
    "postgresql://scout:scout@postgres:5432/scoutdb"
)


engine = create_engine(DATABASE_URL)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()


# Charger les modèles SQLAlchemy
from app.models import user
from app.models import role


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()