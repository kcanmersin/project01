from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from services.auth_service import (
    create_access_token,
    create_user,
    get_user_by_username,
    get_user_by_email,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])

RESERVED_USERNAMES = {"admin", "superadmin"}


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_username(db, body.username)
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı veya şifre hatalı",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hesap devre dışı",
        )
    token = create_access_token(user.id, user.username, user.role)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    # Rezerve kullanıcı adları
    if body.username.lower() in RESERVED_USERNAMES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu kullanıcı adı kullanılamaz",
        )

    if len(body.username) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kullanıcı adı en az 3 karakter olmalı",
        )

    if len(body.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Şifre en az 6 karakter olmalı",
        )

    if get_user_by_username(db, body.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu kullanıcı adı zaten kullanılıyor",
        )

    if body.email and get_user_by_email(db, body.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu e-posta zaten kayıtlı",
        )

    user = create_user(db, body.username, body.password, body.email, role="user")
    token = create_access_token(user.id, user.username, user.role)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def me(db: Session = Depends(get_db), token: str = ""):
    """Token ile mevcut kullanıcıyı döndür — Authorization header'dan kullanılır."""
    from fastapi import Header
    from services.auth_service import decode_token

    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz token")

    user = db.query(__import__("models.user", fromlist=["User"]).User).filter_by(id=int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kullanıcı bulunamadı")
    return UserResponse.model_validate(user)
