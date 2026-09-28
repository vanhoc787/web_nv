import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../config/api';
import styles from './FormGenerator.module.css';

const branchMapping = {
    'CHI NHÁNH BẮC LONG AN': '6612',
    'CHI NHÁNH ĐỨC HUỆ BẮC LONG AN': '6609',
    'CHI NHÁNH ĐỨC HÒA BẮC LONG AN': '6613',
    'CHI NHÁNH TÂN MỸ BẮC LONG AN': '6619',
    'CHI NHÁNH MỘC HÓA BẮC LONG AN': '6620',
    'CHI NHÁNH ĐỨC HÒA THƯỢNG BẮC LONG AN': '6668',
    'CHI NHÁNH BẮC LONG AN - PGD 3/2': '6613',
    'CHI NHÁNH ĐỨC HUỆ BẮC LONG AN - PGD MỸ QUÝ': '6609',
    'CHI NHÁNH TÂN MỸ BẮC LONG AN - PGD LỘC GIANG': '6619',
};

const emptyPerson = {
    Ten: '', MaNV: '', Ngay_sinh: '', Noi_sinh: '', CCCD: '', Ngay_cap: '', Noi_cap: '', Mail: '',
    Phong_ban: '', Chuc_vu: '', SDT: '', User_IPCAS: '', User_AD: '', Chi_nhanh: '', Ma_CN: '', Nhom_CN: 'KSV',
};

const fields = [
    ['Ten', 'Họ và tên (*)'], ['MaNV', 'Mã nhân viên'], ['Ngay_sinh', 'Ngày sinh'], ['Noi_sinh', 'Nơi sinh'],
    ['CCCD', 'Số CCCD'], ['Ngay_cap', 'Ngày cấp'], ['Noi_cap', 'Nơi cấp'], ['Mail', 'Email'],
    ['Phong_ban', 'Phòng ban'], ['Chuc_vu', 'Chức vụ'], ['SDT', 'Số điện thoại'], ['User_IPCAS', 'User IPCAS'],
    ['User_AD', 'User AD'],
];

