/**
 * Products Service
 * Handles product operations
 */

import api, { MOCK_MODE } from './config';

export const productsService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            return { success: true, data: { products: [], total: 0 } };
        }
        const { page = 1, limit = 100, status, category, search } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (status) queryParams.append('status', status);
        if (category) queryParams.append('category', category);
        if (search) queryParams.append('search', search);
        return api.get(`/products?${queryParams}`);
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Product not found' } };
        }
        return api.get(`/products/${id}`);
    },

    create: async (data) => {
        if (MOCK_MODE) {
            const newProduct = { id: Date.now().toString(), ...data, createdAt: new Date().toISOString().split('T')[0] };
            return { success: true, data: newProduct };
        }
        return api.post('/products', data);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Product not found' } };
        }
        return api.put(`/products/${id}`, data);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Product not found' } };
        }
        return api.delete(`/products/${id}`);
    },

    updateStock: async (id, operation, quantity) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Product not found' } };
        }
        return api.post(`/products/${id}/stock`, { operation, quantity });
    },

    getParameters: async (productId) => {
        if (MOCK_MODE) {
            return { success: true, data: { parameters: [] } };
        }
        return api.get(`/products/${productId}/parameters`);
    }
};
