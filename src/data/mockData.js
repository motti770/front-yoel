// Mock Data for CRM System - Based on API Reference
// This matches the actual API structure for easy integration later

// ============ USERS (with roles) ============
export const mockUsers = [
    {
        id: 'user-1',
        email: 'admin@theshul.com',
        firstName: 'יוסי',
        lastName: 'כהן',
        role: 'ADMIN',
        phone: '050-1234567',
        avatar: 'יכ',
        departmentId: null,
        department: null,
        createdAt: '2024-01-01'
    },
    {
        id: 'user-2',
        email: 'manager@theshul.com',
        firstName: 'שרה',
        lastName: 'לוי',
        role: 'MANAGER',
        phone: '050-2345678',
        avatar: 'של',
        departmentId: 'dept-1',
        department: { id: 'dept-1', name: 'רקמה', color: '#667eea' },
        createdAt: '2024-02-01'
    },
    {
        id: 'user-3',
        email: 'david@theshul.com',
        firstName: 'דוד',
        lastName: 'ישראלי',
        role: 'EMPLOYEE',
        phone: '050-3456789',
        avatar: 'די',
        departmentId: 'dept-1',
        department: { id: 'dept-1', name: 'רקמה', color: '#667eea' },
        createdAt: '2024-03-01'
    },
    {
        id: 'user-4',
        email: 'miriam@theshul.com',
        firstName: 'מרים',
        lastName: 'אברהמי',
        role: 'EMPLOYEE',
        phone: '050-4567890',
        avatar: 'מא',
        departmentId: 'dept-2',
        department: { id: 'dept-2', name: 'חיתוך', color: '#f5576c' },
        createdAt: '2024-03-15'
    },
    {
        id: 'user-5',
        email: 'moshe@theshul.com',
        firstName: 'משה',
        lastName: 'גולן',
        role: 'EMPLOYEE',
        phone: '050-5678901',
        avatar: 'מג',
        departmentId: 'dept-3',
        department: { id: 'dept-3', name: 'תפירה', color: '#4facfe' },
        createdAt: '2024-04-01'
    }
];

// Current user simulation (can be changed via role switcher)
export const currentUser = mockUsers[0]; // Default: ADMIN

// ============ DEPARTMENTS ============
export const mockDepartments = [
    {
        id: 'dept-1',
        name: 'עיצוב רקמה',
        code: 'EMBROIDERY_DESIGN',
        description: 'מחלקת עיצוב רקמה - באוקראינה 🇺🇦',
        color: '#667eea',
        isActive: true,
        employeeCount: 5,
        activeTasks: 12,
        location: 'Ukraine'
    },
    {
        id: 'dept-2',
        name: 'חיתוך',
        code: 'CUTTING',
        description: 'מחלקת חיתוך בדים',
        color: '#f5576c',
        isActive: true,
        employeeCount: 3,
        activeTasks: 8,
        location: 'Israel'
    },
    {
        id: 'dept-3',
        name: 'תפירה',
        code: 'SEWING',
        description: 'מחלקת תפירה וגימור',
        color: '#4facfe',
        isActive: true,
        employeeCount: 4,
        activeTasks: 15,
        location: 'Israel'
    },
    {
        id: 'dept-4',
        name: 'איכות',
        code: 'QA',
        description: 'מחלקת בקרת איכות',
        color: '#00f2fe',
        isActive: true,
        employeeCount: 2,
        activeTasks: 6,
        location: 'Israel'
    },
    {
        id: 'dept-5',
        name: 'אריזה',
        code: 'PACKAGING',
        description: 'מחלקת אריזה ומשלוחים',
        color: '#fee140',
        isActive: true,
        employeeCount: 2,
        activeTasks: 4,
        location: 'Israel'
    },
    {
        id: 'dept-6',
        name: 'מפעל ייצור',
        code: 'PRODUCTION',
        description: 'מפעל ייצור - באוקראינה 🇺🇦',
        color: '#a855f7',
        isActive: true,
        employeeCount: 12,
        activeTasks: 25,
        location: 'Ukraine'
    }
];

