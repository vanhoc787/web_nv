
try:
    from app.core.security import validate_token
except ModuleNotFoundError:
    from .app.core.security import validate_token

__all__ = ['validate_token']

