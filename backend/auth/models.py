from typing import Literal, Optional
from pydantic import BaseModel, EmailStr

Role = Literal["user", "admin"]


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    email: EmailStr
    role: Role = "user"


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    name: str
    photo_url: str | None = None
    role: Role = "user"
    created_at: str