/**
 * Leads Service
 * Handles lead management operations with mock data support
 */

import api, { MOCK_MODE } from './config';
import { getMockData, updateMockData, generateId } from './mockData';

export const leadsService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const data = getMockData();
            let leads = [...data.leads];

            if (params.stage) {
                leads = leads.filter(l => l.stage === params.stage);
            }
            if (params.source) {
                leads = leads.filter(l => l.source === params.source);
            }
            if (params.search) {
                const search = params.search.toLowerCase();
                leads = leads.filter(l =>
                    l.name.toLowerCase().includes(search) ||
                    l.email.toLowerCase().includes(search) ||
                    l.company?.toLowerCase().includes(search)
                );
            }

            return {
                success: true,
                data: {
                    leads,
                    total: leads.length,
                    pagination: { page: 1, limit: 100, total: leads.length, totalPages: 1 }
                }
            };
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
            const data = getMockData();
            const lead = data.leads.find(l => l.id === id);
            if (!lead) {
                return { success: false, error: { message: 'Lead not found' } };
            }
            return { success: true, data: lead };
        }
        return api.get(`/leads/${id}`);
    },

    create: async (leadData) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const newLead = {
                id: generateId(),
                ...leadData,
                stage: leadData.stage || 'NEW',
                createdAt: new Date().toISOString().split('T')[0]
            };
            data.leads.unshift(newLead);
            updateMockData('leads', data.leads);
            return { success: true, data: newLead };
        }
        return api.post('/leads', leadData);
    },

    update: async (id, leadData) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const index = data.leads.findIndex(l => l.id === id);
            if (index === -1) {
                return { success: false, error: { message: 'Lead not found' } };
            }
            data.leads[index] = { ...data.leads[index], ...leadData };
            updateMockData('leads', data.leads);
            return { success: true, data: data.leads[index] };
        }
        return api.put(`/leads/${id}`, leadData);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const index = data.leads.findIndex(l => l.id === id);
            if (index === -1) {
                return { success: false, error: { message: 'Lead not found' } };
            }
            data.leads.splice(index, 1);
            updateMockData('leads', data.leads);
            return { success: true };
        }
        return api.delete(`/leads/${id}`);
    },

    updateStage: async (id, stage) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const lead = data.leads.find(l => l.id === id);
            if (!lead) {
                return { success: false, error: { message: 'Lead not found' } };
            }
            lead.stage = stage;
            updateMockData('leads', data.leads);
            return { success: true, data: lead };
        }
        return api.put(`/leads/${id}`, { stage });
    },

    convert: async (id) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const lead = data.leads.find(l => l.id === id);
            if (!lead) {
                return { success: false, error: { message: 'Lead not found' } };
            }

            // Create customer from lead
            const newCustomer = {
                id: generateId(),
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                companyName: lead.company,
                status: 'ACTIVE',
                totalOrders: 0,
                totalSpent: 0,
                createdAt: new Date().toISOString().split('T')[0]
            };
            data.customers.unshift(newCustomer);

            // Update lead
            lead.stage = 'WON';
            lead.convertedToCustomerId = newCustomer.id;

            updateMockData('customers', data.customers);
            updateMockData('leads', data.leads);

            return {
                success: true,
                data: { customerId: newCustomer.id, customer: newCustomer }
            };
        }
        return api.post(`/leads/${id}/convert`);
    },

    selectProduct: async (leadId, productId) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const lead = data.leads.find(l => l.id === leadId);
            if (lead) {
                lead.selectedProductId = productId;
                updateMockData('leads', data.leads);
            }
            return { success: true, data: { lead, tasks: [] } };
        }
        return api.post(`/leads/${leadId}/select-product`, { productId });
    },

    getLeadTasks: async (leadId) => {
        if (MOCK_MODE) {
            return { success: true, data: { tasks: [] } };
        }
        return api.get(`/leads/${leadId}/tasks`);
    },

    updateLeadTask: async (taskId, taskData) => {
        if (MOCK_MODE) {
            return { success: true, data: { id: taskId, ...taskData } };
        }
        return api.put(`/lead-tasks/${taskId}`, taskData);
    },

    completeLeadTask: async (taskId) => {
        if (MOCK_MODE) {
            return { success: true, data: { task: null, nextTask: null, allTasksCompleted: false } };
        }
        return api.post(`/lead-tasks/${taskId}/complete`);
    },

    confirmPayment: async (leadId, paymentData) => {
        if (MOCK_MODE) {
            return { success: true, data: { lead: { id: leadId }, product: null } };
        }
        return api.post(`/leads/${leadId}/confirm-payment`, paymentData);
    },

    getByStage: async () => {
        if (MOCK_MODE) {
            const data = getMockData();
            const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
            const byStage = {};
            stages.forEach(stage => {
                byStage[stage] = data.leads.filter(l => l.stage === stage);
            });
            return { success: true, data: byStage };
        }
        return api.get('/leads/by-stage');
    }
};
