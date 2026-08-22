"""
Pin CRUD + upvote credibility. This is the heart of the demo:
the Home map reads from GET /pins, and NewPinForm posts to POST /pins.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from database import pins_collection
from auth.utils import get_current_user
from .models import PinCreate, PinPublic

router = APIRouter(prefix="/pins", tags=["pins"])


def _serialize(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


@router.get("", response_model=list[PinPublic])
def list_pins(community_id: Optional[str] = Query(default=None)):
    """
    Returns all pins by default (main map).
    Pass ?community_id=... to scope to a community's pins.
    """
    query = {"community_id": community_id} if community_id else {"community_id": None}
    pins = pins_collection.find(query).sort("created_at", -1)
    return [_serialize(p) for p in pins]


@router.post("", response_model=PinPublic, status_code=201)
def create_pin(payload: PinCreate, user: dict = Depends(get_current_user)):
    pin_id = str(uuid.uuid4())
    pin_doc = {
        "id": pin_id,
        "type": payload.type,
        "label": payload.label,
        "lat": payload.lat,
        "lng": payload.lng,
        "note": payload.note,
        "media_url": payload.media_url,
        "votes": 0,
        "community_id": payload.community_id,
        "created_by": user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    pins_collection.insert_one(pin_doc)
    return _serialize(pin_doc)


@router.post("/{pin_id}/upvote", response_model=PinPublic)
def upvote_pin(pin_id: str, user: dict = Depends(get_current_user)):
    pin = pins_collection.find_one({"id": pin_id})
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")

    pins_collection.update_one({"id": pin_id}, {"$inc": {"votes": 1}})
    updated = pins_collection.find_one({"id": pin_id})
    return _serialize(updated)


@router.delete("/{pin_id}", status_code=204)
def delete_pin(pin_id: str, user: dict = Depends(get_current_user)):
    pin = pins_collection.find_one({"id": pin_id})
    if not pin:
        raise HTTPException(status_code=404, detail="Pin not found")
    if pin["created_by"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your pin")
    pins_collection.delete_one({"id": pin_id})
