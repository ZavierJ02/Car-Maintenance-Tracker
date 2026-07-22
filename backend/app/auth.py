import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext

from dotenv import load_dotenv

load_dotenv()

# Use environment variables in production to avoid hardcoding secrets.
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
	raise RuntimeError(
		"SECRET_KEY environment variable is not set"
	)

ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

ACCESS_TOKEN_EXPIRE_MINUTES = int(
	os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)

pwd_context = CryptContext(
	schemes=["bcrypt"],
	deprecated="auto"
)


def hash_password(password: str) -> str:
	"""Hash a plain-text password using passlib."""
	return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
	"""Verify a plain-text password against a hashed password."""
	return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
	"""Create a JWT access token with an expiration timestamp."""
	to_encode = data.copy()
	expire = datetime.now(timezone.utc) + (
		expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
	)
	to_encode.update({"exp": expire})
	return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
	"""Decode a JWT token and return its payload."""
	try:
		payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
		return payload
	except JWTError as exc:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Invalid or expired token",
			headers={"WWW-Authenticate": "Bearer"},
		) from exc
