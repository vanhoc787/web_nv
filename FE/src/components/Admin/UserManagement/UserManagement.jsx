import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './UserManagement.module.css';
import Pagination from '../../../components/Pagination/Pagination';
import { API_ENDPOINTS } from '../../../config/api';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal';
import { orgData, findNameById } from '../../../data/orgData';

const SvgIcon = ({ path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
    </svg>
);
const ITEMS_PER_PAGE = 8;

const normalizeBranchId = (branchCode = '') => branchCode || '';

const normalizeDepartmentId = (branchId = '', deptCode = '') => {
    if (!branchId || !deptCode) return '';
    return orgData.departments[branchId]?.some((department) => department.id === deptCode)
        ? deptCode
        : '';
};

const getOrgBranchName = (branchCode) => findNameById(orgData.branches, normalizeBranchId(branchCode));

const getOrgDepartmentName = (branchCode, deptCode) => {
    const normalizedBranch = normalizeBranchId(branchCode);
    const normalizedDepartment = normalizeDepartmentId(normalizedBranch, deptCode);
    return findNameById(orgData.departments[normalizedBranch] || [], normalizedDepartment) || 'Chưa xác định';
};

const getRoleNameById = (branchCode, deptCode, roleId) => {
    const normalizedBranch = normalizeBranchId(branchCode);
    const normalizedDepartment = normalizeDepartmentId(normalizedBranch, deptCode);
    return findNameById(orgData.roles[normalizedDepartment] || [], roleId) || roleId || 'Chưa xác định';
};

// --- COMPONENT MỚI: MODAL THÊM NGƯỜI DÙNG ---
const AddUserModal = ({ isOpen, onClose, onSave }) => {
    const [fullname, setFullname] = useState('');
    const [employee_code, setEmployeeCode] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [departments, setDepartments] = useState([]);
    const [roleOptions, setRoleOptions] = useState([]);

    useEffect(() => {
        if (!isOpen) {
            setFullname('');
            setEmployeeCode('');
            setUsername('');
            setPassword('');
            setSelectedBranch('');
            setSelectedDepartment('');
            setSelectedRole('');
            setDepartments([]);
            setRoleOptions([]);
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleBranchChange = (e) => {
        const branchId = e.target.value;
        setSelectedBranch(branchId);
        setSelectedDepartment('');
        setSelectedRole('');
        setRoleOptions([]);
        setDepartments(orgData.departments[branchId] || []);
    };

    const handleDepartmentChange = (e) => {
        const departmentId = e.target.value;
        setSelectedDepartment(departmentId);
        setSelectedRole('');
        setRoleOptions(orgData.roles[departmentId] || []);
    };

    const handleRoleChange = (e) => {
        const roleId = e.target.value;
        setSelectedRole(roleId);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!fullname || !username || !password || !selectedBranch || !selectedDepartment || !selectedRole) {
            toast.error('Vui lòng chọn đầy đủ Chi nhánh, Phòng ban và Vị trí trước khi lưu!');
            return;
        }
        onSave({
            fullname,
            employee_code,
            dept: selectedDepartment,
            branch_code: selectedBranch,
            username,
            password,
            role: selectedRole,
            status: 'active'
        });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Thêm Người dùng mới</h2>
                    <button onClick={onClose} className={styles.closeButton}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label htmlFor="employee_code">Mã cán bộ</label>
                            <input id="employee_code" type="text" value={employee_code} onChange={e => setEmployeeCode(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="fullname">Họ và Tên</label>
                            <input id="fullname" type="text" value={fullname} onChange={e => setFullname(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="branch-select">Chi nhánh</label>
                            <select id="branch-select" value={selectedBranch} onChange={handleBranchChange}>
                                <option value="">Chọn chi nhánh</option>
                                {orgData.branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="department-select">Phòng ban</label>
                            <select id="department-select" value={selectedDepartment} onChange={handleDepartmentChange} disabled={!selectedBranch}>
                                <option value="">Chọn phòng ban</option>
                                {departments.map(department => (
                                    <option key={department.id} value={department.id}>{department.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="role-select">Vị trí</label>
                            <select id="role-select" value={selectedRole} onChange={handleRoleChange} disabled={!selectedDepartment}>
                                <option value="">Chọn vị trí</option>
                                {roleOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="username">Tên đăng nhập</label>
                            <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="password">Mật khẩu</label>
                            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                    </div>
                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>Hủy</button>
                        <button type="submit" className={styles.saveButton}>Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- COMPONENT MỚI: MODAL SỬA NGƯỜI DÙNG ---
const EditUserModal = ({ isOpen, onClose, onSave, user }) => {
    const [fullname, setFullname] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [departments, setDepartments] = useState([]);
    const [roleOptions, setRoleOptions] = useState([]);

    useEffect(() => {
        if (user) {
            const branchId = normalizeBranchId(user.branch_code);
            const branchOptions = orgData.departments[branchId] || [];
            const departmentId = normalizeDepartmentId(branchId, user.dept);
            const departmentRoles = orgData.roles[departmentId] || [];
            const matchedRole = departmentRoles.find((item) => item.id === user.role);

            setFullname(user.fullname);
            setSelectedBranch(branchId);
            setDepartments(branchOptions);
            setSelectedDepartment(departmentId);
            setRoleOptions(departmentRoles);
            setSelectedRole(matchedRole?.id || '');
        }
    }, [user]);

    if (!isOpen) {
        return null;
    }

    const handleBranchChange = (e) => {
        const branchId = e.target.value;
        setSelectedBranch(branchId);
        setSelectedDepartment('');
        setSelectedRole('');
        setRoleOptions([]);
        setDepartments(orgData.departments[branchId] || []);
    };

    const handleDepartmentChange = (e) => {
        const departmentId = e.target.value;
        setSelectedDepartment(departmentId);
        setSelectedRole('');
        setRoleOptions(orgData.roles[departmentId] || []);
    };

    const handleRoleChange = (e) => {
        const roleId = e.target.value;
        setSelectedRole(roleId);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedBranch || !selectedDepartment || !selectedRole || !fullname) {
            toast.error('Vui lòng chọn đầy đủ Chi nhánh, Phòng ban và Vị trí trước khi lưu!');
            return;
        }
        onSave(user.employee_code, {
            fullname,
            role: selectedRole,
            dept: selectedDepartment,
            branch_code: selectedBranch
        });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Chỉnh sửa Người dùng</h2>
                    <button onClick={onClose} className={styles.closeButton}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label>Mã Nhân viên</label>
                            <input type="text" value={user.employee_code} readOnly />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Tên đăng nhập</label>
                            <input type="text" value={user.username} disabled />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="edit-fullname">Họ và Tên</label>
                            <input id="edit-fullname" type="text" value={fullname} onChange={e => setFullname(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="edit-branch">Chi nhánh</label>
                            <select id="edit-branch" value={selectedBranch} onChange={handleBranchChange}>
                                <option value="">Chọn chi nhánh</option>
                                {orgData.branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="edit-dept">Phòng ban</label>
                            <select id="edit-dept" value={selectedDepartment} onChange={handleDepartmentChange} disabled={!selectedBranch}>
                                <option value="">Chọn phòng ban</option>
                                {departments.map(department => (
                                    <option key={department.id} value={department.id}>{department.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="edit-role">Vị trí</label>
                            <select id="edit-role" value={selectedRole} onChange={handleRoleChange} disabled={!selectedDepartment}>
                                <option value="">Chọn vị trí</option>
                                {roleOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>Hủy</button>
                        <button type="submit" className={styles.saveButton}>Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Component SortableHeader
const SortableHeader = ({ field, currentSortField, sortDirection, onSort, children }) => {
    const getSortIcon = () => {
        if (currentSortField !== field) {
            // Icon mặc định khi chưa sort - Both arrows (outlined)
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 10L12 6L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 14L12 18L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        }
        
        if (sortDirection === 'asc') {
            // Icon sort tăng dần - Up arrow (outlined)
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 14L12 10L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        } else {
            // Icon sort giảm dần - Down arrow (outlined)
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        }
    };

    return (
        <th 
            className={`${styles.sortableHeader} ${currentSortField === field ? styles.sorted : ''}`}
            onClick={() => onSort(field)}
        >
            <div className={styles.headerContent}>
                <span>{children}</span>
                <span className={styles.sortIcon}>{getSortIcon()}</span>
            </div>
        </th>
    );
};
 // MODAL CẬP NHẬT MẬT KHẨU NGƯỜI DÙNG
const ChangePasswordModal = ({ isOpen, onClose, onSave, user }) => {
        const [newPassword1, setNewPassword1] = useState('');
        const [newPassword2, setNewPassword2] = useState('');

        if (!isOpen) {
            return null;
        }
    
        const handleSubmit = (e) => {
            e.preventDefault();
            if (newPassword1 !== newPassword2) {
                toast.error('Xác nhận mật khẩu không đúng!');
                return;
            }
            onSave(user.employee_code, { newPassword1 });
        };
    
        return (
            <div className={styles.modalBackdrop}>
                <div className={styles.modalContent}>
                    <div className={styles.modalHeader}>
                        <h2>Đổi mật khẩu cho <sapn className={styles.title}>{user.fullname}</sapn></h2>
                        <button onClick={onClose} className={styles.closeButton}>&times;</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Nhập mật khẩu mới</label>
                                <input id="newPassword1" type="password" value={newPassword1} onChange={e => setNewPassword1(e.target.value)} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Xác nhận mật khẩu mới</label>
                                <input id="newPassword2" type="password" value={newPassword2} onChange={e => setNewPassword2(e.target.value)} required />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.cancelButton} onClick={onClose}>Hủy</button>
                            <button type="submit" className={styles.saveButton}>Lưu thay đổi</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'warning'
    });
    const navigate = useNavigate();
    const importFileInputRef = useRef(null);

       // --- THÊM MỚI: State cho modal sửa ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Giả lập việc fetch dữ liệu từ API
    useEffect(() => {
        const fetchCases = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                // Nếu không có token, người dùng chưa đăng nhập, chuyển về trang login
                navigate('/login');
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(API_ENDPOINTS.USERS.LIST, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Không thể tải dữ liệu người dùng.');
                }

                const data = await response.json();
                setUsers(data.users);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCases();
    }, [navigate]);

    // Hàm xử lý sort
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Hàm sort dữ liệu
    const sortUsers = useMemo(() => {
        return (usersToSort) => {
            if (!sortField) return usersToSort;

            return [...usersToSort].sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];
            
            // Xử lý các trường hợp đặc biệt
            if (sortField === 'dept') {
                aVal = getOrgDepartmentName(a.branch_code, a.dept);
                bVal = getOrgDepartmentName(b.branch_code, b.dept);
            }
            
            if (sortField === 'role') {
                const roleMap = {
                    'employee': 'Nhân viên',
                    'manager': 'Trưởng phòng',
                    'deputy_manager': 'Phó phòng',
                    'director': 'Giám đốc',
                    'deputy_director': 'Phó giám đốc',
                    'administrator': 'Administrator'
                };
                aVal = roleMap[aVal] || 'Chưa xác định';
                bVal = roleMap[bVal] || 'Chưa xác định';
            }
            
            if (sortField === 'branch_code') {
                aVal = getOrgBranchName(a.branch_code);
                bVal = getOrgBranchName(b.branch_code);
            }
            
            if (sortField === 'status') {
                aVal = aVal === 'active' ? 'Hoạt động' : 'Vô hiệu hóa';
                bVal = bVal === 'active' ? 'Hoạt động' : 'Vô hiệu hóa';
            }
            
            // Chuyển về string để so sánh
            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();
            
                if (sortDirection === 'asc') {
                    return aVal.localeCompare(bVal);
                } else {
                    return bVal.localeCompare(aVal);
                }
            });
        };
    }, [sortDirection, sortField]);

    const filteredUsers = useMemo(() => {
        setCurrentPage(1);
        let filtered = users;
        
        if (searchTerm) {
            filtered = users.filter(user =>
                user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return sortUsers(filtered);
    }, [users, searchTerm, sortUsers]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    const handleAddUser = async (newUserData) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Không tìm thấy token. Vui lòng đăng nhập lại.');
            return;
        }
        // console.log('Adding new user with data:', newUserData);

        try {
            const response = await fetch(API_ENDPOINTS.USERS.CREATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newUserData)
            });

            const result = await response.json();

            if (!response.ok) {
                // console.error();
                throw new Error(result.message || 'Không thể tạo người dùng.');
            }

            // gọi lại api để cập nhật danh sách người dùng
            const updatedResponse = await fetch(API_ENDPOINTS.USERS.LIST, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const updatedData = await updatedResponse.json();
            setUsers(updatedData.users);

            setIsAddModalOpen(false); // Đóng modal sau khi lưu thành công
            toast.success('Thêm người dùng mới thành công!');

        } catch (error) {
            // console.error('Lỗi khi thêm người dùng:', error);
            toast.error(`Đã xảy ra lỗi: ${error.message}`);
        }
    };

    const handleImportLoans = async (event) => {
        const files = Array.from(event.target.files || []);
        event.target.value = '';
        if (!files.length) return;

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Không tìm thấy token. Vui lòng đăng nhập lại.');
            return;
        }

        try {
            setIsImporting(true);
            const formData = new FormData();
            files.forEach((file) => formData.append('files', file));
            const response = await fetch(API_ENDPOINTS.LOANS.IMPORT_LOANS, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const result = await response.json();
            if (!response.ok) {
                    throw new Error(result.detail?.message || result.detail || 'Không thể import dữ liệu khoản vay.');
            }
            toast.success(`${result.rows_imported} dòng khoản vay đã được lưu.`);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsImporting(false);
        }
    };

    // --- THÊM MỚI: Logic mở modal sửa ---
    const openEditModal = (user) => {
        setCurrentUser(user);
        setIsEditModalOpen(true);
    };

    const handleEditUser = async (userId, updatedData) => {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(API_ENDPOINTS.USERS.UPDATE(userId), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Cập nhật user trong state
                setUsers(previousUsers => previousUsers.map(u =>
                    u.employee_code === userId ? { ...u, ...result.user } : u
                ));
                setIsEditModalOpen(false);
                toast.success('Cập nhật người dùng thành công!');
            } else {
                toast.error(result.detail || result.message || 'Cập nhật thất bại!');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Đã có lỗi xảy ra khi cập nhật!');
        }
    };

    const handleDisableUser = async (userId) => {
        const currentUser = users.find(user => user.employee_code === userId);
        const action = currentUser?.status === 'active' ? 'vô hiệu hóa' : 'kích hoạt';
        const actionText = currentUser?.status === 'active' ? 'vô hiệu hóa' : 'kích hoạt';
        
        setConfirmModal({
            isOpen: true,
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} người dùng`,
            message: `Bạn có chắc chắn muốn ${action} người dùng "${currentUser?.fullname || userId}"?`,
            type: currentUser?.status === 'active' ? 'warning' : 'info',
            onConfirm: async () => {
                const token = localStorage.getItem('token');
                
                try {
                    const response = await fetch(API_ENDPOINTS.USERS.TOGGLE_STATUS(userId), {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const result = await response.json();

                    if (response.ok && result.success) {
                        // Cập nhật user trong state
                        setUsers(users.map(user =>
                            user.employee_code === userId ? { ...user, ...result.user } : user
                        ));
                        toast.success(result.message);
                    } else {
                        toast.error(result.message || `Không thể ${actionText} người dùng!`);
                    }
                } catch (error) {
                    console.error('Error toggling user status:', error);
                    toast.error(`Đã có lỗi xảy ra khi ${actionText} người dùng!`);
                }
                
                setConfirmModal({ isOpen: false });
            },
            onCancel: () => setConfirmModal({ isOpen: false })
        });
    };

    const handleDeleteUser = async (userId) => {
        const userToDelete = users.find(user => user.employee_code === userId);
        
        setConfirmModal({
            isOpen: true,
            title: 'Xóa người dùng',
            message: `Bạn có chắc chắn muốn xóa người dùng "${userToDelete?.fullname || userId}"? Hành động này không thể hoàn tác.`,
            type: 'danger',
            onConfirm: async () => {
                // gọi API để xóa người dùng
                fetch(API_ENDPOINTS.USERS.DELETE(userId), {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Không thể xóa người dùng.');
                        }
                        return response.json();
                    })
                    .then(async () => {
                        // gọi lại api để cập nhật danh sách người dùng
                        const updatedResponse = await fetch(API_ENDPOINTS.USERS.LIST, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        });
                        const updatedData = await updatedResponse.json();
                        setUsers(updatedData.users);
                        toast.success('Xóa người dùng thành công!');
                    })
                    .catch(error => {
                        // console.error('Lỗi khi xóa người dùng:', error);
                        toast.error(`Đã xảy ra lỗi: ${error.message}`);
                    })
            }
        });
    };

    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

    const handleChangePassword = async (userID, data) => {
        try {
            const response = await fetch(API_ENDPOINTS.USERS.CHANGEPASSWORD(userID), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                // console.error();
                throw new Error(result.message || 'Không thể đổi mật khẩu người dùng.');
            }

            setIsChangePasswordModalOpen(false)
            toast.success('Cập nhật mật khẩu thành công!');

        } catch (error) {
            toast.error(`Đã xảy ra lỗi: ${error.message}`);
        }

    };

    const openChangePasswordModal = (user) => {
        setCurrentUser(user);
        setIsChangePasswordModalOpen(true);
    };

    if (isLoading) {
        return <div className={styles.message}>Đang tải danh sách người dùng...</div>;
    }

    if (error) {
        return <div className={`${styles.message} ${styles.error}`}>Lỗi: {error}</div>;
    }

    return (
        <>
            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddUser}
            />
            <EditUserModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditUser}
                user={currentUser}
            />
            <ChangePasswordModal 
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
                onSave={handleChangePassword}
                user={currentUser}
            />

            <div className={styles.userManagementWindow}>
            <div className={styles.pageHeader}>
                <div>
                    <h1>Quản lý Người dùng</h1>
                </div>
                <button className={styles.addButton} onClick={() => setIsAddModalOpen(true)}>
                    + Thêm Người dùng
                </button>
                <input
                    ref={importFileInputRef}
                    className={styles.hiddenFileInput}
                    type="file"
                    accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    multiple
                    onChange={handleImportLoans}
                />
                <button
                    className={styles.importButton}
                    onClick={() => importFileInputRef.current?.click()}
                    disabled={isImporting}
                >
                    {isImporting ? 'Đang import...' : 'Import khoản vay CSV'}
                </button>
            </div>

            <div className={styles.filterBar}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Tìm theo Mã NV, Tên, Tên đăng nhập..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className={styles.tableWrapper}>  
                <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <SortableHeader 
                                    field="employee_code" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Mã Nhân viên
                                </SortableHeader>
                                <SortableHeader 
                                    field="fullname" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Họ và Tên
                                </SortableHeader>
                                <SortableHeader 
                                    field="username" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Tên đăng nhập
                                </SortableHeader>
                                <SortableHeader 
                                    field="dept" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Phòng ban
                                </SortableHeader>
                                <SortableHeader 
                                    field="role" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Chức vụ
                                </SortableHeader>
                                <SortableHeader 
                                    field="branch_code" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Chi nhánh
                                </SortableHeader>
                                <SortableHeader 
                                    field="status" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Trạng thái
                                </SortableHeader>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map(user => (
                                <tr key={user.employee_code}>
                                    <td>{user.employee_code}</td>
                                    <td>{user.fullname}</td>
                                    <td>{user.username}</td>
                                    <td>{getOrgDepartmentName(user.branch_code, user.dept)}</td>
                                    <td>{getRoleNameById(user.branch_code, user.dept, user.role)}</td>
                                    <td>{getOrgBranchName(user.branch_code)}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[user.status]}`}>
                                            {user.status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionCell}>
                                            <button className={styles.actionButton} onClick={() => openEditModal(user)} aria-label="Sửa">
                                            <SvgIcon path="m21.289.98l.59.59c.813.814.69 2.257-.277 3.223L9.435 16.96l-3.942 1.442c-.495.182-.977-.054-1.075-.525a.93.93 0 0 1 .045-.51l1.47-3.976L18.066 1.257c.967-.966 2.41-1.09 3.223-.276zM8.904 2.19a1 1 0 1 1 0 2h-4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4a1 1 0 0 1 2 0v4a4 4 0 0 1-4 4h-12a4 4 0 0 1-4-4v-12a4 4 0 0 1 4-4z" />
                                            </button>
                                            <button className={`${styles.actionButton} ${styles.disable}`} onClick={() => handleDisableUser(user.employee_code)} aria-label={user.status === 'active' ? "Vô hiệu hóa": "Kích hoạt" }>
                                                {user.status === 'active' ? <SvgIcon path="M10 4a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4a4 4 0 0 0-4-4m7.5 9C15 13 13 15 13 17.5s2 4.5 4.5 4.5s4.5-2 4.5-4.5s-2-4.5-4.5-4.5M10 14c-4.42 0-8 1.79-8 4v2h9.5a6.5 6.5 0 0 1-.5-2.5a6.5 6.5 0 0 1 .95-3.36c-.63-.08-1.27-.14-1.95-.14m7.5.5c1.66 0 3 1.34 3 3c0 .56-.15 1.08-.42 1.5L16 14.92c.42-.27.94-.42 1.5-.42M14.92 16L19 20.08c-.42.27-.94.42-1.5.42c-1.66 0-3-1.34-3-3c0-.56.15-1.08.42-1.5" /> : <SvgIcon path="M12 4a4 4 0 1 0 0 8a4 4 0 0 0 0-8m-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4z" />}
                                            </button>
                                            <button className={`${styles.actionButton} ${styles.changepassword}`} onClick={() => openChangePasswordModal(user)} aria-label="Đổi MK">
                                                <SvgIcon path="m13.815 14.632l-4.031 4.031H7.115v2.668H4.447v2.668H0v-4.447l9.368-9.368a7.4 7.4 0 0 1-.474-2.632a7.554 7.554 0 1 1 4.869 7.062zm7.532-9.31v-.003a2.668 2.668 0 1 0-2.669 2.668h.001a2.67 2.67 0 0 0 2.668-2.665" />
                                            </button>
                                            <button className={`${styles.actionButton} ${styles.delete}`} onClick={() => handleDeleteUser(user.employee_code)} aria-label="Xóa">
                                                <SvgIcon path="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z" />
                                            </button>
                                        </div>
                                        
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                    
                <div className={styles.paginationContainer}>
                    <div className={styles.rowsPerPageSelector}>
                        <span>Hiển thị:</span>
                        <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                            <option value={5}>5 dòng</option>
                            <option value={10}>10 dòng</option>
                            <option value={15}>15 dòng</option>
                        </select>
                    </div>
                    <div className={styles.pageInfo}>
                        Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} trên tổng số {filteredUsers.length} người dùng
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
            
            </div>
            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
            />
        </>
    );
}export default UserManagement;