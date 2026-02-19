from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine, SessionLocal
from models import user as _user_model  # noqa: F401 — registers User with Base
from routers import feed, ogimage, auth
from services.auth_service import create_user, get_user_by_username


SEED_USERS = [
    {"username": "superadmin", "password": "superadmin123", "role": "superadmin", "email": "superadmin@swipenews.app"},
    {"username": "admin",      "password": "admin123",      "role": "admin",      "email": "admin@swipenews.app"},
    {"username": "user",       "password": "user123",       "role": "user",       "email": "user@swipenews.app"},
]


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for u in SEED_USERS:
            if not get_user_by_username(db, u["username"]):
                create_user(db, u["username"], u["password"], u["email"], u["role"])
                print(f"[seed] '{u['username']}' oluşturuldu ({u['role']})")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="SwipeNews API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(feed.router)
app.include_router(ogimage.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
