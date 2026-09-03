import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { axiosClient } from "../AxiosClient/axios";
import { loginFailure, loginStart, setUser, logout } from "../Store/UserSlice";

// Create Authentication Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);
    const [initialCheckDone, setInitialCheckDone] = useState(false);

    const verifyToken = async () => {
        try {
            dispatch(loginStart());
            const res = await axiosClient.get("/api/user/profile", { withCredentials: true });
            dispatch(setUser(res.data));
        } catch (err) {
            dispatch(loginFailure(err.response?.status || 500));
        } finally {
            setLoading(false);
            setInitialCheckDone(true);
        }
    };

    const logoutUser = async () => {
        try {
            await axiosClient.post(
                '/api/auth/logout',
                {},
                {
                    withCredentials: true,
                }
            );
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Always clear state and localStorage, even if API call fails
            dispatch(logout());
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("redirectAfterLogin");
        }
    };

    useEffect(() => {
        // Quick check for token existence before making API call
        const hasToken = document.cookie.includes('accessToken') ||
            localStorage.getItem('accessToken');

        if (!hasToken) {
            // No token, skip verification and render immediately
            setLoading(false);
            setInitialCheckDone(true);
            dispatch(loginFailure(401));
        } else {
            // Token exists, verify it
            verifyToken();
        }
    }, []);

    // For public routes, don't block rendering
    // Only show loader for protected routes after initial check
    const shouldShowLoader = loading && !initialCheckDone;

    return (
        <AuthContext.Provider value={{ user, loading, logout: logoutUser }}>
            {shouldShowLoader ? (
                <div className="w-full h-screen flex justify-center items-center">
                    <div className="w-10 h-10 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

// Custom hook for consuming AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};
