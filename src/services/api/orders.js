/**
 * Orders Service
 * Handles order operations with mock data support
 */

import api, { MOCK_MODE } from './config';
import { getMockData, updateMockData, generateId } from './mockData';

export const ordersService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const data = getMockData();
            let orders = [...data.orders];

            if (params.status) {
                orders = orders.filter(o => o.status === params.status);
            }
            if (params.customerId) {
                orders = orders.filter(o => o.customerId === params.customerId);
            }
            if (params.search) {
                const search = params.search.toLowerCase();
                orders = orders.filter(o =>
                    o.customerName?.toLowerCase().includes(search) ||
                    o.productName?.toLowerCase().includes(search)
                );
            }

            return {
                success: true,
                data: {
                    orders,
                    total: orders.length,
                    pagination: { page: 1, limit: 100, total: orders.length, totalPages: 1 }
                }
            };
        }
        const { page = 1, limit = 100, status, customerId } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (status) queryParams.append('status', status);
        if (customerId) queryParams.append('customerId', customerId);
        return api.get(`/orders?${queryParams}`);
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const order = data.orders.find(o => o.id === id);
            if (!order) {
                return { success: false, error: { message: 'Order not found' } };
            }
            return { success: true, data: order };
        }
        return api.get(`/orders/${id}`);
    },

    create: async (orderData) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const customer = data.customers.find(c => c.id === orderData.customerId);
            const product = data.products.find(p => p.id === orderData.productId);

            const orderId = generateId();
            const newOrder = {
                id: orderId,
                orderNumber: `#${orderId.slice(-6)}`,
                ...orderData,
                customerName: customer?.name || 'לקוח לא ידוע',
                productName: product?.name || 'מוצר לא ידוע',
                status: orderData.status || 'PENDING',
                priority: orderData.priority || 'NORMAL',
                totalAmount: orderData.totalAmount || product?.price || 0,
                paymentStatus: 'AWAITING_DEPOSIT',
                depositAmount: 0,
                createdAt: new Date().toISOString().split('T')[0],
                tasks: []
            };
            data.orders.unshift(newOrder);
            updateMockData('orders', data.orders);

            // Update customer stats
            if (customer) {
                customer.totalOrders = (customer.totalOrders || 0) + 1;
                customer.totalSpent = (customer.totalSpent || 0) + newOrder.totalAmount;
                updateMockData('customers', data.customers);
            }

            return { success: true, data: newOrder };
        }
        return api.post('/orders', orderData);
    },

    update: async (id, orderData) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const index = data.orders.findIndex(o => o.id === id);
            if (index === -1) {
                return { success: false, error: { message: 'Order not found' } };
            }
            data.orders[index] = { ...data.orders[index], ...orderData };
            updateMockData('orders', data.orders);
            return { success: true, data: data.orders[index] };
        }
        return api.put(`/orders/${id}`, orderData);
    },

    cancel: async (id) => {
        if (MOCK_MODE) {
            return ordersService.update(id, { status: 'CANCELLED' });
        }
        return api.post(`/orders/${id}/cancel`);
    },

    confirmDeposit: async (id, depositAmount) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const order = data.orders.find(o => o.id === id);
            if (order) {
                order.status = 'IN_PRODUCTION';
                order.paymentStatus = 'DEPOSIT_PAID';
                order.depositAmount = depositAmount;
                updateMockData('orders', data.orders);
            }
            return { success: true, data: order };
        }
        return api.post(`/orders/${id}/confirm-deposit`, { depositAmount });
    },

    updateStatus: async (id, status) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const order = data.orders.find(o => o.id === id);
            if (!order) {
                return { success: false, error: { message: 'Order not found' } };
            }
            order.status = status;
            updateMockData('orders', data.orders);
            return { success: true, data: order };
        }
        return api.put(`/orders/${id}/status`, { status });
    },

    getByCustomer: async (customerId) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const orders = data.orders.filter(o => o.customerId === customerId);
            return { success: true, data: { orders } };
        }
        return api.get(`/orders/customer/${customerId}`);
    }
};