function FormGenerator() {
    const [programs, setPrograms] = useState([]);
    const [users, setUsers] = useState([]);
    const [program, setProgram] = useState('');
    const [template, setTemplate] = useState('');
    const [userId, setUserId] = useState('');
    const [person, setPerson] = useState(emptyPerson);
    const [extra, setExtra] = useState({ thong_tin: '', nhom: '' });
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');
    const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

    const selectedProgram = programs.find((item) => item.name === program);
    const selectedUser = users.find((item) => String(item.id) === String(userId));
    const isDynamic = template.includes('03-CSUS');

    const loadData = async () => {
        setLoading(true);
        try {
            const [programResponse, userResponse] = await Promise.all([
                fetch(API_ENDPOINTS.FORM_GENERATOR.PROGRAMS, { headers }),
                fetch(API_ENDPOINTS.FORM_GENERATOR.USERS, { headers }),
            ]);
            const programData = await programResponse.json();
            const userData = await userResponse.json();
            if (!programResponse.ok) throw new Error(programData.detail || 'Không thể tải danh sách mẫu.');
            if (!userResponse.ok) throw new Error(userData.detail || 'Không thể tải danh sách nhân sự.');
            setPrograms(programData.programs || []);
            setUsers(userData.users || []);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const selectProgram = (value) => {
        setProgram(value);
        setTemplate('');
    };

    const selectUser = (value) => {
        setUserId(value);
        const user = users.find((item) => String(item.id) === String(value));
        setPerson(user ? { ...emptyPerson, ...user } : emptyPerson);
    };

    const updatePersonField = (field, value) => {
        const nextPerson = { ...person, [field]: value };
        if (field === 'Chi_nhanh') nextPerson.Ma_CN = branchMapping[value] || '';
        setPerson(nextPerson);
    };

    const savePerson = async () => {
        const editingExisting = userId !== '';
        try {
            const response = await fetch(editingExisting ? API_ENDPOINTS.FORM_GENERATOR.USER(userId) : API_ENDPOINTS.FORM_GENERATOR.USERS, {
                method: editingExisting ? 'PUT' : 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ values: person }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || 'Không thể lưu nhân sự.');
            toast.success(editingExisting ? 'Đã cập nhật nhân sự.' : 'Đã thêm nhân sự.');
            setEditing(false);
            await loadData();
            selectUser(String(result.user.id));
        } catch (error) {
            toast.error(error.message);
        }
    };

    const deletePerson = async () => {
        if (!userId) return;
        if (!window.confirm('Bạn có chắc muốn xóa nhân sự đang chọn?')) return;

        try {
            const response = await fetch(API_ENDPOINTS.FORM_GENERATOR.USER(userId), {
                method: 'DELETE',
                headers,
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.detail || 'Không thể xóa nhân sự.');
            toast.success(result.message || 'Đã xóa nhân sự.');
            setUserId('');
            setPerson(emptyPerson);
            setEditing(false);
            await loadData();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const generateDocument = async (event) => {
        event.preventDefault();
        if (!program || !template || userId === '') {
            toast.error('Vui lòng chọn chương trình, mẫu biểu và nhân sự.');
            return;
        }
        try {
            const response = await fetch(API_ENDPOINTS.FORM_GENERATOR.GENERATE, {
                method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ program, template, user_id: Number(userId), ...extra }),
            });
            if (!response.ok) {
                const contentType = response.headers.get('content-type') || '';
                const result = contentType.includes('application/json') ? await response.json() : null;
                throw new Error(result?.detail || `Không thể tạo mẫu Word (HTTP ${response.status}).`);
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${person.Ten || 'mau-bieu'}_${template}`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success('Đã tạo mẫu Word.');
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <section className={styles.page}>
            <header className={styles.header}><div><h1>Hệ thống tạo mẫu biểu</h1><span>Chọn mẫu và thông tin nhân sự để tạo file Word.</span></div><div className={styles.status}>{loading ? 'Đang tải dữ liệu...' : `${users.length} nhân sự`}</div></header>
            <form className={styles.card} onSubmit={generateDocument}>
                <div className={styles.formGrid}>
                    <label>Chương trình nghiệp vụ<select value={program} onChange={(event) => selectProgram(event.target.value)}><option value="">-- Vui lòng chọn --</option>{programs.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
                    <label>Mẫu biểu cần tạo<select value={template} onChange={(event) => setTemplate(event.target.value)} disabled={!selectedProgram}><option value="">-- Chọn mẫu biểu --</option>{selectedProgram?.templates.map((item) => <option key={item}>{item}</option>)}</select></label>
                    <label className={styles.userSelect}>Thông tin nhân sự<select value={userId} onChange={(event) => selectUser(event.target.value)}><option value="">-- Chọn nhân sự --</option>{users.map((item) => <option key={item.id} value={item.id}>{item.Ten}</option>)}</select><span className={styles.userActions}><button type="button" onClick={() => { setEditing(true); setPerson({ ...emptyPerson, ...(selectedUser || {}) }); }} disabled={!selectedUser}>Sửa</button><button type="button" className={styles.userAdd} onClick={() => { setEditing(true); setPerson({ ...emptyPerson }); setExtra({ thong_tin: '', nhom: '' }); setUserId(''); }}>+ Thêm mới</button><button type="button" className={styles.deleteButton} onClick={deletePerson} disabled={!selectedUser}>Xóa</button></span></label>
                </div>
                {isDynamic && <div className={styles.dynamicGrid}><label>Thông tin thay đổi<input value={extra.thong_tin} onChange={(event) => setExtra({ ...extra, thong_tin: event.target.value })} /></label><label>Nhóm chức năng đề nghị thay đổi<input value={extra.nhom} onChange={(event) => setExtra({ ...extra, nhom: event.target.value })} /></label></div>}
                <button className={styles.generateButton} type="submit">TẠO MẪU BIỂU</button>
            </form>

            {editing && <section className={styles.editor}><div className={styles.editorHeader}><div><p>HỒ SƠ NHÂN SỰ</p><h2>{userId === '' ? 'Thêm nhân sự mới' : 'Chỉnh sửa thông tin nhân sự'}</h2></div><button type="button" onClick={() => setEditing(false)}>Đóng</button></div><div className={styles.peopleGrid}>{fields.map(([field, label]) => <label key={field}>{label}<input value={person[field] || ''} onChange={(event) => updatePersonField(field, event.target.value)} /></label>)}<label>Chi nhánh trực thuộc<select value={person.Chi_nhanh || ''} onChange={(event) => updatePersonField('Chi_nhanh', event.target.value)}><option value="">-- Chọn chi nhánh --</option>{Object.keys(branchMapping).map((branch) => <option key={branch}>{branch}</option>)}</select></label><label>Mã CN (tự động)<input value={person.Ma_CN || ''} readOnly /></label><label>Nhóm quyền<select value={person.Nhom_CN || 'KSV'} onChange={(event) => updatePersonField('Nhom_CN', event.target.value)}><option>KSV</option><option>GDV</option></select></label></div><button type="button" className={styles.saveButton} onClick={savePerson}>Lưu thông tin</button></section>}
        </section>
    );
}

export default FormGenerator;