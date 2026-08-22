from typing import Literal, Optional
from pydantic import BaseModel

PinType = Literal["study", "crowded", "silent", "event", "sound"]


class PinCreate(BaseModel):
    type: PinType
    label: str
    lat: float
    lng: float
    note: Optional[str] = None
    media_url: Optional[str] = None  # Cloudinary URL, uploaded client-side
    community_id: Optional[str] = None


class PinPublic(BaseModel):
    id: str
    type: PinType
    label: str
    lat: float
    lng: float
    note: Optional[str] = None
    media_url: Optional[str] = None
    votes: int
    community_id: Optional[str] = None
    created_by: str
    created_at: str
