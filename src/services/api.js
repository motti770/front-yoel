/**
 * API Service Layer
 * Connects to the real CRM API at https://crm-api.app.mottidokib.com
 */

import axios from 'axios';

// ============ MOCK MODE ============
// Set to true to use mock data (when backend is down)
const MOCK_MODE = true;

// ============ localStorage PERSISTENCE ============
// Helper functions to save/load data from localStorage
const loadFromStorage = (key, defaultData) => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.warn(`[localStorage] Failed to load ${key}:`, error);
    }
    return defaultData;
};

const saveToStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`[localStorage] Failed to save ${key}:`, error);
    }
};

// Helper to automatically save after modifying data
const withAutoSave = (storageKey, mockDataRef, operation) => {
    const result = operation();
    saveToStorage(storageKey, mockDataRef);
    return result;
};

// ============ MOCK DATA - Initial defaults ============
const defaultMockLeads = [
    { id: '1', name: 'משה כהן', email: 'moshe@example.com', phone: '052-1234567', stage: 'NEW', source: 'WEBSITE', budget: 50000, notes: 'מעוניין בפרוכת מהודרת', createdAt: '2025-12-28' },
    { id: '2', name: 'דוד לוי', email: 'david@example.com', phone: '053-2345678', stage: 'CONTACTED', source: 'REFERRAL', budget: 35000, notes: 'ממליץ מלקוח קיים', createdAt: '2025-12-27' },
    { id: '3', name: 'יוסף אברהם', email: 'yosef@example.com', phone: '054-3456789', stage: 'QUALIFIED', source: 'PHONE', budget: 75000, notes: 'בית כנסת גדול - פרויקט משמעותי', createdAt: '2025-12-26' },
    { id: '4', name: 'שרה גולדברג', email: 'sarah@example.com', phone: '055-4567890', stage: 'PROPOSAL', source: 'EMAIL', budget: 25000, notes: 'מחפשת מפות לבימה', createdAt: '2025-12-25' },
    { id: '5', name: 'אברהם שוורץ', email: 'avraham@example.com', phone: '052-5678901', stage: 'NEW', source: 'SOCIAL_MEDIA', budget: 60000, notes: 'ראה את העבודות שלנו בפייסבוק', createdAt: '2025-12-24' },
    { id: '6', name: 'רחל ברקוביץ', email: 'rachel@example.com', phone: '053-6789012', stage: 'CONTACTED', source: 'WEBSITE', budget: 40000, notes: 'מעוניינת בטלית לחתן', createdAt: '2025-12-23' },
    { id: '7', name: 'יעקב פרידמן', email: 'yaakov@example.com', phone: '054-7890123', stage: 'QUALIFIED', source: 'REFERRAL', budget: 85000, notes: 'פרויקט שיפוץ בית כנסת מלא', createdAt: '2025-12-22' },
    { id: '8', name: 'לאה שטיין', email: 'leah@example.com', phone: '055-8901234', stage: 'NEGOTIATION', source: 'PHONE', budget: 45000, notes: 'משא ומתן על המחיר', createdAt: '2025-12-21' },
    { id: '9', name: 'חיים רוזנברג', email: 'chaim@example.com', phone: '052-9012345', stage: 'NEW', source: 'EMAIL', budget: 30000, notes: 'שאל שאלות על תהליך הייצור', createdAt: '2025-12-20' },
    { id: '10', name: 'מרים ויינשטיין', email: 'miriam@example.com', phone: '053-0123456', stage: 'CONTACTED', source: 'WEBSITE', budget: 55000, notes: 'רוצה להזמין סט מלא לבית כנסת', createdAt: '2025-12-19' }
];

const defaultMockCustomers = [
    { id: '1', name: 'בית כנסת אור החיים', email: 'info@orchaim.org.il', phone: '02-5671234', status: 'ACTIVE', totalOrders: 12, totalSpent: 450000, lastOrder: '2025-12-15', address: 'רח\' הרב קוק 45, ירושלים' },
    { id: '2', name: 'מוסדות בעלזא', email: 'orders@belz.org', phone: '03-6789012', status: 'ACTIVE', totalOrders: 28, totalSpent: 1250000, lastOrder: '2025-12-20', address: 'רח\' בר אילן 78, בני ברק' },
    { id: '3', name: 'קהילת מוריה', email: 'kahal@moria.co.il', phone: '08-9456123', status: 'ACTIVE', totalOrders: 8, totalSpent: 280000, lastOrder: '2025-12-10', address: 'שכונת נאות מוריה, מודיעין עילית' },
    { id: '4', name: 'ישיבת מיר', email: 'admin@mir.edu', phone: '02-6543210', status: 'ACTIVE', totalOrders: 45, totalSpent: 2100000, lastOrder: '2025-12-22', address: 'רח\' בית ישראל 15, ירושלים' },
    { id: '5', name: 'בית מדרש גבוה', email: 'office@bmg.org.il', phone: '08-6547890', status: 'ACTIVE', totalOrders: 15, totalSpent: 625000, lastOrder: '2025-12-18', address: 'קרית הישיבה, לכיש' },
    { id: '6', name: 'קהילת חסידי ויז\'ניץ', email: 'mosdos@vizhnitz.org', phone: '03-5789123', status: 'VIP', totalOrders: 52, totalSpent: 3200000, lastOrder: '2025-12-25', address: 'רח\' הרב שך 92, בני ברק' },
    { id: '7', name: 'בית כנסת רמב\"ן', email: 'contact@ramban-shul.co.il', phone: '04-8234567', status: 'ACTIVE', totalOrders: 6, totalSpent: 185000, lastOrder: '2025-11-30', address: 'רח\' הרמב\"ן 23, צפת' },
    { id: '8', name: 'כולל אברכים תפארת', email: 'kollel@tiferet.org', phone: '09-7456789', status: 'ACTIVE', totalOrders: 10, totalSpent: 320000, lastOrder: '2025-12-12', address: 'רח\' הראשונים 34, אלעד' },
    { id: '9', name: 'מרכז תורני שערי ציון', email: 'shaarei@zion.org.il', phone: '02-5234567', status: 'ACTIVE', totalOrders: 18, totalSpent: 670000, lastOrder: '2025-12-08', address: 'רח\' שמואל הנביא 67, ירושלים' },
    { id: '10', name: 'קהילת בוסטון', email: 'boston@synagogue.com', phone: '052-3456789', status: 'ACTIVE', totalOrders: 22, totalSpent: 890000, lastOrder: '2025-12-16', address: 'רח\' ז\'בוטינסקי 145, רמת גן' }
];

