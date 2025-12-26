/**
 * Mock Data for Development
 * Used when the real API is unavailable
 */

// Mock Users
export const mockUsers = [
    {
        id: '1',
        name: 'יואל - מנהל',
        email: 'admin@yoel.com',
        role: 'ADMIN',
        department: 'הנהלה',
        avatar: null,
        createdAt: '2025-01-01'
    },
    {
        id: '2',
        name: 'שרה כהן',
        email: 'sarah@yoel.com',
        role: 'EMPLOYEE',
        department: 'מכירות',
        avatar: null,
        createdAt: '2025-01-15'
    },
    {
        id: '3',
        name: 'רחל לוי',
        email: 'rachel@yoel.com',
        role: 'EMPLOYEE',
        department: 'עיצוב',
        avatar: null,
        createdAt: '2025-02-01'
    }
];

// Mock Customers
export const mockCustomers = [
    {
        id: '1',
        name: 'בית כנסת אור החיים',
        email: 'orchaim@email.com',
        phone: '03-1234567',
        status: 'ACTIVE',
        type: 'בית כנסת',
        address: 'רחוב הרצל 15, תל אביב',
        notes: 'לקוח VIP',
        createdAt: '2025-01-10',
        ordersCount: 5,
        totalSpent: 45000
    },
    {
        id: '2',
        name: 'בית כנסת בית יעקב',
        email: 'beityakov@email.com',
        phone: '02-9876543',
        status: 'ACTIVE',
        type: 'בית כנסת',
        address: 'רחוב יפו 100, ירושלים',
        notes: '',
        createdAt: '2025-02-15',
        ordersCount: 2,
        totalSpent: 18000
    },
    {
        id: '3',
        name: 'משפחת גולדשטיין',
        email: 'gold@email.com',
        phone: '054-1112222',
        status: 'ACTIVE',
        type: 'פרטי',
        address: 'בני ברק',
        notes: 'מזמין לאירועים',
        createdAt: '2025-03-01',
        ordersCount: 1,
        totalSpent: 8500
    }
];

// Mock Products
export const mockProducts = [
    {
        id: '1',
        name: 'פרוכת אריות',
        sku: 'PAR-001',
        category: 'פרוכות',
        basePrice: 5000,
        status: 'ACTIVE',
        description: 'פרוכת מפוארת עם עיטור אריות',
        imageUrl: null,
        workflowId: '1',
        createdAt: '2025-01-01'
    },
    {
        id: '2',
        name: 'פרוכת לוחות הברית',
        sku: 'PAR-002',
        category: 'פרוכות',
        basePrice: 4500,
        status: 'ACTIVE',
        description: 'פרוכת קלאסית עם לוחות הברית',
        imageUrl: null,
        workflowId: '1',
        createdAt: '2025-01-05'
    },
    {
        id: '3',
        name: 'טלית לחתן',
        sku: 'TAL-001',
        category: 'טליתות',
        basePrice: 2500,
        status: 'ACTIVE',
        description: 'טלית מרוקמת לחתן',
        imageUrl: null,
        workflowId: '2',
        createdAt: '2025-01-10'
    },
    {
        id: '4',
        name: 'כיסוי ספר תורה',
        sku: 'KIS-001',
        category: 'אביזרי ספר תורה',
        basePrice: 3500,
        status: 'ACTIVE',
        description: 'כיסוי מהודר לספר תורה',
        imageUrl: null,
        workflowId: '3',
        createdAt: '2025-02-01'
    }
];

