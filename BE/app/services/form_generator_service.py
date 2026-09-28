import html
import io
import os
import re
import textwrap
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

from docxtpl import DocxTemplate
from fastapi import HTTPException
from sqlmodel import Session, select

from ..models.personnel import Personnel


PROJECT_ROOT = Path(__file__).resolve().parents[3]
TEMPLATE_DIR = PROJECT_ROOT / 'FE' / 'templates'
PERSONNEL_COLUMNS = [
    'STT', 'Ten', 'MaNV', 'Ngay_sinh', 'Noi_sinh', 'CCCD', 'Ngay_cap', 'Noi_cap', 'Mail',
    'Phong_ban', 'Chuc_vu', 'SDT', 'User_IPCAS', 'User_AD', 'Chi_nhanh', 'Ma_CN', 'Nhom_CN',
]


def _clean_value(value: Any) -> str:
    if value is None or value == 'nan' or str(value).lower() == 'nan':
        return ''
    value = str(value)
    return re.sub(r'^([0-9]+)\.0$', r'\1', value)


def _serialize_personnel(record: Personnel) -> dict[str, Any]:
    data = {column: _clean_value(getattr(record, column, '')) for column in PERSONNEL_COLUMNS}
    data['id'] = record.id
    return data


def list_programs() -> list[dict[str, Any]]:
    if not TEMPLATE_DIR.exists():
        return []
    programs = []
    for directory in sorted(path for path in TEMPLATE_DIR.iterdir() if path.is_dir()):
        templates = sorted(path.name for path in directory.glob('*.docx'))
        programs.append({'name': directory.name, 'templates': templates})
    return programs


def list_people(session: Session, created_by: uuid.UUID) -> list[dict[str, Any]]:
    records = session.exec(
        select(Personnel).where(Personnel.created_by == created_by).order_by(Personnel.id)
    ).all()
    return [_serialize_personnel(record) for record in records]


def save_person(person: dict[str, Any], created_by: uuid.UUID, session: Session, row_id: int | None = None) -> dict[str, Any]:
    name = _clean_value(person.get('Ten'))
    if not name:
        raise HTTPException(status_code=400, detail="Trường 'Họ và tên' không được để trống.")

    values = {column: _clean_value(person.get(column, '')) for column in PERSONNEL_COLUMNS}
    if row_id is None:
        latest = session.exec(
            select(Personnel).where(Personnel.created_by == created_by).order_by(Personnel.id.desc()).limit(1)
        ).first()
        next_stt = int(str(latest.STT)) + 1 if latest and str(latest.STT).isdigit() else 1
        values['STT'] = str(next_stt)
        record = Personnel(created_by=created_by, **values)
        session.add(record)
        session.commit()
        session.refresh(record)
        return _serialize_personnel(record)

    record = session.exec(
        select(Personnel).where(Personnel.id == row_id, Personnel.created_by == created_by)
    ).first()
    if record is None:
        raise HTTPException(status_code=404, detail='Không tìm thấy nhân sự.')

    for column in PERSONNEL_COLUMNS:
        setattr(record, column, values.get(column, ''))
    record.updated_at = datetime.utcnow()
    session.add(record)
    session.commit()
    session.refresh(record)
    return _serialize_personnel(record)


def delete_person(row_id: int, created_by: uuid.UUID, session: Session) -> None:
    record = session.exec(
        select(Personnel).where(Personnel.id == row_id, Personnel.created_by == created_by)
    ).first()
    if record is None:
        raise HTTPException(status_code=404, detail='Không tìm thấy nhân sự.')

    session.delete(record)
    session.commit()

    remaining = session.exec(
        select(Personnel).where(Personnel.created_by == created_by).order_by(Personnel.id)
    ).all()
    for index, item in enumerate(remaining, start=1):
        item.STT = str(index)
        session.add(item)
    session.commit()


def _format_long_text(key: str, value: Any, width: int = 30) -> str:
    text_value = _clean_value(value)
    if len(text_value) > width and key.lower() not in {'chi_nhanh', 'ma_cn', 'thong_tin', 'nhom'}:
        text_value = '\n'.join(textwrap.wrap(text_value, width=width, break_long_words=True, replace_whitespace=False))
    return html.escape(text_value)


def generate_document(session: Session, created_by: uuid.UUID, program: str, template: str, user_id: int, thong_tin: str = '', nhom: str = '') -> tuple[bytes, str]:
    program_path = TEMPLATE_DIR / program
    template_path = program_path / template
    try:
        program_path.resolve().relative_to(TEMPLATE_DIR.resolve())
        template_path.resolve().relative_to(program_path.resolve())
    except ValueError as error:
        raise HTTPException(status_code=400, detail='Đường dẫn chương trình hoặc mẫu không hợp lệ.') from error
    if not template_path.is_file() or template_path.suffix.lower() != '.docx':
        raise HTTPException(status_code=404, detail='Không tìm thấy mẫu Word.')

    record = session.exec(
        select(Personnel).where(Personnel.id == user_id, Personnel.created_by == created_by)
    ).first()
    if record is None:
        raise HTTPException(status_code=404, detail='Không tìm thấy nhân sự.')

    user_data = _serialize_personnel(record)
    now = datetime.now()
    user_data.update({'ngay_tao': now.strftime('%d/%m/%Y'), 'thang': now.strftime('%m'), 'nam': now.strftime('%Y')})
    if '03-CSUS' in template:
        user_data.update({'Thong_tin': _clean_value(thong_tin), 'nhom': _clean_value(nhom)})
    context = {key: _format_long_text(key, value) for key, value in user_data.items()}

    output = io.BytesIO()
    try:
        document = DocxTemplate(str(template_path))
        document.render(context)
        document.save(output)
    except Exception as error:
        raise HTTPException(status_code=500, detail=f'Không thể tạo mẫu Word: {error}') from error
    name = _clean_value(user_data.get('Ten')) or 'nhan-su'
    safe_name = re.sub(r'[^0-9A-Za-zÀ-ỹ _-]', '_', f'{name}_{Path(template).stem}').strip() or 'mau-bieu'
    return output.getvalue(), f'{safe_name}.docx'