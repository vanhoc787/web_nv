from typing import Any
from urllib.parse import quote

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from sqlmodel import Session, select

from ..core.database import get_session
from ..core.security import validate_token
from ..models.user import User
from ..services.form_generator_service import delete_person, generate_document, list_people, list_programs, save_person

router = APIRouter()


class PersonRequest(BaseModel):
    values: dict[str, Any] = Field(default_factory=dict)


class GenerateRequest(BaseModel):
    program: str
    template: str
    user_id: int
    thong_tin: str = ''
    nhom: str = ''


@router.get('/form-generator/programs')
def get_programs(_: str = Depends(validate_token)):
    return {'programs': list_programs()}


@router.get('/form-generator/users')
def get_people(username: str = Depends(validate_token), session: Session = Depends(get_session)):
    current = session.exec(select(User).where(User.username == username)).first()
    if current is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail='User không tồn tại.')
    return {'users': list_people(session, current.id)}


@router.post('/form-generator/users')
def create_person(request: PersonRequest, username: str = Depends(validate_token), session: Session = Depends(get_session)):
    current = session.exec(select(User).where(User.username == username)).first()
    if current is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail='User không tồn tại.')
    return {'user': save_person(request.values, current.id, session)}


@router.put('/form-generator/users/{user_id}')
def update_person(user_id: int, request: PersonRequest, username: str = Depends(validate_token), session: Session = Depends(get_session)):
    current = session.exec(select(User).where(User.username == username)).first()
    if current is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail='User không tồn tại.')
    return {'user': save_person(request.values, current.id, session, user_id)}


@router.delete('/form-generator/users/{user_id}')
def remove_person(user_id: int, username: str = Depends(validate_token), session: Session = Depends(get_session)):
    current = session.exec(select(User).where(User.username == username)).first()
    if current is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail='User không tồn tại.')
    delete_person(user_id, current.id, session)
    return {'success': True, 'message': 'Đã xóa nhân sự.'}


@router.post('/form-generator/generate')
def create_document(request: GenerateRequest, username: str = Depends(validate_token), session: Session = Depends(get_session)):
    current = session.exec(select(User).where(User.username == username)).first()
    if current is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail='User không tồn tại.')
    content, filename = generate_document(session, current.id, request.program, request.template, request.user_id, request.thong_tin, request.nhom)
    encoded_filename = quote(filename)
    return StreamingResponse(
        iter([content]),
        media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        headers={'Content-Disposition': f"attachment; filename=download.docx; filename*=UTF-8''{encoded_filename}"},
    )