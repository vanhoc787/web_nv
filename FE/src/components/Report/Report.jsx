import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../config/api';
import { orgData } from '../../data/orgData';
import styles from './Report.module.css';

const today = new Date().toISOString().slice(0, 10);
const firstDayOfYear = `${new Date().getFullYear()}-01-01`;
const EMPTY_METRICS = { total: 0, individual: 0, legal_entity: 0, active: 0, closed: 0 };

const numberFormat = new Intl.NumberFormat('vi-VN');
const metricLabels = [
    ['total', 'Tất cả khách hàng', 'customerTotal'],
    ['individual', 'Khách hàng cá nhân', 'individual'],
    ['legal_entity', 'Khách hàng pháp nhân', 'legal'],
];

function signedValue(value) {
    if (value > 0) return `+${numberFormat.format(value)}`;
    return numberFormat.format(value);
}

function changePercent(change, base) {
    if (!base) return change ? '—' : '0%';
    return `${change > 0 ? '+' : ''}${((change / base) * 100).toFixed(1)}%`;
}

function movementValue(increase = 0, decrease = 0) {
    return <span className={styles.movementValue}>
        <b className={styles.increase}>+{numberFormat.format(increase)}</b>
        <span>/</span>
        <b className={styles.decrease}>-{numberFormat.format(decrease)}</b>
    </span>;
}

