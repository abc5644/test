from typing import Optional
from pydantic import BaseModel


class CommunityCreate(BaseModel):
    name: str


class CommunityJoin(BaseModel):
    join_code: str


class CommunityPublic(BaseModel):
    id: str
    name: str
    join_code: str
    members: list[str]
    created_at: str
