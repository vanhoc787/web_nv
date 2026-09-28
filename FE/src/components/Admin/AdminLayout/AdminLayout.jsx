import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './AdminLayout.module.css';
import { jwtDecode } from "jwt-decode";
import logo from '../../../assets/LogoBLA.png';
import { toast } from 'react-hot-toast';

const SvgIcon = ({ path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
    </svg>
);


function AdminLayout({ children }) {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token'); // Sử dụng key 'token' nhất quán
        if (token) {
            const decodedUser = jwtDecode(token);
            setUser({ name: decodedUser.username || 'Administrator' });
        } else {
            // Nếu không có token, quay về trang đăng nhập
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = (event) => {
        event.preventDefault();
        localStorage.removeItem('token');
        toast.success("Đăng xuất thành công!");
        navigate('/login', { replace: true }); // Chuyển về trang đăng nhập và thay thế lịch sử
    };

    return (
        // Cấu trúc layout chính đã được cập nhật
        <div className={styles.appContainer}>
            <header className={styles.appHeader}>
                <div className={styles.logoImage}>
                    <img src={logo} alt="BLA Logo" />
                </div>
                <div className={styles.userMenu} onBlur={() => setMenuOpen(false)} tabIndex="0">
                    <span onClick={() => setMenuOpen(!isMenuOpen)}>
                        <strong>{user ? user.name : '...'}</strong> ▾
                    </span>
                    {isMenuOpen && (
                        <div className={styles.dropdownContent}>
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
            </header>
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}

export default AdminLayout;