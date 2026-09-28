from datetime import datetime, timedelta
from typing import Any, Union

import jwt

from ..core.config import SECURITY_ALGORITHM, SECRET_KEY, TOKEN_EXPIRE_DAYS


def verify_password(username: str, password: str) -> bool:
    return username == 'admin' and password == 'admin'


def generate_token(username: Union[str, Any], **claims: Any) -> str:
    expire = datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)
    payload = {'exp': expire, 'username': username, **claims}
    return jwt.encode(payload, SECRET_KEY, algorithm=SECURITY_ALGORITHM)
