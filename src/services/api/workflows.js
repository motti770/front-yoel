/**
 * Workflows Service
 * Handles workflow operations
 */

import api, { MOCK_MODE } from './config';

export const workflowsService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            return { success: true, data: { workflows: [], total: 0 } };
        }
        const { page = 1, limit = 100 } = params;
        return api.get(`/workflows?page=${page}&limit=${limit}`);
    },

    getActive: async () => {
        if (MOCK_MODE) {
            return { success: true, data: [] };
        }
        return api.get('/workflows/active');
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Workflow not found' } };
        }
        return api.get(`/workflows/${id}`);
    },

    getByProduct: async (productId) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'No workflow for product' } };
        }
        return api.get(`/workflows/product/${productId}`);
    },

    create: async (data) => {
        if (MOCK_MODE) {
            const newWorkflow = {
                id: Date.now().toString(),
                ...data,
                steps: [],
                status: 'ACTIVE',
                isActive: true,
                createdAt: new Date().toISOString().split('T')[0]
            };
            return { success: true, data: newWorkflow };
        }
        return api.post('/workflows', data);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Workflow not found' } };
        }
        return api.put(`/workflows/${id}`, data);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Workflow not found' } };
        }
        return api.delete(`/workflows/${id}`);
    },

    addStep: async (workflowId, stepData) => {
        if (MOCK_MODE) {
            const newStep = {
                id: `step-${workflowId}-${Date.now()}`,
                ...stepData,
                stepOrder: stepData.stepOrder || 1,
                isActive: true
            };
            return { success: true, data: newStep };
        }
        return api.post(`/workflows/${workflowId}/steps`, stepData);
    },

    updateStep: async (stepId, stepData) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Step not found' } };
        }
        return api.put(`/workflows/steps/${stepId}`, stepData);
    },

    deleteStep: async (workflowId, stepId) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Step not found' } };
        }
        return api.delete(`/workflows/${workflowId}/steps/${stepId}`);
    }
};
