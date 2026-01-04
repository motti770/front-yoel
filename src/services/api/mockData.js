/**
 * Mock Data with localStorage persistence
 */

const STORAGE_KEY = 'crm_mock_data';

// Default mock data
const defaultData = {
    customers: [
        { id: 'c1', name: 'בית הכנסת אור החיים', email: 'orchaim@gmail.com', phone: '02-1234567', status: 'ACTIVE', totalOrders: 3, totalSpent: 25000, createdAt: '2024-01-15' },
        { id: 'c2', name: 'קהילת בית ישראל', email: 'beitisrael@gmail.com', phone: '03-2345678', status: 'ACTIVE', totalOrders: 2, totalSpent: 18000, createdAt: '2024-02-20' },
        { id: 'c3', name: 'בית מדרש תפארת ציון', email: 'tiferetzion@gmail.com', phone: '02-3456789', status: 'ACTIVE', totalOrders: 1, totalSpent: 8500, createdAt: '2024-03-10' },
        { id: 'c4', name: 'משפחת כהן', email: 'cohen.family@gmail.com', phone: '050-4567890', status: 'ACTIVE', totalOrders: 1, totalSpent: 4500, createdAt: '2024-04-05' },
        { id: 'c5', name: 'בית כנסת נר תמיד', email: 'nertamid@gmail.com', phone: '08-5678901', status: 'ACTIVE', totalOrders: 2, totalSpent: 15000, createdAt: '2024-05-12' },
        { id: 'c6', name: 'Congregation Beth David', email: 'bethdavid@gmail.com', phone: '+1-555-1234', status: 'ACTIVE', totalOrders: 1, totalSpent: 12000, createdAt: '2024-06-01' },
        { id: 'c7', name: 'משפחת לוי', email: 'levi.fam@gmail.com', phone: '054-6789012', status: 'ACTIVE', totalOrders: 0, totalSpent: 0, createdAt: '2024-07-15' },
        { id: 'c8', name: 'בית הכנסת הגדול', email: 'hagadol@gmail.com', phone: '03-7890123', status: 'ACTIVE', totalOrders: 4, totalSpent: 35000, createdAt: '2024-01-01' },
        { id: 'c9', name: 'Temple Emanuel', email: 'emanuel@temple.org', phone: '+1-555-5678', status: 'ACTIVE', totalOrders: 2, totalSpent: 22000, createdAt: '2024-08-20' },
        { id: 'c10', name: 'ישיבת פונוביז', email: 'ponevezh@yeshiva.org', phone: '03-8901234', status: 'ACTIVE', totalOrders: 3, totalSpent: 28000, createdAt: '2024-02-01' },
        { id: 'c11', name: 'משפחת שטיין', email: 'stein@email.com', phone: '052-9012345', status: 'ACTIVE', totalOrders: 1, totalSpent: 6500, createdAt: '2024-09-01' },
        { id: 'c12', name: 'בית הכנסת חסידי ברסלב', email: 'breslov@shul.com', phone: '02-0123456', status: 'ACTIVE', totalOrders: 2, totalSpent: 19000, createdAt: '2024-03-15' }
    ],
    products: [
        { id: 'p1', name: 'פרוכת רקומה', sku: 'PAROCHET-EMB', description: 'פרוכת לארון קודש עם רקמה מפוארת', price: 8500, stockQuantity: 0, category: 'RITUAL', status: 'ACTIVE', image: '/images/parochet.jpg' },
        { id: 'p2', name: 'מעיל לספר תורה', sku: 'MEIL-STD', description: 'מעיל מפואר לספר תורה', price: 4500, stockQuantity: 2, category: 'RITUAL', status: 'ACTIVE', image: '/images/meil.jpg' },
        { id: 'p3', name: 'כיסוי בימה ועמוד', sku: 'BIMA-AMUD', description: 'כיסוי מרהיב לבימה ועמוד החזן', price: 6500, stockQuantity: 1, category: 'RITUAL', status: 'ACTIVE', image: '/images/bima.jpg' },
        { id: 'p4', name: 'כיסוי טלית ותפילין', sku: 'TALIT-TEFILIN', description: 'כיסוי יוקרתי לטלית ותפילין', price: 1200, stockQuantity: 10, category: 'RITUAL', status: 'ACTIVE', image: '/images/talit.jpg' },
        { id: 'p5', name: 'פרוכת פשוטה', sku: 'PAROCHET-SIMPLE', description: 'פרוכת בעיצוב קלאסי ופשוט', price: 5500, stockQuantity: 0, category: 'RITUAL', status: 'ACTIVE', image: '/images/parochet-simple.jpg' },
        { id: 'p6', name: 'תיקון פרוכת', sku: 'REPAIR-PAROCHET', description: 'שיפוץ ותיקון פרוכת קיימת', price: 2000, stockQuantity: 0, category: 'SERVICE', status: 'ACTIVE', image: '/images/repair.jpg' }
    ],
    departments: [
        { id: 'd1', name: 'עיצוב רקמה', code: 'DESIGN', color: '#6366f1', description: 'מחלקת עיצוב', employeeCount: 3 },
        { id: 'd2', name: 'רקמה', code: 'EMBROIDERY', color: '#8b5cf6', description: 'מחלקת רקמה', employeeCount: 5 },
        { id: 'd3', name: 'תפירה', code: 'SEWING', color: '#ec4899', description: 'מחלקת תפירה', employeeCount: 4 },
        { id: 'd4', name: 'בקרת איכות', code: 'QC', color: '#10b981', description: 'בקרת איכות', employeeCount: 2 },
        { id: 'd5', name: 'משלוחים', code: 'SHIPPING', color: '#f59e0b', description: 'מחלקת משלוחים', employeeCount: 2 }
    ],
    workflows: [
        { id: 'w1', name: 'תהליך ייצור פרוכת', code: 'PAROCHET_FULL', description: 'תהליך מלא לייצור פרוכת רקומה', stepsCount: 8 },
        { id: 'w2', name: 'תהליך ייצור מעיל', code: 'MEIL_STD', description: 'תהליך ייצור מעיל לספר תורה', stepsCount: 6 },
        { id: 'w3', name: 'תהליך ייצור כיסוי בימה', code: 'BIMA_STD', description: 'תהליך ייצור כיסוי לבימה ועמוד', stepsCount: 7 },
        { id: 'w4', name: 'תהליך ייצור כיסוי טלית', code: 'TALIT_STD', description: 'תהליך מהיר לכיסוי טלית ותפילין', stepsCount: 4 },
        { id: 'w5', name: 'תהליך תיקון', code: 'REPAIR', description: 'תהליך תיקון ושיקום', stepsCount: 3 }
    ],
    orders: [
        { id: 'o1', customerId: 'c1', customerName: 'בית הכנסת אור החיים', productId: 'p1', productName: 'פרוכת רקומה', status: 'IN_PRODUCTION', priority: 'HIGH', totalAmount: 8500, dueDate: '2026-02-15', createdAt: '2024-12-01' },
        { id: 'o2', customerId: 'c2', customerName: 'קהילת בית ישראל', productId: 'p2', productName: 'מעיל לספר תורה', status: 'PENDING', priority: 'NORMAL', totalAmount: 4500, dueDate: '2026-03-01', createdAt: '2024-12-15' },
        { id: 'o3', customerId: 'c8', customerName: 'בית הכנסת הגדול', productId: 'p3', productName: 'כיסוי בימה ועמוד', status: 'CONFIRMED', priority: 'NORMAL', totalAmount: 6500, dueDate: '2026-02-28', createdAt: '2024-12-10' },
        { id: 'o4', customerId: 'c5', customerName: 'בית כנסת נר תמיד', productId: 'p1', productName: 'פרוכת רקומה', status: 'READY', priority: 'URGENT', totalAmount: 9000, dueDate: '2026-01-20', createdAt: '2024-11-01' },
        { id: 'o5', customerId: 'c10', customerName: 'ישיבת פונוביז', productId: 'p2', productName: 'מעיל לספר תורה', status: 'DELIVERED', priority: 'NORMAL', totalAmount: 4500, dueDate: '2024-12-20', createdAt: '2024-10-15' },
        { id: 'o6', customerId: 'c6', customerName: 'Congregation Beth David', productId: 'p5', productName: 'פרוכת פשוטה', status: 'IN_PRODUCTION', priority: 'HIGH', totalAmount: 5500, dueDate: '2026-02-10', createdAt: '2024-12-20' }
    ],
    leads: [
        { id: 'l1', name: 'יוסי כהן', email: 'yosi@example.com', phone: '050-1111111', company: 'בית הכנסת המרכזי', source: 'WEBSITE', stage: 'NEW', estimatedValue: 8000, notes: 'מתעניין בפרוכת', nextFollowUp: '2026-01-10' },
        { id: 'l2', name: 'שרה לוי', email: 'sara@example.com', phone: '052-2222222', company: 'קהילת אור התורה', source: 'REFERRAL', stage: 'CONTACTED', estimatedValue: 12000, notes: 'רוצה הצעת מחיר למעיל', nextFollowUp: '2026-01-08' },
        { id: 'l3', name: 'דוד אברהם', email: 'david@example.com', phone: '054-3333333', company: null, source: 'PHONE', stage: 'QUALIFIED', estimatedValue: 6500, notes: 'כיסוי בימה לחתונה', nextFollowUp: '2026-01-15' },
        { id: 'l4', name: 'רחל מזרחי', email: 'rachel@example.com', phone: '050-4444444', company: 'Temple Shalom', source: 'FACEBOOK', stage: 'PROPOSAL', estimatedValue: 15000, notes: 'שלחנו הצעה מפורטת', nextFollowUp: '2026-01-12' },
        { id: 'l5', name: 'משה פרץ', email: 'moshe@example.com', phone: '053-5555555', company: 'ישיבת נר ישראל', source: 'EMAIL', stage: 'NEGOTIATION', estimatedValue: 20000, notes: 'במו"מ על מחיר', nextFollowUp: '2026-01-09' },
        { id: 'l6', name: 'לאה גבאי', email: 'leah@example.com', phone: '058-6666666', company: null, source: 'WEBSITE', stage: 'NEW', estimatedValue: 4500, notes: 'פנייה חדשה', nextFollowUp: '2026-01-11' },
        { id: 'l7', name: 'אברהם דהן', email: 'avraham@example.com', phone: '050-7777777', company: 'בית מדרש חסידי', source: 'REFERRAL', stage: 'CONTACTED', estimatedValue: 9000, notes: 'יצרנו קשר', nextFollowUp: '2026-01-14' },
        { id: 'l8', name: 'חנה רוזן', email: 'hana@example.com', phone: '052-8888888', company: 'Kehilat Yaakov', source: 'PHONE', stage: 'WON', estimatedValue: 7500, notes: 'נסגר בהצלחה!', nextFollowUp: null },
        { id: 'l9', name: 'יעקב שלום', email: 'yaakov@example.com', phone: '054-9999999', company: null, source: 'OTHER', stage: 'LOST', estimatedValue: 5000, notes: 'הלך למתחרים', nextFollowUp: null },
        { id: 'l10', name: 'מרים אוחיון', email: 'miriam@example.com', phone: '050-1010101', company: 'מרכז קהילתי', source: 'WEBSITE', stage: 'QUALIFIED', estimatedValue: 11000, notes: 'מוכנה להצעה', nextFollowUp: '2026-01-16' }
    ],
    tasks: [
        { id: 't1', title: 'עיצוב רקמה - הזמנה o1', orderId: 'o1', departmentId: 'd1', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: '2026-01-20', assignedTo: 'יוסי הרקם' },
        { id: 't2', title: 'רקמת פרוכת - הזמנה o1', orderId: 'o1', departmentId: 'd2', status: 'PENDING', priority: 'HIGH', dueDate: '2026-01-25', assignedTo: 'משה הרקם' },
        { id: 't3', title: 'תפירת מעיל - הזמנה o2', orderId: 'o2', departmentId: 'd3', status: 'PENDING', priority: 'NORMAL', dueDate: '2026-02-15', assignedTo: 'שרה התופרת' },
        { id: 't4', title: 'בקרת איכות - הזמנה o4', orderId: 'o4', departmentId: 'd4', status: 'IN_PROGRESS', priority: 'URGENT', dueDate: '2026-01-15', assignedTo: 'דוד הבודק' },
        { id: 't5', title: 'משלוח - הזמנה o5', orderId: 'o5', departmentId: 'd5', status: 'COMPLETED', priority: 'NORMAL', dueDate: '2024-12-20', assignedTo: 'אבי המשלח' }
    ]
};

// Load data from localStorage or use defaults
export function loadMockData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Failed to load mock data from localStorage');
    }
    // Save defaults and return
    saveMockData(defaultData);
    return defaultData;
}

// Save data to localStorage
export function saveMockData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Failed to save mock data to localStorage');
    }
}

// Get mock data (with auto-load)
let mockData = null;
export function getMockData() {
    if (!mockData) {
        mockData = loadMockData();
    }
    return mockData;
}

// Update and save
export function updateMockData(key, value) {
    const data = getMockData();
    data[key] = value;
    saveMockData(data);
    return data;
}

// Reset to defaults
export function resetMockData() {
    mockData = JSON.parse(JSON.stringify(defaultData));
    saveMockData(mockData);
    return mockData;
}

// Generate unique ID
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
