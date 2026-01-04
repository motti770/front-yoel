/**
 * Leads Service
 * Handles lead management operations
 */

import api, { MOCK_MODE } from './config';

export const leadsService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            return { success: true, data: { leads: [], total: 0 } };
        }
        const { page = 1, limit = 100, stage, source, search } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (stage) queryParams.append('stage', stage);
        if (source) queryParams.append('source', source);
        if (search) queryParams.append('search', search);
        return api.get(`/leads?${queryParams}`);
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Lead not found' } };
        }
        return api.get(`/leads/${id}`);
    },

    create: async (data) => {
        if (MOCK_MODE) {
            const newLead = { id: Date.now().toString(), ...data, createdAt: new Date().toISOString().split('T')[0] };
            return { success: true, data: newLead };
        }
        return api.post('/leads', data);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Lead not found' } };
        }
        return api.put(`/leads/${id}`, data);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Lead not found' } };
        }
        return api.delete(`/leads/${id}`);
    },

    updateStage: async (id, stage) => {
        if (MOCK_MODE) {
            return leadsService.update(id, { stage });
        }
        return api.put(`/leads/${id}`, { stage });
    },

    convert: async (id) => {
        if (MOCK_MODE) {
            return { success: true, data: { customerId: Date.now().toString() } };
        }
        return api.post(`/leads/${id}/convert`);
    },

    // Select product for lead and create sales tasks from salesWorkflowId
    selectProduct: async (leadId, productId) => {
        if (MOCK_MODE) {
            return { success: true, data: { lead: { id: leadId, selectedProductId: productId }, tasks: [] } };
        }
        return api.post(`/leads/${leadId}/select-product`, { productId });
    },

    // Get all tasks for a lead
    getLeadTasks: async (leadId) => {
        if (MOCK_MODE) {
            return { success: true, data: { tasks: [] } };
        }
        return api.get(`/leads/${leadId}/tasks`);
    },

    // Update a lead task
    updateLeadTask: async (taskId, data) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Task not found' } };
        }
        return api.put(`/lead-tasks/${taskId}`, data);
    },

    // Complete a lead task and auto-start next one
    completeLeadTask: async (taskId) => {
        if (MOCK_MODE) {
            return { success: true, data: { task: null, nextTask: null, allTasksCompleted: false } };
        }
        return api.post(`/lead-tasks/${taskId}/complete`);
    },

    // Confirm payment and convert lead to order
    confirmPayment: async (leadId, paymentData) => {
        if (MOCK_MODE) {
            return { success: true, data: { lead: { id: leadId }, product: null } };
        }
        return api.post(`/leads/${leadId}/confirm-payment`, paymentData);
    }
};
