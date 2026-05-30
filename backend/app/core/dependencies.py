from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import decode_token
from app.models.user import User

# Tells FastAPI where to expect the token
# Frontend sends: Authorization: Bearer <token>
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ─── Core Auth Dependency ──────────────────────────────────────────────────────

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Primary auth dependency.
    - Extracts JWT from Authorization header
    - Decodes and validates the token
    - Fetches user from database
    - Raises 401 if anything is invalid

    Usage:
        @router.get("/me")
        def get_me(current_user: User = Depends(get_current_user)):
            return current_user
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_token(token)
    if payload is None:
        raise credentials_exception

    # Ensure it's an access token, not a refresh token
    if payload.get("type") != "access":
        raise credentials_exception

    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )

    return user


# ─── Role-Based Guards ─────────────────────────────────────────────────────────

def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Only allows admin users.
    Use on admin dashboard routes.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def require_instructor(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Allows instructors and admins.
    Use on course creation/management routes.
    """
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Instructor access required"
        )
    return current_user


def require_student(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Allows all authenticated users (student, instructor, admin).
    Use on enrollment and progress routes.
    """
    return current_user