const defaultMockProducts = [
    { id: '1', name: 'פרוכת ארון קודש מהודרת', category: 'פרוכות', status: 'ACTIVE', basePrice: 8500, productionTime: 45, parameters: ['גודל', 'צבע', 'רקמה'], stock: 0, description: 'פרוכת מהודרת עם רקמה מלאה' },
    { id: '2', name: 'מעיל לספר תורה - קלאסי', category: 'מעילים', status: 'ACTIVE', basePrice: 3200, productionTime: 30, parameters: ['גודל', 'צבע'], stock: 2, description: 'מעיל קלאסי לספר תורה' },
    { id: '3', name: 'טלית גדולה מהודרת', category: 'טליתות', status: 'ACTIVE', basePrice: 1800, productionTime: 14, parameters: ['גודל', 'צבע עליון'], stock: 5, description: 'טלית צמר איכותית' },
    { id: '4', name: 'כיסוי לבימה - אקסקלוסיבי', category: 'כיסויים', status: 'ACTIVE', basePrice: 4500, productionTime: 35, parameters: ['גודל', 'צבע', 'רקמה'], stock: 0, description: 'כיסוי מפואר לבימה' },
    { id: '5', name: 'מפה לשולחן התורה', category: 'מפות', status: 'ACTIVE', basePrice: 650, productionTime: 10, parameters: ['גודל', 'צבע'], stock: 8, description: 'מפה לשולחן קריאת התורה' },
    { id: '6', name: 'כיפה סרוגה - רגילה', category: 'כיפות', status: 'ACTIVE', basePrice: 15, productionTime: 2, parameters: ['צבע'], stock: 500, description: 'כיפה סרוגה סטנדרטית' },
    { id: '7', name: 'כתר תורה מפואר', category: 'תכשיטי תורה', status: 'ACTIVE', basePrice: 12000, productionTime: 60, parameters: ['גובה', 'רקמה'], stock: 0, description: 'כתר תורה מרהיב' },
    { id: '8', name: 'ציצית מהודרת', category: 'ציציות', status: 'ACTIVE', basePrice: 250, productionTime: 7, parameters: ['גודל'], stock: 25, description: 'ציצית עבודת יד' }
];

const defaultMockOrders = [
    { id: '1', customerId: '1', customerName: 'בית כנסת אור החיים', productId: '1', productName: 'פרוכת ארון קודש מהודרת', quantity: 1, totalPrice: 9500, status: 'IN_PRODUCTION', dueDate: '2026-02-15', createdAt: '2025-12-10', notes: 'רקמה של אריה זהב', tasks: ['1', '11', '12'] },
    { id: '2', customerId: '2', customerName: 'מוסדות בעלזא', productId: '2', productName: 'מעיל לספר תורה - קלאסי', quantity: 5, totalPrice: 17000, status: 'PENDING', dueDate: '2026-01-30', createdAt: '2025-12-22', notes: 'צבע כחול מלכותי', tasks: ['2'] },
    { id: '3', customerId: '4', customerName: 'ישיבת מיר', productId: '3', productName: 'טלית גדולה מהודרת', quantity: 50, totalPrice: 85000, status: 'COMPLETED', dueDate: '2025-12-20', createdAt: '2025-11-15', notes: 'הזמנה שנתית', tasks: ['3'] },
    { id: '4', customerId: '6', customerName: 'קהילת חסידי ויז\'ניץ', productId: '4', productName: 'כיסוי לבימה - אקסקלוסיבי', quantity: 2, totalPrice: 10000, status: 'IN_PRODUCTION', dueDate: '2026-01-25', createdAt: '2025-12-18', notes: 'עיצוב מיוחד לפי דרישה', tasks: ['4'] },
    { id: '5', customerId: '3', customerName: 'קהילת מוריה', productId: '5', productName: 'מפה לשולחן התורה', quantity: 3, totalPrice: 2100, status: 'PENDING', dueDate: '2026-01-10', createdAt: '2025-12-25', notes: 'גודל סטנדרטי', tasks: ['5'] },
    { id: '6', customerId: '5', customerName: 'בית מדרש גבוה', productId: '7', productName: 'כתר תורה מפואר', quantity: 1, totalPrice: 13500, status: 'IN_PRODUCTION', dueDate: '2026-03-01', createdAt: '2025-12-12', notes: 'גובה 45 ס"מ', tasks: ['6'] },
    { id: '7', customerId: '1', customerName: 'בית כנסת אור החיים', productId: '8', productName: 'ציצית מהודרת', quantity: 20, totalPrice: 5200, status: 'COMPLETED', dueDate: '2025-12-28', createdAt: '2025-12-05', notes: 'גודל M', tasks: ['7'] },
    { id: '8', customerId: '9', customerName: 'מרכז תורני שערי ציון', productId: '1', productName: 'פרוכת ארון קודש מהודרת', quantity: 2, totalPrice: 18000, status: 'PENDING', dueDate: '2026-02-20', createdAt: '2025-12-23', notes: 'שתי פרוכות זהות', tasks: ['8'] },
    { id: '9', customerId: '7', customerName: 'בית כנסת רמב"ן', productId: '3', productName: 'טלית גדולה מהודרת', quantity: 10, totalPrice: 17500, status: 'IN_PRODUCTION', dueDate: '2026-01-18', createdAt: '2025-12-15', notes: 'מגוון גדלים', tasks: ['9'] },
    { id: '10', customerId: '10', customerName: 'קהילת בוסטון', productId: '4', productName: 'כיסוי לבימה - אקסקלוסיבי', quantity: 1, totalPrice: 5200, status: 'COMPLETED', dueDate: '2025-12-15', createdAt: '2025-11-20', notes: 'נשלח בדואר בינלאומי', tasks: ['10'] }
];

