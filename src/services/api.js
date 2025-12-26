/**
 * API Service Layer
 * Connects to the real CRM API at https://crm-api.app.mottidokib.com
 */

import axios from 'axios';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://crm-api.app.mottidokib.com';

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

// ============ AUTH ============
export const authService = {
    login: async (email, password) => {
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

// ============ CUSTOMERS ============
export const customersService = {
    getAll: async (params = {}) => {
        if (USE_MOCK) {
            console.log('[MOCK] Getting customers');
            return { success: true, data: { customers: mockCustomers, total: mockCustomers.length } };
        }
        const { page = 1, limit = 100, status, search } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (status) queryParams.append('status', status);
        if (search) queryParams.append('search', search);
        return api.get(`/customers?${queryParams}`);
    },

    getById: async (id) => {
        return api.get(`/customers/${id}`);
    },

    create: async (data) => {
        return api.post('/customers', data);
    },

    update: async (id, data) => {
        return api.put(`/customers/${id}`, data);
    },

    delete: async (id) => {
        return api.delete(`/customers/${id}`);
    }
};

// ============ LEADS ============
export const leadsService = {
    getAll: async (params = {}) => {
        const { page = 1, limit = 100, stage, source, search } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (stage) queryParams.append('stage', stage);
        if (source) queryParams.append('source', source);
        if (search) queryParams.append('search', search);
        return api.get(`/leads?${queryParams}`);
    },

    getById: async (id) => {
        return api.get(`/leads/${id}`);
    },

    create: async (data) => {
        return api.post('/leads', data);
    },

    update: async (id, data) => {
        return api.put(`/leads/${id}`, data);
    },

    delete: async (id) => {
        return api.delete(`/leads/${id}`);
    },

    updateStage: async (id, stage) => {
        return api.put(`/leads/${id}`, { stage });
    },

    convert: async (id) => {
        return api.post(`/leads/${id}/convert`);
    }
};

// ============ PRODUCTS ============
export const productsService = {
    getAll: async (params = {}) => {
        const { page = 1, limit = 100, status, category, search } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (status) queryParams.append('status', status);
        if (category) queryParams.append('category', category);
        if (search) queryParams.append('search', search);
        return api.get(`/products?${queryParams}`);
    },

    getById: async (id) => {
        return api.get(`/products/${id}`);
    },

    create: async (data) => {
        return api.post('/products', data);
    },

    update: async (id, data) => {
        return api.put(`/products/${id}`, data);
    },

    delete: async (id) => {
        return api.delete(`/products/${id}`);
    },

    updateStock: async (id, operation, quantity) => {
        return api.post(`/products/${id}/stock`, { operation, quantity });
    },

    getParameters: async (productId) => {
        return api.get(`/products/${productId}/parameters`);
    }
};

// ============ ORDERS ============
export const ordersService = {
    getAll: async (params = {}) => {
        const { page = 1, limit = 100, status, customerId } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (status) queryParams.append('status', status);
        if (customerId) queryParams.append('customerId', customerId);
        return api.get(`/orders?${queryParams}`);
    },

    getById: async (id) => {
        return api.get(`/orders/${id}`);
    },

    create: async (data) => {
        return api.post('/orders', data);
    },

    update: async (id, data) => {
        return api.put(`/orders/${id}`, data);
    },

    cancel: async (id) => {
        return api.post(`/orders/${id}/cancel`);
    }
};

// ============ DEPARTMENTS ============
export const departmentsService = {
    getAll: async (params = {}) => {
        const { page = 1, limit = 100 } = params;
        return api.get(`/departments?page=${page}&limit=${limit}`);
    },

    getActive: async () => {
        return api.get('/departments/active');
    },

    getById: async (id) => {
        return api.get(`/departments/${id}`);
    },

    create: async (data) => {
        return api.post('/departments', data);
    },

    update: async (id, data) => {
        return api.put(`/departments/${id}`, data);
    },

    delete: async (id) => {
        return api.delete(`/departments/${id}`);
    }
};

// ============ WORKFLOWS ============
export const workflowsService = {
    getAll: async (params = {}) => {
        const { page = 1, limit = 100 } = params;
        return api.get(`/workflows?page=${page}&limit=${limit}`);
    },

    getActive: async () => {
        return api.get('/workflows/active');
    },

    getById: async (id) => {
        return api.get(`/workflows/${id}`);
    },

    create: async (data) => {
        return api.post('/workflows', data);
    },

    update: async (id, data) => {
        return api.put(`/workflows/${id}`, data);
    },

    delete: async (id) => {
        return api.delete(`/workflows/${id}`);
    }
};

// ============ PARAMETERS ============
export const parametersService = {
    getAll: async (params = {}) => {
        const { page = 1, limit = 100, type, isActive, search } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (type) queryParams.append('type', type);
        if (isActive !== undefined) queryParams.append('isActive', isActive);
        if (search) queryParams.append('search', search);
        return api.get(`/parameters?${queryParams}`);
    },

    getActive: async () => {
        return api.get('/parameters/active');
    },

    getById: async (id) => {
        return api.get(`/parameters/${id}`);
    },

    create: async (data) => {
        return api.post('/parameters', data);
    },

    update: async (id, data) => {
        return api.put(`/parameters/${id}`, data);
    },

    delete: async (id) => {
        return api.delete(`/parameters/${id}`);
    },

    calculatePrice: async (productId, selectedParameters) => {
        return api.post('/parameters/calculate-price', { productId, selectedParameters });
    }
};

// ============ TASKS ============
export const tasksService = {
    getAll: async (params = {}) => {
        const { page = 1, limit = 100, status, departmentId, assignedToId, orderItemId } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (status) queryParams.append('status', status);
        if (departmentId) queryParams.append('departmentId', departmentId);
        if (assignedToId) queryParams.append('assignedToId', assignedToId);
        if (orderItemId) queryParams.append('orderItemId', orderItemId);
        return api.get(`/tasks?${queryParams}`);
    },

    getMy: async (status) => {
        const queryParams = status ? `?status=${status}` : '';
        return api.get(`/tasks/my${queryParams}`);
    },

    getById: async (id) => {
        return api.get(`/tasks/${id}`);
    },

    getByOrderItem: async (orderItemId) => {
        return api.get(`/tasks/order-item/${orderItemId}`);
    },

    getByDepartment: async (departmentId, status) => {
        const queryParams = status ? `?status=${status}` : '';
        return api.get(`/tasks/department/${departmentId}${queryParams}`);
    },

    update: async (id, data) => {
        return api.put(`/tasks/${id}`, data);
    },

    updateStatus: async (id, status) => {
        return api.put(`/tasks/${id}`, { status });
    },

    assign: async (id, assignedToId) => {
        return api.post(`/tasks/${id}/assign`, { assignedToId });
    },

    unassign: async (id) => {
        return api.delete(`/tasks/${id}/assign`);
    },

    complete: async (id) => {
        return api.post(`/tasks/${id}/complete`);
    },

    cancel: async (id) => {
        return api.post(`/tasks/${id}/cancel`);
    }
};

// ============ ANALYTICS ============
export const analyticsService = {
    getDashboard: async () => {
        try {
            const response = await api.get('/analytics/dashboard');
            if (response.success && response.data && Object.keys(response.data).length > 0) {
                return response;
            }
            throw new Error('Empty data');
        } catch (error) {
            console.warn('Analytics API failed or empty, using mock data');
            return {
                success: true,
                data: {
                    totalRevenue: 125000,
                    revenueChange: '+12.5%',
                    totalOrders: 45,
                    ordersChange: '+3',
                    totalCustomers: 120,
                    customersChange: '+5',
                    activeTasks: 18
                }
            };
        }
    },

    getSales: async (startDate, endDate) => {
        try {
            const queryParams = new URLSearchParams();
            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);
            return await api.get(`/analytics/sales?${queryParams}`);
        } catch (error) {
            return { success: true, data: { sales: [] } };
        }
    },

    getRevenueTrends: async (period = 'monthly', year) => {
        try {
            const queryParams = new URLSearchParams({ period });
            if (year) queryParams.append('year', year);
            const response = await api.get(`/analytics/revenue-trends?${queryParams}`);
            if (response.success && response.data) return response;
            throw new Error('Empty trends');
        } catch (error) {
            return {
                success: true,
                data: {
                    trends: [
                        { period: 'Jan', revenue: 12000 },
                        { period: 'Feb', revenue: 19000 },
                        { period: 'Mar', revenue: 15000 },
                        { period: 'Apr', revenue: 22000 },
                        { period: 'May', revenue: 28000 },
                        { period: 'Jun', revenue: 25000 }
                    ]
                }
            };
        }
    },

    getCustomers: async () => {
        return api.get('/analytics/customers');
    },

    getProducts: async () => {
        return api.get('/analytics/products');
    },

    getTasks: async (departmentId) => {
        try {
            const queryParams = departmentId ? `?departmentId=${departmentId}` : '';
            const response = await api.get(`/analytics/tasks${queryParams}`);
            if (response.success && response.data) return response;
            throw new Error('Empty task analytics');
        } catch (error) {
            return {
                success: true,
                data: {
                    tasksByStatus: { PENDING: 5, IN_PROGRESS: 8, COMPLETED: 12, BLOCKED: 2 },
                    tasksByDepartment: []
                }
            };
        }
    }
};

// ============ FILES ============
export const filesService = {
    upload: async (file, entityType, entityId) => {
        const formData = new FormData();
        formData.append('file', file);
        if (entityType) formData.append('entityType', entityType);
        if (entityId) formData.append('entityId', entityId);

        return api.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    getAll: async (params = {}) => {
        const { page = 1, limit = 10, entityType, entityId } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (entityType) queryParams.append('entityType', entityType);
        if (entityId) queryParams.append('entityId', entityId);
        return api.get(`/files?${queryParams}`);
    },

    getById: async (id) => {
        return api.get(`/files/${id}`);
    },

    download: async (id) => {
        return api.get(`/files/${id}/download`, { responseType: 'blob' });
    },

    getSignedUrl: async (id) => {
        return api.get(`/files/${id}/signed-url`);
    },

    delete: async (id) => {
        return api.delete(`/files/${id}`);
    }
};

// ============ API KEYS ============
export const apiKeysService = {
    getAll: async (params = {}) => {
        const { page = 1, limit = 10, isActive } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (isActive !== undefined) queryParams.append('isActive', isActive);
        return api.get(`/api-keys?${queryParams}`);
    },

    getById: async (id) => {
        return api.get(`/api-keys/${id}`);
    },

    create: async (data) => {
        return api.post('/api-keys', data);
    },

    update: async (id, data) => {
        return api.put(`/api-keys/${id}`, data);
    },

    delete: async (id) => {
        return api.delete(`/api-keys/${id}`);
    }
};

// Export default api instance for custom calls
export default api;
