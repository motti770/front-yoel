/**
 * Customers Service
 * Handles customer operations
 */

import api, { MOCK_MODE } from './config';

export const customersService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            // Mock implementation would go here
            return { success: true, data: { customers: [], total: 0 } };
        }
        const { page = 1, limit = 100, status, search } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (status) queryParams.append('status', status);
        if (search) queryParams.append('search', search);
        return api.get(`/customers?${queryParams}`);
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Customer not found' } };
        }
        return api.get(`/customers/${id}`);
    },

    create: async (data) => {
        if (MOCK_MODE) {
            const newCustomer = { id: Date.now().toString(), ...data, totalOrders: 0, totalSpent: 0, createdAt: new Date().toISOString().split('T')[0] };
            return { success: true, data: newCustomer };
        }
        return api.post('/customers', data);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Customer not found' } };
        }
        return api.put(`/customers/${id}`, data);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Customer not found' } };
        }
        return api.delete(`/customers/${id}`);
    }
};
