#!/bin/bash

PROJECT_NAME="tech-scout"

echo "Création du projet $PROJECT_NAME"

mkdir -p $PROJECT_NAME
cd $PROJECT_NAME || exit

#################################
# Structure globale
#################################

mkdir -p \
backend/app/{api,core,models,schemas,services,db} \
backend/alembic \
frontend

#################################
# Backend FastAPI
#################################

cat > backend/requirements.txt <<EOF
fastapi
uvicorn[standard]
sqlalchemy
psycopg2-binary
alembic
python-jose[cryptography]
passlib[bcrypt]
python-multipart
pydantic-settings
EOF


cat > backend/Dockerfile <<EOF
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn","app.main:app","--host","0.0.0.0","--port","8000"]
EOF


cat > backend/app/main.py <<EOF
from fastapi import FastAPI

app = FastAPI(
    title="Tech Scout API",
    version="1.0"
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "application": "Tech Scout"
    }
EOF


#################################
# Database
#################################

cat > backend/app/db/database.py <<EOF
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
EOF


#################################
# Frontend React
#################################

cd frontend || exit

npm create vite@latest . \
-- --template react-ts

npm install

cd ..

#################################
# Docker Compose
#################################

cat > docker-compose.yml <<EOF
services:

  postgres:
    image: postgres:16
    container_name: scout-postgres
    environment:
      POSTGRES_DB: scoutdb
      POSTGRES_USER: scout
      POSTGRES_PASSWORD: scout
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data


  backend:
    build:
      context: ./backend
    container_name: scout-backend
    ports:
      - "8000:8000"
    depends_on:
      - postgres


  frontend:
    image: node:22
    container_name: scout-frontend
    working_dir: /app
    volumes:
      - ./frontend:/app
    ports:
      - "5173:5173"
    command:
      npm run dev -- --host 0.0.0.0


volumes:

  postgres_data:
EOF


#################################
# README
#################################

cat > README.md <<EOF
# Tech Scout

Plateforme interne de formation gamifiée.

## Stack

- React
- FastAPI
- PostgreSQL
- Docker Compose

## Démarrage

\`\`\`bash
docker compose up --build
\`\`\`

## URLs

Frontend:
http://localhost:5173

Backend:
http://localhost:8000

Swagger:
http://localhost:8000/docs
EOF


echo ""
echo "Projet créé avec succès"
echo ""
echo "Lancement :"
echo "cd $PROJECT_NAME"
echo "docker compose up --build"