// ============ CUSTOMERS ============
export const mockCustomers = [
    {
        id: 'cust-1',
        name: 'בית הכנסת הגדול',
        email: 'contact@bigshul.org',
        phone: '03-1234567',
        companyName: 'עמותת בית הכנסת הגדול',
        status: 'ACTIVE',
        totalOrders: 8,
        totalSpent: 125000,
        createdAt: '2024-01-15',
        updatedAt: '2024-12-01'
    },
    {
        id: 'cust-2',
        name: 'קהילת אור חדש',
        email: 'info@orchadash.com',
        phone: '02-9876543',
        companyName: 'קהילת אור חדש ירושלים',
        status: 'ACTIVE',
        totalOrders: 5,
        totalSpent: 85000,
        createdAt: '2024-02-20',
        updatedAt: '2024-11-15'
    },
    {
        id: 'cust-3',
        name: 'בית מדרש תורה ותפילה',
        email: 'office@torahtefila.org',
        phone: '04-5551234',
        companyName: 'בית מדרש תורה ותפילה חיפה',
        status: 'ACTIVE',
        totalOrders: 3,
        totalSpent: 45000,
        createdAt: '2024-03-10',
        updatedAt: '2024-10-20'
    },
    {
        id: 'cust-4',
        name: 'ישיבת נתיבות התורה',
        email: 'admin@netivot.edu',
        phone: '08-6667777',
        companyName: 'ישיבת נתיבות התורה באר שבע',
        status: 'ACTIVE',
        totalOrders: 12,
        totalSpent: 210000,
        createdAt: '2024-01-05',
        updatedAt: '2024-12-05'
    },
    {
        id: 'cust-5',
        name: 'עמותת שערי רחמים',
        email: 'contact@shaarei.org',
        phone: '09-8889999',
        companyName: 'עמותת שערי רחמים נתניה',
        status: 'INACTIVE',
        totalOrders: 2,
        totalSpent: 18000,
        createdAt: '2024-04-01',
        updatedAt: '2024-06-15'
    }
];

// ============ PRODUCTS ============
export const mockProducts = [
    {
        id: 'prod-1',
        name: 'פרוכת לארון קודש',
        sku: 'PAR-001',
        description: 'פרוכת מהודרת לארון הקודש עם רקמה בעבודת יד',
        price: 15000,
        stockQuantity: 3,
        category: 'RITUAL',
        status: 'ACTIVE',
        workflowId: 'wf-1',
        workflow: { id: 'wf-1', name: 'תהליך פרוכת' },
        parameterCount: 4
    },
    {
        id: 'prod-2',
        name: 'מעיל לספר תורה',
        sku: 'MEI-001',
        description: 'מעיל מפואר לספר תורה עם רקמות זהב',
        price: 8000,
        stockQuantity: 5,
        category: 'RITUAL',
        status: 'ACTIVE',
        workflowId: 'wf-2',
        workflow: { id: 'wf-2', name: 'תהליך מעיל' },
        parameterCount: 3
    },
    {
        id: 'prod-3',
        name: 'כיסוי לבימה',
        sku: 'BIM-001',
        description: 'כיסוי מהודר לבימה עם עיטורים',
        price: 5000,
        stockQuantity: 8,
        category: 'FURNITURE',
        status: 'ACTIVE',
        workflowId: 'wf-3',
        workflow: { id: 'wf-3', name: 'תהליך כיסוי בימה' },
        parameterCount: 2
    },
    {
        id: 'prod-4',
        name: 'טלית מהודרת',
        sku: 'TAL-001',
        description: 'טלית גדול עם עטרה מרוקמת',
        price: 2500,
        stockQuantity: 20,
        category: 'PERSONAL',
        status: 'ACTIVE',
        workflowId: 'wf-4',
        workflow: { id: 'wf-4', name: 'תהליך טלית' },
        parameterCount: 3
    },
    {
        id: 'prod-5',
        name: 'כתר לספר תורה',
        sku: 'KET-001',
        description: 'כתר מפואר לספר תורה',
        price: 25000,
        stockQuantity: 1,
        category: 'RITUAL',
        status: 'ACTIVE',
        workflowId: null,
        workflow: null,
        parameterCount: 2
    },
    {
        id: 'prod-6',
        name: 'רימונים לספר תורה',
        sku: 'RIM-001',
        description: 'זוג רימונים מעוצבים',
        price: 12000,
        stockQuantity: 0,
        category: 'RITUAL',
        status: 'ACTIVE',
        workflowId: null,
        workflow: null,
        parameterCount: 1
    }
];