const defaultMockTasks = [
    { id: '1', title: 'עיצוב רקמה לפרוכת - אור החיים', orderId: '1', assignee: 'מרים לוי', department: 'עיצוב רקמה', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: '2026-01-10', createdAt: '2025-12-10', notes: 'דפוס אריה זהב', dependsOnTaskId: null },
    { id: '11', title: 'תפירת פרוכת - אור החיים', orderId: '1', assignee: 'שרה גולד', department: 'תפירה', status: 'PENDING', priority: 'HIGH', dueDate: '2026-01-20', createdAt: '2025-12-10', notes: 'תפירה לאחר סיום עיצוב', dependsOnTaskId: '1' },
    { id: '12', title: 'בדיקת איכות פרוכת - אור החיים', orderId: '1', assignee: 'דוד רוזן', department: 'איכות', status: 'PENDING', priority: 'HIGH', dueDate: '2026-01-25', createdAt: '2025-12-10', notes: 'בדיקה לאחר תפירה', dependsOnTaskId: '11' },
    { id: '2', title: 'חיתוך בד למעילי תורה - בעלזא', orderId: '2', assignee: 'יעקב כהן', department: 'חיתוך', status: 'PENDING', priority: 'MEDIUM', dueDate: '2026-01-05', createdAt: '2025-12-22', notes: '5 מעילים בצבע כחול', dependsOnTaskId: null },
    { id: '3', title: 'תפירת טליתות - מיר', orderId: '3', assignee: 'שרה גולד', department: 'תפירה', status: 'COMPLETED', priority: 'HIGH', dueDate: '2025-12-18', createdAt: '2025-11-15', notes: '50 טליתות - הושלם', dependsOnTaskId: null, completedAt: '2025-12-18T10:30:00Z' },
    { id: '4', title: 'רקמה לכיסוי בימה - ויזניץ', orderId: '4', assignee: 'רחל שטרן', department: 'עיצוב רקמה', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: '2026-01-15', createdAt: '2025-12-18', notes: 'עיצוב מיוחד', dependsOnTaskId: null },
    { id: '5', title: 'בדיקת איכות מפות - מוריה', orderId: '5', assignee: 'דוד רוזן', department: 'איכות', status: 'PENDING', priority: 'LOW', dueDate: '2026-01-08', createdAt: '2025-12-25', notes: '3 מפות', dependsOnTaskId: null },
    { id: '6', title: 'עיצוב כתר תורה - בית מדרש גבוה', orderId: '6', assignee: 'מרים לוי', department: 'עיצוב רקמה', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: '2026-02-10', createdAt: '2025-12-12', notes: 'כתר מפואר מאוד', dependsOnTaskId: null },
    { id: '7', title: 'ארגון משלוח ציציות - אור החיים', orderId: '7', assignee: 'משה לוי', department: 'לוגיסטיקה', status: 'COMPLETED', priority: 'MEDIUM', dueDate: '2025-12-28', createdAt: '2025-12-05', notes: 'נשלח בהצלחה', dependsOnTaskId: null, completedAt: '2025-12-28T14:00:00Z' },
    { id: '8', title: 'תכנון פרוכת כפולה - שערי ציון', orderId: '8', assignee: 'אסתר כהן', department: 'עיצוב רקמה', status: 'PENDING', priority: 'MEDIUM', dueDate: '2026-01-25', createdAt: '2025-12-23', notes: 'שתי פרוכות זהות', dependsOnTaskId: null },
    { id: '9', title: 'תפירת טליתות מגוון - רמבן', orderId: '9', assignee: 'שרה גולד', department: 'תפירה', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: '2026-01-12', createdAt: '2025-12-15', notes: 'גדלים S, M, L', dependsOnTaskId: null },
    { id: '10', title: 'אריזה ושילוח בינלאומי - בוסטון', orderId: '10', assignee: 'משה לוי', department: 'לוגיסטיקה', status: 'COMPLETED', priority: 'HIGH', dueDate: '2025-12-15', createdAt: '2025-11-20', notes: 'נשלח באוויר', dependsOnTaskId: null, completedAt: '2025-12-15T16:45:00Z' }
];

const defaultMockWorkflows = [
    { id: '1', name: 'תהליך ייצור פרוכת סטנדרטית', description: 'תהליך מלא מהזמנה ועד משלוח', status: 'ACTIVE', steps: ['קבלת הזמנה', 'עיצוב ואישור', 'רכישת חומרים', 'רקמה', 'תפירה', 'בדיקת איכות', 'אריזה', 'משלוח'], estimatedDays: 45, createdAt: '2024-01-15' },
    { id: '2', name: 'תהליך ייצור מעיל תורה מהיר', description: 'תהליך מהיר למעילי תורה', status: 'ACTIVE', steps: ['קבלת הזמנה', 'חיתוך', 'תפירה', 'בדיקה', 'משלוח'], estimatedDays: 20, createdAt: '2024-02-10' },
    { id: '3', name: 'תהליך הזמנה מותאמת אישית', description: 'לפרויקטים מיוחדים ומורכבים', status: 'ACTIVE', steps: ['פגישת ייעוץ', 'הצעת מחיר', 'עיצוב ראשוני', 'אישור לקוח', 'רכישת חומרים מיוחדים', 'ייצור', 'התאמות', 'בדיקה סופית', 'משלוח'], estimatedDays: 90, createdAt: '2024-03-05' },
    { id: '4', name: 'תהליך ייצור המוני (50+ יחידות)', description: 'לטליתות וכיפות בכמויות גדולות', status: 'ACTIVE', steps: ['קבלת הזמנה', 'רכישה סיטונאית', 'חיתוך המוני', 'תפירה המונית', 'בדיקת דגימות', 'אריזה', 'משלוח'], estimatedDays: 30, createdAt: '2024-04-20' },
    { id: '5', name: 'תהליך תיקונים ושיפוצים', description: 'לתיקון פרוכות וכיסויים קיימים', status: 'ACTIVE', steps: ['קבלת פריט', 'הערכת נזקים', 'הצעת מחיר', 'אישור', 'תיקון', 'בדיקה', 'החזרה ללקוח'], estimatedDays: 14, createdAt: '2024-05-12' }
];

const defaultMockDepartments = [
    { id: '1', name: 'עיצוב רקמה', manager: 'מרים לוי', managerId: '2', employeeCount: 5, activeTasks: 18, status: 'ACTIVE', description: 'עיצוב ותכנון דפוסי רקמה', createdAt: '2024-01-10' },
    { id: '2', name: 'חיתוך', manager: 'יעקב כהן', managerId: '3', employeeCount: 3, activeTasks: 12, status: 'ACTIVE', description: 'חיתוך בדים וחומרים', createdAt: '2024-01-10' },
    { id: '3', name: 'תפירה', manager: 'שרה גולדשטיין', managerId: '4', employeeCount: 8, activeTasks: 22, status: 'ACTIVE', description: 'תפירה והרכבת מוצרים', createdAt: '2024-01-10' },
    { id: '4', name: 'בקרת איכות', manager: 'דוד רוזן', managerId: '5', employeeCount: 2, activeTasks: 8, status: 'ACTIVE', description: 'בדיקת איכות ומוצרים', createdAt: '2024-01-10' },
    { id: '5', name: 'לוגיסטיקה ומשלוחים', manager: 'משה לוי', managerId: '6', employeeCount: 4, activeTasks: 15, status: 'ACTIVE', description: 'אריזה ומשלוחים', createdAt: '2024-01-10' }
];

