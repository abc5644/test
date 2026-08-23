"""
Shared MongoDB connection (MongoDB Atlas free M0 cluster).
Every router imports `db` from here instead of opening its own connection.
"""
import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise RuntimeError(
        "MONGO_URI is not set. Copy backend/.env.example to backend/.env "
        "and paste your MongoDB Atlas connection string."
    )

# tlsCAFile=certifi.where() fixes 'SSL handshake failed: TLSV1_ALERT_INTERNAL_ERROR'
# on Render's container image, which doesn't always trust Atlas's cert chain
# by default even though the same connection works fine locally on Windows.
client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
db = client["campuspulse"]

# Collections (created lazily by MongoDB on first insert, listed here for clarity)
users_collection = db["users"]
pins_collection = db["pins"]
communities_collection = db["communities"]
locations_collection = db["locations"]