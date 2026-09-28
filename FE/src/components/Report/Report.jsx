import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../config/api';
import { orgData } from '../../data/orgData';
import styles from './Report.module.css';

const today = new Date().toISOString().slice(0, 10);
const firstDayOfYear = `${new Date().getFullYear()}-01-01`;
const EMPTY_METRICS = { total: 0, individual: 0, legal_entity: 0, active: 0, closed: 0 };

const numberFormat = new Intl.NumberFormat('vi-VN');
const metricLabels = [
    ['total', 'Tổng KHPN + KHCN', 'customerTotal'],
    ['legal_entity', 'Khách hàng pháp nhân', 'legal'],
    ['individual', 'Khách hàng cá nhân', 'individual'],
];

function signedValue(value) {
    if (value > 0) return `+${numberFormat.format(value)}`;
    return numberFormat.format(value);
}

function changePercent(change, base) {
    if (!base) return change ? '—' : '0%';
    return `${change > 0 ? '+' : ''}${((change / base) * 100).toFixed(1)}%`;
}

function Report() {
    const [fromDate, setFromDate] = useState(firstDayOfYear);
    const [toDate, setToDate] = useState(today);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadReport = async (event) => {
        event?.preventDefault();
        if (!fromDate || !toDate || fromDate > toDate) {
            toast.error('Vui lòng chọn hai mốc thời gian hợp lệ.');
            return;
        }
        setLoading(true);
        try {
            const params = new URLSearchParams({ from_date: fromDate, to_date: toDate });
            const response = await fetch(`${API_ENDPOINTS.REPORTS.LOANS}?${params}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || 'Không thể tải báo cáo.');
            setReport(result);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadReport(); }, []);

    const exportReport = async () => {
        try {
            const params = new URLSearchParams({ from_date: fromDate, to_date: toDate });
            const response = await fetch(`${API_ENDPOINTS.REPORTS.LOANS_EXPORT}?${params}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.detail || 'Không thể xuất báo cáo.');
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `bao-cao-khoan-vay-${fromDate}-${toDate}.xlsx`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const summary = report || { from: EMPTY_METRICS, to: EMPTY_METRICS, change: {}, branches: [] };
    const branchNames = Object.fromEntries(orgData.branches.map((branch) => [branch.id, branch.name]));
    const totalChange = summary.change.total ?? 0;
    const branchTotal = summary.branches.reduce((result, branch) => {
        result.from += branch.from.total;
        result.to += branch.to.total;
        result.change += branch.change.total;
        return result;
    }, { from: 0, to: 0, change: 0 });

    return (
        <section className={styles.reportPage}>
            <header className={styles.pageHeader}>
                <div><h1>Báo cáo số lượng khách hàng</h1></div>
            </header>

            <form className={styles.controlPanel} onSubmit={loadReport}>
                <label><span>KỲ BÁO CÁO</span><input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></label>
                <label><span>KỲ ĐỐI CHIẾU</span><input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
                <div className={styles.viewMode}><span>CHẾ ĐỘ HIỂN THỊ BẢNG</span><div><button type="button" className={styles.selectedMode}>Bảng Tổng Quát</button><button type="button" className={styles.disabledMode} disabled>Chi tiết 4 nhóm KHCN</button></div></div>
                <button className={styles.refreshButton} type="submit" disabled={loading}>{loading ? 'Đang tải...' : 'Xem báo cáo'}</button>
            </form>

            <div className={styles.summaryGrid}>
                {metricLabels.map(([key, label, tone]) => {
                    const change = summary.change[key] ?? 0;
                    return <article className={`${styles.metricCard} ${styles[tone]}`} key={key}>
                        <span>{label}</span>
                        <div className={styles.metricMain}><strong>{numberFormat.format(summary.to[key] ?? 0)}</strong><small>khách hàng</small></div>
                        <div className={change < 0 ? styles.changeDown : styles.changeUp}><b>{signedValue(change)}</b><small>({changePercent(change, summary.from[key] ?? 0)})</small></div>
                    </article>;
                })}
            </div>

            <div className={styles.reportToolbar}>
                <div className={styles.toolbarTabs}><button className={styles.activeTab}>▦ &nbsp;Bảng Báo Cáo</button></div>
                <button type="button" className={styles.exportButton} onClick={exportReport} disabled={loading || !report}>▣ &nbsp; Xuất Báo Cáo</button>
            </div>

            <section className={styles.tableSection}>
                <div className={styles.tableHeader}><div><h2>BÁO CÁO SỐ LƯỢNG KHÁCH HÀNG CỦA CÁC ĐƠN VỊ</h2><p>Đơn vị tính: Khách hàng</p></div><span>{summary.branches.length} đơn vị</span></div>
                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr><th rowSpan="2">STT</th><th rowSpan="2">Chi nhánh</th><th colSpan="3">Kỳ báo cáo<small>({toDate})</small></th><th colSpan="3">Kỳ đối chiếu<small>({fromDate})</small></th><th colSpan="3">Biến động</th></tr>
                            <tr><th>Tổng KH</th><th>Pháp nhân</th><th>Cá nhân</th><th>Tổng KH</th><th>Pháp nhân</th><th>Cá nhân</th><th>Tổng (+/-)</th><th>KHDN (+/-)</th><th>KHCN (+/-)</th></tr>
                        </thead>
                        <tbody>
                            {summary.branches.map((branch, index) => (
                                <tr key={branch.branch_code}><td>{index + 1}</td><td><strong>{branchNames[branch.branch_code] || branch.branch_name}</strong><small>{branch.branch_code}</small></td><td><b>{numberFormat.format(branch.to.total)}</b></td><td>{numberFormat.format(branch.to.legal_entity)}</td><td>{numberFormat.format(branch.to.individual)}</td><td><b>{numberFormat.format(branch.from.total)}</b></td><td>{numberFormat.format(branch.from.legal_entity)}</td><td>{numberFormat.format(branch.from.individual)}</td><td className={branch.change.total < 0 ? styles.decrease : styles.increase}>{signedValue(branch.change.total)}</td><td className={branch.change.legal_entity < 0 ? styles.decrease : styles.increase}>{signedValue(branch.change.legal_entity)}</td><td className={branch.change.individual < 0 ? styles.decrease : styles.increase}>{signedValue(branch.change.individual)}</td></tr>
                            ))}
                            {!!summary.branches.length && <tr className={styles.totalRow}><td colSpan="2">TỔNG CỘNG</td><td>{numberFormat.format(branchTotal.to)}</td><td>{numberFormat.format(summary.to.legal_entity)}</td><td>{numberFormat.format(summary.to.individual)}</td><td>{numberFormat.format(branchTotal.from)}</td><td>{numberFormat.format(summary.from.legal_entity)}</td><td>{numberFormat.format(summary.from.individual)}</td><td className={totalChange < 0 ? styles.decrease : styles.increase}>{signedValue(totalChange)}</td><td className={summary.change.legal_entity < 0 ? styles.decrease : styles.increase}>{signedValue(summary.change.legal_entity ?? 0)}</td><td className={summary.change.individual < 0 ? styles.decrease : styles.increase}>{signedValue(summary.change.individual ?? 0)}</td></tr>}
                            {!summary.branches.length && <tr><td colSpan="11" className={styles.empty}>Chưa có dữ liệu cho kỳ báo cáo.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </section>
        </section>
    );
}

export default Report;