const defaultMockParameters = [
    {
        id: 'param-size',
        name: 'גודל',
        code: 'SIZE',
        type: 'SELECT',
        description: 'בחר גודל מוצר',
        isRequired: true,
        isActive: true,
        sortOrder: 1,
        options: [
            { id: 'opt-size-small', value: 'small', label: 'קטן', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-size-medium', value: 'medium', label: 'בינוני', priceImpact: 500, sortOrder: 2, isActive: true },
            { id: 'opt-size-large', value: 'large', label: 'גדול', priceImpact: 1000, sortOrder: 3, isActive: true },
            { id: 'opt-size-custom', value: 'custom', label: 'מותאם אישית', priceImpact: 1500, sortOrder: 4, isActive: true }
        ]
    },
    {
        id: 'param-fabric-color',
        name: 'צבע בד',
        code: 'FABRIC_COLOR',
        type: 'COLOR',
        description: 'בחר צבע בד',
        isRequired: true,
        isActive: true,
        sortOrder: 2,
        options: [
            { id: 'opt-color-red', value: 'red', label: 'אדום', colorHex: '#DC143C', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-color-blue', value: 'blue', label: 'כחול', colorHex: '#0000CD', priceImpact: 0, sortOrder: 2, isActive: true },
            { id: 'opt-color-green', value: 'green', label: 'ירוק', colorHex: '#228B22', priceImpact: 0, sortOrder: 3, isActive: true },
            { id: 'opt-color-gold', value: 'gold', label: 'זהב', colorHex: '#FFD700', priceImpact: 300, sortOrder: 4, isActive: true },
            { id: 'opt-color-silver', value: 'silver', label: 'כסף', colorHex: '#C0C0C0', priceImpact: 200, sortOrder: 5, isActive: true }
        ]
    },
    {
        id: 'param-embroidery-type',
        name: 'סוג רקמה',
        code: 'EMBROIDERY_TYPE',
        type: 'SELECT',
        description: 'בחר רמת רקמה',
        isRequired: false,
        isActive: true,
        sortOrder: 3,
        options: [
            { id: 'opt-emb-simple', value: 'simple', label: 'רקמה פשוטה', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-emb-medium', value: 'medium', label: 'רקמה בינונית', priceImpact: 800, sortOrder: 2, isActive: true },
            { id: 'opt-emb-full', value: 'full', label: 'רקמה מלאה', priceImpact: 2000, sortOrder: 3, isActive: true }
        ]
    },
    {
        id: 'param-dedication-text',
        name: 'טקסט הקדשה',
        code: 'DEDICATION_TEXT',
        type: 'TEXT',
        description: 'הקלד טקסט הקדשה בעברית',
        isRequired: false,
        isActive: true,
        sortOrder: 4,
        options: []
    }
];

// ============ ACTUAL MOCK DATA - Load from localStorage or use defaults ============
let mockLeads = loadFromStorage('mockLeads', defaultMockLeads);
let mockCustomers = loadFromStorage('mockCustomers', defaultMockCustomers);
let mockProducts = loadFromStorage('mockProducts', defaultMockProducts);
let mockOrders = loadFromStorage('mockOrders', defaultMockOrders);
let mockTasks = loadFromStorage('mockTasks', defaultMockTasks);
let mockWorkflows = loadFromStorage('mockWorkflows', defaultMockWorkflows);
let mockDepartments = loadFromStorage('mockDepartments', defaultMockDepartments);
let mockParameters = loadFromStorage('mockParameters', defaultMockParameters);

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://crm-api.app.mottidokib.com';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Debug log - remove in production
        console.log('[API Request]', config.method?.toUpperCase(), config.url, 'Token:', token ? 'Present' : 'Missing');
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => {
        // Return only the data portion if it exists in the standard wrapper
        if (response.data && response.data.success !== undefined) {
            return response.data;
        }
        return response.data;
    },
    (error) => {
        const { response } = error;

        // Handle 401 - unauthorized
        if (response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            // Only redirect if not already on login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // Return error in consistent format
        return Promise.reject({
            success: false,
            error: response?.data?.error || {
                code: 'NETWORK_ERROR',
                message: error.message || 'Network error occurred'
            }
        });
    }
);

// ============ AUTH ============
export const authService = {
    login: async (email, password) => {
        if (MOCK_MODE) {
            // Mock login - always succeed
            const mockUser = {
                id: '1',
                email: email,
                firstName: 'יואל',
                lastName: 'אדמין',
                role: 'ADMIN',
                department: 'ניהול',
                avatar: 'יא'
            };
            const mockToken = 'mock-token-' + Date.now();
            localStorage.setItem('authToken', mockToken);
            localStorage.setItem('user', JSON.stringify(mockUser));
            return {
                success: true,
                data: {
                    token: mockToken,
                    user: mockUser
                }
            };
        }
        const result = await api.post('/auth/login', { email, password });
        if (result.success && result.data) {
            localStorage.setItem('authToken', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
        }
        return result;
    },

    register: async (userData) => {
        const result = await api.post('/auth/register', userData);
        if (result.success && result.data) {
            localStorage.setItem('authToken', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
        }
        return result;
    },

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },

    getMe: async () => {
        if (MOCK_MODE) {
            // Return mock user when backend is down
            return {
                success: true,
                data: {
                    id: '1',
                    email: 'admin@yoel.com',
                    firstName: 'יואל',
                    lastName: 'אדמין',
                    role: 'ADMIN',
                    department: 'ניהול',
                    avatar: 'יא'
                }
            };
        }
        return api.get('/auth/me');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('authToken');
    }
};

// ============ CUSTOMERS ============
export const customersService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const { status, search } = params;
            let filtered = [...mockCustomers];
            if (status) filtered = filtered.filter(c => c.status === status);
            if (search) filtered = filtered.filter(c =>
                c.name.includes(search) || c.email.includes(search)
            );
            return { success: true, data: { customers: filtered, total: filtered.length } };
        }
        const { page = 1, limit = 100, status, search } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (status) queryParams.append('status', status);
        if (search) queryParams.append('search', search);
        return api.get(`/customers?${queryParams}`);
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            const customer = mockCustomers.find(c => c.id === id);
            return { success: true, data: customer };
        }
        return api.get(`/customers/${id}`);
    },

    create: async (data) => {
        if (MOCK_MODE) {
            const newCustomer = { id: Date.now().toString(), ...data, totalOrders: 0, totalSpent: 0, createdAt: new Date().toISOString().split('T')[0] };
            mockCustomers.push(newCustomer);
            saveToStorage('mockCustomers', mockCustomers);
            return { success: true, data: newCustomer };
        }
        return api.post('/customers', data);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            const index = mockCustomers.findIndex(c => c.id === id);
            if (index !== -1) {
                mockCustomers[index] = { ...mockCustomers[index], ...data };
                saveToStorage('mockCustomers', mockCustomers);
                return { success: true, data: mockCustomers[index] };
            }
            return { success: false, error: { message: 'Customer not found' } };
        }
        return api.put(`/customers/${id}`, data);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            const index = mockCustomers.findIndex(c => c.id === id);
            if (index !== -1) {
                mockCustomers.splice(index, 1);
                saveToStorage('mockCustomers', mockCustomers);
                return { success: true };
            }
            return { success: false, error: { message: 'Customer not found' } };
        }
        return api.delete(`/customers/${id}`);
    }
};

