import axios from "axios";
import { getCookie } from "@/utils/cookies";
import { store } from "@/redux/store";
import { logoutUser } from "@/redux/slices/authSlice";

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = getCookie("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const url = error.config?.url || "";
        const isAuthEndpoint = 
            url.includes("/users/login") || 
            url.includes("/users/verify-otp") || 
            url.includes("/users/verify-reset-otp") || 
            url.includes("/users/reset-password");

        // Handle 401 Unauthorized responses to clean up expired sessions (skip for auth-initiation routes)
        if (error.response && error.response.status === 401 && !isAuthEndpoint) {
            store.dispatch(logoutUser());
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
