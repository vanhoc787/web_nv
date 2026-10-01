from datetime import date

from sqlalchemy import Column, MetaData, String, Table
from sqlalchemy.dialects import postgresql

from app.services.loan_service import _normalize_search_text
from app.services.loan_service import (
    MATURITY_DATE_HEADERS,
    _configure_headers,
    _is_active_loan_at,
    _key_for_header,
    _maturity_date_expression,
    _missing_import_columns,
)


def test_normalize_search_text_removes_accents_and_case():
    assert _normalize_search_text('Nguyễn Văn A') == 'nguyen van a'
    assert _normalize_search_text('  TÊN KHÁCH HÀNG  ') == 'ten khach hang'
    assert _normalize_search_text('Mã KH 001') == 'ma kh 001'


def test_apprmatdt_is_accepted_as_the_maturity_date_column():
    headers = [
        'BRCD', 'CUSTSEQ', 'CUSTNM', 'DISBURSEMENT_AMOUNT', 'DU_NO',
        'LOAN_TYPE', 'CUSTOMER_TYPE_CODE', 'ADDR1', 'DSBSDT', 'APPRMATDT', 'INTTRMMTH',
    ]

    assert _missing_import_columns(headers) == []
    _configure_headers(headers)
    assert _key_for_header('APPRMATDT') is not None
    assert MATURITY_DATE_HEADERS[0] == 'APPRMATDT'


def test_settled_loan_is_reduced_on_maturity_date_not_before():
    headers = ['DU_NO', 'PASTDUE_INTEREST_AMOUNT', 'TOTAL_INTEREST_REPAY_AMOUNT', 'DSBSDT', 'APPRMATDT']
    _configure_headers(headers)
    disbursement_key = _key_for_header('DSBSDT')
    maturity_key = _key_for_header('APPRMATDT')
    row = {
        _key_for_header('DU_NO'): '0',
        _key_for_header('PASTDUE_INTEREST_AMOUNT'): '0',
        _key_for_header('TOTAL_INTEREST_REPAY_AMOUNT'): '0',
        disbursement_key: '2026-01-01',
        maturity_key: '2026-09-30',
    }

    assert _is_active_loan_at(row, date(2026, 9, 29), disbursement_key, maturity_key)
    assert not _is_active_loan_at(row, date(2026, 9, 30), disbursement_key, maturity_key)


def test_unsettled_loan_remains_active_after_maturity_date():
    headers = ['DU_NO', 'PASTDUE_INTEREST_AMOUNT', 'TOTAL_INTEREST_REPAY_AMOUNT', 'DSBSDT', 'APPRMATDT']
    _configure_headers(headers)
    disbursement_key = _key_for_header('DSBSDT')
    maturity_key = _key_for_header('APPRMATDT')
    row = {
        _key_for_header('DU_NO'): '125000',
        _key_for_header('PASTDUE_INTEREST_AMOUNT'): '0',
        _key_for_header('TOTAL_INTEREST_REPAY_AMOUNT'): '0',
        disbursement_key: '2026-01-01',
        maturity_key: '2026-09-30',
    }

    assert _is_active_loan_at(row, date(2026, 10, 1), disbursement_key, maturity_key)


def test_loan_not_disbursed_by_cutoff_is_not_active():
    headers = ['DU_NO', 'PASTDUE_INTEREST_AMOUNT', 'TOTAL_INTEREST_REPAY_AMOUNT', 'DSBSDT', 'APPRMATDT']
    _configure_headers(headers)
    disbursement_key = _key_for_header('DSBSDT')
    maturity_key = _key_for_header('APPRMATDT')
    row = {
        _key_for_header('DU_NO'): '125000',
        _key_for_header('PASTDUE_INTEREST_AMOUNT'): '0',
        _key_for_header('TOTAL_INTEREST_REPAY_AMOUNT'): '0',
        disbursement_key: '2026-10-01',
        maturity_key: '2027-10-01',
    }

    assert not _is_active_loan_at(row, date(2026, 9, 30), disbursement_key, maturity_key)


def test_maturity_expression_prefers_apprmatdt_over_dsbsmatdt():
    _configure_headers(['APPRMATDT', 'DSBSMATDT'])
    table = Table(
        'loan_imports', MetaData(),
        Column('APPRMATDT', String),
        Column('DSBSMATDT', String),
    )

    sql = str(_maturity_date_expression(table).compile(dialect=postgresql.dialect()))

    assert 'greatest' not in sql.lower()
    assert 'APPRMATDT' in sql
    assert 'DSBSMATDT' not in sql


def test_maturity_expression_falls_back_to_dsbsmatdt():
    _configure_headers(['DSBSMATDT'])
    table = Table('loan_imports', MetaData(), Column('DSBSMATDT', String))

    sql = str(_maturity_date_expression(table).compile(dialect=postgresql.dialect()))

    assert 'DSBSMATDT' in sql
