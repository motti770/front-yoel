/**
 * Files Service
 * Handles file upload and management
 */

import api from './config';

export const filesService = {
    upload: async (file, entityType, entityId) => {
        const formData = new FormData();
        formData.append('file', file);
        if (entityType) formData.append('entityType', entityType);
        if (entityId) formData.append('entityId', entityId);

        return api.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    getAll: async (params = {}) => {
        const { page = 1, limit = 10, entityType, entityId } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (entityType) queryParams.append('entityType', entityType);
        if (entityId) queryParams.append('entityId', entityId);
        return api.get(`/files?${queryParams}`);
    },

    getById: async (id) => {
        return api.get(`/files/${id}`);
    },

    download: async (id) => {
        return api.get(`/files/${id}/download`, { responseType: 'blob' });
    },

    getSignedUrl: async (id) => {
        return api.get(`/files/${id}/signed-url`);
    },

    delete: async (id) => {
        return api.delete(`/files/${id}`);
    }
};
