import csv
import io
import re
from typing import Any, TextIO

from fastapi import HTTPException, UploadFile
from sqlalchemy import Column, MetaData, String, Table, inspect, insert, select
from ..core.database import engine

LOAN_TABLE_NAME = 'loan_imports'
MAX_COLUMNS = 100
BATCH_SIZE = 500


def _normalize_column_name(header: str, used_names: set[str]) -> str:
    name = re.sub(r'[^a-zA-Z0-9_]+', '_', header.strip().lower()).strip('_')
    name = name or 'column'
    if name[0].isdigit():
        name = f'column_{name}'

    base_name = name[:55]
    name = base_name
    suffix = 2
    while name in used_names:
        suffix_text = f'_{suffix}'
        name = f'{base_name[:63 - len(suffix_text)]}{suffix_text}'
        suffix += 1
    used_names.add(name)
    return name


def _build_column_mapping(headers: list[str]) -> dict[str, str]:
    used_names: set[str] = set()
    return {header: _normalize_column_name(header, used_names) for header in headers}


def _get_or_create_table(headers: list[str]) -> tuple[Table, dict[str, str]]:
    column_mapping = _build_column_mapping(headers)
    inspector = inspect(engine)

    if inspector.has_table(LOAN_TABLE_NAME):
        existing_columns = [column['name'] for column in inspector.get_columns(LOAN_TABLE_NAME)]
        expected_columns = list(column_mapping.values())
        if existing_columns != expected_columns:
            raise HTTPException(
                status_code=409,
                detail={
                    'message': 'Cấu trúc CSV không khớp với bảng loan_imports hiện tại.',
                    'expected_columns': existing_columns,
                    'received_columns': expected_columns,
                },
            )
        metadata = MetaData()
        return Table(LOAN_TABLE_NAME, metadata, autoload_with=engine), column_mapping

    metadata = MetaData()
    table = Table(
        LOAN_TABLE_NAME,
        metadata,
        *(Column(column_name, String, nullable=True) for column_name in column_mapping.values()),
    )
    metadata.create_all(engine)
    return table, column_mapping


def list_imported_loans() -> dict[str, Any]:
    inspector = inspect(engine)
    if not inspector.has_table(LOAN_TABLE_NAME):
        return {'columns': [], 'loans': []}

    metadata = MetaData()
    table = Table(LOAN_TABLE_NAME, metadata, autoload_with=engine)
    columns = [column.name for column in table.columns]

    with engine.connect() as connection:
        loans = [dict(row) for row in connection.execute(select(table)).mappings()]

    return {'columns': columns, 'loans': loans}


def import_loans_csv(file: UploadFile) -> dict[str, Any]:
    if not file.filename or not file.filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail='Chỉ hỗ trợ file CSV.')

    try:
        text_stream: TextIO = io.TextIOWrapper(file.file, encoding='utf-8-sig', newline='')
        reader = csv.reader(text_stream)
        headers = next(reader, None)
        if not headers or not any(header.strip() for header in headers):
            raise HTTPException(status_code=400, detail='File CSV không có dòng tiêu đề.')
        if len(headers) > MAX_COLUMNS:
            raise HTTPException(status_code=400, detail=f'File CSV tối đa {MAX_COLUMNS} cột.')
        if len(set(header.strip().lower() for header in headers)) != len(headers):
            raise HTTPException(status_code=400, detail='Tên cột CSV không được trùng nhau.')

        table, column_mapping = _get_or_create_table(headers)
        rows: list[dict[str, str | None]] = []
        imported_rows = 0

        with engine.begin() as connection:
            for values in reader:
                if not any(value.strip() for value in values):
                    continue
                if len(values) != len(headers):
                    raise HTTPException(
                        status_code=400,
                        detail=f'Dòng {imported_rows + 2} có {len(values)} cột, cần {len(headers)} cột.',
                    )
                rows.append({
                    column_mapping[header]: value.strip() or None
                    for header, value in zip(headers, values)
                })
                if len(rows) >= BATCH_SIZE:
                    connection.execute(insert(table), rows)
                    imported_rows += len(rows)
                    rows.clear()

            if rows:
                connection.execute(insert(table), rows)
                imported_rows += len(rows)

        return {
            'message': 'Import dữ liệu khoản vay thành công.',
            'table': LOAN_TABLE_NAME,
            'columns': list(column_mapping.values()),
            'rows_imported': imported_rows,
        }
    except UnicodeDecodeError as error:
        raise HTTPException(status_code=400, detail='File phải được lưu ở định dạng UTF-8.') from error
    finally:
        file.file.close()
