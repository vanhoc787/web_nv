from fastapi import HTTPException
from sqlmodel import Session, select

from ..core.password import hash_password, verify_password
from ..models.user import User


ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = '123456'


def ensure_admin_user(session: Session) -> None:
    admin = session.exec(
        select(User).where(User.username == ADMIN_USERNAME)
    ).first()
    if admin is not None:
        return

    session.add(
        User(
            employee_code='NV001',
            username=ADMIN_USERNAME,
            password=hash_password(ADMIN_PASSWORD),
            fullname='System Administrator',
            branch_code='HO',
            dept='IT',
            role='ADMIN',
            status='active',
        )
    )
    session.commit()


def authenticate_user(session: Session, username: str, password: str) -> User | None:
    user = session.exec(
        select(User).where(User.username == username, User.status == 'active')
    ).first()
    if user is None or not verify_password(password, user.password):
        return None
    return user


def require_admin(user: User) -> None:
    if user.role not in {'ADMIN', 'administrator'}:
        raise HTTPException(status_code=403, detail='Chỉ ADMIN mới được thực hiện thao tác này.')


def serialize_user(user: User) -> dict:
    return {
        'id': user.id,
        'employee_code': user.employee_code,
        'user_code': user.employee_code,
        'username': user.username,
        'fullname': user.fullname,
        'branch_code': user.branch_code,
        'branch_id': user.branch_code,
        'dept': user.dept,
        'role': 'ADMIN' if user.role == 'administrator' else user.role,
        'status': user.status,
    }
