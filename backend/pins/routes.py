"""
Pin CRUD + upvote credibility.

Permission model:
- Main community (community_id is None):
    admins add/delete; anyone logged in can upvote.
- Private community (community_id set):
    any member (or admin) can add;
    the pin's creator or an admin can delete;
    anyone can upvote.

Upvote model:
- One logged-in user can upvote a particular pin only once.
- MongoDB's $addToSet + atomic filter prevents duplicate votes,
  including rapid/concurrent requests.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from database import pins_collection, communities_collection
from auth.utils import get_current_user
from .models import PinCreate, PinPublic


router = APIRouter(
    prefix="/pins",
    tags=["pins"],
)


# ============================================================
# HELPERS
# ============================================================

def _serialize(doc: dict) -> dict:
    """
    Remove MongoDB's internal _id before returning the document.
    """
    if doc is None:
        return doc

    doc.pop("_id", None)
    return doc


def _is_admin(user: dict) -> bool:
    return user.get("role") == "admin"


def _is_community_member(
    user_id: str,
    community_id: str,
) -> bool:
    community = communities_collection.find_one(
        {"id": community_id}
    )

    if not community:
        return False

    return user_id in community.get(
        "members",
        []
    )


# ============================================================
# LIST PINS
# ============================================================

@router.get(
    "",
    response_model=list[PinPublic],
)
def list_pins(
    community_id: Optional[str] = Query(
        default=None
    ),
):
    """
    Returns all pins by default (main map).

    Pass ?community_id=... to scope to a community's pins.
    """

    query = (
        {"community_id": community_id}
        if community_id
        else {"community_id": None}
    )

    pins = (
        pins_collection
        .find(query)
        .sort("created_at", -1)
    )

    return [
        _serialize(pin)
        for pin in pins
    ]


# ============================================================
# CREATE PIN
# ============================================================

@router.post(
    "",
    response_model=PinPublic,
    status_code=201,
)
def create_pin(
    payload: PinCreate,
    user: dict = Depends(
        get_current_user
    ),
):
    is_admin = _is_admin(user)

    # --------------------------------------------------------
    # Permission check
    # --------------------------------------------------------

    if payload.community_id is None:

        if not is_admin:
            raise HTTPException(
                status_code=403,
                detail=(
                    "Only admins can add pins "
                    "to the main community"
                ),
            )

    else:

        if (
            not is_admin
            and not _is_community_member(
                user["id"],
                payload.community_id,
            )
        ):
            raise HTTPException(
                status_code=403,
                detail=(
                    "You must be a member of "
                    "this community to add pins"
                ),
            )

    # --------------------------------------------------------
    # Create pin
    # --------------------------------------------------------

    pin_id = str(
        uuid.uuid4()
    )

    pin_doc = {
        "id": pin_id,
        "type": payload.type,
        "label": payload.label,
        "lat": payload.lat,
        "lng": payload.lng,
        "note": payload.note,
        "media_url": payload.media_url,

        # Current vote count.
        "votes": 0,

        # Tracks which users have voted.
        #
        # $addToSet later guarantees the same user cannot be
        # inserted twice.
        "voted_by": [],

        "community_id": payload.community_id,
        "created_by": user["id"],
        "created_at": datetime.now(
            timezone.utc
        ).isoformat(),
    }

    pins_collection.insert_one(
        pin_doc
    )

    return _serialize(
        pin_doc
    )


# ============================================================
# UPVOTE PIN
# ============================================================

@router.post(
    "/{pin_id}/upvote",
    response_model=PinPublic,
)
def upvote_pin(
    pin_id: str,
    user: dict = Depends(
        get_current_user
    ),
):
    """
    Upvote a pin exactly once per user.

    The filter + $addToSet + $inc operation is atomic from
    MongoDB's perspective, so rapid duplicate requests cannot
    simply increment the vote count repeatedly.
    """

    user_id = user["id"]

    # --------------------------------------------------------
    # Make sure the pin exists first.
    # --------------------------------------------------------

    pin = pins_collection.find_one(
        {"id": pin_id}
    )

    if not pin:
        raise HTTPException(
            status_code=404,
            detail="Pin not found",
        )

    # --------------------------------------------------------
    # Atomic one-user-one-vote operation.
    #
    # voted_by != user_id:
    #     only allow the update if this user has NOT voted.
    #
    # $addToSet:
    #     adds the user ID only once.
    #
    # $inc:
    #     increments the displayed vote count exactly once.
    # --------------------------------------------------------

    result = pins_collection.update_one(
        {
            "id": pin_id,

            # Works for both:
            # 1. new pins with voted_by []
            # 2. old pins without voted_by
            "voted_by": {
                "$ne": user_id
            },
        },
        {
            "$inc": {
                "votes": 1
            },

            "$addToSet": {
                "voted_by": user_id
            },
        },
    )

    # --------------------------------------------------------
    # No document changed means this user already voted.
    # --------------------------------------------------------

    if result.modified_count == 0:
        raise HTTPException(
            status_code=409,
            detail="You have already upvoted this pin",
        )

    # --------------------------------------------------------
    # Return updated pin.
    # --------------------------------------------------------

    updated = pins_collection.find_one(
        {"id": pin_id}
    )

    return _serialize(
        updated
    )


# ============================================================
# DELETE PIN
# ============================================================

@router.delete(
    "/{pin_id}",
    status_code=204,
)
def delete_pin(
    pin_id: str,
    user: dict = Depends(
        get_current_user
    ),
):
    pin = pins_collection.find_one(
        {"id": pin_id}
    )

    if not pin:
        raise HTTPException(
            status_code=404,
            detail="Pin not found",
        )

    is_admin = _is_admin(user)

    # --------------------------------------------------------
    # Main community
    # --------------------------------------------------------

    if pin["community_id"] is None:

        if not is_admin:
            raise HTTPException(
                status_code=403,
                detail=(
                    "Only admins can delete "
                    "pins in the main community"
                ),
            )

    # --------------------------------------------------------
    # Private community
    # --------------------------------------------------------

    else:

        if (
            not is_admin
            and pin["created_by"]
            != user["id"]
        ):
            raise HTTPException(
                status_code=403,
                detail=(
                    "You can only delete "
                    "your own pins"
                ),
            )

    pins_collection.delete_one(
        {"id": pin_id}
    )