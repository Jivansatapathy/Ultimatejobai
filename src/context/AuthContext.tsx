import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';

interface AuthContextType {
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (accessToken: string, refreshToken: string, isAdmin: boolean) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const adminStatus = localStorage.getItem('is_admin') === 'true';
        if (token) {
            setIsAuthenticated(true);
            setIsAdmin(adminStatus);
        }
        setLoading(false);
    }, []);

    const login = (accessToken: string, refreshToken: string, adminStatus: boolean) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('is_admin', adminStatus ? 'true' : 'false');
        setIsAuthenticated(true);
        setIsAdmin(adminStatus);
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                await api.post('/api/auth/logout/', { refresh: refreshToken });
            }
        } catch (error) {
            console.error("Logout failed at backend:", error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('is_admin');
            setIsAuthenticated(false);
            setIsAdmin(false);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
