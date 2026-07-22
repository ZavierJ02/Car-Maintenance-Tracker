from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.auth import decode_access_token
from app.database import get_db
from app.models import User

bearer_scheme = HTTPBearer()


def get_current_user(
	credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
	db: Session = Depends(get_db),
) -> User:
	"""Return the authenticated user from a Bearer JWT token."""
	credentials_exception = HTTPException(
		status_code=status.HTTP_401_UNAUTHORIZED,
		detail="Could not validate credentials",
		headers={"WWW-Authenticate": "Bearer"},
	)

	if credentials is None or credentials.scheme.lower() != "bearer":
		raise credentials_exception

	token = credentials.credentials
	payload = decode_access_token(token)
	email = payload.get("sub")

	if not email:
		raise credentials_exception

	user = db.query(User).filter(User.email == email).first()
	if user is None:
		raise credentials_exception

	return user
