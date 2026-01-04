/**
 * Tasks Service
 * Handles task operations with mock data support
 */

import api, { MOCK_MODE } from './config';
import { getMockData, updateMockData, generateId } from './mockData';

export const tasksService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const data = getMockData();
            let tasks = [...data.tasks];

            if (params.status) {
                tasks = tasks.filter(t => t.status === params.status);
            }
            if (params.departmentId) {
                tasks = tasks.filter(t => t.departmentId === params.departmentId);
            }
            if (params.orderId) {
                tasks = tasks.filter(t => t.orderId === params.orderId);
            }

            return {
                success: true,
                data: {
                    tasks,
                    total: tasks.length,
                    pagination: { page: 1, limit: 100, total: tasks.length, totalPages: 1 }
                }
            };
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
            const data = getMockData();
            let tasks = [...data.tasks];
            if (status) {
                tasks = tasks.filter(t => t.status === status);
            }
            return { success: true, data: { tasks } };
        }
        const queryParams = status ? `?status=${status}` : '';
        return api.get(`/tasks/my${queryParams}`);
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const task = data.tasks.find(t => t.id === id);
            if (!task) {
                return { success: false, error: { message: 'Task not found' } };
            }
            return { success: true, data: task };
        }
        return api.get(`/tasks/${id}`);
    },

    getByOrderItem: async (orderItemId) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const tasks = data.tasks.filter(t => t.orderItemId === orderItemId);
            return { success: true, data: { tasks } };
        }
        return api.get(`/tasks/order-item/${orderItemId}`);
    },

    getByDepartment: async (departmentId, status) => {
        if (MOCK_MODE) {
            const data = getMockData();
            let tasks = data.tasks.filter(t => t.departmentId === departmentId);
            if (status) {
                tasks = tasks.filter(t => t.status === status);
            }
            return { success: true, data: { tasks } };
        }
        const queryParams = status ? `?status=${status}` : '';
        return api.get(`/tasks/department/${departmentId}${queryParams}`);
    },

    create: async (taskData) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const newTask = {
                id: generateId(),
                ...taskData,
                status: taskData.status || 'PENDING',
                createdAt: new Date().toISOString()
            };
            data.tasks.unshift(newTask);
            updateMockData('tasks', data.tasks);
            return { success: true, data: newTask };
        }
        return api.post('/tasks', taskData);
    },

    update: async (id, taskData) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const index = data.tasks.findIndex(t => t.id === id);
            if (index === -1) {
                return { success: false, error: { message: 'Task not found' } };
            }
            data.tasks[index] = { ...data.tasks[index], ...taskData };
            updateMockData('tasks', data.tasks);
            return { success: true, data: data.tasks[index] };
        }
        return api.put(`/tasks/${id}`, taskData);
    },

    updateStatus: async (id, status) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const task = data.tasks.find(t => t.id === id);
            if (!task) {
                return { success: false, error: { message: 'Task not found' } };
            }
            task.status = status;
            updateMockData('tasks', data.tasks);
            return { success: true, data: task };
        }
        return api.put(`/tasks/${id}`, { status });
    },

    assign: async (id, assignedToId) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const task = data.tasks.find(t => t.id === id);
            if (!task) {
                return { success: false, error: { message: 'Task not found' } };
            }
            task.assignedToId = assignedToId;
            updateMockData('tasks', data.tasks);
            return { success: true, data: task };
        }
        return api.post(`/tasks/${id}/assign`, { assignedToId });
    },

    unassign: async (id) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const task = data.tasks.find(t => t.id === id);
            if (!task) {
                return { success: false, error: { message: 'Task not found' } };
            }
            task.assignedToId = null;
            updateMockData('tasks', data.tasks);
            return { success: true, data: task };
        }
        return api.delete(`/tasks/${id}/assign`);
    },

    complete: async (id) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const task = data.tasks.find(t => t.id === id);
            if (task) {
                task.status = 'COMPLETED';
                updateMockData('tasks', data.tasks);
            }
            return { success: true, data: task };
        }
        return api.post(`/tasks/${id}/complete`);
    },

    cancel: async (id) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const task = data.tasks.find(t => t.id === id);
            if (task) {
                task.status = 'CANCELLED';
                updateMockData('tasks', data.tasks);
            }
            return { success: true, data: task };
        }
        return api.post(`/tasks/${id}/cancel`);
    },

    onTaskComplete: async (taskId, completionData) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const task = data.tasks.find(t => t.id === taskId);
            if (task) {
                task.status = 'COMPLETED';
                updateMockData('tasks', data.tasks);
            }
            return {
                success: true,
                data: {
                    task,
                    nextTasks: [],
                    orderCompleted: false
                }
            };
        }
        return api.post(`/tasks/${taskId}/complete`, completionData);
    }
};
