from fastapi import APIRouter, Depends, File, UploadFile
from pydantic import BaseModel
from sqlmodel import Session, select

from ..core.database import get_session
from ..core.security import validate_token
from ..models.user import User
from ..services.loan_service import get_loan, import_loan_files, list_loans, update_loan

router = APIRouter()


class LoanUpdateRequest(BaseModel):
    status: str
    note: str = ''


@router.get('/loans')
def get_loans(
    page: int = 1,
    page_size: int = 50,
    days_notice: int | None = None,
    customer_code: str = '',
    customer_name: str = '',
    status: str = '',
    loan_category: str = '',
    username: str = Depends(validate_token),
    session: Session = Depends(get_session),
):
    user = session.exec(select(User).where(User.username == username)).first()
    if user is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail='User không tồn tại.')
    return list_loans(
        max(1, page), min(max(1, page_size), 200), days_notice, customer_code,
        customer_name, status, loan_category, username, user.role,
    )


@router.get('/loans/{loan_id}')
def get_loan_detail(loan_id: int, _: str = Depends(validate_token)):
    return get_loan(loan_id)


@router.patch('/loans/{loan_id}')
def patch_loan(
    loan_id: int,
    request: LoanUpdateRequest,
    username: str = Depends(validate_token),
    session: Session = Depends(get_session),
):
    user = session.exec(select(User).where(User.username == username)).first()
    if user is None or user.role not in {'ADMIN', 'administrator', 'employee', 'KS', 'GDV'}:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail='Tài khoản chỉ có quyền xem khoản vay.')
    return update_loan(loan_id, request.status, request.note, username)


@router.post('/loans/import')
def import_loans(
    files: list[UploadFile] = File(...),
    username: str = Depends(validate_token),
    session: Session = Depends(get_session),
):
    user = session.exec(select(User).where(User.username == username)).first()
    if user is None or user.role not in {'ADMIN', 'administrator'}:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail='Chỉ ADMIN mới được import dữ liệu.')
    return import_loan_files(files)
