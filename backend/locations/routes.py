from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException

from database import locations_collection, communities_collection
from auth.utils import get_current_user
from .models import LocationUpdate, LocationPublic

router = APIRouter(prefix="/locations", tags=["locations"])
STALE_AFTER_SECONDS = 120


def _is_member(user_id: str, community_id: str) -> bool:
    c = communities_collection.find_one({"id": community_id})
    return bool(c and user_id in c.get("members", []))


@router.post("/{community_id}")
def share_location(community_id: str, payload: LocationUpdate, user: dict = Depends(get_current_user)):
    if not _is_member(user["id"], community_id):
        raise HTTPException(status_code=403, detail="Not a member of this community")
    locations_collection.update_one(
        {"user_id": user["id"], "community_id": community_id},
        {"$set": {
            "user_id": user["id"], "community_id": community_id, "name": user["name"],
            "lat": payload.lat, "lng": payload.lng,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )
    return {"ok": True}


@router.get("/{community_id}", response_model=list[LocationPublic])
def get_locations(community_id: str, user: dict = Depends(get_current_user)):
    if not _is_member(user["id"], community_id):
        raise HTTPException(status_code=403, detail="Not a member of this community")
    cutoff = (datetime.now(timezone.utc) - timedelta(seconds=STALE_AFTER_SECONDS)).isoformat()
    docs = locations_collection.find({"community_id": community_id, "updated_at": {"$gte": cutoff}})
    return [{"user_id": d["user_id"], "name": d["name"], "lat": d["lat"], "lng": d["lng"], "updated_at": d["updated_at"]} for d in docs]


@router.delete("/{community_id}")
def stop_sharing(community_id: str, user: dict = Depends(get_current_user)):
    locations_collection.delete_one({"user_id": user["id"], "community_id": community_id})
    return {"ok": True}