# Tech Scout - Reconstruction environnement local avec Docker et Alembic

Ce document décrit la procédure pour cloner le projet **Tech Scout** sur un nouveau poste et reconstruire la base PostgreSQL à partir des migrations Alembic.

---

# 1. Cloner le projet

Sur le nouveau poste :

```bash
git clone <URL_DU_REPO>

cd tech-scout
```

Vérifier l'arborescence :

```bash
tree -L 2
```

Structure attendue :

```text
tech-scout
├── backend
│   ├── alembic
│   ├── alembic.ini
│   ├── app
│   └── Dockerfile
├── frontend
└── docker-compose.yml
```

---

# 2. Démarrer uniquement PostgreSQL

Ne pas démarrer toute l'application immédiatement.

Démarrer uniquement la base :

```bash
docker compose up -d postgres
```

Vérifier que PostgreSQL est démarré :

```bash
docker ps
```

Résultat attendu :

```text
scout-postgres   Up (healthy)
```

---

# 3. Appliquer les migrations Alembic

Créer un conteneur backend temporaire :

```bash
docker compose run --rm backend bash
```

Dans le conteneur :

```bash
cd /app
```

Vérifier l'état des migrations :

```bash
alembic current
```

Appliquer toutes les migrations :

```bash
alembic upgrade head
```

Résultat attendu :

```text
INFO  [alembic.runtime.migration] Running upgrade -> xxxxx, initial schema
INFO  [alembic.runtime.migration] Running upgrade xxxxx -> yyyyy
```

Sortir du conteneur :

```bash
exit
```

---

# 4. Vérifier la structure PostgreSQL

Connexion à PostgreSQL :

```bash
docker exec -it scout-postgres psql -U scout -d scoutdb
```

Lister les tables :

```sql
\dt
```

Tables attendues :

```text
alembic_version
roles
users
badges
user_badges
badge_requests
```

Vérifier la version Alembic :

```sql
SELECT * FROM alembic_version;
```

Quitter PostgreSQL :

```sql
\q
```

---

# 5. Démarrer le backend

Démarrer uniquement le backend :

```bash
docker compose up backend
```

Les logs attendus :

```text
Application startup complete.
Uvicorn running on http://0.0.0.0:8000
```

---

# 6. Tester l'API Backend

Tester le endpoint de santé :

```bash
curl http://localhost:8000/health
```

Résultat attendu :

```json
{
  "status": "ok",
  "application": "Tech Scout"
}
```

Accéder à Swagger :

```
http://localhost:8000/docs
```

---

# 7. Vérifier les données initiales

Le backend initialise les données avec :

```text
backend/app/seeds/init_data.py
```

Vérifier les rôles :

Connexion PostgreSQL :

```bash
docker exec -it scout-postgres psql -U scout -d scoutdb
```

Puis :

```sql
SELECT * FROM roles;
```

Résultat attendu :

```text
ADMIN
MENTOR
PARTICIPANT
```

---

# 8. Démarrage complet de l'application

Après validation de PostgreSQL et du backend :

```bash
docker compose up
```

---

# 9. Reconstruction complète après suppression de l'environnement

Si on veut repartir d'une base propre :

⚠️ Cette commande supprime les données PostgreSQL locales.

```bash
docker compose down -v
```

Puis :

```bash
docker compose up -d postgres
```

Appliquer les migrations :

```bash
docker compose run --rm backend bash
```

Dans le conteneur :

```bash
alembic upgrade head
```

Puis :

```bash
exit
```

Démarrer le backend :

```bash
docker compose up backend
```

---

# 10. Règles importantes

## Ne pas versionner le volume PostgreSQL

Le volume Docker PostgreSQL ne doit pas être stocké dans Git.

La source de vérité est :

```text
Code source
    |
    +-- Modèles SQLAlchemy
    |
    +-- Migrations Alembic
    |
    +-- Seeds initiaux
```

---

# Cycle complet sur un nouveau poste

```text
git clone
      |
      v
docker compose up -d postgres
      |
      v
alembic upgrade head
      |
      v
docker compose up backend
      |
      v
curl http://localhost:8000/health
```

Cette procédure garantit que tous les environnements reconstruisent la même base de données.
