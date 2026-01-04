/**
 * API Configuration
 * Axios instance and interceptors
 */

import axios from 'axios';

// ============ MOCK MODE ============
// Set to true to use mock data (when backend is down)
// TODO: Set to false when backend is ready
export const MOCK_MODE = true;

// API Configuration
// In development, use proxy to avoid CORS issues
// In production, use the real API URL
const API_URL = import.meta.env.DEV
    ? '/api'
    : (import.meta.env.VITE_API_URL || 'https://the-shull-api.app.mottidokib.com');

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Debug log - remove in production
        console.log('[API Request]', config.method?.toUpperCase(), config.url, 'Token:', token ? 'Present' : 'Missing');
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => {
        // Return only the data portion if it exists in the standard wrapper
        if (response.data && response.data.success !== undefined) {
            return response.data;
        }
        return response.data;
    },
    (error) => {
        const { response } = error;

        // Handle 401 - unauthorized
        if (response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            // Only redirect if not already on login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // Return error in consistent format
        return Promise.reject({
            success: false,
            error: response?.data?.error || {
                code: 'NETWORK_ERROR',
                message: error.message || 'Network error occurred'
            }
        });
    }
);

// Export api instance as default
export default api;
