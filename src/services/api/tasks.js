/**
 * Tasks Service
 * Handles task operations
 */

import api, { MOCK_MODE } from './config';

export const tasksService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            return { success: true, data: { tasks: [], total: 0 } };
        }
        const { page = 1, limit = 100, status, departmentId, assignedToId, orderItemId } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (status) queryParams.append('status', status);
        if (departmentId) queryParams.append('departmentId', departmentId);
        if (assignedToId) queryParams.append('assignedToId', assignedToId);
        if (orderItemId) queryParams.append('orderItemId', orderItemId);
        return api.get(`/tasks?${queryParams}`);
    },

    getMy: async (status) => {
        if (MOCK_MODE) {
            return { success: true, data: { tasks: [] } };
        }
        const queryParams = status ? `?status=${status}` : '';
        return api.get(`/tasks/my${queryParams}`);
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Task not found' } };
        }
        return api.get(`/tasks/${id}`);
    },

    getByOrderItem: async (orderItemId) => {
        return api.get(`/tasks/order-item/${orderItemId}`);
    },

    getByDepartment: async (departmentId, status) => {
        const queryParams = status ? `?status=${status}` : '';
        return api.get(`/tasks/department/${departmentId}${queryParams}`);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Task not found' } };
        }
        return api.put(`/tasks/${id}`, data);
    },

    updateStatus: async (id, status) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Task not found' } };
        }
        return api.put(`/tasks/${id}`, { status });
    },

    assign: async (id, assignedToId) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Task not found' } };
        }
        return api.post(`/tasks/${id}/assign`, { assignedToId });
    },

    unassign: async (id) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Task not found' } };
        }
        return api.delete(`/tasks/${id}/assign`);
    },

    create: async (taskData) => {
        if (MOCK_MODE) {
            const newTask = {
                id: Date.now().toString(),
                ...taskData,
                status: 'PENDING',
                createdAt: new Date().toISOString()
            };
            return { success: true, data: newTask };
        }
        return api.post('/tasks', taskData);
    },

    complete: async (id) => {
        if (MOCK_MODE) {
            return { success: true, data: { id, status: 'COMPLETED' } };
        }
        return api.post(`/tasks/${id}/complete`);
    },

    cancel: async (id) => {
        if (MOCK_MODE) {
            return { success: true, data: { id, status: 'CANCELLED' } };
        }
        return api.post(`/tasks/${id}/cancel`);
    },

    onTaskComplete: async (taskId, completionData) => {
        if (MOCK_MODE) {
            return {
                success: true,
                data: {
                    task: { id: taskId, status: 'COMPLETED' },
                    nextTasks: [],
                    orderCompleted: false
                }
            };
        }
        return api.post(`/tasks/${taskId}/complete`, completionData);
    }
};
