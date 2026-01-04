/**
 * Products Service
 * Handles product operations with mock data support
 */

import api, { MOCK_MODE } from './config';
import { getMockData, updateMockData, generateId } from './mockData';

export const productsService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const data = getMockData();
            let products = [...data.products];

            if (params.status) {
                products = products.filter(p => p.status === params.status);
            }
            if (params.category) {
                products = products.filter(p => p.category === params.category);
            }
            if (params.search) {
                const search = params.search.toLowerCase();
                products = products.filter(p =>
                    p.name.toLowerCase().includes(search) ||
                    p.sku.toLowerCase().includes(search)
                );
            }

            return {
                success: true,
                data: {
                    products,
                    total: products.length,
                    pagination: { page: 1, limit: 100, total: products.length, totalPages: 1 }
                }
            };
        }
        const { page = 1, limit = 100, status, category, search } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (status) queryParams.append('status', status);
        if (category) queryParams.append('category', category);
        if (search) queryParams.append('search', search);
        return api.get(`/products?${queryParams}`);
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const product = data.products.find(p => p.id === id);
            if (!product) {
                return { success: false, error: { message: 'Product not found' } };
            }
            return { success: true, data: product };
        }
        return api.get(`/products/${id}`);
    },

    create: async (productData) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const newProduct = {
                id: generateId(),
                ...productData,
                createdAt: new Date().toISOString().split('T')[0],
                status: productData.status || 'ACTIVE'
            };
            data.products.unshift(newProduct);
            updateMockData('products', data.products);
            return { success: true, data: newProduct };
        }
        return api.post('/products', productData);
    },

    update: async (id, productData) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const index = data.products.findIndex(p => p.id === id);
            if (index === -1) {
                return { success: false, error: { message: 'Product not found' } };
            }
            data.products[index] = { ...data.products[index], ...productData };
            updateMockData('products', data.products);
            return { success: true, data: data.products[index] };
        }
        return api.put(`/products/${id}`, productData);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const index = data.products.findIndex(p => p.id === id);
            if (index === -1) {
                return { success: false, error: { message: 'Product not found' } };
            }
            data.products.splice(index, 1);
            updateMockData('products', data.products);
            return { success: true };
        }
        return api.delete(`/products/${id}`);
    },

    updateStock: async (id, operation, quantity) => {
        if (MOCK_MODE) {
            const data = getMockData();
            const product = data.products.find(p => p.id === id);
            if (!product) {
                return { success: false, error: { message: 'Product not found' } };
            }
            if (operation === 'ADD') {
                product.stockQuantity += quantity;
            } else if (operation === 'SUBTRACT') {
                product.stockQuantity = Math.max(0, product.stockQuantity - quantity);
            } else {
                product.stockQuantity = quantity;
            }
            updateMockData('products', data.products);
            return { success: true, data: product };
        }
        return api.post(`/products/${id}/stock`, { operation, quantity });
    },

    getParameters: async (productId) => {
        if (MOCK_MODE) {
            return { success: true, data: { parameters: [] } };
        }
        return api.get(`/products/${productId}/parameters`);
    }
};
