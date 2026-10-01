import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../config/api';
import styles from './Loan.module.css';

const STATUS_OPTIONS = ['', 'Đang vay', 'Đã gia hạn', 'Đã tất toán'];
const fullBalanceFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });

function Loan() {
    const navigate = useNavigate();
    const [data, setData] = useState({ columns: [], loans: [], total: 0, total_pages: 0 });
    const [filters, setFilters] = useState({ customer_code: '', customer_name: '', status: '' });
    const [appliedFilters, setAppliedFilters] = useState({ customer_code: '', customer_name: '', status: '' });
    const [mode, setMode] = useState('all');
    const [loanCategory, setLoanCategory] = useState('all');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [detailColumns, setDetailColumns] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [otherColumnsOpen, setOtherColumnsOpen] = useState(false);
    const token = localStorage.getItem('token');
    
    // Lưu trữ controller để hủy request cũ (Chống Race Condition)
    const abortControllerRef = useRef(null);
    const detailControllerRef = useRef(null);

    // TỐI ƯU HÓA 1: Chỉ parse JWT 1 lần duy nhất
    const canEdit = useMemo(() => {
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return ['ADMIN', 'administrator', 'employee', 'KS', 'GDV'].includes(payload.role);
        } catch {
            return false;
        }
    }, [token]);

    // TỐI ƯU HÓA 2: Tích hợp AbortController
    const loadLoans = useCallback(async (nextPage = page, nextMode = mode, nextFilters = appliedFilters, nextCategory = loanCategory) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        const params = new URLSearchParams({ page: String(nextPage), page_size: '50' });
        if (nextMode === 'due') params.set('days_notice', '5');
        if (nextCategory !== 'all') params.set('loan_category', nextCategory);
        Object.entries(nextFilters).forEach(([key, value]) => value && params.set(key, value));
        
        try {
            const response = await fetch(`${API_ENDPOINTS.LOANS.LIST}?${params}`, { 
                headers: { Authorization: `Bearer ${token}` },
                signal: abortControllerRef.current.signal 
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || 'Không thể tải danh sách khoản vay.');
            setData(result);
        } catch (error) {
            if (error.name !== 'AbortError') {
                toast.error(error.message);
            }
        } finally {
            setLoading(false);
        }
    }, [appliedFilters, loanCategory, mode, page, token]);

    useEffect(() => { 
        loadLoans(); 
        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [loadLoans]);

    const applyFilters = (event) => {
        event.preventDefault();
        setPage(1);
        setAppliedFilters(filters);
    };

    const switchMode = (nextMode) => {
        const nextCategory = nextMode === 'due' || nextMode === 'edited' ? nextMode : 'all';
        if (mode === nextMode && loanCategory === nextCategory) return;
        setMode(nextMode);
        setLoanCategory(nextCategory);
        setPage(1);
    };

    const selectSummaryCategory = (category) => {
        setLoanCategory(category);
        setMode(category === 'due' ? 'due' : 'all');
        setPage(1);
    };

    const updateLoan = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${API_ENDPOINTS.LOANS.LIST}/${selectedLoan.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: selectedLoan.status, note: selectedLoan.gdv_note || '' }),
            });
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.detail || 'Không thể cập nhật khoản vay.');
            }
            setSelectedLoan(null);
            toast.success('Đã lưu cập nhật khoản vay.');
            loadLoans();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const openLoanDetails = useCallback(async (loan) => {
        detailControllerRef.current?.abort();
        const controller = new AbortController();
        detailControllerRef.current = controller;
        setSelectedLoan({ ...loan });
        setDetailColumns([]);
        setOtherColumnsOpen(false);
        setDetailLoading(true);

        try {
            const response = await fetch(`${API_ENDPOINTS.LOANS.LIST}/${loan.id}`, {
                headers: { Authorization: `Bearer ${token}` },
                signal: controller.signal,
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || 'Không thể tải chi tiết khoản vay.');
            setSelectedLoan(result.loan || result);
            setDetailColumns(result.columns || []);
        } catch (error) {
            if (error.name !== 'AbortError') toast.error(error.message);
        } finally {
            if (detailControllerRef.current === controller) {
                detailControllerRef.current = null;
                setDetailLoading(false);
            }
        }
    }, [token]);

    const closeLoanDetails = () => {
        detailControllerRef.current?.abort();
        detailControllerRef.current = null;
        setDetailLoading(false);
        setSelectedLoan(null);
    };

    const summary = data.summary || {};
    const formatBalance = (value) => {
        const amount = Number(value || 0);
        const isTrillion = amount >= 1_000_000_000_000;
        const formattedAmount = new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount / (isTrillion ? 1_000_000_000_000 : 1_000_000_000));
        return `${formattedAmount} ${isTrillion ? 'nghìn tỷ' : 'tỷ'} đồng`;
    };
    const balanceCards = [
        ['Tổng dư nợ hiện tại', summary.total_outstanding, 'balanceTotal'],
        ['Dư nợ khách hàng cá nhân', summary.individual_outstanding, 'balanceIndividual'],
        ['Dư nợ khách hàng pháp nhân', summary.legal_entity_outstanding, 'balanceLegal'],
    ];
    const cards = [
        ['Tổng khoản vay', summary.total ?? data.total, 'total', 'all'],
        ['Sắp đáo hạn (5 ngày)', summary.due_5_days ?? 0, 'due', 'due'],
        ['Quá hạn chưa xử lý', summary.overdue ?? 0, 'overdue', 'overdue'],
        ['Đã gia hạn', summary.renewed ?? 0, 'renewed', 'renewed'],
        ['Đã tất toán', summary.closed ?? 0, 'closed', 'closed'],
    ];

    // TỐI ƯU HÓA 4: Cache lại Body của Table
    const tableBody = useMemo(() => {
        return data.loans.map((loan, index) => (
            <tr
                key={loan.id}
                className={styles.loanRow}
                tabIndex={0}
                aria-label={`Xem chi tiết khoản vay ${loan.CUSTSEQ || ''}`}
                onClick={() => openLoanDetails(loan)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openLoanDetails(loan);
                    }
                }}
            >
                {data.columns.map((column) => (
                    <td key={column.key} className={styles[`column_${column.key}`]} title={column.key === '__serial__' ? undefined : String(loan[column.key] ?? '')}>
                        {column.key === '__serial__'
                            ? (page - 1) * 50 + index + 1
                            : column.key === 'days_to_due'
                                ? <b className={loan.days_to_due <= 3 ? styles.urgent : styles.days}>{loan.days_to_due ?? '-'}</b>
                                : loan[column.key] || '-'}
                    </td>
                ))}
            </tr>
        ));
    }, [data.loans, data.columns, page, openLoanDetails]);

    const modalColumns = detailColumns.length ? detailColumns : data.columns;
    const detailColumn = (header) => modalColumns.find((column) => column.key.toUpperCase() === header);
    const maturityDetailColumn = detailColumn('APPRMATDT') || detailColumn('DSBSMATDT');
    const primaryDetailColumns = [
        detailColumn('CUSTSEQ'),
        detailColumn('CUSTNM'),
        detailColumn('DISBURSEMENT_AMOUNT'),
        detailColumn('DU_NO'),
        detailColumn('DSBSDT'),
        maturityDetailColumn,
        detailColumn('LOAN_TYPE'),
        detailColumn('DSBSSEQ'),
    ].filter(Boolean);
    const primaryDetailKeys = new Set(primaryDetailColumns.map((column) => column.key));
    const hiddenDetailKeys = new Set(['id', 'status', 'gdv', 'gdv_note', 'days_to_due', '__serial__']);
    const otherDetailColumns = modalColumns.filter((column) => (
        !primaryDetailKeys.has(column.key) && !hiddenDetailKeys.has(column.key)
    ));
    const customerCode = selectedLoan?.[detailColumn('CUSTSEQ')?.key] || '';
    const customerName = selectedLoan?.[detailColumn('CUSTNM')?.key] || '';

    return (
        <section className={styles.loanPage}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>Quản lý danh sách khoản vay</h1>
                </div>
                <div className={styles.syncStatus}><span /> Cập nhật tự động</div>
            </header>
            
            <div className={styles.balanceGrid}>
                {balanceCards.map(([label, value, tone]) => (
                    <article
                        className={`${styles.summaryCard} ${styles.balanceCard} ${styles[tone]}`}
                        key={label}
                        title={`${fullBalanceFormat.format(Number(value || 0))} đồng`}
                        aria-label={`${label}: ${fullBalanceFormat.format(Number(value || 0))} đồng`}
                    >
                        <span>{label}</span>
                        <strong>{formatBalance(value)}</strong>
                        <small>Trên toàn bộ danh mục</small>
                    </article>
                ))}
            </div>

            <div className={styles.summaryGrid}>
                {cards.map(([label, value, tone, category]) => (
                    <button type="button" className={`${styles.summaryCard} ${styles.summaryCardButton} ${styles[tone]} ${loanCategory === category ? styles.summaryCardActive : ''}`} key={label} onClick={() => selectSummaryCategory(category)} aria-pressed={loanCategory === category}>
                        <span>{label}</span>
                        <strong>{Number(value).toLocaleString('vi-VN')}</strong>
                    </button>
                ))}
            </div>

            <div className={styles.workspace}>
                {/* TOOLBAR TOP */}
                <div className={styles.toolbarTop}>
                    <div className={styles.modeButtons}>
                        <button className={mode === 'all' ? styles.activeButton : ''} onClick={() => switchMode('all')}>
                            Tất cả khoản vay
                        </button>
                        <button className={mode === 'edited' ? styles.activeButton : ''} onClick={() => switchMode('edited')}>
                            Khoản vay đã chỉnh sửa
                        </button>
                        <button className={mode === 'due' ? styles.activeButton : ''} onClick={() => switchMode('due')}>
                            Sắp đáo hạn
                        </button>
                        <span className={styles.noticeLabel}>trong <b>5</b> ngày</span>
                    </div>
                    <span className={styles.resultHint}>
                        {loading ? 'Đang tải dữ liệu...' : `${data.total.toLocaleString('vi-VN')} kết quả`}
                    </span>
                </div>

                {/* FILTER BAR */}
                <form className={styles.filterBar} onSubmit={applyFilters}>
                    <label>Mã khách hàng
                        <input placeholder="Nhập mã khách hàng" value={filters.customer_code} onChange={(e) => setFilters({ ...filters, customer_code: e.target.value })} />
                    </label>
                    <label>Tên khách hàng
                        <input placeholder="Nhập tên khách hàng" value={filters.customer_name} onChange={(e) => setFilters({ ...filters, customer_name: e.target.value })} />
                    </label>
                    <label>Trạng thái
                        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                            {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>{status || 'Mọi trạng thái'}</option>
                            ))}
                        </select>
                    </label>
                    <button className={styles.searchButton} type="submit" disabled={loading}>
                        <span>⌕</span> {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                    </button>
                    <button className={styles.resetButton} type="button" onClick={() => { 
                        const empty = { customer_code: '', customer_name: '', status: '' }; 
                        setFilters(empty); 
                        setAppliedFilters(empty); 
                        setLoanCategory('all');
                        setMode('all');
                        setPage(1);
                    }}>
                        ↻ Đặt lại
                    </button>
                    <button className={styles.reportButton} type="button" onClick={() => navigate('/reports')}>
                        Báo cáo
                    </button>
                </form>

                {/* DATA TABLE */}
                <div className={styles.tableContainer}>
                    <div className={styles.tableScroll}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    {data.columns.map((column) => <th key={column.key} className={styles[`column_${column.key}`]}>{column.label}</th>)}
                                </tr>
                            </thead>
                            <tbody style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                                {tableBody}
                            </tbody>
                        </table>
                    </div>
                    {!loading && data.loans.length === 0 && (
                        <div className={styles.emptyState}>Không có khoản vay phù hợp.</div>
                    )}
                </div>

                {/* FOOTER - PAGINATION */}
                <footer className={styles.pagination}>
                    <span>Hiển thị <b>{data.loans.length ? (page - 1) * 50 + 1 : 0}–{(page - 1) * 50 + data.loans.length}</b> / {data.total.toLocaleString('vi-VN')} khoản vay</span>
                    <div>
                        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Trước</button>
                        <strong>Trang {data.total_pages ? `${page}/${data.total_pages}` : '0'}</strong>
                        <button disabled={page >= data.total_pages} onClick={() => setPage(page + 1)}>Tiếp ›</button>
                    </div>
                </footer>
            </div>

            {/* MODAL CHI TIẾT */}
            {selectedLoan && (
                <div className={styles.modalBackdrop} onMouseDown={(event) => event.target === event.currentTarget && closeLoanDetails()}>
                    <form className={styles.modal} onSubmit={canEdit ? updateLoan : (event) => event.preventDefault()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h2>Cập nhật khoản vay</h2>
                                <p>{customerName || 'Hồ sơ khoản vay'}{customerCode ? ` · '${customerCode}'` : ''}</p>
                            </div>
                            <button type="button" className={styles.closeButton} onClick={closeLoanDetails} aria-label="Đóng">×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.detailGrid}>
                                {primaryDetailColumns.map((column) => {
                                    const value = selectedLoan[column.key];
                                    return <div className={styles.detailItem} key={column.key} title={value == null ? '' : String(value)}>
                                        <span>{column.label}</span>
                                        <strong>{value == null || value === '' ? '-' : String(value)}</strong>
                                    </div>;
                                })}
                            </div>

                            <section className={styles.otherColumnsSection}>
                                <button
                                    type="button"
                                    className={styles.otherColumnsToggle}
                                    aria-expanded={otherColumnsOpen}
                                    onClick={() => setOtherColumnsOpen((open) => !open)}
                                >
                                    <span aria-hidden="true">{otherColumnsOpen ? '▾' : '▸'}</span>
                                    Cột khác trong file ({otherDetailColumns.length})
                                    {detailLoading && <small>Đang tải...</small>}
                                </button>
                                {otherColumnsOpen && <div className={styles.otherColumnsGrid}>
                                    {otherDetailColumns.map((column) => {
                                        const value = selectedLoan[column.key];
                                        return <div className={styles.detailItem} key={column.key} title={value == null ? '' : String(value)}>
                                            <span>{column.label}</span>
                                            <strong>{value == null || value === '' ? '-' : String(value)}</strong>
                                        </div>;
                                    })}
                                </div>}
                            </section>

                            <section className={styles.statusSection}>
                                <h3>Trạng thái</h3>
                                <div className={styles.statusOptions} role="group" aria-label="Trạng thái khoản vay">
                                    {STATUS_OPTIONS.slice(1).map((status) => (
                                        <button
                                            key={status}
                                            type="button"
                                            className={`${styles.statusOption} ${selectedLoan.status === status ? styles.statusOptionActive : ''}`}
                                            aria-pressed={selectedLoan.status === status}
                                            disabled={!canEdit}
                                            onClick={() => setSelectedLoan({ ...selectedLoan, status })}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                                {selectedLoan.gdv && <small className={styles.assignedOfficer}>GDV phụ trách: {selectedLoan.gdv}</small>}
                            </section>

                            <label className={styles.noteField}>Ghi chú / lý do
                                <textarea
                                    maxLength={2000}
                                    readOnly={!canEdit}
                                    value={selectedLoan.gdv_note || ''}
                                    onChange={(event) => setSelectedLoan({ ...selectedLoan, gdv_note: event.target.value })}
                                    placeholder="Lý do khách dừng vay, điều khoản gia hạn, việc cần theo dõi..."
                                />
                                <small className={styles.noteCount}>{(selectedLoan.gdv_note || '').length}/2000</small>
                            </label>
                        </div>

                        <div className={styles.modalFooter}>
                            {!canEdit && <span className={styles.readOnlyHint}>Tài khoản chỉ có quyền xem</span>}
                            <button type="button" onClick={closeLoanDetails}>Huỷ</button>
                            {canEdit && <button type="submit" className={styles.searchButton} disabled={detailLoading}>Lưu cập nhật</button>}
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
}

export default Loan;