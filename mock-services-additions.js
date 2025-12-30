// Copy and paste these into api.js

// Products Service - Add MOCK_MODE blocks:
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const { status, category, search } = params;
            let filtered = [...mockProducts];
            if (status) filtered = filtered.filter(p => p.status === status);
            if (category) filtered = filtered.filter(p => p.category === category);
            if (search) filtered = filtered.filter(p => p.name.includes(search));
            return { success: true, data: { products: filtered, total: filtered.length } };
        }
        // existing code...
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            const product = mockProducts.find(p => p.id === id);
            return { success: true, data: product };
        }
        return api.get(`/products/${id}`);
    },

    create: async (data) => {
        if (MOCK_MODE) {
            const newProduct = { id: Date.now().toString(), ...data, createdAt: new Date().toISOString().split('T')[0] };
            mockProducts.push(newProduct);
            return { success: true, data: newProduct };
        }
        return api.post('/products', data);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            const index = mockProducts.findIndex(p => p.id === id);
            if (index !== -1) {
                mockProducts[index] = { ...mockProducts[index], ...data };
                return { success: true, data: mockProducts[index] };
            }
            return { success: false, error: { message: 'Product not found' } };
        }
        return api.put(`/products/${id}`, data);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            const index = mockProducts.findIndex(p => p.id === id);
            if (index !== -1) {
                mockProducts.splice(index, 1);
                return { success: true };
            }
            return { success: false, error: { message: 'Product not found' } };
        }
        return api.delete(`/products/${id}`);
    },

    updateStock: async (id, operation, quantity) => {
        if (MOCK_MODE) {
            const index = mockProducts.findIndex(p => p.id === id);
            if (index !== -1) {
                mockProducts[index].stock = operation === 'ADD' ?
                    mockProducts[index].stock + quantity :
                    mockProducts[index].stock - quantity;
                return { success: true, data: mockProducts[index] };
            }
            return { success: false, error: { message: 'Product not found' } };
        }
        return api.post(`/products/${id}/stock`, { operation, quantity });
    },

    getParameters: async (productId) => {
        if (MOCK_MODE) {
            const product = mockProducts.find(p => p.id === productId);
            return { success: true, data: { parameters: product?.parameters || [] } };
        }
        return api.get(`/products/${productId}/parameters`);
    }

// Orders Service - Add to each function:
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const { status, customerId } = params;
            let filtered = [...mockOrders];
            if (status) filtered = filtered.filter(o => o.status === status);
            if (customerId) filtered = filtered.filter(o => o.customerId === customerId);
            return { success: true, data: { orders: filtered, total: filtered.length } };
        }
        // existing code...
    },

// Tasks Service:
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const { status, department, assignee } = params;
            let filtered = [...mockTasks];
            if (status) filtered = filtered.filter(t => t.status === status);
            if (department) filtered = filtered.filter(t => t.department === department);
            if (assignee) filtered = filtered.filter(t => t.assignee === assignee);
            return { success: true, data: { tasks: filtered, total: filtered.length } };
        }
        // existing code...
    },

// Workflows Service:
    getAll: async () => {
        if (MOCK_MODE) {
            return { success: true, data: { workflows: mockWorkflows, total: mockWorkflows.length } };
        }
        return api.get('/workflows');
    },

    getActive: async () => {
        if (MOCK_MODE) {
            const active = mockWorkflows.filter(w => w.status === 'ACTIVE');
            return { success: true, data: active };
        }
        return api.get('/workflows/active');
    },
