/**
 * Departments Service
 * Handles department operations
 */

import api, { MOCK_MODE } from './config';

export const departmentsService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            return { success: true, data: { departments: [], total: 0 } };
        }
        const { page = 1, limit = 100 } = params;
        return api.get(`/departments?page=${page}&limit=${limit}`);
    },

    getActive: async () => {
        if (MOCK_MODE) {
            return { success: true, data: [] };
        }
        return api.get('/departments/active');
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Department not found' } };
        }
        return api.get(`/departments/${id}`);
    },

    create: async (data) => {
        if (MOCK_MODE) {
            const newDepartment = {
                id: Date.now().toString(),
                ...data,
                employeeCount: 0,
                activeTasks: 0,
                status: 'ACTIVE',
                createdAt: new Date().toISOString().split('T')[0]
            };
            return { success: true, data: newDepartment };
        }
        return api.post('/departments', data);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Department not found' } };
        }
        return api.put(`/departments/${id}`, data);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Department not found' } };
        }
        return api.delete(`/departments/${id}`);
    }
};
