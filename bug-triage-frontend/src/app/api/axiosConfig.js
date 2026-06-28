import axios from "axios";
import { getToken, logout } from "../utils/auth";

const axiosInstance = axios.create({
    //URL BE Spring Boot
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor để thêm token vào mỗi request
// Interceptor để thêm token vào mỗi request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
            console.log("Axios sending token:", token.substring(0, 20) + "...");
        } else {
            console.log("Axios sending request WITHOUT token!");
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Interceptor để xử lý khi token het han
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            logout();
            // Chuyển hướng về trang login
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
