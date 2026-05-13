import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';

interface AuthContextType {
    isAuthenticated: boolean;
    isAdmin: boolean;
    isEmployer: boolean;
    userEmail: string | null;
    userRole: string | null;
    companyName: string | null;
    login: (
        accessToken: string,
        refreshToken: string,
        isAdmin: boolean,
        userEmail?: string | null,
        userRole?: string | null,
        companyName?: string | null,
    ) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [companyName, setCompanyName] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const adminStatus = localStorage.getItem('is_admin') === 'true';
        const storedEmail = localStorage.getItem('current_user_email');
        const storedRole = localStorage.getItem('current_user_role');
        const storedCompany = localStorage.getItem('current_company_name');
        if (token) {
            setIsAuthenticated(true);
            setIsAdmin(adminStatus);
            setUserEmail(storedEmail);
            setUserRole(storedRole);
            setCompanyName(storedCompany);
        }
        setLoading(false);
    }, []);

    const login = (
        accessToken: string,
        refreshToken: string,
        adminStatus: boolean,
        email?: string | null,
        role?: string | null,
        company?: string | null,
    ) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('is_admin', adminStatus ? 'true' : 'false');
        if (email) {
            localStorage.setItem('current_user_email', email);
            setUserEmail(email);
        }
        if (role) {
            localStorage.setItem('current_user_role', role);
            setUserRole(role);
        } else {
            localStorage.removeItem('current_user_role');
            setUserRole(null);
        }
        if (company) {
            localStorage.setItem('current_company_name', company);
            setCompanyName(company);
        } else {
            localStorage.removeItem('current_company_name');
            setCompanyName(null);
        }
        setIsAuthenticated(true);
        setIsAdmin(adminStatus);

        // Sync with browser extension
        window.postMessage({
            type: 'JOBAI_AUTH_TOKEN',
            token: accessToken
        }, window.location.origin);
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
            localStorage.removeItem('current_user_email');
            localStorage.removeItem('current_user_role');
            localStorage.removeItem('current_company_name');
            setIsAuthenticated(false);
            setIsAdmin(false);
            setUserEmail(null);
            setUserRole(null);
            setCompanyName(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isAdmin,
                isEmployer: userRole === 'employer',
                userEmail,
                userRole,
                companyName,
                login,
                logout,
                loading,
            }}
        >
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