// ============ LEADS ============
export const leadsService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const { stage, source, search } = params;
            let filtered = [...mockLeads];
            if (stage) filtered = filtered.filter(l => l.stage === stage);
            if (source) filtered = filtered.filter(l => l.source === source);
            if (search) filtered = filtered.filter(l =>
                l.name.includes(search) || l.email.includes(search)
            );
            return { success: true, data: { leads: filtered, total: filtered.length } };
        }
        const { page = 1, limit = 100, stage, source, search } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (stage) queryParams.append('stage', stage);
        if (source) queryParams.append('source', source);
        if (search) queryParams.append('search', search);
        return api.get(`/leads?${queryParams}`);
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            const lead = mockLeads.find(l => l.id === id);
            return { success: true, data: lead };
        }
        return api.get(`/leads/${id}`);
    },

    create: async (data) => {
        if (MOCK_MODE) {
            const newLead = { id: Date.now().toString(), ...data, createdAt: new Date().toISOString().split('T')[0] };
            mockLeads.push(newLead);
            saveToStorage('mockLeads', mockLeads);
            return { success: true, data: newLead };
        }
        return api.post('/leads', data);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            const index = mockLeads.findIndex(l => l.id === id);
            if (index !== -1) {
                mockLeads[index] = { ...mockLeads[index], ...data };
                saveToStorage('mockLeads', mockLeads);
                return { success: true, data: mockLeads[index] };
            }
            return { success: false, error: { message: 'Lead not found' } };
        }
        return api.put(`/leads/${id}`, data);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            const index = mockLeads.findIndex(l => l.id === id);
            if (index !== -1) {
                mockLeads.splice(index, 1);
                saveToStorage('mockLeads', mockLeads);
                return { success: true };
            }
            return { success: false, error: { message: 'Lead not found' } };
        }
        return api.delete(`/leads/${id}`);
    },

    updateStage: async (id, stage) => {
        if (MOCK_MODE) {
            return leadsService.update(id, { stage });
        }
        return api.put(`/leads/${id}`, { stage });
    },

    convert: async (id) => {
        if (MOCK_MODE) {
            const lead = mockLeads.find(l => l.id === id);
            if (lead) {
                // Convert lead to customer (mock)
                return { success: true, data: { customerId: Date.now().toString() } };
            }
            return { success: false, error: { message: 'Lead not found' } };
        }
        return api.post(`/leads/${id}/convert`);
    }
};

// ============ PRODUCTS ============
export const productsService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const { status, category, search } = params;
            let filtered = [...mockProducts];
            if (status) filtered = filtered.filter(p => p.status === status);
            if (category) filtered = filtered.filter(p => p.category === category);
            if (search) filtered = filtered.filter(p => p.name.includes(search));
            return { success: true, data: { products: filtered, total: filtered.length } };
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
            const product = mockProducts.find(p => p.id === id);
            return { success: true, data: product };
        }
        return api.get(`/products/${id}`);
    },

    create: async (data) => {
        if (MOCK_MODE) {
            const newProduct = { id: Date.now().toString(), ...data, createdAt: new Date().toISOString().split('T')[0] };
            mockProducts.push(newProduct);
            saveToStorage('mockProducts', mockProducts);
            return { success: true, data: newProduct };
        }
        return api.post('/products', data);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            const index = mockProducts.findIndex(p => p.id === id);
            if (index !== -1) {
                mockProducts[index] = { ...mockProducts[index], ...data };
                saveToStorage('mockProducts', mockProducts);
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
                saveToStorage('mockProducts', mockProducts);
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
                const newStock = operation === 'ADD' ? mockProducts[index].stock + quantity : mockProducts[index].stock - quantity;
                mockProducts[index].stock = newStock;
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
};

// ============ ORDERS ============
export const ordersService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const { status, customerId } = params;
            let filtered = [...mockOrders];
            if (status) filtered = filtered.filter(o => o.status === status);
            if (customerId) filtered = filtered.filter(o => o.customerId === customerId);
            return { success: true, data: { orders: filtered, total: filtered.length } };
        }
        const { page = 1, limit = 100, status, customerId } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (status) queryParams.append('status', status);
        if (customerId) queryParams.append('customerId', customerId);
        return api.get(`/orders?${queryParams}`);
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            const order = mockOrders.find(o => o.id === id);
            return { success: true, data: order };
        }
        return api.get(`/orders/${id}`);
    },

    create: async (data) => {
        if (MOCK_MODE) {
            const newOrder = { id: Date.now().toString(), ...data, status: 'PENDING', createdAt: new Date().toISOString().split('T')[0] };
            mockOrders.push(newOrder);
            saveToStorage('mockOrders', mockOrders);
            return { success: true, data: newOrder };
        }
        return api.post('/orders', data);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            const index = mockOrders.findIndex(o => o.id === id);
            if (index !== -1) {
                mockOrders[index] = { ...mockOrders[index], ...data };
                saveToStorage('mockOrders', mockOrders);
                return { success: true, data: mockOrders[index] };
            }
            return { success: false, error: { message: 'Order not found' } };
        }
        return api.put(`/orders/${id}`, data);
    },

    cancel: async (id) => {
        if (MOCK_MODE) {
            return ordersService.update(id, { status: 'CANCELLED' });
        }
        return api.post(`/orders/${id}/cancel`);
    }
};

// ============ DEPARTMENTS ============
export const departmentsService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            return { success: true, data: { departments: mockDepartments, total: mockDepartments.length } };
        }
        const { page = 1, limit = 100 } = params;
        return api.get(`/departments?page=${page}&limit=${limit}`);
    },

    getActive: async () => {
        if (MOCK_MODE) {
            const active = mockDepartments.filter(d => d.status === 'ACTIVE');
            return { success: true, data: active };
        }
        return api.get('/departments/active');
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            const department = mockDepartments.find(d => d.id === id);
            return { success: true, data: department };
        }
        return api.get(`/departments/${id}`);
    },

    create: async (data) => {
        if (MOCK_MODE) {
            const newDepartment = {
                id: Date.now().toString(),
                ...data,
                employeeCount: 0,
                activeTasks: 0,
                status: 'ACTIVE',
                createdAt: new Date().toISOString().split('T')[0]
            };
            mockDepartments.push(newDepartment);
            return { success: true, data: newDepartment };
        }
        return api.post('/departments', data);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            const index = mockDepartments.findIndex(d => d.id === id);
            if (index !== -1) {
                mockDepartments[index] = { ...mockDepartments[index], ...data };
                return { success: true, data: mockDepartments[index] };
            }
            return { success: false, error: { message: 'Department not found' } };
        }
        return api.put(`/departments/${id}`, data);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            const index = mockDepartments.findIndex(d => d.id === id);
            if (index !== -1) {
                mockDepartments.splice(index, 1);
                return { success: true };
            }
            return { success: false, error: { message: 'Department not found' } };
        }
        return api.delete(`/departments/${id}`);
    }
};

