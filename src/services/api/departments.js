/**
 * Departments Service
 * Handles department operations with mock data support
 */

import api, { MOCK_MODE } from './config';
import { getMockData, updateMockData, generateId } from './mockData';

export const departmentsService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const data = getMockData();
            return {
                success: true,
                data: {
                    departments: data.departments,
                    total: data.departments.length
                }
            };
        }
        const { page = 1, limit = 100 } = params;
        return api.get(`/departments?page=${page}&limit=${limit}`);
    },

    getActive: async () => {
        if (MOCK_MODE) {
            const data = getMockData();
            return { success: true, data: data.departments };
        }
        return api.get('/departments/active');
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const dept = data.departments.find(d => d.id === id);
            if (!dept) {
                return { success: false, error: { message: 'Department not found' } };
            }
            return { success: true, data: dept };
        }
        return api.get(`/departments/${id}`);
    },

    create: async (deptData) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const newDept = {
                id: generateId(),
                ...deptData,
                employeeCount: 0,
                activeTasks: 0,
                status: 'ACTIVE',
                createdAt: new Date().toISOString().split('T')[0]
            };
            data.departments.push(newDept);
            updateMockData('departments', data.departments);
            return { success: true, data: newDept };
        }
        return api.post('/departments', deptData);
    },

    update: async (id, deptData) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const index = data.departments.findIndex(d => d.id === id);
            if (index === -1) {
                return { success: false, error: { message: 'Department not found' } };
            }
            data.departments[index] = { ...data.departments[index], ...deptData };
            updateMockData('departments', data.departments);
            return { success: true, data: data.departments[index] };
        }
        return api.put(`/departments/${id}`, deptData);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const index = data.departments.findIndex(d => d.id === id);
            if (index === -1) {
                return { success: false, error: { message: 'Department not found' } };
            }
            data.departments.splice(index, 1);
            updateMockData('departments', data.departments);
            return { success: true };
        }
        return api.delete(`/departments/${id}`);
    }
};