function Report() {
    const [fromDate, setFromDate] = useState(firstDayOfYear);
    const [toDate, setToDate] = useState(today);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hoveredBranch, setHoveredBranch] = useState(null);
    const chartSectionRef = useRef(null);
    const chartTooltipRef = useRef(null);

    const positionChartTooltip = (event) => {
        const chart = chartSectionRef.current;
        const tooltip = chartTooltipRef.current;
        if (!chart || !tooltip) return;

        const bounds = chart.getBoundingClientRect();
        const pointerX = event.clientX - bounds.left;
        const pointerY = event.clientY - bounds.top;
        const leftOfPointer = pointerX - tooltip.offsetWidth - 14;
        const rightOfPointer = pointerX + 14;
        const left = rightOfPointer + tooltip.offsetWidth <= bounds.width - 8
            ? rightOfPointer
            : leftOfPointer;
        const abovePointer = pointerY - tooltip.offsetHeight - 12;
        const top = abovePointer >= 8 ? abovePointer : pointerY + 12;
        tooltip.style.left = `${Math.max(8, Math.min(left, bounds.width - tooltip.offsetWidth - 8))}px`;
        tooltip.style.top = `${Math.max(8, Math.min(top, bounds.height - tooltip.offsetHeight - 8))}px`;
    };

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
    const chartRows = [...summary.branches].sort((left, right) => right.to.total - left.to.total);
    const chartMax = Math.max(1, ...chartRows.flatMap((branch) => [branch.from.total, branch.to.total]));

    return (
        <section className={styles.reportPage}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>Báo cáo biến động khách hàng vay vốn</h1>
                    <p>Số khách hàng đang vay tại hai mốc thời gian, tính theo ngày giải ngân.</p>
                </div>
            </header>

            <form className={styles.controlPanel} onSubmit={loadReport}>
                <label><span>Mốc đầu kỳ</span><input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
                <label><span>Mốc cuối kỳ</span><input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></label>
                <button className={styles.refreshButton} type="submit" disabled={loading}>{loading ? 'Đang tải...' : 'Xem báo cáo'}</button>
            </form>

            <div className={styles.summaryGrid}>
                {metricLabels.map(([key, label, tone]) => {
                    const change = summary.change[key] ?? 0;
                    return <article className={`${styles.metricCard} ${styles[tone]}`} key={key}>
                        <span>{label}</span>
                        <div className={styles.metricMain}>
                            <strong>{numberFormat.format(summary.from[key] ?? 0)}</strong>
                            <span aria-hidden="true">&rarr;</span>
                            <strong>{numberFormat.format(summary.to[key] ?? 0)}</strong>
                        </div>
                        <div className={change < 0 ? styles.changeDown : styles.changeUp}>
                            <b>{signedValue(change)}</b><small>{changePercent(change, summary.from[key] ?? 0)}</small>
                        </div>
                    </article>;
                })}
            </div>

            <section
                ref={chartSectionRef}
                className={styles.chartSection}
                aria-label="Biểu đồ khách hàng đang vay theo chi nhánh"
                onPointerMove={positionChartTooltip}
                onPointerLeave={() => setHoveredBranch(null)}
            >
                <div className={styles.sectionHeading}>
                    <div><h2>Số khách hàng đang vay theo chi nhánh</h2><p>So sánh số khách hàng còn khoản vay hiệu lực tại hai mốc.</p></div>
                    <div className={styles.legend}><span><i className={styles.fromSwatch} />Đầu kỳ</span><span><i className={styles.toSwatch} />Cuối kỳ</span></div>
                </div>
                {chartRows.length ? <div className={styles.chartRows}>
                    {chartRows.map((branch) => (
                        <div
                            className={styles.chartRow}
                            key={branch.branch_code}
                            tabIndex={0}
                            role="group"
                            aria-label={`${branchNames[branch.branch_code] || branch.branch_name}, cuối kỳ ${numberFormat.format(branch.to.total)}, đầu kỳ ${numberFormat.format(branch.from.total)}`}
                            onPointerEnter={() => setHoveredBranch(branch)}
                            onPointerLeave={() => setHoveredBranch(null)}
                            onFocus={() => setHoveredBranch(branch)}
                            onBlur={() => setHoveredBranch(null)}
                        >
                            <strong>{branchNames[branch.branch_code] || branch.branch_name}</strong>
                            <div className={styles.barPair}>
                                <div className={styles.barTrack}>
                                    <span className={styles.fromBar} style={{ width: `${(branch.from.total / chartMax) * 100}%` }} />
                                </div>
                                <div className={styles.barTrack}>
                                    <span className={styles.toBar} style={{ width: `${(branch.to.total / chartMax) * 100}%` }} />
                                </div>
                            </div>
                            <div className={styles.chartValues}><span>{numberFormat.format(branch.from.total)}</span><b>{numberFormat.format(branch.to.total)}</b></div>
                        </div>
                    ))}
                </div> : <p className={styles.emptyChart}>Chưa có dữ liệu cho khoảng thời gian này.</p>}
                {hoveredBranch && <div ref={chartTooltipRef} className={`${styles.chartTooltip} ${styles.chartTooltipVisible}`} role="tooltip">
                    <strong>{branchNames[hoveredBranch.branch_code] || hoveredBranch.branch_name}</strong>
                    <span className={styles.tooltipTo}>Cuối kỳ : {numberFormat.format(hoveredBranch.to.total)}</span>
                    <span className={styles.tooltipFrom}>Đầu kỳ : {numberFormat.format(hoveredBranch.from.total)}</span>
                </div>}
            </section>

            <section className={styles.tableSection}>
                <div className={styles.tableHeader}>
                    <div><h2>Chi tiết biến động theo đơn vị</h2><p>Khách hàng được đếm không trùng tại từng mốc.</p></div>
                    <button type="button" className={styles.exportButton} onClick={exportReport} disabled={loading || !report}>Xuất Excel</button>
                </div>
                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr><th rowSpan="2">Mã CN</th><th rowSpan="2">Chi nhánh</th><th colSpan="3">CÁ NHÂN</th><th colSpan="3">PHÁP NHÂN</th><th colSpan="3">TỔNG</th></tr>
                            <tr>
                                <th>Đầu kỳ<small>{fromDate}</small></th><th>Cuối kỳ<small>{toDate}</small></th><th>Tăng / giảm</th>
                                <th>Đầu kỳ<small>{fromDate}</small></th><th>Cuối kỳ<small>{toDate}</small></th><th>Tăng / giảm</th>
                                <th>Đầu kỳ<small>{fromDate}</small></th><th>Cuối kỳ<small>{toDate}</small></th><th>Tăng / giảm</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.branches.map((branch) => (
                                <tr key={branch.branch_code}>
                                    <td>{branch.branch_code}</td><td className={styles.branchName}>{branchNames[branch.branch_code] || branch.branch_name}</td>
                                    <td>{numberFormat.format(branch.from.individual)}</td><td><b>{numberFormat.format(branch.to.individual)}</b></td><td>{movementValue(branch.increase?.individual, branch.decrease?.individual)}</td>
                                    <td>{numberFormat.format(branch.from.legal_entity)}</td><td><b>{numberFormat.format(branch.to.legal_entity)}</b></td><td>{movementValue(branch.increase?.legal_entity, branch.decrease?.legal_entity)}</td>
                                    <td>{numberFormat.format(branch.from.total)}</td><td><b>{numberFormat.format(branch.to.total)}</b></td><td>{movementValue(branch.increase?.total, branch.decrease?.total)}</td>
                                </tr>
                            ))}
                            {!!summary.branches.length && <tr className={styles.totalRow}>
                                <td colSpan="2">Toàn đơn vị (đếm không trùng)</td>
                                <td>{numberFormat.format(summary.from.individual)}</td><td>{numberFormat.format(summary.to.individual)}</td><td>{movementValue(summary.increase?.individual, summary.decrease?.individual)}</td>
                                <td>{numberFormat.format(summary.from.legal_entity)}</td><td>{numberFormat.format(summary.to.legal_entity)}</td><td>{movementValue(summary.increase?.legal_entity, summary.decrease?.legal_entity)}</td>
                                <td>{numberFormat.format(summary.from.total)}</td><td>{numberFormat.format(summary.to.total)}</td><td>{movementValue(summary.increase?.total, summary.decrease?.total)}</td>
                            </tr>}
                            {!summary.branches.length && <tr><td colSpan="11" className={styles.empty}>Chưa có dữ liệu cho kỳ báo cáo.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </section>
        </section>
    );
}

export default Report;