// Mock Orders
export const mockOrders = [
    {
        id: '1',
        orderNumber: 'ORD-2025-001',
        customerId: '1',
        customerName: 'בית כנסת אור החיים',
        status: 'IN_PROGRESS',
        totalAmount: 12500,
        paidAmount: 6250,
        items: [
            { productId: '1', productName: 'פרוכת אריות', quantity: 1, price: 7500 },
            { productId: '4', productName: 'כיסוי ספר תורה', quantity: 1, price: 5000 }
        ],
        notes: 'צבע זהב, הקדשה: לזכר אבי מורי',
        dueDate: '2025-02-15',
        createdAt: '2025-01-20'
    },
    {
        id: '2',
        orderNumber: 'ORD-2025-002',
        customerId: '2',
        customerName: 'בית כנסת בית יעקב',
        status: 'PENDING',
        totalAmount: 4500,
        paidAmount: 0,
        items: [
            { productId: '2', productName: 'פרוכת לוחות הברית', quantity: 1, price: 4500 }
        ],
        notes: 'צבע בורדו',
        dueDate: '2025-03-01',
        createdAt: '2025-02-01'
    },
    {
        id: '3',
        orderNumber: 'ORD-2025-003',
        customerId: '3',
        customerName: 'משפחת גולדשטיין',
        status: 'COMPLETED',
        totalAmount: 2800,
        paidAmount: 2800,
        items: [
            { productId: '3', productName: 'טלית לחתן', quantity: 1, price: 2800 }
        ],
        notes: 'לחתונה ב-15.3',
        dueDate: '2025-03-10',
        createdAt: '2025-02-10'
    }
];

// Mock Leads
export const mockLeads = [
    {
        id: '1',
        name: 'בית כנסת שערי ציון',
        contactName: 'הרב משה כהן',
        email: 'shaareitzion@email.com',
        phone: '03-5551234',
        stage: 'NEW',
        source: 'אתר',
        notes: 'מעוניינים בפרוכת חדשה',
        assignedTo: '2',
        value: 8000,
        createdAt: '2025-12-20'
    },
    {
        id: '2',
        name: 'משפחת רוזנברג',
        contactName: 'יעקב רוזנברג',
        email: 'rosenberg@email.com',
        phone: '054-7778888',
        stage: 'CONTACTED',
        source: 'המלצה',
        notes: 'חתונה של הבן בחודש הבא',
        assignedTo: '2',
        value: 3500,
        createdAt: '2025-12-22'
    },
    {
        id: '3',
        name: 'בית מדרש תורת אמת',
        contactName: 'אברהם לוי',
        email: 'toratemes@email.com',
        phone: '02-6669999',
        stage: 'PROPOSAL',
        source: 'פייסבוק',
        notes: 'רוצים הצעת מחיר ל-3 פרוכות',
        assignedTo: '2',
        value: 18000,
        createdAt: '2025-12-18'
    },
    {
        id: '4',
        name: 'קהילת בני תורה',
        contactName: 'דוד ישראלי',
        email: 'bneitorah@email.com',
        phone: '08-1234567',
        stage: 'NEGOTIATION',
        source: 'אתר',
        notes: 'מחכים לאישור תקציב',
        assignedTo: '2',
        value: 25000,
        createdAt: '2025-12-15'
    }
];

// Mock Departments
export const mockDepartments = [
    { id: '1', name: 'הנהלה', description: 'ניהול כללי', isActive: true, employeeCount: 1 },
    { id: '2', name: 'מכירות', description: 'מכירות ולידים', isActive: true, employeeCount: 2 },
    { id: '3', name: 'עיצוב', description: 'עיצוב ורקמה', isActive: true, employeeCount: 3 },
    { id: '4', name: 'ייצור', description: 'ייצור והרכבה', isActive: true, employeeCount: 4 },
    { id: '5', name: 'לוגיסטיקה', description: 'אריזה ומשלוח', isActive: true, employeeCount: 2 }
];

