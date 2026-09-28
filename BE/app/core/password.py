import base64
import hashlib
import hmac
import secrets

_SALT_SIZE = 16
_KEY_LENGTH = 64


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(_SALT_SIZE)
    password_hash = hashlib.scrypt(
        password.encode('utf-8'),
        salt=salt,
        n=2**14,
        r=8,
        p=1,
        dklen=_KEY_LENGTH,
    )
    encoded_salt = base64.b64encode(salt).decode('ascii')
    encoded_hash = base64.b64encode(password_hash).decode('ascii')
    return f'scrypt${encoded_salt}${encoded_hash}'


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, encoded_salt, encoded_hash = stored_hash.split('$')
        if algorithm != 'scrypt':
            return False
        salt = base64.b64decode(encoded_salt)
        expected_hash = base64.b64decode(encoded_hash)
        actual_hash = hashlib.scrypt(
            password.encode('utf-8'),
            salt=salt,
            n=2**14,
            r=8,
            p=1,
            dklen=len(expected_hash),
        )
        return hmac.compare_digest(actual_hash, expected_hash)
    except (ValueError, TypeError):
        return False