// ============ WORKFLOWS ============
export const workflowsService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            return { success: true, data: { workflows: mockWorkflows, total: mockWorkflows.length } };
        }
        const { page = 1, limit = 100 } = params;
        return api.get(`/workflows?page=${page}&limit=${limit}`);
    },

    getActive: async () => {
        if (MOCK_MODE) {
            const active = mockWorkflows.filter(w => w.status === 'ACTIVE');
            return { success: true, data: active };
        }
        return api.get('/workflows/active');
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            const workflow = mockWorkflows.find(w => w.id === id);
            return { success: true, data: workflow };
        }
        return api.get(`/workflows/${id}`);
    },

    getByProduct: async (productId) => {
        return api.get(`/workflows/product/${productId}`);
    },

    create: async (data) => {
        return api.post('/workflows', data);
    },

    update: async (id, data) => {
        return api.put(`/workflows/${id}`, data);
    },

    delete: async (id) => {
        return api.delete(`/workflows/${id}`);
    },

    addStep: async (workflowId, stepData) => {
        return api.post(`/workflows/${workflowId}/steps`, stepData);
    },

    updateStep: async (workflowId, stepId, stepData) => {
        return api.put(`/workflows/${workflowId}/steps/${stepId}`, stepData);
    },

    deleteStep: async (workflowId, stepId) => {
        return api.delete(`/workflows/${workflowId}/steps/${stepId}`);
    }
};

// ============ PARAMETERS ============
export const parametersService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const { type, isActive, search } = params;
            let filtered = [...mockParameters];
            if (type) filtered = filtered.filter(p => p.type === type);
            if (isActive !== undefined) filtered = filtered.filter(p => p.isActive === isActive);
            if (search) filtered = filtered.filter(p =>
                p.name.includes(search) || p.code.includes(search) || p.description?.includes(search)
            );
            return { success: true, data: { parameters: filtered, total: filtered.length } };
        }
        const { page = 1, limit = 100, type, isActive, search } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (type) queryParams.append('type', type);
        if (isActive !== undefined) queryParams.append('isActive', isActive);
        if (search) queryParams.append('search', search);
        return api.get(`/parameters?${queryParams}`);
    },

    getActive: async () => {
        if (MOCK_MODE) {
            const active = mockParameters.filter(p => p.isActive);
            return { success: true, data: active };
        }
        return api.get('/parameters/active');
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            const parameter = mockParameters.find(p => p.id === id);
            return { success: true, data: parameter };
        }
        return api.get(`/parameters/${id}`);
    },

    create: async (data) => {
        if (MOCK_MODE) {
            const newParameter = {
                id: `param-${Date.now()}`,
                ...data,
                options: data.options || [],
                createdAt: new Date().toISOString()
            };
            mockParameters.push(newParameter);
            saveToStorage('mockParameters', mockParameters);
            return { success: true, data: newParameter };
        }
        return api.post('/parameters', data);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            const index = mockParameters.findIndex(p => p.id === id);
            if (index !== -1) {
                mockParameters[index] = { ...mockParameters[index], ...data };
                saveToStorage('mockParameters', mockParameters);
                return { success: true, data: mockParameters[index] };
            }
            return { success: false, error: { message: 'Parameter not found' } };
        }
        return api.put(`/parameters/${id}`, data);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            const index = mockParameters.findIndex(p => p.id === id);
            if (index !== -1) {
                mockParameters.splice(index, 1);
                saveToStorage('mockParameters', mockParameters);
                return { success: true };
            }
            return { success: false, error: { message: 'Parameter not found' } };
        }
        return api.delete(`/parameters/${id}`);
    },

    addOption: async (parameterId, optionData) => {
        if (MOCK_MODE) {
            const paramIndex = mockParameters.findIndex(p => p.id === parameterId);
            if (paramIndex === -1) {
                return { success: false, error: { message: 'Parameter not found' } };
            }
            const newOption = {
                id: `opt-${Date.now()}`,
                ...optionData
            };
            if (!mockParameters[paramIndex].options) {
                mockParameters[paramIndex].options = [];
            }
            mockParameters[paramIndex].options.push(newOption);
            saveToStorage('mockParameters', mockParameters);
            return { success: true, data: mockParameters[paramIndex] };
        }
        return api.post(`/parameters/${parameterId}/options`, optionData);
    },

    updateOption: async (parameterId, optionId, optionData) => {
        if (MOCK_MODE) {
            const paramIndex = mockParameters.findIndex(p => p.id === parameterId);
            if (paramIndex === -1) {
                return { success: false, error: { message: 'Parameter not found' } };
            }
            const optionIndex = mockParameters[paramIndex].options?.findIndex(o => o.id === optionId);
            if (optionIndex === -1 || optionIndex === undefined) {
                return { success: false, error: { message: 'Option not found' } };
            }
            mockParameters[paramIndex].options[optionIndex] = {
                ...mockParameters[paramIndex].options[optionIndex],
                ...optionData
            };
            saveToStorage('mockParameters', mockParameters);
            return { success: true, data: mockParameters[paramIndex] };
        }
        return api.put(`/parameters/options/${optionId}`, optionData);
    },

    deleteOption: async (parameterId, optionId) => {
        if (MOCK_MODE) {
            const paramIndex = mockParameters.findIndex(p => p.id === parameterId);
            if (paramIndex === -1) {
                return { success: false, error: { message: 'Parameter not found' } };
            }
            const optionIndex = mockParameters[paramIndex].options?.findIndex(o => o.id === optionId);
            if (optionIndex === -1 || optionIndex === undefined) {
                return { success: false, error: { message: 'Option not found' } };
            }
            mockParameters[paramIndex].options.splice(optionIndex, 1);
            saveToStorage('mockParameters', mockParameters);
            return { success: true, data: mockParameters[paramIndex] };
        }
        return api.delete(`/parameters/options/${optionId}`);
    },

    calculatePrice: async (productId, selectedParameters) => {
        if (MOCK_MODE) {
            // Simple mock calculation
            let total = 0;
            selectedParameters.forEach(sp => {
                const param = mockParameters.find(p => p.id === sp.parameterId);
                if (param && sp.optionId) {
                    const option = param.options?.find(o => o.id === sp.optionId);
                    if (option && option.priceImpact) {
                        total += option.priceImpact;
                    }
                }
            });
            return { success: true, data: { priceImpact: total } };
        }
        return api.post('/parameters/calculate-price', { productId, selectedParameters });
    }
};

