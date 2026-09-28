from datetime import date

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from ..core.security import validate_token
from ..services.loan_service import loan_report, loan_report_xlsx

router = APIRouter()


@router.get('/reports/loans')
def get_loan_report(from_date: date, to_date: date, _: str = Depends(validate_token)):
    if from_date > to_date:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail='Mốc thời gian bắt đầu phải trước mốc kết thúc.')
    return loan_report(from_date, to_date)


@router.get('/reports/loans/export')
def export_loan_report(from_date: date, to_date: date, _: str = Depends(validate_token)):
    if from_date > to_date:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail='Mốc thời gian bắt đầu phải trước mốc kết thúc.')
    report = loan_report(from_date, to_date)
    filename = f'bao-cao-khoan-vay-{from_date.isoformat()}-{to_date.isoformat()}.xlsx'
    return StreamingResponse(
        iter([loan_report_xlsx(report)]),
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={'Content-Disposition': f'attachment; filename="{filename}"'},
    )