// ============ ORDERS ============
export const mockOrders = [
    {
        id: 'ord-1',
        orderNumber: 'ORD-20241201-001',
        customerId: 'cust-1',
        customer: mockCustomers[0],
        status: 'PROCESSING',
        totalAmount: 23000,
        items: [
            {
                id: 'item-1',
                productId: 'prod-1',
                product: mockProducts[0],
                quantity: 1,
                unitPrice: 15000,
                selectedParameters: [
                    { parameterId: 'param-1', optionId: 'opt-1', value: 'זהב' },
                    { parameterId: 'param-2', optionId: 'opt-4', value: 'קטיפה אדומה' }
                ]
            },
            {
                id: 'item-2',
                productId: 'prod-2',
                product: mockProducts[1],
                quantity: 1,
                unitPrice: 8000,
                selectedParameters: []
            }
        ],
        notes: 'להכין לפני חג הפסח',
        createdAt: '2024-12-01',
        updatedAt: '2024-12-05'
    },
    {
        id: 'ord-2',
        orderNumber: 'ORD-20241128-002',
        customerId: 'cust-2',
        customer: mockCustomers[1],
        status: 'PENDING',
        totalAmount: 15000,
        items: [
            {
                id: 'item-3',
                productId: 'prod-1',
                product: mockProducts[0],
                quantity: 1,
                unitPrice: 15000,
                selectedParameters: []
            }
        ],
        notes: '',
        createdAt: '2024-11-28',
        updatedAt: '2024-11-28'
    },
    {
        id: 'ord-3',
        orderNumber: 'ORD-20241125-003',
        customerId: 'cust-4',
        customer: mockCustomers[3],
        status: 'COMPLETED',
        totalAmount: 45000,
        items: [
            {
                id: 'item-4',
                productId: 'prod-5',
                product: mockProducts[4],
                quantity: 1,
                unitPrice: 25000,
                selectedParameters: []
            },
            {
                id: 'item-5',
                productId: 'prod-6',
                product: mockProducts[5],
                quantity: 1,
                unitPrice: 12000,
                selectedParameters: []
            },
            {
                id: 'item-6',
                productId: 'prod-2',
                product: mockProducts[1],
                quantity: 1,
                unitPrice: 8000,
                selectedParameters: []
            }
        ],
        notes: 'הזמנה מושלמה - נשלחה',
        createdAt: '2024-11-25',
        updatedAt: '2024-12-01'
    },
    {
        id: 'ord-4',
        orderNumber: 'ORD-20241120-004',
        customerId: 'cust-3',
        customer: mockCustomers[2],
        status: 'PROCESSING',
        totalAmount: 7500,
        items: [
            {
                id: 'item-7',
                productId: 'prod-3',
                product: mockProducts[2],
                quantity: 1,
                unitPrice: 5000,
                selectedParameters: []
            },
            {
                id: 'item-8',
                productId: 'prod-4',
                product: mockProducts[3],
                quantity: 1,
                unitPrice: 2500,
                selectedParameters: []
            }
        ],
        notes: '',
        createdAt: '2024-11-20',
        updatedAt: '2024-11-22'
    }
];

