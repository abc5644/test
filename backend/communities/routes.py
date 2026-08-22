"""
Communities: create / join by code. Photo sharing and vibe clips reuse the
pins system (via community_id) and Cloudinary directly from the frontend,
so there's no upload endpoint here on purpose.
"""
import random
import string
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from database import communities_collection
from auth.utils import get_current_user
from .models import CommunityCreate, CommunityJoin, CommunityPublic

router = APIRouter(prefix="/communities", tags=["communities"])

MAX_MEMBERS = 10


def _serialize(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


def _generate_join_code(length: int = 6) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(random.choices(alphabet, k=length))


@router.post("", response_model=CommunityPublic, status_code=201)
def create_community(payload: CommunityCreate, user: dict = Depends(get_current_user)):
    community_id = str(uuid.uuid4())
    join_code = _generate_join_code()
    while communities_collection.find_one({"join_code": join_code}):
        join_code = _generate_join_code()

    community_doc = {
        "id": community_id,
        "name": payload.name,
        "join_code": join_code,
        "members": [user["id"]],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    communities_collection.insert_one(community_doc)
    return _serialize(community_doc)


@router.post("/join", response_model=CommunityPublic)
def join_community(payload: CommunityJoin, user: dict = Depends(get_current_user)):
    community = communities_collection.find_one({"join_code": payload.join_code.upper()})
    if not community:
        raise HTTPException(status_code=404, detail="Invalid join code")
    if user["id"] in community["members"]:
        return _serialize(community)
    if len(community["members"]) >= MAX_MEMBERS:
        raise HTTPException(status_code=400, detail="Community is full (max 10 members)")

    communities_collection.update_one({"id": community["id"]}, {"$push": {"members": user["id"]}})
    updated = communities_collection.find_one({"id": community["id"]})
    return _serialize(updated)


@router.get("/mine", response_model=list[CommunityPublic])
def my_communities(user: dict = Depends(get_current_user)):
    communities = communities_collection.find({"members": user["id"]})
    return [_serialize(c) for c in communities]
