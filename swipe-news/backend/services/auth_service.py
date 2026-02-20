import os
import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from models.user import User

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "swipe-news-secret-key-change-in-production-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 gün

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Password helpers ─────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ── JWT helpers ───────────────────────────────────────────────────────────────

def create_access_token(user_id: int, username: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "username": username,
        "role": role,
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


# ── DB helpers ────────────────────────────────────────────────────────────────

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, username: str, password: str, email: Optional[str] = None, role: str = "user") -> User:
    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ── Google OAuth helpers ───────────────────────────────────────────────────────

def get_user_by_google_id(db: Session, google_id: str) -> Optional[User]:
    return db.query(User).filter(User.google_id == google_id).first()


def _safe_username(base: str) -> str:
    """Ad / email'den geçerli bir username türetir."""
    cleaned = re.sub(r"[^a-zA-Z0-9_]", "", base)[:20]
    return cleaned if len(cleaned) >= 3 else "user"


def get_or_create_google_user(
    db: Session,
    google_id: str,
    email: Optional[str],
    name: Optional[str],
) -> User:
    # 1. google_id ile mevcut kullanıcıyı ara
    user = get_user_by_google_id(db, google_id)
    if user:
        return user

    # 2. Aynı e-posta ile kayıtlıysa google_id'yi bağla
    if email:
        user = get_user_by_email(db, email)
        if user:
            user.google_id = google_id
            db.commit()
            db.refresh(user)
            return user

    # 3. Yeni kullanıcı oluştur
    base = _safe_username(name or (email.split("@")[0] if email else "user"))
    username = base
    counter = 1
    while get_user_by_username(db, username):
        username = f"{base}{counter}"
        counter += 1

    user = User(
        username=username,
        email=email,
        google_id=google_id,
        hashed_password=hash_password(secrets.token_hex(32)),  # Google kullanıcısı şifreyle giriş yapamaz
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
