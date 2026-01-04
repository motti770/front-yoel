/**
 * Users Service
 * Handles user management operations
 */

import api from './config';

export const usersService = {
    getAll: async () => {
        return api.get('/users');
    },

    create: async (userData) => {
        return api.post('/users', userData);
    },

    update: async (id, userData) => {
        return api.put(`/users/${id}`, userData);
    },

    delete: async (id) => {
        return api.delete(`/users/${id}`);
    }
};
