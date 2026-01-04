/**
 * Auth Service
 * Handles authentication operations
 */

import api, { MOCK_MODE } from './config';

export const authService = {
    login: async (email, password) => {
        if (MOCK_MODE) {
            // Mock login - always succeed
            const mockUser = {
                id: '1',
                email: email,
                firstName: 'יואל',
                lastName: 'אדמין',
                role: 'ADMIN',
                department: 'ניהול',
                avatar: 'יא'
            };
            const mockToken = 'mock-token-' + Date.now();
            localStorage.setItem('authToken', mockToken);
            localStorage.setItem('user', JSON.stringify(mockUser));
            return {
                success: true,
                data: {
                    token: mockToken,
                    user: mockUser
                }
            };
        }
        const result = await api.post('/auth/login', { email, password });
        if (result.success && result.data) {
            localStorage.setItem('authToken', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
        }
        return result;
    },

    register: async (userData) => {
        const result = await api.post('/auth/register', userData);
        if (result.success && result.data) {
            localStorage.setItem('authToken', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
        }
        return result;
    },

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },

    getMe: async () => {
        if (MOCK_MODE) {
            // Return mock user when backend is down
            return {
                success: true,
                data: {
                    id: '1',
                    email: 'admin@yoel.com',
                    firstName: 'יואל',
                    lastName: 'אדמין',
                    role: 'ADMIN',
                    department: 'ניהול',
                    avatar: 'יא'
                }
            };
        }
        return api.get('/auth/me');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('authToken');
    }
};
