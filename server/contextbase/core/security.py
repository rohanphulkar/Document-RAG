from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import bcrypt

from .config import settings
from .database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_reset_token(email: str):
    return create_access_token(
        {"sub": email, "type": "reset"},
        timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES)
    )


def verify_reset_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") == "reset":
            return payload.get("sub")
    except JWTError:
        pass
    return None


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    from contextbase.models.user import User
    
    creds_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise creds_exception
    except JWTError:
        raise creds_exception
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise creds_exception
    return user
