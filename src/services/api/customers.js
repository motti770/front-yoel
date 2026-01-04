/**
 * Customers Service
 * Handles customer operations with mock data support
 */

import api, { MOCK_MODE } from './config';
import { getMockData, updateMockData, generateId } from './mockData';

export const customersService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const data = getMockData();
            let customers = [...data.customers];

            // Filter by status
            if (params.status) {
                customers = customers.filter(c => c.status === params.status);
            }

            // Search
            if (params.search) {
                const search = params.search.toLowerCase();
                customers = customers.filter(c =>
                    c.name.toLowerCase().includes(search) ||
                    c.email.toLowerCase().includes(search) ||
                    c.phone.includes(search)
                );
            }

            return {
                success: true,
                data: {
                    customers,
                    total: customers.length,
                    pagination: { page: 1, limit: 100, total: customers.length, totalPages: 1 }
                }
            };
        }
        const { page = 1, limit = 100, status, search } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (status) queryParams.append('status', status);
        if (search) queryParams.append('search', search);
        return api.get(`/customers?${queryParams}`);
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const customer = data.customers.find(c => c.id === id);
            if (!customer) {
                return { success: false, error: { message: 'Customer not found' } };
            }
            return { success: true, data: customer };
        }
        return api.get(`/customers/${id}`);
    },

    create: async (customerData) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const newCustomer = {
                id: generateId(),
                ...customerData,
                totalOrders: 0,
                totalSpent: 0,
                createdAt: new Date().toISOString().split('T')[0],
                status: customerData.status || 'ACTIVE'
            };
            data.customers.unshift(newCustomer);
            updateMockData('customers', data.customers);
            return { success: true, data: newCustomer };
        }
        return api.post('/customers', customerData);
    },

    update: async (id, customerData) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const index = data.customers.findIndex(c => c.id === id);
            if (index === -1) {
                return { success: false, error: { message: 'Customer not found' } };
            }
            data.customers[index] = { ...data.customers[index], ...customerData };
            updateMockData('customers', data.customers);
            return { success: true, data: data.customers[index] };
        }
        return api.put(`/customers/${id}`, customerData);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const index = data.customers.findIndex(c => c.id === id);
            if (index === -1) {
                return { success: false, error: { message: 'Customer not found' } };
            }
            data.customers.splice(index, 1);
            updateMockData('customers', data.customers);
            return { success: true };
        }
        return api.delete(`/customers/${id}`);
    }
};