// ============ TASKS ============
// Helper function to enrich mock tasks with relational data
const enrichTask = (task) => {
    const enriched = { ...task };

    // Convert assignee string to assignedTo object
    if (task.assignee && typeof task.assignee === 'string') {
        const names = task.assignee.split(' ');
        enriched.assignedTo = {
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || '',
            fullName: task.assignee
        };
    }

    // Convert department string to department object
    if (task.department && typeof task.department === 'string') {
        const deptObj = mockDepartments.find(d => d.name === task.department);
        if (deptObj) {
            enriched.department = {
                id: deptObj.id,
                name: deptObj.name,
                color: '#667eea' // Default color
            };
        } else {
            enriched.department = {
                name: task.department,
                color: '#667eea'
            };
        }
    }

    // Add workflowStep object from task title
    if (task.title) {
        enriched.workflowStep = {
            name: task.title.split(' - ')[0], // Get first part before dash
            estimatedDurationDays: 5
        };
    }

    // Add mock orderItem with product and customer if not present
    if (task.orderId && !task.orderItem) {
        const order = mockOrders.find(o => o.id === task.orderId);
        if (order) {
            enriched.orderItem = {
                order: {
                    orderNumber: `ORD-${order.id.padStart(4, '0')}`,
                    customer: {
                        name: order.customerName
                    }
                },
                product: {
                    name: order.productName
                },
                unitPrice: order.totalPrice,
                quantity: order.quantity
            };
        }
    }

    return enriched;
};

export const tasksService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const { status, department, assignee } = params;
            let filtered = [...mockTasks];
            if (status) filtered = filtered.filter(t => t.status === status);
            if (department) filtered = filtered.filter(t => t.department === department);
            if (assignee) filtered = filtered.filter(t => t.assignee === assignee);

            // Enrich tasks with relational data
            const enrichedTasks = filtered.map(enrichTask);
            return { success: true, data: { tasks: enrichedTasks, total: enrichedTasks.length } };
        }
        const { page = 1, limit = 100, status, departmentId, assignedToId, orderItemId } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (status) queryParams.append('status', status);
        if (departmentId) queryParams.append('departmentId', departmentId);
        if (assignedToId) queryParams.append('assignedToId', assignedToId);
        if (orderItemId) queryParams.append('orderItemId', orderItemId);
        return api.get(`/tasks?${queryParams}`);
    },

    getMy: async (status) => {
        if (MOCK_MODE) {
            let filtered = [...mockTasks];
            if (status) filtered = filtered.filter(t => t.status === status);

            // Enrich tasks with relational data
            const enrichedTasks = filtered.map(enrichTask);
            return { success: true, data: { tasks: enrichedTasks } };
        }
        const queryParams = status ? `?status=${status}` : '';
        return api.get(`/tasks/my${queryParams}`);
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            const task = mockTasks.find(t => t.id === id);
            return { success: true, data: task };
        }
        return api.get(`/tasks/${id}`);
    },

    getByOrderItem: async (orderItemId) => {
        return api.get(`/tasks/order-item/${orderItemId}`);
    },

    getByDepartment: async (departmentId, status) => {
        const queryParams = status ? `?status=${status}` : '';
        return api.get(`/tasks/department/${departmentId}${queryParams}`);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            const index = mockTasks.findIndex(t => t.id === id);
            if (index !== -1) {
                mockTasks[index] = { ...mockTasks[index], ...data };
                saveToStorage('mockTasks', mockTasks);
                return { success: true, data: mockTasks[index] };
            }
            return { success: false, error: { message: 'Task not found' } };
        }
        return api.put(`/tasks/${id}`, data);
    },

    updateStatus: async (id, status) => {
        if (MOCK_MODE) {
            const index = mockTasks.findIndex(t => t.id === id);
            if (index !== -1) {
                mockTasks[index].status = status;
                saveToStorage('mockTasks', mockTasks);
                if (status === 'IN_PROGRESS' && !mockTasks[index].startedAt) {
                    mockTasks[index].startedAt = new Date().toISOString();
                }
                return { success: true, data: mockTasks[index] };
            }
            return { success: false, error: { message: 'Task not found' } };
        }
        return api.put(`/tasks/${id}`, { status });
    },

    assign: async (id, assignedToId) => {
        if (MOCK_MODE) {
            const index = mockTasks.findIndex(t => t.id === id);
            if (index !== -1) {
                mockTasks[index].assignedToId = assignedToId;
                saveToStorage('mockTasks', mockTasks);
                return { success: true, data: mockTasks[index] };
            }
            return { success: false, error: { message: 'Task not found' } };
        }
        return api.post(`/tasks/${id}/assign`, { assignedToId });
    },

    unassign: async (id) => {
        if (MOCK_MODE) {
            const index = mockTasks.findIndex(t => t.id === id);
            if (index !== -1) {
                mockTasks[index].assignedToId = null;
                saveToStorage('mockTasks', mockTasks);
                mockTasks[index].assignee = null;
                return { success: true, data: mockTasks[index] };
            }
            return { success: false, error: { message: 'Task not found' } };
        }
        return api.delete(`/tasks/${id}/assign`);
    },

    create: async (taskData) => {
        if (MOCK_MODE) {
            const newTask = {
                id: Date.now().toString(),
                ...taskData,
                status: 'PENDING',
                createdAt: new Date().toISOString()
            };
            mockTasks.push(newTask);
            saveToStorage('mockTasks', mockTasks);
            return { success: true, data: newTask };
        }
        return api.post('/tasks', taskData);
    },

    complete: async (id) => {
        if (MOCK_MODE) {
            const index = mockTasks.findIndex(t => t.id === id);
            if (index !== -1) {
                mockTasks[index].status = 'COMPLETED';
                mockTasks[index].completedAt = new Date().toISOString();
                return { success: true, data: mockTasks[index] };
            }
            return { success: false, error: { message: 'Task not found' } };
        }
        return api.post(`/tasks/${id}/complete`);
    },

    cancel: async (id) => {
        if (MOCK_MODE) {
            const index = mockTasks.findIndex(t => t.id === id);
            if (index !== -1) {
                mockTasks[index].status = 'CANCELLED';
                return { success: true, data: mockTasks[index] };
            }
            return { success: false, error: { message: 'Task not found' } };
        }
        return api.post(`/tasks/${id}/cancel`);
    },

    onTaskComplete: async (taskId, completionData) => {
        if (MOCK_MODE) {
            // 1. Mark task as completed
            const taskIndex = mockTasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) return { success: false, error: { message: 'Task not found' } };

            mockTasks[taskIndex].status = 'COMPLETED';
            mockTasks[taskIndex].completedAt = new Date().toISOString();
            if (completionData?.notes) {
                mockTasks[taskIndex].notes = (mockTasks[taskIndex].notes || '') + '\n[סיום]: ' + completionData.notes;
            }

            // 2. Find dependent tasks (tasks waiting for this one)
            const dependentTasks = mockTasks.filter(t =>
                t.dependsOnTaskId === taskId && t.status === 'PENDING'
            );

            // 3. Auto-start next task
            for (const depTask of dependentTasks) {
                const depIndex = mockTasks.findIndex(t => t.id === depTask.id);
                mockTasks[depIndex].status = 'IN_PROGRESS';
                mockTasks[depIndex].startedAt = new Date().toISOString();
            }

            // 4. Check if all order tasks complete
            const completedTask = mockTasks[taskIndex];
            const orderTasks = mockTasks.filter(t => t.orderId === completedTask.orderId);
            const allComplete = orderTasks.every(t => t.status === 'COMPLETED');

            if (allComplete) {
                // Update order status
                const orderIndex = mockOrders.findIndex(o => o.id === completedTask.orderId);
                if (orderIndex !== -1) {
                    mockOrders[orderIndex].status = 'COMPLETED';
                    mockOrders[orderIndex].completedAt = new Date().toISOString();
                }
            }

            return {
                success: true,
                data: {
                    task: mockTasks[taskIndex],
                    nextTasks: dependentTasks,
                    orderCompleted: allComplete
                }
            };
        }

        // Real API call
        return api.post(`/tasks/${taskId}/complete`, completionData);
    }
};

