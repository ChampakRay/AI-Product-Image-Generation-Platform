import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import api from "../api/axios";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(() => {
        return Boolean(
            localStorage.getItem("auth_token")
        );
    });

    useEffect(() => {
        const token =
            localStorage.getItem("auth_token");

        // If there is no token, loading is already
        // initialized as false, so there is nothing
        // else to do.
        if (!token) {
            return;
        }

        api.get("/me")
            .then((response) => {
                setUser(response.data.user);
            })
            .catch(() => {
                localStorage.removeItem(
                    "auth_token"
                );

                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const register = async (data) => {
        const response = await api.post(
            "/register",
            data
        );

        localStorage.setItem(
            "auth_token",
            response.data.token
        );

        setUser(response.data.user);

        return response.data;
    };

    const login = async (data) => {
        const response = await api.post(
            "/login",
            data
        );

        localStorage.setItem(
            "auth_token",
            response.data.token
        );

        setUser(response.data.user);

        return response.data;
    };

    const logout = async () => {
        try {
            await api.post("/logout");
        } finally {
            localStorage.removeItem(
                "auth_token"
            );

            setUser(null);
        }
    };

    const value = {
        user,
        setUser,
        loading,
        register,
        login,
        logout,
        isAuthenticated: Boolean(user),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}