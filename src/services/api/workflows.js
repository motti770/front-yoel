/**
 * Workflows Service
 * Handles workflow operations with mock data support
 */

import api, { MOCK_MODE } from './config';
import { getMockData, updateMockData, generateId } from './mockData';

export const workflowsService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const data = getMockData();
            return {
                success: true,
                data: {
                    workflows: data.workflows,
                    total: data.workflows.length
                }
            };
        }
        const { page = 1, limit = 100 } = params;
        return api.get(`/workflows?page=${page}&limit=${limit}`);
    },

    getActive: async () => {
        if (MOCK_MODE) {
            const data = getMockData();
            return { success: true, data: data.workflows };
        }
        return api.get('/workflows/active');
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const workflow = data.workflows.find(w => w.id === id);
            if (!workflow) {
                return { success: false, error: { message: 'Workflow not found' } };
            }
            return { success: true, data: workflow };
        }
        return api.get(`/workflows/${id}`);
    },

    getByProduct: async (productId) => {
        if (MOCK_MODE) {
            const data = getMockData();
            // Return first workflow as default for any product
            const workflow = data.workflows[0];
            return { success: true, data: workflow };
        }
        return api.get(`/workflows/product/${productId}`);
    },

    create: async (workflowData) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const newWorkflow = {
                id: generateId(),
                ...workflowData,
                steps: [],
                stepsCount: 0,
                status: 'ACTIVE',
                isActive: true,
                createdAt: new Date().toISOString().split('T')[0]
            };
            data.workflows.push(newWorkflow);
            updateMockData('workflows', data.workflows);
            return { success: true, data: newWorkflow };
        }
        return api.post('/workflows', workflowData);
    },

    update: async (id, workflowData) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const index = data.workflows.findIndex(w => w.id === id);
            if (index === -1) {
                return { success: false, error: { message: 'Workflow not found' } };
            }
            data.workflows[index] = { ...data.workflows[index], ...workflowData };
            updateMockData('workflows', data.workflows);
            return { success: true, data: data.workflows[index] };
        }
        return api.put(`/workflows/${id}`, workflowData);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const index = data.workflows.findIndex(w => w.id === id);
            if (index === -1) {
                return { success: false, error: { message: 'Workflow not found' } };
            }
            data.workflows.splice(index, 1);
            updateMockData('workflows', data.workflows);
            return { success: true };
        }
        return api.delete(`/workflows/${id}`);
    },

    addStep: async (workflowId, stepData) => {
        if (MOCK_MODE) {
            const newStep = {
                id: generateId(),
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
            return { success: true, data: { id: stepId, ...stepData } };
        }
        return api.put(`/workflows/steps/${stepId}`, stepData);
    },

    deleteStep: async (workflowId, stepId) => {
        if (MOCK_MODE) {
            return { success: true };
        }
        return api.delete(`/workflows/${workflowId}/steps/${stepId}`);
    }
};
