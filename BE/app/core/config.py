import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / '.env')

SECURITY_ALGORITHM = os.getenv('SECURITY_ALGORITHM')
SECRET_KEY = os.getenv('SECRET_KEY')

if not SECURITY_ALGORITHM or not SECRET_KEY:
    raise RuntimeError('SECURITY_ALGORITHM and SECRET_KEY must be configured')

TOKEN_EXPIRE_DAYS = 3
