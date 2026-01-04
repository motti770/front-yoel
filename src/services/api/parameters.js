/**
 * Parameters Service
 * Handles product parameters operations
 */

import api, { MOCK_MODE } from './config';

export const parametersService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            return { success: true, data: { parameters: [], total: 0 } };
        }
        const { page = 1, limit = 100, type, isActive, search } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (type) queryParams.append('type', type);
        if (isActive !== undefined) queryParams.append('isActive', isActive);
        if (search) queryParams.append('search', search);
        return api.get(`/parameters?${queryParams}`);
    },

    getActive: async () => {
        if (MOCK_MODE) {
            return { success: true, data: [] };
        }
        return api.get('/parameters/active');
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Parameter not found' } };
        }
        return api.get(`/parameters/${id}`);
    },

    create: async (data) => {
        if (MOCK_MODE) {
            const newParameter = {
                id: `param-${Date.now()}`,
                ...data,
                options: data.options || [],
                createdAt: new Date().toISOString()
            };
            return { success: true, data: newParameter };
        }
        return api.post('/parameters', data);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Parameter not found' } };
        }
        return api.put(`/parameters/${id}`, data);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Parameter not found' } };
        }
        return api.delete(`/parameters/${id}`);
    },

    addOption: async (parameterId, optionData) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Parameter not found' } };
        }
        return api.post(`/parameters/${parameterId}/options`, optionData);
    },

    updateOption: async (parameterId, optionId, optionData) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Option not found' } };
        }
        return api.put(`/parameters/options/${optionId}`, optionData);
    },

    deleteOption: async (parameterId, optionId) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Option not found' } };
        }
        return api.delete(`/parameters/options/${optionId}`);
    },

    calculatePrice: async (productId, selectedParameters) => {
        if (MOCK_MODE) {
            return { success: true, data: { priceImpact: 0 } };
        }
        return api.post('/parameters/calculate-price', { productId, selectedParameters });
    }
};
