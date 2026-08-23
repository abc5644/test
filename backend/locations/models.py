from pydantic import BaseModel

class LocationUpdate(BaseModel):
    lat: float
    lng: float

class LocationPublic(BaseModel):
    user_id: str
    name: str
    lat: float
    lng: float
    updated_at: str