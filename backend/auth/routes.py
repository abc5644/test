"""
/auth/signup and /auth/login.
Nothing else in the app matters until these work end-to-end.
"""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status

from database import users_collection
from .models import SignupRequest, LoginRequest, AuthResponse
from .utils import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest):
    if users_collection.find_one({"email": payload.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
        "name": payload.name,
        "photo_url": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    users_collection.insert_one(user_doc)

    token = create_access_token(user_id)
    return AuthResponse(access_token=token, user_id=user_id, name=payload.name, email=payload.email)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    user = users_collection.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user["id"])
    return AuthResponse(access_token=token, user_id=user["id"], name=user["name"], email=user["email"])
