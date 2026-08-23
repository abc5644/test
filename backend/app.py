"""
FastAPI entrypoint. Mounts the auth, pins, and communities routers.
Run locally with: uvicorn app:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from locations.routes import router as locations_router


from auth.routes import router as auth_router
from pins.routes import router as pins_router
from communities.routes import router as communities_router

app = FastAPI(title="CampusPulse API")
app.include_router(locations_router)
# Wide open intentionally for hackathon speed — tighten before any real deploy.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(pins_router)
app.include_router(communities_router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "CampusPulse API"}
