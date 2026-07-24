Pour l'instant, les commandes déjà réalisées sont à documenter :

# Initialisation du projet

## Création du squelette

Création de la structure :

- backend FastAPI
- frontend React/Vite
- PostgreSQL
- Docker Compose


## Démarrage de l'environnement

```bash
docker compose up --build

Démarrage en arrière-plan :

docker compose up -d
Vérification des containers
docker compose ps
Accès au container backend
docker exec -it scout-backend bash
Initialisation Alembic

Depuis le backend :

cd backend

alembic init alembic
Reconstruction du container après modification
docker compose down

docker compose build --no-cache backend

docker compose up -d
Vérification PostgreSQL

Connexion :

docker exec -it scout-postgres psql -U scout -d scoutdb

Lister les tables :

\dt

On ajoutera aussi les erreurs rencontrées et leurs corrections, car c'est utile pour un projet professionnel :

Exemple :

```md
## Troubleshooting

### Alembic : No 'script_location' key found

Cause :
Le fichier alembic.ini n'était pas présent dans le container backend.

Correction :

Reconstruction de l'image :

```bash
docker compose build --no-cache backend



Ajout à conserver :

# Base de données

## Connexion PostgreSQL

Accès au container PostgreSQL :

```bash
docker exec -it scout-postgres psql -U scout -d scoutdb

Lister les tables :

\dt

Résultat attendu après migration :

 Schema |      Name       | Type
--------+-----------------+-------
 public | alembic_version | table
 public | users           | table
Migration Alembic
Générer une migration

Depuis le container backend :

alembic revision --autogenerate -m "description"

Exemple :

alembic revision --autogenerate -m "create users table"
Appliquer les migrations
alembic upgrade head
Vérifier l'état des migrations
alembic current

---

Maintenant on peut passer à l'étape suivante : **modéliser les rôles utilisateurs**.

On va ajouter :

## Table `roles`

Avec :

```text
roles
-----
id
name

Valeurs initiales :

ADMIN
MENTOR
PARTICIPANT

Puis on modifiera users :

Actuellement :

users
-----
id
first_name
last_name
email
password_hash
created_at

Après :

users
-----
id
first_name
last_name
email
password_hash
role_id
created_at

Relation :

roles
  |
  | 1 ---- N
  |
users

Ensuite on générera une nouvelle migration :

alembic revision --autogenerate -m "add roles and user role relation"

Puis :

alembic upgrade head

À la fin nous aurons la première vraie brique métier : gestion des utilisateurs et des permissions, nécessaire avant de commencer JWT.


## Gestion des migrations

Les fichiers générés par Alembic doivent être versionnés dans Git.

Après création d'une migration :

```bash
git status
git add alembic/versions
git commit -m "database migration"