// ============ WORKFLOWS ============
export const mockWorkflows = [
    {
        id: 'wf-1',
        name: 'תהליך פרוכת',
        code: 'PAROCHET_WF',
        description: 'תהליך ייצור פרוכת מלא',
        isActive: true,
        steps: [
            { id: 'step-1', name: 'חיתוך בד', departmentId: 'dept-2', department: mockDepartments[1], estimatedDurationDays: 1, sortOrder: 1 },
            { id: 'step-2', name: 'רקמה ראשית', departmentId: 'dept-1', department: mockDepartments[0], estimatedDurationDays: 5, sortOrder: 2 },
            { id: 'step-3', name: 'תפירה וגימור', departmentId: 'dept-3', department: mockDepartments[2], estimatedDurationDays: 2, sortOrder: 3 },
            { id: 'step-4', name: 'בקרת איכות', departmentId: 'dept-4', department: mockDepartments[3], estimatedDurationDays: 1, sortOrder: 4 },
            { id: 'step-5', name: 'אריזה', departmentId: 'dept-5', department: mockDepartments[4], estimatedDurationDays: 1, sortOrder: 5 }
        ],
        productCount: 1
    },
    {
        id: 'wf-2',
        name: 'תהליך מעיל',
        code: 'MEIL_WF',
        description: 'תהליך ייצור מעיל לספר תורה',
        isActive: true,
        steps: [
            { id: 'step-6', name: 'חיתוך בד', departmentId: 'dept-2', department: mockDepartments[1], estimatedDurationDays: 1, sortOrder: 1 },
            { id: 'step-7', name: 'רקמה', departmentId: 'dept-1', department: mockDepartments[0], estimatedDurationDays: 3, sortOrder: 2 },
            { id: 'step-8', name: 'תפירה', departmentId: 'dept-3', department: mockDepartments[2], estimatedDurationDays: 2, sortOrder: 3 },
            { id: 'step-9', name: 'בקרת איכות', departmentId: 'dept-4', department: mockDepartments[3], estimatedDurationDays: 1, sortOrder: 4 }
        ],
        productCount: 1
    },
    {
        id: 'wf-3',
        name: 'תהליך כיסוי בימה',
        code: 'BIMA_WF',
        description: 'תהליך ייצור כיסוי בימה',
        isActive: true,
        steps: [
            { id: 'step-10', name: 'חיתוך', departmentId: 'dept-2', department: mockDepartments[1], estimatedDurationDays: 1, sortOrder: 1 },
            { id: 'step-11', name: 'רקמה', departmentId: 'dept-1', department: mockDepartments[0], estimatedDurationDays: 2, sortOrder: 2 },
            { id: 'step-12', name: 'תפירה', departmentId: 'dept-3', department: mockDepartments[2], estimatedDurationDays: 1, sortOrder: 3 }
        ],
        productCount: 1
    },
    {
        id: 'wf-4',
        name: 'תהליך טלית',
        code: 'TALIT_WF',
        description: 'תהליך ייצור טלית',
        isActive: true,
        steps: [
            { id: 'step-13', name: 'חיתוך', departmentId: 'dept-2', department: mockDepartments[1], estimatedDurationDays: 1, sortOrder: 1 },
            { id: 'step-14', name: 'רקמת עטרה', departmentId: 'dept-1', department: mockDepartments[0], estimatedDurationDays: 1, sortOrder: 2 },
            { id: 'step-15', name: 'תפירה', departmentId: 'dept-3', department: mockDepartments[2], estimatedDurationDays: 1, sortOrder: 3 }
        ],
        productCount: 1
    }
];

// ============ PARAMETERS ============
export const mockParameters = [
    {
        id: 'param-1',
        name: 'צבע רקמה',
        code: 'embroidery_color',
        type: 'COLOR',
        description: 'בחר צבע לרקמה',
        isRequired: true,
        isActive: true,
        sortOrder: 1,
        options: [
            { id: 'opt-1', value: 'gold', label: 'זהב', priceImpact: 500, colorHex: '#FFD700', sortOrder: 1, isActive: true },
            { id: 'opt-2', value: 'silver', label: 'כסף', priceImpact: 300, colorHex: '#C0C0C0', sortOrder: 2, isActive: true },
            { id: 'opt-3', value: 'white', label: 'לבן', priceImpact: 0, colorHex: '#FFFFFF', sortOrder: 3, isActive: true }
        ]
    },
    {
        id: 'param-2',
        name: 'סוג בד',
        code: 'fabric_type',
        type: 'SELECT',
        description: 'בחר סוג בד',
        isRequired: true,
        isActive: true,
        sortOrder: 2,
        options: [
            { id: 'opt-4', value: 'velvet_red', label: 'קטיפה אדומה', priceImpact: 0, colorHex: '#8B0000', sortOrder: 1, isActive: true },
            { id: 'opt-5', value: 'velvet_blue', label: 'קטיפה כחולה', priceImpact: 0, colorHex: '#00008B', sortOrder: 2, isActive: true },
            { id: 'opt-6', value: 'velvet_white', label: 'קטיפה לבנה', priceImpact: 200, colorHex: '#FFFFF0', sortOrder: 3, isActive: true },
            { id: 'opt-7', value: 'silk', label: 'משי', priceImpact: 1000, colorHex: '#F5F5DC', sortOrder: 4, isActive: true }
        ]
    },
    {
        id: 'param-3',
        name: 'טקסט לרקמה',
        code: 'embroidery_text',
        type: 'TEXT',
        description: 'הזן טקסט לרקמה',
        isRequired: false,
        isActive: true,
        sortOrder: 3,
        options: []
    },
    {
        id: 'param-4',
        name: 'גודל',
        code: 'size',
        type: 'SELECT',
        description: 'בחר גודל',
        isRequired: true,
        isActive: true,
        sortOrder: 4,
        options: [
            { id: 'opt-8', value: 'small', label: 'קטן', priceImpact: -500, colorHex: null, sortOrder: 1, isActive: true },
            { id: 'opt-9', value: 'medium', label: 'בינוני', priceImpact: 0, colorHex: null, sortOrder: 2, isActive: true },
            { id: 'opt-10', value: 'large', label: 'גדול', priceImpact: 800, colorHex: null, sortOrder: 3, isActive: true },
            { id: 'opt-11', value: 'xl', label: 'גדול מאוד', priceImpact: 1500, colorHex: null, sortOrder: 4, isActive: true }
        ]
    }
];

