# CampusPulse

An interactive, community-verified live map of the NSUT campus — built for Hack-4-Crown, Oblivion'26. Layers real-time campus life (study spots, crowds, events, ambient "vibe" clips) on top of a base map, with crowd upvotes deciding credibility instead of admin moderation.

## Stack

- **Frontend:** React (Vite), PWA — `frontend/`
- **Map:** react-leaflet + OpenStreetMap tiles (no API key needed)
- **Backend:** FastAPI (Python) — `backend/`
- **Database:** MongoDB Atlas (free M0 cluster)
- **Auth:** email/password, bcrypt + JWT
- **Media:** Cloudinary free tier, uploaded directly from the browser
- **Hosting:** Vercel (frontend), Render (backend), Atlas (db)

## Local setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # fill in MONGO_URI and JWT_SECRET
uvicorn app:app --reload
```

API runs at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env          # fill in VITE_API_URL and Cloudinary values
npm run dev
```

App runs at `http://localhost:5173`.

## Cloudinary setup (for media clips/photos)

1. Create a free Cloudinary account.
2. Under Settings → Upload, create an **unsigned** upload preset (needed since uploads happen client-side, straight from the browser).
3. Put your cloud name and preset name into `frontend/.env`.

## Deploying

- **Frontend → Vercel:** import the repo, set root directory to `frontend/`, add the `VITE_*` env vars. Remember: Vite bakes env vars in at build time, so changing one later means a redeploy, not just a settings tweak.
- **Backend → Render:** import the repo, set root directory to `backend/`, add `MONGO_URI` and `JWT_SECRET` env vars. **Must set `PYTHON_VERSION=3.11.9`** or the build breaks on `pydantic-core`. `render.yaml` in `backend/` has this pre-wired if you use a Blueprint.
- **Database → MongoDB Atlas:** free M0 cluster, allow access from anywhere (`0.0.0.0/0`) for hackathon simplicity, grab the connection string for `MONGO_URI`.

## Build order

See the project brief — short version: **auth → map + pins → upvotes → vibe clips → communities → profile → stretch (friends, live location)**. Auth and pins/map are already scaffolded and functional above; vibe clip capture (`VoiceRecorder`) and Cloudinary upload wiring are in place on the Home map screen.

## Project structure

```
naksha_demo/
├── backend/
│   ├── app.py                  # FastAPI entrypoint, mounts routers
│   ├── database.py             # shared MongoDB connection
│   ├── auth/                   # signup/login routes, models, bcrypt+JWT utils
│   ├── pins/                   # pins CRUD + upvote routes/models
│   └── communities/             # community create/join routes/models
├── frontend/
│   └── src/
│       ├── api.js              # single shared file: all fetch() calls to backend
│       ├── pages/               # Intro, Login, Signup, HomeMap, Profile, Community
│       └── components/          # PinPopup, NewPinForm, VoiceRecorder, UploadPhoto
```

## Already-decided constraints

- No OAuth / NSUT-domain email verification — plain email/password only
- No Google Maps — Leaflet + OpenStreetMap, no credit card required
- Vibe clips capped at 5–10 seconds by design
- CORS wide open (`allow_origins=["*"]`) intentionally, for hackathon speed
