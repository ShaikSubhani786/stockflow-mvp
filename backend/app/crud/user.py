
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.organization import Organization
from app.core.security import hash_password


def get_user_by_email(db: Session, email: str):
    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


def create_user(
    db: Session,
    email: str,
    password: str,
    organization_name: str
):
    try:
        organization = Organization(
            name=organization_name
        )

        db.add(organization)
        db.flush()

        user = User(
            email=email,
            hashed_password=hash_password(password),
            organization_id=organization.id
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    except Exception:
        db.rollback()
        raise