// ============ TASKS ============
export const mockTasks = [
    {
        id: 'task-1',
        status: 'IN_PROGRESS',
        sortOrder: 1,
        notes: 'בעבודה - רקמה ראשית',
        completedAt: null,
        workflowStep: { id: 'step-2', name: 'רקמה ראשית', estimatedDurationDays: 5 },
        department: mockDepartments[0],
        departmentId: 'dept-1',
        assignedTo: mockUsers[2],
        assignedToId: 'user-3',
        orderItem: {
            id: 'item-1',
            quantity: 1,
            unitPrice: 15000,
            product: mockProducts[0],
            order: {
                orderNumber: 'ORD-20241201-001',
                customer: mockCustomers[0]
            }
        },
        createdAt: '2024-12-02',
        updatedAt: '2024-12-05'
    },
    {
        id: 'task-2',
        status: 'PENDING',
        sortOrder: 2,
        notes: null,
        completedAt: null,
        workflowStep: { id: 'step-3', name: 'תפירה וגימור', estimatedDurationDays: 2 },
        department: mockDepartments[2],
        departmentId: 'dept-3',
        assignedTo: null,
        assignedToId: null,
        orderItem: {
            id: 'item-1',
            quantity: 1,
            unitPrice: 15000,
            product: mockProducts[0],
            order: {
                orderNumber: 'ORD-20241201-001',
                customer: mockCustomers[0]
            }
        },
        createdAt: '2024-12-02',
        updatedAt: '2024-12-02'
    },
    {
        id: 'task-3',
        status: 'IN_PROGRESS',
        sortOrder: 1,
        notes: 'חיתוך בד למעיל',
        completedAt: null,
        workflowStep: { id: 'step-6', name: 'חיתוך בד', estimatedDurationDays: 1 },
        department: mockDepartments[1],
        departmentId: 'dept-2',
        assignedTo: mockUsers[3],
        assignedToId: 'user-4',
        orderItem: {
            id: 'item-2',
            quantity: 1,
            unitPrice: 8000,
            product: mockProducts[1],
            order: {
                orderNumber: 'ORD-20241201-001',
                customer: mockCustomers[0]
            }
        },
        createdAt: '2024-12-03',
        updatedAt: '2024-12-05'
    },
    {
        id: 'task-4',
        status: 'COMPLETED',
        sortOrder: 1,
        notes: 'חיתוך הושלם',
        completedAt: '2024-12-03',
        workflowStep: { id: 'step-1', name: 'חיתוך בד', estimatedDurationDays: 1 },
        department: mockDepartments[1],
        departmentId: 'dept-2',
        assignedTo: mockUsers[3],
        assignedToId: 'user-4',
        orderItem: {
            id: 'item-1',
            quantity: 1,
            unitPrice: 15000,
            product: mockProducts[0],
            order: {
                orderNumber: 'ORD-20241201-001',
                customer: mockCustomers[0]
            }
        },
        createdAt: '2024-12-01',
        updatedAt: '2024-12-03'
    },
    {
        id: 'task-5',
        status: 'PENDING',
        sortOrder: 1,
        notes: null,
        completedAt: null,
        workflowStep: { id: 'step-1', name: 'חיתוך בד', estimatedDurationDays: 1 },
        department: mockDepartments[1],
        departmentId: 'dept-2',
        assignedTo: null,
        assignedToId: null,
        orderItem: {
            id: 'item-3',
            quantity: 1,
            unitPrice: 15000,
            product: mockProducts[0],
            order: {
                orderNumber: 'ORD-20241128-002',
                customer: mockCustomers[1]
            }
        },
        createdAt: '2024-11-28',
        updatedAt: '2024-11-28'
    }
];

