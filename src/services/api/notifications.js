/**
 * Notifications Service
 * Handles notification operations
 */

import api, { MOCK_MODE } from './config';

export const notificationsService = {
    getAll: async (params = {}) => {
        // Notifications endpoint doesn't exist yet - return empty
        // TODO: Remove this when backend adds /notifications endpoint
        try {
            if (MOCK_MODE) {
                return {
                    success: true,
                    data: {
                        notifications: [],
                        total: 0,
                        unreadCount: 0
                    }
                };
            }
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, val]) => {
                if (val !== undefined && val !== null) queryParams.append(key, val);
            });
            return api.get(`/notifications?${queryParams}`);
        } catch (err) {
            // If endpoint doesn't exist, return empty data
            console.warn('Notifications endpoint not available');
            return { success: true, data: { notifications: [], total: 0, unreadCount: 0 } };
        }
    },

    getUnreadCount: async () => {
        try {
            if (MOCK_MODE) {
                return { success: true, data: { count: 0 } };
            }
            return api.get('/notifications/unread-count');
        } catch (err) {
            return { success: true, data: { count: 0 } };
        }
    },

    markAsRead: async (id) => {
        if (MOCK_MODE) {
            return { success: true };
        }
        return api.put(`/notifications/${id}/read`);
    },

    markAllAsRead: async () => {
        if (MOCK_MODE) {
            return { success: true };
        }
        return api.post('/notifications/mark-all-read');
    },

    dismiss: async (id) => {
        if (MOCK_MODE) {
            return { success: true };
        }
        return api.put(`/notifications/${id}/dismiss`);
    },

    dismissAll: async () => {
        if (MOCK_MODE) {
            return { success: true };
        }
        return api.post('/notifications/dismiss-all');
    },

    // Create a new notification (for internal use)
    create: async (data) => {
        if (MOCK_MODE) {
            const newNotif = {
                id: `notif-${Date.now()}`,
                read: false,
                dismissed: false,
                createdAt: new Date().toISOString(),
                ...data
            };
            return { success: true, data: newNotif };
        }
        return api.post('/notifications', data);
    },

    // Delete old notifications (cleanup)
    deleteOld: async (daysOld = 30) => {
        if (MOCK_MODE) {
            return { success: true, data: { deleted: 0 } };
        }
        return api.delete(`/notifications/old?days=${daysOld}`);
    }
};
