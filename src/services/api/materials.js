/**
 * Materials Service
 * Handles raw materials (inventory) operations
 */

import api, { MOCK_MODE } from './config';

export const materialsService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            return { success: true, data: { materials: [], total: 0 } };
        }
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null) queryParams.append(key, val);
        });
        return api.get(`/materials?${queryParams}`);
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Material not found' } };
        }
        return api.get(`/materials/${id}`);
    },

    create: async (data) => {
        if (MOCK_MODE) {
            const newMaterial = {
                id: `mat-${Date.now()}`,
                ...data,
                createdAt: new Date().toISOString().split('T')[0]
            };
            return { success: true, data: newMaterial };
        }
        return api.post('/materials', data);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Material not found' } };
        }
        return api.put(`/materials/${id}`, data);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Material not found' } };
        }
        return api.delete(`/materials/${id}`);
    },

    // Update stock quantity
    updateStock: async (id, quantity, operation = 'SET') => {
        if (MOCK_MODE) {
            return { success: false, error: { message: 'Material not found' } };
        }
        return api.put(`/materials/${id}/stock`, { quantity, operation });
    },

    // Get low stock materials
    getLowStock: async () => {
        if (MOCK_MODE) {
            return { success: true, data: { materials: [], total: 0 } };
        }
        return api.get('/materials/low-stock');
    },

    // Get materials by product
    getByProduct: async (productId) => {
        if (MOCK_MODE) {
            return { success: true, data: { materials: [], total: 0 } };
        }
        return api.get(`/materials/product/${productId}`);
    },

    // Reserve materials for an order (subtract from stock)
    reserveForOrder: async (orderId, materialsUsed) => {
        if (MOCK_MODE) {
            return { success: true, data: { reserved: [] } };
        }
        return api.post(`/materials/reserve/${orderId}`, { materials: materialsUsed });
    },

    // Get material categories
    getCategories: async () => {
        if (MOCK_MODE) {
            const categories = [
                { id: 'FABRIC', name: 'בדים', nameEn: 'Fabrics', icon: 'Shirt' },
                { id: 'THREAD', name: 'חוטי רקמה', nameEn: 'Embroidery Threads', icon: 'Scissors' },
                { id: 'ACCESSORY', name: 'אביזרים', nameEn: 'Accessories', icon: 'Sparkles' },
                { id: 'BACKING', name: 'בדי תמיכה', nameEn: 'Backing', icon: 'Layers' }
            ];
            return { success: true, data: { categories } };
        }
        return api.get('/materials/categories');
    }
};