// ============ ANALYTICS DATA ============
export const mockAnalytics = {
    dashboard: {
        totalRevenue: 90500,
        totalOrders: 4,
        totalCustomers: 5,
        activeTasks: 3,
        pendingOrders: 1,
        completedOrdersThisMonth: 1
    },
    sales: {
        totalSales: 90500,
        orderCount: 4,
        averageOrderValue: 22625,
        salesByStatus: {
            COMPLETED: 45000,
            PROCESSING: 30500,
            PENDING: 15000
        }
    },
    revenueTrends: [
        { period: 'ינואר', revenue: 85000, orderCount: 3 },
        { period: 'פברואר', revenue: 62000, orderCount: 2 },
        { period: 'מרץ', revenue: 78000, orderCount: 3 },
        { period: 'אפריל', revenue: 95000, orderCount: 4 },
        { period: 'מאי', revenue: 110000, orderCount: 5 },
        { period: 'יוני', revenue: 88000, orderCount: 3 },
        { period: 'יולי', revenue: 72000, orderCount: 2 },
        { period: 'אוגוסט', revenue: 65000, orderCount: 2 },
        { period: 'ספטמבר', revenue: 98000, orderCount: 4 },
        { period: 'אוקטובר', revenue: 125000, orderCount: 5 },
        { period: 'נובמבר', revenue: 145000, orderCount: 6 },
        { period: 'דצמבר', revenue: 90500, orderCount: 4 }
    ],
    topProducts: [
        { id: 'prod-1', name: 'פרוכת לארון קודש', orderCount: 15, revenue: 225000 },
        { id: 'prod-2', name: 'מעיל לספר תורה', orderCount: 22, revenue: 176000 },
        { id: 'prod-5', name: 'כתר לספר תורה', orderCount: 8, revenue: 200000 },
        { id: 'prod-4', name: 'טלית מהודרת', orderCount: 45, revenue: 112500 },
        { id: 'prod-3', name: 'כיסוי לבימה', orderCount: 12, revenue: 60000 }
    ],
    tasksByStatus: {
        PENDING: 2,
        IN_PROGRESS: 2,
        COMPLETED: 1,
        BLOCKED: 0,
        CANCELLED: 0
    },
    tasksByDepartment: [
        { departmentId: 'dept-1', departmentName: 'רקמה', taskCount: 1, color: '#667eea' },
        { departmentId: 'dept-2', departmentName: 'חיתוך', taskCount: 3, color: '#f5576c' },
        { departmentId: 'dept-3', departmentName: 'תפירה', taskCount: 1, color: '#4facfe' }
    ]
};

// ============ ACTIVITIES ============
export const mockActivities = [
    {
        id: 'act-1',
        type: 'order',
        title: 'הזמנה חדשה התקבלה',
        description: 'הזמנה ORD-20241201-001 מבית הכנסת הגדול',
        timestamp: '2024-12-01 09:30',
        user: 'יוסי כהן'
    },
    {
        id: 'act-2',
        type: 'task',
        title: 'משימה הושלמה',
        description: 'חיתוך בד הושלם - פרוכת לארון קודש',
        timestamp: '2024-12-03 14:20',
        user: 'מרים אברהמי'
    },
    {
        id: 'act-3',
        type: 'task',
        title: 'משימה התחילה',
        description: 'רקמה ראשית - בעבודה',
        timestamp: '2024-12-05 08:00',
        user: 'דוד ישראלי'
    },
    {
        id: 'act-4',
        type: 'customer',
        title: 'לקוח חדש נוסף',
        description: 'עמותת שערי רחמים נתניה',
        timestamp: '2024-12-05 11:45',
        user: 'שרה לוי'
    }
];

// ============ HELPER FUNCTIONS ============

// Get tasks for specific user (EMPLOYEE view)
export const getMyTasks = (userId) => {
    return mockTasks.filter(task => task.assignedToId === userId);
};

// Get tasks for specific department
export const getDepartmentTasks = (departmentId) => {
    return mockTasks.filter(task => task.departmentId === departmentId);
};

// Check if user can access resource based on role
export const canAccess = (userRole, resource) => {
    const permissions = {
        ADMIN: ['all'],
        MANAGER: ['dashboard', 'customers', 'products', 'orders', 'tasks', 'workflows', 'departments', 'parameters', 'analytics', 'calendar', 'settings'],
        EMPLOYEE: ['dashboard', 'my-tasks', 'calendar', 'settings']
    };

    if (userRole === 'ADMIN') return true;
    return permissions[userRole]?.includes(resource) || false;
};

// Navigation items based on role with translation keys
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
