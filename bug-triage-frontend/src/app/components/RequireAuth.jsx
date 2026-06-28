import { Navigate } from "react-router";
import { getCurrentUser, getToken } from "../utils/auth";

export function RequireAuth({ children, allowedRole }) {
    const token = getToken();
    const user = getCurrentUser();

    // Nếu không có token -> Bắt đăng nhập
    if (!token || !user) {
        return <Navigate to="/" replace />;
    }

    // Nếu cố tình vào URL của role khác -> Đẩy về trang chủ của họ
    if (allowedRole && user.role !== allowedRole) {
        if (user.role === "ROLE_MANAGER") {
            return <Navigate to="/manager" replace />;
        } else {
            return <Navigate to="/developer" replace />;
        }
    }

    return children;
}