// ============ ANALYTICS ============
export const analyticsService = {
    getDashboard: async () => {
        try {
            const response = await api.get('/analytics/dashboard');
            if (response.success && response.data && Object.keys(response.data).length > 0) {
                return response;
            }
            throw new Error('Empty data');
        } catch (error) {
            console.warn('Analytics API failed or empty, using mock data');
            return {
                success: true,
                data: {
                    totalRevenue: 125000,
                    revenueChange: '+12.5%',
                    totalOrders: 45,
                    ordersChange: '+3',
                    totalCustomers: 120,
                    customersChange: '+5',
                    activeTasks: 18
                }
            };
        }
    },

    getSales: async (startDate, endDate) => {
        try {
            const queryParams = new URLSearchParams();
            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);
            return await api.get(`/analytics/sales?${queryParams}`);
        } catch (error) {
            return { success: true, data: { sales: [] } };
        }
    },

    getRevenueTrends: async (period = 'monthly', year) => {
        try {
            const queryParams = new URLSearchParams({ period });
            if (year) queryParams.append('year', year);
            const response = await api.get(`/analytics/revenue-trends?${queryParams}`);
            if (response.success && response.data) return response;
            throw new Error('Empty trends');
        } catch (error) {
            return {
                success: true,
                data: {
                    trends: [
                        { period: 'Jan', revenue: 12000 },
                        { period: 'Feb', revenue: 19000 },
                        { period: 'Mar', revenue: 15000 },
                        { period: 'Apr', revenue: 22000 },
                        { period: 'May', revenue: 28000 },
                        { period: 'Jun', revenue: 25000 }
                    ]
                }
            };
        }
    },

    getCustomers: async () => {
        return api.get('/analytics/customers');
    },

    getProducts: async () => {
        return api.get('/analytics/products');
    },

    getTasks: async (departmentId) => {
        try {
            const queryParams = departmentId ? `?departmentId=${departmentId}` : '';
            const response = await api.get(`/analytics/tasks${queryParams}`);
            if (response.success && response.data) return response;
            throw new Error('Empty task analytics');
        } catch (error) {
            return {
                success: true,
                data: {
                    tasksByStatus: { PENDING: 5, IN_PROGRESS: 8, COMPLETED: 12, BLOCKED: 2 },
                    tasksByDepartment: []
                }
            };
        }
    }
};

// ============ FILES ============
export const filesService = {
    upload: async (file, entityType, entityId) => {
        const formData = new FormData();
        formData.append('file', file);
        if (entityType) formData.append('entityType', entityType);
        if (entityId) formData.append('entityId', entityId);

        return api.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    getAll: async (params = {}) => {
        const { page = 1, limit = 10, entityType, entityId } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (entityType) queryParams.append('entityType', entityType);
        if (entityId) queryParams.append('entityId', entityId);
        return api.get(`/files?${queryParams}`);
    },

    getById: async (id) => {
        return api.get(`/files/${id}`);
    },

    download: async (id) => {
        return api.get(`/files/${id}/download`, { responseType: 'blob' });
    },

    getSignedUrl: async (id) => {
        return api.get(`/files/${id}/signed-url`);
    },

    delete: async (id) => {
        return api.delete(`/files/${id}`);
    }
};

// ============ API KEYS ============
export const apiKeysService = {
    getAll: async (params = {}) => {
        const { page = 1, limit = 10, isActive } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (isActive !== undefined) queryParams.append('isActive', isActive);
        return api.get(`/api-keys?${queryParams}`);
    },

    getById: async (id) => {
        return api.get(`/api-keys/${id}`);
    },

    create: async (data) => {
        return api.post('/api-keys', data);
    },

    update: async (id, data) => {
        return api.put(`/api-keys/${id}`, data);
    },

    delete: async (id) => {
        return api.delete(`/api-keys/${id}`);
    }
};

// ============ USERS ============
export const usersService = {
    getAll: async () => {
        return api.get('/users');
    },

    create: async (userData) => {
        return api.post('/users', userData);
    },

    update: async (id, userData) => {
        return api.put(`/users/${id}`, userData);
    },

    delete: async (id) => {
        return api.delete(`/users/${id}`);
    }
};

// ============ STOCK ORDERS ============
export const stockOrdersService = {
    getAll: async (params = {}) => {
        const { page = 1, limit = 100, status } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (status) queryParams.append('status', status);
        return api.get(`/stock-orders?${queryParams}`);
    },

    getById: async (id) => {
        return api.get(`/stock-orders/${id}`);
    },

    create: async (data) => {
        return api.post('/stock-orders', data);
    },

    update: async (id, data) => {
        return api.put(`/stock-orders/${id}`, data);
    },

    updateStatus: async (id, status, progress = null) => {
        const data = { status };
        if (progress !== null) data.progress = progress;
        return api.put(`/stock-orders/${id}`, data);
    },

    delete: async (id) => {
        return api.delete(`/stock-orders/${id}`);
    }
};

// ============ SALES PIPELINE ============
export const salesPipelineService = {
    getStages: async () => {
        return api.get('/sales-pipeline/stages');
    },

    updateStages: async (stages) => {
        return api.put('/sales-pipeline/stages', { stages });
    },

    getProductPipeline: async (productId) => {
        return api.get(`/sales-pipeline/product/${productId}`);
    },

    updateProductPipeline: async (productId, stages) => {
        return api.put(`/sales-pipeline/product/${productId}`, { stages });
    }
};



// Export default api instance for custom calls
export default api;
