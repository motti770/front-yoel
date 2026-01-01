// Navigation items based on role with translation keys and categories
export const getNavItemsForRole = (role) => {
    const allItems = [
        // CRM
        { path: '/leads', labelKey: 'leads', icon: 'Target', roles: ['ADMIN', 'MANAGER'], category: 'crm' },
        { path: '/', labelKey: 'dashboard', icon: 'LayoutDashboard', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'], category: 'crm' },
        { path: '/customers', labelKey: 'customers', icon: 'Users', roles: ['ADMIN', 'MANAGER'], category: 'crm' },

        // Production & Operations
        { path: '/orders', labelKey: 'orders', icon: 'ShoppingCart', roles: ['ADMIN', 'MANAGER'], category: 'production' },
        { path: '/tasks', labelKey: 'tasks', icon: 'CheckSquare', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'], category: 'production' },
        { path: '/workflows', labelKey: 'workflows', icon: 'GitBranch', roles: ['ADMIN', 'MANAGER'], category: 'production' },
        { path: '/calendar', labelKey: 'calendar', icon: 'Calendar', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'], category: 'production' },

        // Inventory
        { path: '/products', labelKey: 'products', icon: 'Package', roles: ['ADMIN', 'MANAGER'], category: 'inventory' },
        { path: '/materials', labelKey: 'materials', icon: 'Shirt', roles: ['ADMIN', 'MANAGER'], category: 'inventory' },
        { path: '/assets', labelKey: 'assets', icon: 'FolderOpen', roles: ['ADMIN', 'MANAGER'], category: 'inventory' },
        { path: '/stock-orders', labelKey: 'stockOrders', icon: 'Warehouse', roles: ['ADMIN', 'MANAGER'], category: 'inventory' },

        // Management & System
        { path: '/analytics', labelKey: 'analytics', icon: 'BarChart3', roles: ['ADMIN', 'MANAGER'], category: 'management' },
        { path: '/users', labelKey: 'users', icon: 'UserCog', roles: ['ADMIN'], category: 'management' },
        { path: '/departments', labelKey: 'departments', icon: 'Building2', roles: ['ADMIN', 'MANAGER'], category: 'management' },
        { path: '/parameters', labelKey: 'parameters', icon: 'Sliders', roles: ['ADMIN', 'MANAGER'], category: 'management' },
        { path: '/import', labelKey: 'import', icon: 'Upload', roles: ['ADMIN', 'MANAGER'], category: 'management' },
        { path: '/settings', labelKey: 'settings', icon: 'Settings', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'], category: 'management' }
    ];

    return allItems.filter(item => item.roles.includes(role));
};
