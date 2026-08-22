from pydantic import BaseModel, EmailStr


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


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    name: str
    photo_url: str | None = None
    created_at: str
