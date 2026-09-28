from app.services.loan_service import _normalize_search_text


def test_normalize_search_text_removes_accents_and_case():
    assert _normalize_search_text('Nguyễn Văn A') == 'nguyen van a'
    assert _normalize_search_text('  TÊN KHÁCH HÀNG  ') == 'ten khach hang'
    assert _normalize_search_text('Mã KH 001') == 'ma kh 001'
