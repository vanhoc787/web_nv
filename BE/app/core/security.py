import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from pydantic import ValidationError

from .config import SECURITY_ALGORITHM, SECRET_KEY

reusable_oauth2 = HTTPBearer(scheme_name='Authorization')


def validate_token(http_authorization_credentials=Depends(reusable_oauth2)) -> str:
    try:
        payload = jwt.decode(
            http_authorization_credentials.credentials,
            SECRET_KEY,
            algorithms=[SECURITY_ALGORITHM],
        )
        username = payload.get('username')
        if not username:
            raise HTTPException(status_code=403, detail='Could not validate credentials')
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=403, detail='Token expired')
    except (jwt.PyJWTError, ValidationError):
        raise HTTPException(status_code=403, detail='Could not validate credentials')


def current_claims(http_authorization_credentials=Depends(reusable_oauth2)) -> dict:
    try:
        return jwt.decode(
            http_authorization_credentials.credentials,
            SECRET_KEY,
            algorithms=[SECURITY_ALGORITHM],
        )
    except (jwt.PyJWTError, ValidationError):
        raise HTTPException(status_code=403, detail='Could not validate credentials')
