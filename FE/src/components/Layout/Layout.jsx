import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { API_ENDPOINTS } from '../../config/api';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import React from 'react';
import styles from './Layout.module.css';
import toast from 'react-hot-toast';
import blaLogo from '../../assets/BLA.svg';

// Component SVG Icon để tái sử dụng
const SvgIcon = ({ path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
    </svg>
);

const ChangePasswordModal = ({ isOpen, onClose, onSave, user }) => {
        const [oldPassword, setOldPassword] = useState('');
        const [newPassword1, setNewPassword1] = useState('');
        const [newPassword2, setNewPassword2] = useState('');
        const saveBtnRef = useRef(null);

        // lock body scroll and autofocus when modal opens
        useEffect(() => {
            if (isOpen) {
                // lock scroll
                document.body.style.overflow = 'hidden';
                // focus save button after a tick
                setTimeout(() => {
                    if (saveBtnRef.current) saveBtnRef.current.focus();
                }, 0);
            } else {
                document.body.style.overflow = '';
            }
            return () => { document.body.style.overflow = ''; };
        }, [isOpen]);

        if (!isOpen) {
            return null;
        }

        const handleSubmit = (e) => {
            e.preventDefault();
            if (newPassword1 !== newPassword2) {
                toast.error('Xác nhận mật khẩu không đúng!');
                return;
            }
            onSave(user.employee_code, {oldPassword, newPassword1});
        };

        return (
            <div className={styles.modalBackdrop}>
                <div className={styles.modalContent}>
                    <div className={styles.modalHeader}>
                        <h2>Đổi mật khẩu</h2>
                        <button onClick={onClose} className={styles.closeButton} aria-label="Đóng">&times;</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label htmlFor="oldPassword">Nhập mật khẩu cũ</label>
                                <input id="oldPassword" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="newPassword1">Nhập mật khẩu mới</label>
                                <input id="newPassword1" type="password" value={newPassword1} onChange={e => setNewPassword1(e.target.value)} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="newPassword2">Xác nhận mật khẩu mới</label>
                                <input id="newPassword2" type="password" value={newPassword2} onChange={e => setNewPassword2(e.target.value)} required />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.cancelButton} onClick={onClose}>Hủy</button>
                            <button type="submit" ref={saveBtnRef} className={styles.saveButton}>Lưu thay đổi</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

function Layout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [conversations, setConversations] = useState([]);
    // error state removed (not used); errors are logged to console/toast
    const [openMenuId, setOpenMenuId] = useState(null); // id conversation có menu đang mở

    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'warning'
    });
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        const fetchConver = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                // Nếu không có token, người dùng chưa đăng nhập, chuyển về trang login
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(API_ENDPOINTS.CONVERSATIONS.LIST, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Không thể tải danh sách đoạn chat!');
                }

                const data = await response.json();
                let convers = data.convers || [];

                // Sắp xếp theo thời gian mới nhất 
                // convers = convers.sort((a, b) => new Date(b.create_time) - new Date(a.create_time));
                

                if (convers.length > 0 && (window.location.pathname === '/chatbot_NB/:conversationId')) {
                    navigate(`/chatbot_NB/${convers[0].id}`);
                }

                setConversations(convers);

            } catch (err) {
                console.error('Error creating chat:', err);
            };
        }
        fetchConver();

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        const handleOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleOutside);

        // Thêm event listener khi menu mở
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Dọn dẹp event listener khi component unmount hoặc menu đóng
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('mousedown', handleOutside);
        };
    }, [isMenuOpen, navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            window.location.replace('/login');
            navigate('/login');
        }
        const decodedUser = jwtDecode(token);

        if (decodedUser) {
            setUser({
                name: decodedUser.fullname || 'Cán bộ',
                // human friendly role for display
                role: decodedUser.role === 'employee' ? 'Nhân viên'
                    : decodedUser.role === 'administrator' ? 'Quản trị viên'
                        : decodedUser.role === 'manager' ? 'Trưởng phòng'
                            : 'Người dùng',
                // keep the raw role code for permission checks
                role_code: decodedUser.role,
                employee_code: decodedUser.sub,
                dept: decodedUser.dept,
            });
        }
    }, [navigate]);

    useEffect(() => {
        if (editingId && inputRef.current) {
        try {
            // focus then select all text so user can immediately type to replace
            inputRef.current.focus();
            if (typeof inputRef.current.select === 'function') {
                inputRef.current.select();
            } else if (typeof inputRef.current.setSelectionRange === 'function') {
                inputRef.current.setSelectionRange(0, inputRef.current.value ? inputRef.current.value.length : 0);
            }
        } catch {
            // ignore if DOM not ready or selection not supported
        }
        }
    }, [editingId]);

    const startEditing = (conver) => {
        setOpenMenuId(null);
        setEditingId(conver.id);
        setEditValue(conver.title || '');
    };

    const openMenu = (id) => (e) => {
        e.stopPropagation();
        e.preventDefault();
        setOpenMenuId(prev => (prev === id ? null : id));
    };

    const saveTitle = async (conver, newTitle) => {
        const trimmed = newTitle.trim();
        if (!trimmed) {
        toast.error('Tên không được để trống');
        return;
        }

        try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_ENDPOINTS.CONVERSATIONS.UPDATE(conver.id), {
            method: 'PATCH',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ 
                id: conver.id,
                title: trimmed
            }),
        });

        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json.message || 'Lỗi khi cập nhật');
        }

        // Cập nhật danh sách local
        setConversations(prev =>
            prev.map(c => (c.id === conver.id ? { ...c, title: trimmed } : c))
        );
        toast.success('Đổi tên thành công!');
        } catch (error) {
        console.error(error);
        toast.error('Không thể lưu tên mới.');
        } finally {
        setEditingId(null);
        }
    };

    const handleKeyDown = (e, conver) => {
        if (e.key === 'Enter') {
        e.preventDefault();
        saveTitle(conver, editValue);
        } else if (e.key === 'Escape') {
        setEditingId(null);
        }
    };

  const handleBlur = (conver) => {
        saveTitle(conver, editValue);
    };

  const handleMouseOut = () => {
    setOpenMenuId(null);
    setMenuOpen(false);
  }

  const handleDelete = async (conver) => {
      setOpenMenuId(null);
      // use the passed conversation directly (previous find was incorrect)
      const converToDelete = conver;

        setConfirmModal({
            isOpen: true,
            title: 'Xóa đoạn chat',
            message: `Bạn có chắc chắn muốn xóa đoạn chat "${converToDelete?.title || conver.id}"? Hành động này không thể hoàn tác.`,
            type: 'danger',
            onConfirm: async () => {
                // gọi API để xóa người dùng
                fetch(API_ENDPOINTS.CONVERSATIONS.DELETE(conver.id), {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Không thể xóa đoạn chat.');
                        }
                        return response.json();
                    })
                    .then(async () => {
                        // gọi lại api để cập nhật danh sách đoạn chat
                        const updatedResponse = await fetch(API_ENDPOINTS.CONVERSATIONS.LIST, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        });
                        const updatedData = await updatedResponse.json();
                        setConversations(updatedData.convers);

                        // If the deleted conversation is currently open in the chat view,
                        // navigate to the first available conversation (or the base chat route)
                        try {
                            const currentPath = window.location.pathname || '';
                            const deletedPath = `/chatbot_NB/${conver.id}`;
                            if (currentPath === deletedPath) {
                                if (Array.isArray(updatedData.convers) && updatedData.convers.length > 0) {
                                    navigate(`/chatbot_NB/${updatedData.convers[0].id}`);
                                } else {
                                    navigate('/chatbot_NB/:conversationId');
                                }
                            }
                        } catch (e) {
                            // navigation failure shouldn't block deletion flow
                            console.warn('Navigation after delete failed', e);
                        }

                        toast.success('Xóa đoạn chat thành công!');
                    })
                    .catch(error => {
                        // console.error('Lỗi khi xóa đoạn chat:', error);
                        toast.error(`Đã xảy ra lỗi: ${error.message}`);
                    })
            }
        });
    };

    const [currentUser, setCurrentUser] = useState(null);
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

    const handleLogout = (event) => {
        event.preventDefault();
        localStorage.removeItem('token'); // Xóa token
        navigate('/login', { replace: true }); // Chuyển về trang đăng nhập và thay thế lịch sử
        toast.success('Bạn đã đăng xuất thành công!');
    };

    const openChangePasswordModal = (user) => {
        setCurrentUser(user);
        setIsChangePasswordModalOpen(true);
    };

    const handleAddConversations = async (event) => {
        
        if (event && event.preventDefault) event.preventDefault();

        if (isCreatingChat) return; // tránh click nhiều lần

        try {
            setIsCreatingChat(true);
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Vui lòng đăng nhập trước khi tạo đoạn chat mới.');
                navigate('/login');
                return;
            }

            // Gọi API tạo đoạn chat mới
            const response = await fetch(API_ENDPOINTS.CONVERSATIONS.CREATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                // nếu muốn gửi payload (ví dụ title) gọi ở body, thêm ở đây:
                 body: JSON.stringify({ 
                    user_id: user.employee_code,
                    title: 'Đoạn chat mới',
                    status: 'active',
                    create_time: new Date().toISOString()

                 })
            });

            const result = await response.json();

            if (!response.ok) {
                // nếu backend trả về lỗi, show message nếu có
                throw new Error(result.message || 'Không thể tạo đoạn chat mới.');
            }

            // gọi lại api để cập nhật danh sách conversation
            const updatedConver = await fetch(API_ENDPOINTS.CONVERSATIONS.LIST, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const updatedData = await updatedConver.json();
            setConversations(updatedData.convers);

            navigate(`/chatbot_NB/${result.conver.newConver.id}`);

        } catch (error) {
            console.error('Error creating chat:', error);
            toast.error(`Lỗi khi tạo đoạn chat: ${error.message || error}`);
        } finally {
            setIsCreatingChat(false);
        }
    }

    return (
        <>
            <ChangePasswordModal 
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
                onSave={handleChangePassword}
                user={currentUser}
            />

            <div className={styles.appContainer}>
                {/* Mobile hamburger button (shown only on small screens via CSS) */}
                <button
                    className={`${styles.mobileHamburger} ${isSidebarOpen ? styles.hamburgerShifted : ''}`}
                    aria-label={isSidebarOpen ? 'Đóng menu' : 'Mở menu'}
                    aria-expanded={isSidebarOpen}
                    onClick={() => setSidebarOpen(prev => !prev)}
                >
                    {isSidebarOpen ? (
                        // X / close icon
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
                            <path fill="currentColor" d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.89 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z" />
                        </svg>
                    ) : (
                        // hamburger icon
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true">
                            <path fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M2 4h12M2 8h12M2 12h12"></path>
                        </svg>
                    )}
                </button>

                <aside className={`${styles.appSidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
                    <div className={styles.logo}>
                        <img src={blaLogo} alt="BLA Logo" />
                    </div>
                    <nav className={styles.sidebarCenter}>
                        <ul className={styles.navList}>
                            <li className={styles.navList_li}>
                                <NavLink
                                    to="/loans"
                                    className={({ isActive }) => isActive ? styles.active : ''}
                                    onClick={() => {
                                        setSidebarOpen(false);
                                        setOpenMenuId(null);
                                        try { navigate('/loans'); } catch { /* ignore */ }
                                    }}
                                    onTouchStart={(e) => {
                                        if (e && e.preventDefault) e.preventDefault();
                                        setSidebarOpen(false);
                                        setOpenMenuId(null);
                                        try { navigate('/loans'); } catch { /* ignore */ }
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
                                        <path d="M0 0h24v24H0z" fill="none" />
                                        <path fill="currentColor" d="M6.5 7.5a5.5 5.5 0 1 1 11 0a5.5 5.5 0 0 1-11 0M3 19a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v3H3z" />
                                    </svg>
                                    <span>Quản lý khoản vay</span>
                                </NavLink>
                            </li>

                            <li className={styles.navList_li}>
                                <NavLink
                                    to="/createWord"
                                    className={({ isActive }) => isActive ? styles.active : ''}
                                    onClick={() => {
                                        setSidebarOpen(false);
                                        setOpenMenuId(null);
                                        try { navigate('/createWord'); } catch { /* ignore */ }
                                    }}
                                    onTouchStart={(e) => {
                                        if (e && e.preventDefault) e.preventDefault();
                                        setSidebarOpen(false);
                                        setOpenMenuId(null);
                                        try { navigate('/createWord'); } catch { /* ignore */ }
                                    }}
                                >
                                   <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 36 36">
                                        <path d="M0 0h36v36H0z" fill="none" />
                                        <path fill="currentColor" d="M21 12H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1M8 10h12V7.94H8Z" class="clr-i-outline clr-i-outline-path-1" />
                                        <path fill="currentColor" d="M21 14.08H7a1 1 0 0 0-1 1V19a1 1 0 0 0 1 1h11.36L22 16.3v-1.22a1 1 0 0 0-1-1M20 18H8v-2h12Z" class="clr-i-outline clr-i-outline-path-2" />
                                        <path fill="currentColor" d="M11.06 31.51v-.06l.32-1.39H4V4h20v10.25l2-1.89V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v28a1 1 0 0 0 1 1h8a3.4 3.4 0 0 1 .06-.49" class="clr-i-outline clr-i-outline-path-3" />
                                        <path fill="currentColor" d="m22 19.17l-.78.79a1 1 0 0 0 .78-.79" class="clr-i-outline clr-i-outline-path-4" />
                                        <path fill="currentColor" d="M6 26.94a1 1 0 0 0 1 1h4.84l.3-1.3l.13-.55v-.05H8V24h6.34l2-2H7a1 1 0 0 0-1 1Z" class="clr-i-outline clr-i-outline-path-5" />
                                        <path fill="currentColor" d="m33.49 16.67l-3.37-3.37a1.61 1.61 0 0 0-2.28 0L14.13 27.09L13 31.9a1.61 1.61 0 0 0 1.26 1.9a1.6 1.6 0 0 0 .31 0a1.2 1.2 0 0 0 .37 0l4.85-1.07L33.49 19a1.6 1.6 0 0 0 0-2.27ZM18.77 30.91l-3.66.81l.89-3.63L26.28 17.7l2.82 2.82Zm11.46-11.52l-2.82-2.82L29 15l2.84 2.84Z" class="clr-i-outline clr-i-outline-path-6" />
                                        <path fill="none" d="M0 0h36v36H0z" />
                                    </svg>
                                    <span>Tạo mẫu biểu</span>
                                </NavLink>
                            </li>
                        </ul>
                        <ul className={styles.navList} style={{ display: 'none' }}>
                            <li className={styles.navList_li}>
                                {conversations.map(conver => (
                                        <div key={conver.id} className={styles.navItemWrapper} onMouseLeave={handleMouseOut}>
                                            {/* Ensure touch/click on mobile immediately navigates and closes sidebar */}
                                            <NavLink
                                                to={`/chatbot_NB/${conver.id}`}
                                                className={({ isActive }) => isActive ? `${styles.active} ${styles.navList_jus}` : styles.navList_jus}
                                                onClick={() => {
                                                    // defensive navigate in case touch behavior is intercepted by overlay
                                                    try { navigate(`/chatbot_NB/${conver.id}`); } catch { /* ignore */ }
                                                }}
                                                onTouchStart={(e) => {
                                                    // Prevent default touch behavior and navigate immediately
                                                    if (e && e.preventDefault) e.preventDefault();
                                                    try { navigate(`/chatbot_NB/${conver.id}`); } catch { /* ignore */ }
                                                }}
                                            >

                                            {editingId === conver.id ? (
                                                <input ref={inputRef} type="text" className={styles.editInput} value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => handleKeyDown(e, conver)} onBlur={() => handleBlur(conver)}/>
                                            ) : (
                                                <span className={styles.navTitle}>{conver.title}</span>
                                            )}

                                            <div className={styles.ellipsisWrapper} onClick={openMenu(conver.id)} aria-haspopup="true" aria-expanded={openMenuId === conver.id} title="Tùy chọn">
                                                <button className={styles.ellipsisBtn} aria-label="Tùy chọn">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="1em"height="1em">
                                                        <path fill="currentColor" d="M6 10a2 2 0 1 1-4 0a2 2 0 0 1 4 0m6 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0m4 2a2 2 0 1 0 0-4a2 2 0 0 0 0 4"></path>
                                                    </svg>

                                                </button>

                                                {/* popup menu */}
                                                {openMenuId === conver.id && (
                                                    <div ref={menuRef} className={styles.menuPop}>
                                                        <button className={styles.menuItem} onClick={() => startEditing(conver)}>
                                                            <SvgIcon path="M5 8a4 4 0 1 1 7.796 1.263l-2.533 2.534A4 4 0 0 1 5 8m4.06 5H7a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h2.172a3 3 0 0 1-.114-1.588l.674-3.372a3 3 0 0 1 .82-1.533zm9.032-5a2.9 2.9 0 0 0-2.056.852L9.967 14.92a1 1 0 0 0-.273.51l-.675 3.373a1 1 0 0 0 1.177 1.177l3.372-.675a1 1 0 0 0 .511-.273l6.07-6.07a2.91 2.91 0 0 0-.944-4.742A2.9 2.9 0 0 0 18.092 8" />
                                                            <span className={styles.sidebarSpanStrong}>Đổi tên</span>
                                                        </button>
                                                        <button className={styles.menuItemDanger} onClick={() => handleDelete(conver)}>
                                                            <SvgIcon path="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z" />
                                                            <span className={styles.sidebarSpanStrong}>Xóa</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </NavLink>
                                    </div>
                                ))}
                                
                            </li>
                        </ul>
                    </nav>

                    <nav className={styles.sidebarNav} onMouseLeave={handleMouseOut}>
                        <div className={styles.navBtn} ref={menuRef} onClick={() => setMenuOpen(prev => !prev)}>
                            <span className={styles.sidebarSpan}>
                                <SvgIcon path="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m0 18.5a8.5 8.5 0 1 1 .001-17.001A8.5 8.5 0 0 1 12 20.5m0-8c-3.038 0-5.5 1.728-5.5 3.5s2.462 3.5 5.5 3.5s5.5-1.728 5.5-3.5s-2.462-3.5-5.5-3.5m0-.5a3 3 0 1 0 0-6a3 3 0 0 0 0 6" />
                                <strong className={styles.sidebarSpanStrong}>{user ? user.name : '...'}</strong>
                            </span>
                            {isMenuOpen && (
                                <div className={styles.dropdownContent}>
                                    <a onClick={() => openChangePasswordModal(user)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="1em" height="1em" >
                                                <path fill="currentColor" d="M21 2a8.998 8.998 0 0 0-8.612 11.612L2 24v6h6l10.388-10.388A9 9 0 1 0 21 2m0 16a7 7 0 0 1-2.032-.302l-1.147-.348l-.847.847l-3.181 3.181L12.414 20L11 21.414l1.379 1.379l-1.586 1.586L9.414 23L8 24.414l1.379 1.379L7.172 28H4v-3.172l9.802-9.802l.848-.847l-.348-1.147A7 7 0 1 1 21 18"></path>
                                                <circle cx="22" cy="10" r="2" fill="currentColor"></circle>
                                            </svg>
                                        <span className={styles.sidebarSpanStrong}>Đổi mật khẩu</span>
                                    </a>
                                    <a onClick={handleLogout}>
                                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em">
                                            <g className="logout-outline">
                                                <g fill="currentColor" fillRule="evenodd" className="Vector" clipRule="evenodd">
                                                    <path d="M3 7a5 5 0 0 1 5-5h5a1 1 0 1 1 0 2H8a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h5a1 1 0 1 1 0 2H8a5 5 0 0 1-5-5z"></path>
                                                    <path d="M14.47 7.316a1 1 0 0 1 1.414-.046l4.8 4.5a1 1 0 0 1 0 1.46l-4.8 4.5a1 1 0 1 1-1.368-1.46l2.955-2.77H8a1 1 0 1 1 0-2h9.471l-2.955-2.77a1 1 0 0 1-.046-1.414"></path>
                                                </g>
                                            </g>
                                        </svg>
                                        <span className={styles.sidebarSpanStrong}>Đăng xuất</span>
                                    </a>
                                </div>
                            )}
                        </div>
                    </nav>
                </aside>

                <div className={styles.mainWrapper}>
                    {/* overlay that darkens content when sidebar is open on mobile */}
                    <div
                        className={`${styles.overlay} ${isSidebarOpen ? styles.overlayVisible : ''}`}
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden={isSidebarOpen ? 'false' : 'true'}
                    />
                    <main className={styles.mainContent}>
                        {React.cloneElement(children, { setConversations })}
                    </main>
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
}

export default Layout;