// Mock Workflows
export const mockWorkflows = [
    {
        id: '1',
        name: 'תהליך פרוכת',
        description: 'תהליך ייצור פרוכת מלא',
        isActive: true,
        steps: [
            { id: '1', name: 'קבלת הזמנה', order: 1, departmentId: '2', estimatedDays: 1 },
            { id: '2', name: 'עיצוב סקיצה', order: 2, departmentId: '3', estimatedDays: 3 },
            { id: '3', name: 'אישור לקוח', order: 3, departmentId: '2', estimatedDays: 2 },
            { id: '4', name: 'עיצוב רקמה', order: 4, departmentId: '3', estimatedDays: 5 },
            { id: '5', name: 'ייצור', order: 5, departmentId: '4', estimatedDays: 7 },
            { id: '6', name: 'בקרת איכות', order: 6, departmentId: '1', estimatedDays: 1 },
            { id: '7', name: 'אריזה ומשלוח', order: 7, departmentId: '5', estimatedDays: 2 }
        ]
    },
    {
        id: '2',
        name: 'תהליך טלית',
        description: 'תהליך ייצור טלית',
        isActive: true,
        steps: [
            { id: '8', name: 'קבלת הזמנה', order: 1, departmentId: '2', estimatedDays: 1 },
            { id: '9', name: 'עיצוב', order: 2, departmentId: '3', estimatedDays: 2 },
            { id: '10', name: 'ייצור', order: 3, departmentId: '4', estimatedDays: 4 },
            { id: '11', name: 'אריזה', order: 4, departmentId: '5', estimatedDays: 1 }
        ]
    }
];

// Mock Tasks
export const mockTasks = [
    {
        id: '1',
        title: 'עיצוב סקיצה - פרוכת אריות',
        description: 'לעצב סקיצה ראשונית לפרוכת',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        orderId: '1',
        orderNumber: 'ORD-2025-001',
        departmentId: '3',
        assignedToId: '3',
        assignedToName: 'רחל לוי',
        dueDate: '2025-01-25',
        createdAt: '2025-01-21'
    },
    {
        id: '2',
        title: 'אישור הצעת מחיר',
        description: 'לשלוח ללקוח ולקבל אישור',
        status: 'PENDING',
        priority: 'MEDIUM',
        orderId: '2',
        orderNumber: 'ORD-2025-002',
        departmentId: '2',
        assignedToId: '2',
        assignedToName: 'שרה כהן',
        dueDate: '2025-02-05',
        createdAt: '2025-02-01'
    }
];

// Mock Parameters
export const mockParameters = [
    {
        id: '1',
        name: 'צבע רקע',
        type: 'SELECT',
        isActive: true,
        options: [
            { id: '1', value: 'זהב', priceModifier: 0 },
            { id: '2', value: 'כסף', priceModifier: 200 },
            { id: '3', value: 'בורדו', priceModifier: 0 },
            { id: '4', value: 'כחול', priceModifier: 0 }
        ]
    },
    {
        id: '2',
        name: 'גודל',
        type: 'SELECT',
        isActive: true,
        options: [
            { id: '5', value: '150x200 ס"מ', priceModifier: 0 },
            { id: '6', value: '170x300 ס"מ', priceModifier: 500 },
            { id: '7', value: '200x350 ס"מ', priceModifier: 1000 }
        ]
    },
    {
        id: '3',
        name: 'הקדשה',
        type: 'TEXT',
        isActive: true,
        options: []
    }
];

// Mock Analytics
export const mockAnalytics = {
    dashboard: {
        totalCustomers: 45,
        totalOrders: 28,
        totalRevenue: 185000,
        pendingOrders: 8,
        monthlyRevenue: [
            { month: 'ינואר', revenue: 35000 },
            { month: 'פברואר', revenue: 42000 },
            { month: 'מרץ', revenue: 38000 },
            { month: 'אפריל', revenue: 45000 },
            { month: 'מאי', revenue: 25000 }
        ],
        topProducts: [
            { name: 'פרוכת אריות', count: 12 },
            { name: 'פרוכת לוחות הברית', count: 8 },
            { name: 'טלית לחתן', count: 15 }
        ]
    }
};
