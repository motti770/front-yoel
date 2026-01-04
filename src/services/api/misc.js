/**
 * Miscellaneous Services
 * Stock Orders, Sales Pipeline, API Keys
 */

import api from './config';

// ============ STOCK ORDERS ============
export const stockOrdersService = {
    getAll: async (params = {}) => {
        const { page = 1, limit = 100, status } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (status) queryParams.append('status', status);
        return api.get(`/stock-orders?${queryParams}`);
    },

    getById: async (id) => {
        return api.get(`/stock-orders/${id}`);
    },

    create: async (data) => {
        return api.post('/stock-orders', data);
    },

    update: async (id, data) => {
        return api.put(`/stock-orders/${id}`, data);
    },

    updateStatus: async (id, status, progress = null) => {
        const data = { status };
        if (progress !== null) data.progress = progress;
        return api.put(`/stock-orders/${id}`, data);
    },

    delete: async (id) => {
        return api.delete(`/stock-orders/${id}`);
    }
};

// ============ SALES PIPELINE ============
export const salesPipelineService = {
    getStages: async () => {
        return api.get('/sales-pipeline/stages');
    },

    updateStages: async (stages) => {
        return api.put('/sales-pipeline/stages', { stages });
    },

    getProductPipeline: async (productId) => {
        return api.get(`/sales-pipeline/product/${productId}`);
    },

    updateProductPipeline: async (productId, stages) => {
        return api.put(`/sales-pipeline/product/${productId}`, { stages });
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
