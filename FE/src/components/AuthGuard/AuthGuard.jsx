import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthGuard = ({ children, redirectTo = '/login', requireAuth = true }) => {
    const token = localStorage.getItem('token');
    let isAuthenticated = false;
    let userRole = null;
    let userDept = null;

    if (token) {
        try {
            const decoded = jwtDecode(token);
            // Kiểm tra token còn hạn không
            const currentTime = Date.now() / 1000;
            if (decoded.exp > currentTime) {
                isAuthenticated = true;
                userRole = decoded.role;
                userDept = decoded.dept;
            } else {
                // Token hết hạn, xóa khỏi localStorage
                localStorage.removeItem('token');
            }
        } catch (error) {
            // Token không hợp lệ, xóa khỏi localStorage
            localStorage.removeItem('token');
        }
    }

    // Ngăn người dùng sử dụng nút back sau khi đăng nhập
    useEffect(() => {
        if (isAuthenticated && !requireAuth) {
            // Nếu đã đăng nhập mà cố gắng truy cập trang login
            // Thêm một entry vào history để ngăn back
            window.history.pushState(null, "", window.location.href);
            
            const handlePopState = () => {
                window.history.pushState(null, "", window.location.href);
            };
            
            window.addEventListener('popstate', handlePopState);
            
            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [isAuthenticated, requireAuth]);

    // Nếu yêu cầu xác thực nhưng chưa đăng nhập
    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Nếu không yêu cầu xác thực (trang login) nhưng đã đăng nhập
    if (!requireAuth && isAuthenticated) {
        // Chuyển hướng dựa trên role
        if (userRole === 'ADMIN') {
            return <Navigate to="/admin" replace />;
        }

        // if (userDept === 'KH&QLRR') {
        //     return <Navigate to="/dashboard" replace />;
        // }
        // if (userRole === 'employee') {
        //     return <Navigate to="/my-cases" replace />;
        // }
        // if (userRole === 'deputy_director' || userRole === 'director' || userRole === 'BGĐ') {
        //     return <Navigate to="/director-dashboard" replace />;
        // }
        // if (userRole === 'manager' || userRole === 'deputy_manager') {
        //     return <Navigate to="/import" replace />;
        // }
        // Mặc định về dashboard
        //return <Navigate to="/chatbot_NB/:conversationId" replace />;
        return <Navigate to="/loans" replace />;
    }

    return children;
};

export default AuthGuard;
