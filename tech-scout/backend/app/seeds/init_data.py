from sqlalchemy.orm import Session
from pwdlib import PasswordHash

from app.models.role import Role
from app.models.user import User
from app.models.badge import Badge
from app.models.user_badge import UserBadge


password_hash = PasswordHash.recommended()


DEFAULT_ROLES = [
    "ADMIN",
    "MENTOR",
    "PARTICIPANT"
]


DEFAULT_BADGES = [
    {
        "name": "Docker Beginner",
        "description": "Maitrise Docker",
        "level": "BEGINNER"
    },
    {
        "name": "Kubernetes Starter",
        "description": "Déployer une application Kubernetes",
        "level": "BEGINNER"
    },
    {
        "name": "Git Expert",
        "description": "Maîtriser Git et GitFlow",
        "level": "ADVANCED"
    },
    {
        "name": "DevOps Engineer",
        "description": "Maitriser la chaine CI/CD complète",
        "level": "EXPERT"
    },
    {
        "name": "Ansible Expert",
        "description": "Automatiser avec Ansible",
        "level": "ADVANCED"
    }
]


DEFAULT_USERS = [

    {
        "first_name": "Mohamed",
        "last_name": "Admin",
        "email": "admin@techscout.com",
        "password": "Admin123!",
        "role": "ADMIN"
    },

    {
        "first_name": "Sophie",
        "last_name": "Martin",
        "email": "sophie.mentor@techscout.com",
        "password": "Mentor123!",
        "role": "MENTOR"
    },

    {
        "first_name": "Karim",
        "last_name": "BenAli",
        "email": "karim.mentor@techscout.com",
        "password": "Mentor123!",
        "role": "MENTOR"
    },

    {
        "first_name": "Ali",
        "last_name": "Participant",
        "email": "ali.participant@techscout.com",
        "password": "Participant123!",
        "role": "PARTICIPANT"
    },

    {
        "first_name": "Emma",
        "last_name": "Dupont",
        "email": "emma.participant@techscout.com",
        "password": "Participant123!",
        "role": "PARTICIPANT"
    }
]


def init_data(db: Session):

    # =====================
    # Roles
    # =====================

    for role_name in DEFAULT_ROLES:

        role = db.query(Role).filter(
            Role.name == role_name
        ).first()

        if not role:
            db.add(Role(name=role_name))

    db.commit()


    # =====================
    # Badges
    # =====================

    for badge_data in DEFAULT_BADGES:

        badge = db.query(Badge).filter(
            Badge.name == badge_data["name"]
        ).first()

        if not badge:
            db.add(
                Badge(**badge_data)
            )

    db.commit()


    # =====================
    # Users
    # =====================

    for user_data in DEFAULT_USERS:

        user = db.query(User).filter(
            User.email == user_data["email"]
        ).first()

        if user:
            continue


        role = db.query(Role).filter(
            Role.name == user_data["role"]
        ).first()


        user = User(

            first_name=user_data["first_name"],

            last_name=user_data["last_name"],

            email=user_data["email"],

            password_hash=password_hash.hash(user_data["password"]
             ),

            role_id=role.id

        )


        db.add(user)


    db.commit()


    # =====================
    # Attribution badges
    # =====================

    ali = db.query(User).filter(
        User.email == "ali.participant@techscout.com"
    ).first()


    emma = db.query(User).filter(
        User.email == "emma.participant@techscout.com"
    ).first()


    docker = db.query(Badge).filter(
        Badge.name == "Docker Beginner"
    ).first()


    kubernetes = db.query(Badge).filter(
        Badge.name == "Kubernetes Starter"
    ).first()


    git = db.query(Badge).filter(
        Badge.name == "Git Expert"
    ).first()


    assignments = [
        (ali, docker),
        (ali, kubernetes),
        (emma, git)
    ]


    for user, badge in assignments:

        if user and badge:

            exists = db.query(UserBadge).filter(
                UserBadge.user_id == user.id,
                UserBadge.badge_id == badge.id
            ).first()


            if not exists:

                db.add(
                    UserBadge(
                        user_id=user.id,
                        badge_id=badge.id,
                        comment="Badge validé automatiquement au démarrage"
                    )
                )


    db.commit()