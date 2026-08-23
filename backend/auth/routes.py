"""
Authentication routes.

Endpoints:
- POST /auth/signup
- POST /auth/login
- GET  /auth/me
- PATCH /auth/me
"""

import uuid
from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Body,
    Depends,
    HTTPException,
    status,
)

from database import users_collection

from .models import (
    SignupRequest,
    LoginRequest,
    AuthResponse,
    UserPublic,
)

from .utils import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


# ============================================================
# SIGNUP
# ============================================================

@router.post(
    "/signup",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(
    payload: SignupRequest,
):
    if users_collection.find_one(
        {"email": payload.email}
    ):
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    user_id = str(uuid.uuid4())

    user_doc = {
        "id": user_id,
        "email": payload.email,
        "hashed_password": hash_password(
            payload.password
        ),
        "name": payload.name,
        "photo_url": None,
        "role": "user",
        "created_at": datetime.now(
            timezone.utc
        ).isoformat(),
    }

    users_collection.insert_one(
        user_doc
    )

    token = create_access_token(
        user_id
    )

    return AuthResponse(
        access_token=token,
        user_id=user_id,
        name=payload.name,
        email=payload.email,
        role="user",
    )


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=AuthResponse,
)
def login(
    payload: LoginRequest,
):
    user = users_collection.find_one(
        {"email": payload.email}
    )

    if (
        not user
        or not verify_password(
            payload.password,
            user["hashed_password"],
        )
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(
        user["id"]
    )

    return AuthResponse(
        access_token=token,
        user_id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user.get(
            "role",
            "user",
        ),
    )


# ============================================================
# GET CURRENT USER
# ============================================================

@router.get(
    "/me",
    response_model=UserPublic,
)
def get_me(
    user: dict = Depends(
        get_current_user
    ),
):
    return UserPublic(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        photo_url=user.get(
            "photo_url"
        ),
        role=user.get(
            "role",
            "user",
        ),
        created_at=user["created_at"],
    )


# ============================================================
# UPDATE CURRENT USER
# ============================================================

@router.patch(
    "/me",
    response_model=UserPublic,
)
def update_me(
    payload: dict = Body(...),
    user: dict = Depends(
        get_current_user
    ),
):
    updates = {}

    # --------------------------------------------------------
    # NAME
    # --------------------------------------------------------

    if "name" in payload:
        name = payload.get("name")

        if not isinstance(name, str):
            raise HTTPException(
                status_code=422,
                detail="Name must be a string",
            )

        name = name.strip()

        if not name:
            raise HTTPException(
                status_code=422,
                detail="Name cannot be empty",
            )

        if len(name) > 100:
            raise HTTPException(
                status_code=422,
                detail=(
                    "Name cannot exceed 100 characters"
                ),
            )

        updates["name"] = name

    # --------------------------------------------------------
    # PROFILE PHOTO
    # --------------------------------------------------------

    if "photo_url" in payload:
        photo_url = payload.get(
            "photo_url"
        )

        if photo_url is not None:
            if not isinstance(
                photo_url,
                str,
            ):
                raise HTTPException(
                    status_code=422,
                    detail=(
                        "photo_url must be a string or null"
                    ),
                )

            photo_url = photo_url.strip()

            if not photo_url:
                photo_url = None

            elif len(photo_url) > 2048:
                raise HTTPException(
                    status_code=422,
                    detail="photo_url is too long",
                )

        updates["photo_url"] = photo_url

    # --------------------------------------------------------
    # NOTHING TO UPDATE
    # --------------------------------------------------------

    if not updates:
        raise HTTPException(
            status_code=400,
            detail=(
                "No valid profile fields were provided"
            ),
        )

    # --------------------------------------------------------
    # UPDATE DATABASE
    # --------------------------------------------------------

    users_collection.update_one(
        {"id": user["id"]},
        {"$set": updates},
    )

    # --------------------------------------------------------
    # GET UPDATED USER
    # --------------------------------------------------------

    updated_user = users_collection.find_one(
        {"id": user["id"]}
    )

    if not updated_user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return UserPublic(
        id=updated_user["id"],
        email=updated_user["email"],
        name=updated_user["name"],
        photo_url=updated_user.get(
            "photo_url"
        ),
        role=updated_user.get(
            "role",
            "user",
        ),
        created_at=updated_user["created_at"],
    )