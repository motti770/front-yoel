/**
 * Authentication Context
 * Manages user authentication state across the app
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            const savedUser = authService.getCurrentUser();
            if (savedUser && authService.isAuthenticated()) {
                try {
                    // Verify token is still valid
                    const result = await authService.getMe();
                    if (result.success) {
                        setUser(result.data.user);
                    } else {
                        authService.logout();
                    }
                } catch (err) {
                    authService.logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        setError(null);
        try {
            const result = await authService.login(email, password);
            if (result.success) {
                setUser(result.data.user);
                return { success: true };
            }
            setError(result.error?.message || 'Login failed');
            return { success: false, error: result.error };
        } catch (err) {
            const errorMsg = err.error?.message || 'Login failed';
            setError(errorMsg);
            return { success: false, error: { message: errorMsg } };
        }
    };

    const register = async (userData) => {
        setError(null);
        try {
            const result = await authService.register(userData);
            if (result.success) {
                setUser(result.data.user);
                return { success: true };
            }
            setError(result.error?.message || 'Registration failed');
            return { success: false, error: result.error };
        } catch (err) {
            const errorMsg = err.error?.message || 'Registration failed';
            setError(errorMsg);
            return { success: false, error: { message: errorMsg } };
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        clearError: () => setError(null)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
