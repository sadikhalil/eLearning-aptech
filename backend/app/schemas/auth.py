from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class RegisterRequest(BaseModel):
    full_name:    str = Field(..., min_length=2, max_length=100)
    email:        EmailStr
    password:     str = Field(..., min_length=6, max_length=100)
    role:         Optional[str] = "student"
    admin_code:   Optional[str] = None        # ← add this


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    type: Optional[str] = None