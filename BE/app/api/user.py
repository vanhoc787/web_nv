from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

from ..core.database import get_session
from ..core.password import hash_password
from ..core.security import validate_token
from ..models.user import User
from ..schemas.auth import LoginRequest
from ..services.auth_service import generate_token
from ..services.user_service import authenticate_user, require_admin, serialize_user

router = APIRouter()


class UserCreateRequest(BaseModel):
    employee_code: str
    username: str
    password: str
    branch_code: str
    role: str = 'GDV'


class UserUpdateRequest(BaseModel):
    fullname: str | None = None
    branch_code: str | None = None
    dept: str | None = None
    role: str | None = None


class PasswordRequest(BaseModel):
    newPassword1: str


@router.get('/users')
def list_users(
    username: str = Depends(validate_token),
    session: Session = Depends(get_session),
):
    current = session.exec(select(User).where(User.username == username)).first()
    if current is None:
        raise HTTPException(status_code=401, detail='User không tồn tại.')
    users = session.exec(select(User)).all()
    return {'users': [serialize_user(user) for user in users]}


@router.post('/users')
@router.post('/users/create')
def create_user(request: UserCreateRequest, username: str = Depends(validate_token), session: Session = Depends(get_session)):
    current = session.exec(select(User).where(User.username == username)).first()
    if current is None:
        raise HTTPException(status_code=401, detail='User không tồn tại.')
    require_admin(current)
    if session.exec(select(User).where((User.username == request.username) | (User.employee_code == request.employee_code))).first():
        raise HTTPException(status_code=409, detail='Tên đăng nhập hoặc mã user đã tồn tại.')
    user = User(employee_code=request.employee_code, username=request.username, password=hash_password(request.password), branch_code=request.branch_code, role=request.role, fullname=request.username, status='active')
    session.add(user)
    session.commit()
    session.refresh(user)
    return {'success': True, 'user': serialize_user(user)}


@router.put('/users/{user_code}')
def update_user(user_code: str, request: UserUpdateRequest, username: str = Depends(validate_token), session: Session = Depends(get_session)):
    current = session.exec(select(User).where(User.username == username)).first()
    if current is None:
        raise HTTPException(status_code=401, detail='User không tồn tại.')
    require_admin(current)
    user = session.exec(select(User).where(User.employee_code == user_code)).first()
    if user is None:
        raise HTTPException(status_code=404, detail='Không tìm thấy user.')
    if request.fullname is not None:
        user.fullname = request.fullname.strip()
    if request.branch_code is not None:
        user.branch_code = request.branch_code.strip()
    if request.dept is not None:
        user.dept = request.dept.strip()
    if request.role is not None:
        user.role = request.role.strip()
    session.add(user)
    session.commit()
    session.refresh(user)
    return {'success': True, 'user': serialize_user(user)}


@router.patch('/users/{user_code}/change-password')
def change_password(user_code: str, request: PasswordRequest, username: str = Depends(validate_token), session: Session = Depends(get_session)):
    current = session.exec(select(User).where(User.username == username)).first()
    if current is None:
        raise HTTPException(status_code=401, detail='User không tồn tại.')
    require_admin(current)
    user = session.exec(select(User).where(User.employee_code == user_code)).first()
    if user is None:
        raise HTTPException(status_code=404, detail='Không tìm thấy user.')
    user.password = hash_password(request.newPassword1)
    session.add(user)
    session.commit()
    return {'success': True}


@router.patch('/users/{user_code}/status')
def toggle_user_status(user_code: str, username: str = Depends(validate_token), session: Session = Depends(get_session)):
    current = session.exec(select(User).where(User.username == username)).first()
    if current is None:
        raise HTTPException(status_code=401, detail='User không tồn tại.')
    require_admin(current)
    user = session.exec(select(User).where(User.employee_code == user_code)).first()
    if user is None:
        raise HTTPException(status_code=404, detail='Không tìm thấy user.')
    if user.username == username:
        raise HTTPException(status_code=400, detail='Không thể vô hiệu hóa tài khoản đang đăng nhập.')
    user.status = 'inactive' if user.status == 'active' else 'active'
    session.add(user)
    session.commit()
    session.refresh(user)
    return {'success': True, 'message': 'Đã cập nhật trạng thái user.', 'user': serialize_user(user)}


@router.delete('/users/{user_code}')
def delete_user(user_code: str, username: str = Depends(validate_token), session: Session = Depends(get_session)):
    current = session.exec(select(User).where(User.username == username)).first()
    if current is None:
        raise HTTPException(status_code=401, detail='User không tồn tại.')
    require_admin(current)
    user = session.exec(select(User).where(User.employee_code == user_code)).first()
    if user is None:
        raise HTTPException(status_code=404, detail='Không tìm thấy user.')
    if user.username == username:
        raise HTTPException(status_code=400, detail='Không thể xóa tài khoản đang đăng nhập.')
    session.delete(user)
    session.commit()
    return {'success': True}


@router.post('/login')
def login(request_data: LoginRequest, session: Session = Depends(get_session)):
    user = authenticate_user(session, request_data.username, request_data.password)
    if user is None:
        raise HTTPException(status_code=401, detail='Tài khoản hoặc mật khẩu không chính xác.')

    role = 'ADMIN' if user.role == 'administrator' else user.role
    return {'token': generate_token(user.username, role=role, user_code=user.employee_code, branch_id=user.branch_code, fullname=user.fullname, dept=user.dept, status=user.status), 'user': serialize_user(user)}
