from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token


def register_user(db: Session, full_name: str, email: str, password: str, role: str = "student") -> User:
    """Register a new user. Raises 400 if email already exists."""
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        full_name=full_name,
        email=email,
        hashed_password=hash_password(password),
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    """Verify credentials. Raises 401 if invalid."""
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    return user


def generate_tokens(user: User) -> dict:
    """Generate access + refresh tokens for a user."""
    return {
        "access_token":  create_access_token(user.id, user.role),
        "refresh_token": create_refresh_token(user.id),
        "token_type":    "bearer"
    }