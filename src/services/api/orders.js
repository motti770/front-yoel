/**
 * Orders Service
 * Handles order operations
 */

import api, { MOCK_MODE } from './config';

export const ordersService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            return { success: true, data: { orders: [], total: 0 } };
        }
        const { page = 1, limit = 100, status, customerId } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (status) queryParams.append('status', status);
        if (customerId) queryParams.append('customerId', customerId);
        return api.get(`/orders?${queryParams}`);
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Order not found' } };
        }
        return api.get(`/orders/${id}`);
    },

    create: async (data) => {
        if (MOCK_MODE) {
            const orderId = Date.now().toString();
            const orderNumber = `#${orderId.slice(-6)}`;
            const newOrder = {
                id: orderId,
                orderNumber: orderNumber,
                ...data,
                status: 'PENDING_PAYMENT',
                paymentStatus: 'AWAITING_DEPOSIT',
                depositAmount: 0,
                depositPaidAt: null,
                createdAt: new Date().toISOString().split('T')[0],
                tasks: []
            };
            return { success: true, data: newOrder };
        }
        return api.post('/orders', data);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Order not found' } };
        }
        return api.put(`/orders/${id}`, data);
    },

    cancel: async (id) => {
        if (MOCK_MODE) {
            return ordersService.update(id, { status: 'CANCELLED' });
        }
        return api.post(`/orders/${id}/cancel`);
    },

    // Confirm deposit payment - unlocks production tasks
    confirmDeposit: async (id, depositAmount) => {
        if (MOCK_MODE) {
            return { success: true, data: { id, status: 'IN_PRODUCTION', paymentStatus: 'DEPOSIT_PAID' } };
        }
        return api.post(`/orders/${id}/confirm-deposit`, { depositAmount });
    }
};
