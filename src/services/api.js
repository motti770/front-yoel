/**
 * API Service Layer
 * Connects to the real CRM API at https://crm-api.app.mottidokib.com
 */

import axios from 'axios';

// ============ MOCK MODE ============
// Set to true to use mock data (when backend is down)
// TODO: Change to false when backend is back online
const MOCK_MODE = true;

// Data version - increment to force reset once
const MOCK_DATA_VERSION = 20;

// One-time reset if version changed (then stays stable)
const storedVersion = localStorage.getItem('mockDataVersion');
if (storedVersion !== String(MOCK_DATA_VERSION)) {
    localStorage.clear();
    localStorage.setItem('mockDataVersion', String(MOCK_DATA_VERSION));
}

// Manual reset function - call from console if needed: window.resetMockData()
if (typeof window !== 'undefined') {
    window.resetMockData = () => {
        localStorage.clear();
        localStorage.setItem('mockDataVersion', String(MOCK_DATA_VERSION));
        console.log('[API] Mock data reset to defaults');
        window.location.reload();
    };

    // Export all data as JSON file - call: window.exportData()
    window.exportData = () => {
        const data = {
            exportDate: new Date().toISOString(),
            version: MOCK_DATA_VERSION,
            products: JSON.parse(localStorage.getItem('mockProducts') || '[]'),
            customers: JSON.parse(localStorage.getItem('mockCustomers') || '[]'),
            orders: JSON.parse(localStorage.getItem('mockOrders') || '[]'),
            leads: JSON.parse(localStorage.getItem('mockLeads') || '[]'),
            leadTasks: JSON.parse(localStorage.getItem('mockLeadTasks') || '[]'),
            tasks: JSON.parse(localStorage.getItem('mockTasks') || '[]'),
            workflows: JSON.parse(localStorage.getItem('mockWorkflows') || '[]'),
            parameters: JSON.parse(localStorage.getItem('mockParameters') || '[]'),
            materials: JSON.parse(localStorage.getItem('mockMaterials') || '[]'),
            notifications: JSON.parse(localStorage.getItem('mockNotifications') || '[]'),
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crm-data-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('[API] Data exported successfully!');
    };

    // Import data from JSON - call: window.importData() then select file
    window.importData = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.products) localStorage.setItem('mockProducts', JSON.stringify(data.products));
                    if (data.customers) localStorage.setItem('mockCustomers', JSON.stringify(data.customers));
                    if (data.orders) localStorage.setItem('mockOrders', JSON.stringify(data.orders));
                    if (data.leads) localStorage.setItem('mockLeads', JSON.stringify(data.leads));
                    if (data.leadTasks) localStorage.setItem('mockLeadTasks', JSON.stringify(data.leadTasks));
                    if (data.tasks) localStorage.setItem('mockTasks', JSON.stringify(data.tasks));
                    if (data.workflows) localStorage.setItem('mockWorkflows', JSON.stringify(data.workflows));
                    if (data.parameters) localStorage.setItem('mockParameters', JSON.stringify(data.parameters));
                    if (data.materials) localStorage.setItem('mockMaterials', JSON.stringify(data.materials));
                    if (data.notifications) localStorage.setItem('mockNotifications', JSON.stringify(data.notifications));
                    console.log('[API] Data imported successfully!');
                    window.location.reload();
                } catch (err) {
                    console.error('[API] Import failed:', err);
                    alert('שגיאה בייבוא הקובץ');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };
}

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
    // ========== לידים חדשים - עדיין לא בחרו מוצר ==========
    {
        id: '1',
        name: 'משה כהן',
        email: 'moshe@example.com',
        phone: '052-1234567',
        company: 'בית כנסת אהבת שלום',
        pipelineStageId: 'stage-new',  // שלב ב-Pipeline הראשי
        source: 'WEBSITE',
        budget: 50000,
        notes: 'מעוניין בפרוכת מהודרת, נכנס דרך האתר',
        createdAt: '2025-12-28',
        stageUpdatedAt: '2025-12-28',
        selectedProductId: null,
        salesWorkflowId: null,      // יוקצה כשיבחר מוצר
        currentSalesStepId: null,   // שלב נוכחי בתהליך מכירה של המוצר
        tasks: []
    },
    {
        id: '5',
        name: 'אברהם שוורץ',
        email: 'avraham@example.com',
        phone: '052-5678901',
        company: 'קהילת נר תמיד',
        pipelineStageId: 'stage-new',
        source: 'SOCIAL',
        budget: 60000,
        notes: 'ראה את העבודות שלנו בפייסבוק, מתעניין במעיל',
        createdAt: '2025-12-24',
        stageUpdatedAt: '2025-12-24',
        selectedProductId: null,
        salesWorkflowId: null,
        currentSalesStepId: null,
        tasks: []
    },
    {
        id: '9',
        name: 'חיים רוזנברג',
        email: 'chaim@example.com',
        phone: '052-9012345',
        company: 'בית מדרש אור חדש',
        pipelineStageId: 'stage-contacted',
        source: 'EMAIL',
        budget: 30000,
        notes: 'שאל שאלות על תהליך הייצור, נקבעה שיחה',
        createdAt: '2025-12-20',
        stageUpdatedAt: '2025-12-26',
        selectedProductId: null,
        salesWorkflowId: null,
        currentSalesStepId: null,
        tasks: []
    },

    // ========== לידים בתהליך - בחרו מוצר ונמצאים בתהליך מכירה ==========
    {
        id: '2',
        name: 'דוד לוי',
        email: 'david@example.com',
        phone: '053-2345678',
        company: 'בית כנסת הגדול רמת גן',
        pipelineStageId: 'stage-product',  // בוחר מוצר
        source: 'REFERRAL',
        budget: 35000,
        notes: 'ממליץ מלקוח קיים - בית כנסת אור החיים',
        createdAt: '2025-12-27',
        stageUpdatedAt: '2025-12-28',
        selectedProductId: 'parochet',
        salesWorkflowId: '101',         // תהליך מכירה עם עיצוב
        currentSalesStepId: 'step-101-0', // איסוף דרישות
        tasks: []
    },
    {
        id: '3',
        name: 'יוסף אברהם',
        email: 'yosef@example.com',
        phone: '054-3456789',
        company: 'בית כנסת המרכזי ירושלים',
        pipelineStageId: 'stage-product',
        source: 'PHONE',
        budget: 75000,
        notes: 'בית כנסת גדול - פרויקט משמעותי, רוצה עיצוב מיוחד',
        createdAt: '2025-12-26',
        stageUpdatedAt: '2025-12-27',
        selectedProductId: 'parochet',
        salesWorkflowId: '101',
        currentSalesStepId: 'step-101-1', // עיצוב סקיצה
        tasks: ['lt-3-0', 'lt-3-1']
    },
    {
        id: '4',
        name: 'שרה גולדברג',
        email: 'sarah@example.com',
        phone: '055-4567890',
        company: 'קהילת שערי תפילה',
        pipelineStageId: 'stage-quote',  // הצעת מחיר
        source: 'EMAIL',
        budget: 25000,
        notes: 'מחפשת כיסוי לבימה, סקיצה אושרה',
        createdAt: '2025-12-25',
        stageUpdatedAt: '2025-12-29',
        selectedProductId: 'kisui-bima',
        salesWorkflowId: '101',
        currentSalesStepId: 'step-101-2', // הצגה ואישור עיצוב
        tasks: ['lt-4-0', 'lt-4-1', 'lt-4-2']
    },
    {
        id: '6',
        name: 'רחל ברקוביץ',
        email: 'rachel@example.com',
        phone: '053-6789012',
        company: 'פרטי - לחתונה',
        pipelineStageId: 'stage-qualified',  // זיהוי צורך
        source: 'WEBSITE',
        budget: 40000,
        notes: 'מחפשת כיסוי טלית ותפילין לחתן',
        createdAt: '2025-12-23',
        stageUpdatedAt: '2025-12-25',
        selectedProductId: 'kisui-talit',
        salesWorkflowId: '103',          // תהליך מכירה מהיר
        currentSalesStepId: 'step-103-0', // הכנת הצעת מחיר
        tasks: []
    },
    {
        id: '7',
        name: 'יעקב פרידמן',
        email: 'yaakov@example.com',
        phone: '054-7890123',
        company: 'מוסדות תפארת ישראל',
        pipelineStageId: 'stage-product',
        source: 'REFERRAL',
        budget: 85000,
        notes: 'פרויקט שיפוץ בית כנסת מלא - פרוכת + כיסוי בימה',
        createdAt: '2025-12-22',
        stageUpdatedAt: '2025-12-26',
        selectedProductId: 'parochet',
        salesWorkflowId: '101',
        currentSalesStepId: 'step-101-0', // איסוף דרישות
        tasks: ['lt-7-0']
    },

    // ========== לידים ממתינים לתשלום ==========
    {
        id: '8',
        name: 'לאה שטיין',
        email: 'leah@example.com',
        phone: '055-8901234',
        company: 'בית כנסת נוה צדק',
        pipelineStageId: 'stage-deposit',  // ממתין למקדמה
        source: 'PHONE',
        budget: 45000,
        notes: 'מעיל לספר תורה חדש, הכל אושר - ממתינה לתשלום',
        createdAt: '2025-12-21',
        stageUpdatedAt: '2025-12-30',
        selectedProductId: 'meil',
        salesWorkflowId: '102',          // תהליך עם מדידות
        currentSalesStepId: 'step-102-2', // גביית מקדמה
        tasks: ['lt-8-0', 'lt-8-1', 'lt-8-2']
    },
    {
        id: '10',
        name: 'מרים ויינשטיין',
        email: 'miriam@example.com',
        phone: '053-0123456',
        company: 'בית כנסת אור שמח',
        pipelineStageId: 'stage-deposit',
        source: 'WEBSITE',
        budget: 55000,
        notes: 'פרוכת מהודרת - עיצוב אושר, הצעה אושרה, ממתינים למקדמה',
        createdAt: '2025-12-19',
        stageUpdatedAt: '2025-12-29',
        selectedProductId: 'parochet',
        salesWorkflowId: '101',
        currentSalesStepId: 'step-101-4', // גביית מקדמה
        tasks: ['lt-10-0', 'lt-10-1', 'lt-10-2', 'lt-10-3', 'lt-10-4']
    },

    // ========== לידים בשלב משא ומתן ==========
    {
        id: '11',
        name: 'אהרון גרינברג',
        email: 'aharon@example.com',
        phone: '050-1112233',
        company: 'ישיבת אור יצחק',
        pipelineStageId: 'stage-negotiation',  // משא ומתן
        source: 'REFERRAL',
        budget: 120000,
        notes: 'פרויקט גדול - 2 פרוכות, מנהל משא ומתן על המחיר',
        createdAt: '2025-12-15',
        stageUpdatedAt: '2025-12-28',
        selectedProductId: 'parochet',
        salesWorkflowId: '101',
        currentSalesStepId: 'step-101-3', // הכנת הצעת מחיר
        tasks: []
    },
    {
        id: '12',
        name: 'שמעון כץ',
        email: 'shimon@example.com',
        phone: '050-4445566',
        company: 'קהילת בית יעקב',
        pipelineStageId: 'stage-quote',  // הצעת מחיר
        source: 'WEBSITE',
        budget: 38000,
        notes: 'כיסוי בימה + עמוד חזן, נשלחה הצעה',
        createdAt: '2025-12-18',
        stageUpdatedAt: '2025-12-27',
        selectedProductId: 'kisui-bima',
        salesWorkflowId: '101',
        currentSalesStepId: 'step-101-3', // הכנת הצעת מחיר
        tasks: []
    },

    // ========== לידים שנסגרו (זכייה/אבוד) ==========
    {
        id: '13',
        name: 'נחום הלוי',
        email: 'nachum@example.com',
        phone: '052-7778899',
        company: 'בית כנסת הרמב"ם',
        pipelineStageId: 'stage-won',  // זכייה!
        source: 'PHONE',
        budget: 65000,
        notes: 'פרוכת מהודרת - שולם ועבר לייצור!',
        createdAt: '2025-12-10',
        stageUpdatedAt: '2025-12-25',
        selectedProductId: 'parochet',
        salesWorkflowId: '101',
        currentSalesStepId: 'step-101-4', // גביית מקדמה - הושלם
        convertedToOrderId: 'ord-001',
        tasks: []
    },
    {
        id: '14',
        name: 'בנימין רוט',
        email: 'binyamin@example.com',
        phone: '054-1234567',
        company: 'בית כנסת המזרחי',
        pipelineStageId: 'stage-lost',  // אבוד
        source: 'EMAIL',
        budget: 28000,
        notes: 'הלך למתחרה - יקר מדי',
        lostReason: 'מחיר',
        createdAt: '2025-12-08',
        stageUpdatedAt: '2025-12-20',
        selectedProductId: 'meil',
        salesWorkflowId: '102',
        currentSalesStepId: null,
        tasks: []
    }
];

// משימות ליד (לפני תשלום - תהליך מכירה)
const defaultMockLeadTasks = [
    // משימות ליד 3 - יוסף אברהם (פרוכת, בתהליך עיצוב)
    { id: 'lt-3-0', leadId: '3', title: 'איסוף דרישות מלקוח', status: 'COMPLETED', stepOrder: 1, completedAt: '2025-12-27' },
    { id: 'lt-3-1', leadId: '3', title: 'עיצוב סקיצה', status: 'IN_PROGRESS', stepOrder: 2, assignedTo: 'מרים לוי', dueDate: '2025-12-30' },

    // משימות ליד 4 - שרה גולדברג (כיסוי בימה, באישור עיצוב)
    { id: 'lt-4-0', leadId: '4', title: 'איסוף דרישות מלקוח', status: 'COMPLETED', stepOrder: 1, completedAt: '2025-12-26' },
    { id: 'lt-4-1', leadId: '4', title: 'עיצוב סקיצה', status: 'COMPLETED', stepOrder: 2, completedAt: '2025-12-28' },
    { id: 'lt-4-2', leadId: '4', title: 'הצגה ואישור עיצוב', status: 'IN_PROGRESS', stepOrder: 3, assignedTo: 'מרים לוי', dueDate: '2025-12-31' },

    // משימות ליד 7 - יעקב פרידמן (התחיל תהליך)
    { id: 'lt-7-0', leadId: '7', title: 'איסוף דרישות מלקוח', status: 'IN_PROGRESS', stepOrder: 1, assignedTo: 'דוד רוזן', dueDate: '2025-12-29' },

    // משימות ליד 8 - לאה שטיין (מעיל תורה, ממתינה לתשלום)
    { id: 'lt-8-0', leadId: '8', title: 'קבלת מידות מלקוח', status: 'COMPLETED', stepOrder: 1, completedAt: '2025-12-22' },
    { id: 'lt-8-1', leadId: '8', title: 'הכנת הצעת מחיר', status: 'COMPLETED', stepOrder: 2, completedAt: '2025-12-23' },
    { id: 'lt-8-2', leadId: '8', title: 'גביית מקדמה', status: 'IN_PROGRESS', stepOrder: 3, assignedTo: 'יעקב כהן', dueDate: '2025-12-31', isPaymentStep: true },

    // משימות ליד 10 - מרים ויינשטיין (פרוכת, ממתינה לתשלום)
    { id: 'lt-10-0', leadId: '10', title: 'איסוף דרישות מלקוח', status: 'COMPLETED', stepOrder: 1, completedAt: '2025-12-20' },
    { id: 'lt-10-1', leadId: '10', title: 'עיצוב סקיצה', status: 'COMPLETED', stepOrder: 2, completedAt: '2025-12-23' },
    { id: 'lt-10-2', leadId: '10', title: 'הצגה ואישור עיצוב', status: 'COMPLETED', stepOrder: 3, completedAt: '2025-12-25' },
    { id: 'lt-10-3', leadId: '10', title: 'הכנת הצעת מחיר', status: 'COMPLETED', stepOrder: 4, completedAt: '2025-12-26' },
    { id: 'lt-10-4', leadId: '10', title: 'גביית מקדמה', status: 'IN_PROGRESS', stepOrder: 5, assignedTo: 'יעקב כהן', dueDate: '2026-01-02', isPaymentStep: true }
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
    // ========== מוצרים ראשיים (Base Products) ==========
    {
        id: 'parochet',
        name: 'פרוכת',
        category: 'פרוכות',
        status: 'ACTIVE',
        productionTime: 45,
        description: 'פרוכת לארון קודש',
        parentProductId: null,
        salesWorkflowId: '101',    // תהליך מכירה: סקיצה → אישור → מקדמה
        productionWorkflowId: '1', // תהליך ייצור: רקמה → תפירה...
        imageUrl: '/products/parochet.jpeg'
    },
    {
        id: 'meil',
        name: 'מעיל ספר תורה',
        category: 'מעילים',
        status: 'ACTIVE',
        productionTime: 30,
        description: 'מעיל לספר תורה',
        parentProductId: null,
        salesWorkflowId: '102',    // תהליך מכירה: מדידות → מקדמה
        productionWorkflowId: '2', // תהליך ייצור מהיר
        imageUrl: '/products/meil.jpeg'
    },
    {
        id: 'kisui-bima',
        name: 'כיסוי בימה ועמוד',
        category: 'כיסויים',
        status: 'ACTIVE',
        productionTime: 35,
        description: 'כיסוי לבימה ועמוד חזן',
        parentProductId: null,
        salesWorkflowId: '101',    // תהליך מכירה עם סקיצה
        productionWorkflowId: '3', // תהליך מותאם אישית
        imageUrl: '/products/kisui-bima.jpeg'
    },
    {
        id: 'kisui-talit',
        name: 'כיסוי טלית ותפילין',
        category: 'כיסויים',
        status: 'ACTIVE',
        productionTime: 14,
        description: 'כיסוי לטלית ותפילין',
        parentProductId: null,
        salesWorkflowId: '103',    // תהליך מכירה פשוט: רק מקדמה
        productionWorkflowId: '2', // תהליך מהיר
        imageUrl: '/products/kisui-talit.png'
    },

    // ========== קבוצות עיצוב פרוכת (Design Groups) ==========
    // רמה 2: קבוצות עיצוב - מוצגות כרשימה מקופלת
    {
        id: 'P120',
        name: 'כתר וזר',
        catalogCode: 'P120',
        designTag: 'כתר וזר',
        category: 'פרוכות',
        status: 'ACTIVE',
        basePrice: 8500,
        productionTime: 45,
        description: 'עיצוב קלאסי עם כתר וזרי פרחים',
        parentProductId: 'parochet',
        isDesignGroup: true,
        variationCount: 6,
        imageUrl: null
    },
    {
        id: 'P121',
        name: 'ירושלים עגול',
        catalogCode: 'P121',
        designTag: 'ירושלים עגול',
        category: 'פרוכות',
        status: 'ACTIVE',
        basePrice: 9500,
        productionTime: 50,
        description: 'נוף ירושלים בעיצוב עגול מרשים',
        parentProductId: 'parochet',
        isDesignGroup: true,
        variationCount: 6,
        imageUrl: null
    },
    {
        id: 'P122',
        name: 'מסגרת מלכות',
        catalogCode: 'P122',
        designTag: 'מסגרת מלכות',
        category: 'פרוכות',
        status: 'ACTIVE',
        basePrice: 7500,
        productionTime: 40,
        description: 'מסגרת מלכותית עם עיטורים מפוארים',
        parentProductId: 'parochet',
        isDesignGroup: true,
        variationCount: 6,
        imageUrl: null
    },
    {
        id: 'P123',
        name: 'שער וילנא',
        catalogCode: 'P123',
        designTag: 'שער וילנא',
        category: 'פרוכות',
        status: 'ACTIVE',
        basePrice: 12000,
        productionTime: 60,
        description: 'עיצוב שער וילנא עם רקמה מלאה',
        parentProductId: 'parochet',
        isDesignGroup: true,
        variationCount: 4,
        imageUrl: null
    },
    {
        id: 'P124',
        name: 'עץ חיים',
        catalogCode: 'P124',
        designTag: 'עץ חיים',
        category: 'פרוכות',
        status: 'ACTIVE',
        basePrice: 8000,
        productionTime: 45,
        description: 'עיצוב עץ החיים עם ענפים וזרים',
        parentProductId: 'parochet',
        isDesignGroup: true,
        variationCount: 6,
        imageUrl: null
    },
    {
        id: 'P127',
        name: 'בית המקדש',
        catalogCode: 'P127',
        designTag: 'בית מקדש',
        category: 'פרוכות',
        status: 'ACTIVE',
        basePrice: 15000,
        productionTime: 75,
        description: 'בית המקדש עם רקמה מלאה ומפוארת',
        parentProductId: 'parochet',
        isDesignGroup: true,
        variationCount: 4,
        imageUrl: null
    },

    // ========== וריאציות איור (Illustration Variations) ==========
    // רמה 3: וריאציות ספציפיות של כל עיצוב
    // P120 - כתר וזר
    { id: 'P120-A', name: 'כתר וזר - סגנון A', catalogCode: 'P120-A', parentProductId: 'P120', basePrice: 8500, colorScheme: 'קלאסי', description: 'רקע כחול כהה, רקמה זהב', imageUrl: null },
    { id: 'P120-B', name: 'כתר וזר - סגנון B', catalogCode: 'P120-B', parentProductId: 'P120', basePrice: 8500, colorScheme: 'מודרני', description: 'רקע בורדו, רקמה זהב', imageUrl: null },
    { id: 'P120-C', name: 'כתר וזר - סגנון C', catalogCode: 'P120-C', parentProductId: 'P120', basePrice: 8800, colorScheme: 'עשיר', description: 'רקע שחור, רקמה זהב וכסף', imageUrl: null },
    { id: 'P120-D', name: 'כתר וזר - סגנון D', catalogCode: 'P120-D', parentProductId: 'P120', basePrice: 8500, colorScheme: 'מסורתי', description: 'רקע כחול רויאל, רקמה כסף', imageUrl: null },
    { id: 'P120-R', name: 'כתר וזר - סגנון R', catalogCode: 'P120-R', parentProductId: 'P120', basePrice: 9000, colorScheme: 'יוקרתי', description: 'גרסה מורחבת עם עיטורים נוספים', imageUrl: null },
    { id: 'P120-W', name: 'כתר וזר - סגנון W', catalogCode: 'P120-W', parentProductId: 'P120', basePrice: 8200, colorScheme: 'לבן', description: 'רקע לבן, מתאים לימים נוראים', imageUrl: null },

    // P121 - ירושלים עגול
    { id: 'P121-A', name: 'ירושלים עגול - סגנון A', catalogCode: 'P121-A', parentProductId: 'P121', basePrice: 9500, colorScheme: 'קלאסי', description: 'נוף ירושלים מלא, רקע כחול', imageUrl: null },
    { id: 'P121-B', name: 'ירושלים עגול - סגנון B', catalogCode: 'P121-B', parentProductId: 'P121', basePrice: 9500, colorScheme: 'זריחה', description: 'גווני זריחה, שמים כתומים', imageUrl: null },
    { id: 'P121-C', name: 'ירושלים עגול - סגנון C', catalogCode: 'P121-C', parentProductId: 'P121', basePrice: 9800, colorScheme: 'לילה', description: 'נוף לילה עם כוכבים', imageUrl: null },
    { id: 'P121-D', name: 'ירושלים עגול - סגנון D', catalogCode: 'P121-D', parentProductId: 'P121', basePrice: 9500, colorScheme: 'זהב', description: 'כותל וכיפת הזהב מודגשים', imageUrl: null },
    { id: 'P121-R', name: 'ירושלים עגול - סגנון R', catalogCode: 'P121-R', parentProductId: 'P121', basePrice: 10000, colorScheme: 'מלא', description: 'רקמה מלאה עם כל הפרטים', imageUrl: null },
    { id: 'P121-W', name: 'ירושלים עגול - סגנון W', catalogCode: 'P121-W', parentProductId: 'P121', basePrice: 9200, colorScheme: 'לבן', description: 'גרסה לימים נוראים', imageUrl: null },

    // P122 - מסגרת מלכות
    { id: 'P122-A', name: 'מסגרת מלכות - סגנון A', catalogCode: 'P122-A', parentProductId: 'P122', basePrice: 7500, colorScheme: 'קלאסי', description: 'מסגרת עם עיטורי פרחים', imageUrl: null },
    { id: 'P122-B', name: 'מסגרת מלכות - סגנון B', catalogCode: 'P122-B', parentProductId: 'P122', basePrice: 7500, colorScheme: 'מלכותי', description: 'מסגרת עם כתרים', imageUrl: null },
    { id: 'P122-C', name: 'מסגרת מלכות - סגנון C', catalogCode: 'P122-C', parentProductId: 'P122', basePrice: 7800, colorScheme: 'מפואר', description: 'מסגרת כפולה מפוארת', imageUrl: null },
    { id: 'P122-D', name: 'מסגרת מלכות - סגנון D', catalogCode: 'P122-D', parentProductId: 'P122', basePrice: 7500, colorScheme: 'פשוט', description: 'מסגרת נקייה ואלגנטית', imageUrl: null },
    { id: 'P122-R', name: 'מסגרת מלכות - סגנון R', catalogCode: 'P122-R', parentProductId: 'P122', basePrice: 8000, colorScheme: 'עשיר', description: 'גרסה עשירה עם רקמה מלאה', imageUrl: null },
    { id: 'P122-W', name: 'מסגרת מלכות - סגנון W', catalogCode: 'P122-W', parentProductId: 'P122', basePrice: 7200, colorScheme: 'לבן', description: 'לימים נוראים', imageUrl: null },

    // P123 - שער וילנא
    { id: 'P123-A', name: 'שער וילנא - סגנון A', catalogCode: 'P123-A', parentProductId: 'P123', basePrice: 12000, colorScheme: 'מסורתי', description: 'עיצוב מסורתי עם רקמה מלאה', imageUrl: null },
    { id: 'P123-B', name: 'שער וילנא - סגנון B', catalogCode: 'P123-B', parentProductId: 'P123', basePrice: 12000, colorScheme: 'מודרני', description: 'פרשנות מודרנית', imageUrl: null },
    { id: 'P123-R', name: 'שער וילנא - סגנון R', catalogCode: 'P123-R', parentProductId: 'P123', basePrice: 13000, colorScheme: 'יוקרתי', description: 'גרסה מורחבת עם פרטים נוספים', imageUrl: null },
    { id: 'P123-W', name: 'שער וילנא - סגנון W', catalogCode: 'P123-W', parentProductId: 'P123', basePrice: 11500, colorScheme: 'לבן', description: 'לימים נוראים', imageUrl: null },

    // P124 - עץ חיים
    { id: 'P124-A', name: 'עץ חיים - סגנון A', catalogCode: 'P124-A', parentProductId: 'P124', basePrice: 8000, colorScheme: 'טבעי', description: 'עץ עם ענפים ירוקים', imageUrl: null },
    { id: 'P124-B', name: 'עץ חיים - סגנון B', catalogCode: 'P124-B', parentProductId: 'P124', basePrice: 8000, colorScheme: 'זהוב', description: 'עץ זהב על רקע כחול', imageUrl: null },
    { id: 'P124-C', name: 'עץ חיים - סגנון C', catalogCode: 'P124-C', parentProductId: 'P124', basePrice: 8300, colorScheme: 'סתווי', description: 'גווני סתיו חמים', imageUrl: null },
    { id: 'P124-D', name: 'עץ חיים - סגנון D', catalogCode: 'P124-D', parentProductId: 'P124', basePrice: 8000, colorScheme: 'מינימלי', description: 'עיצוב נקי ופשוט', imageUrl: null },
    { id: 'P124-R', name: 'עץ חיים - סגנון R', catalogCode: 'P124-R', parentProductId: 'P124', basePrice: 8500, colorScheme: 'עשיר', description: 'עץ מלא עם פירות ופרחים', imageUrl: null },
    { id: 'P124-W', name: 'עץ חיים - סגנון W', catalogCode: 'P124-W', parentProductId: 'P124', basePrice: 7700, colorScheme: 'לבן', description: 'לימים נוראים', imageUrl: null },

    // P127 - בית המקדש
    { id: 'P127-A', name: 'בית המקדש - סגנון A', catalogCode: 'P127-A', parentProductId: 'P127', basePrice: 15000, colorScheme: 'היסטורי', description: 'שחזור מדויק של בית המקדש', imageUrl: null },
    { id: 'P127-B', name: 'בית המקדש - סגנון B', catalogCode: 'P127-B', parentProductId: 'P127', basePrice: 15000, colorScheme: 'אמנותי', description: 'פרשנות אמנותית', imageUrl: null },
    { id: 'P127-R', name: 'בית המקדש - סגנון R', catalogCode: 'P127-R', parentProductId: 'P127', basePrice: 16500, colorScheme: 'מלא', description: 'גרסה מורחבת עם כל הפרטים', imageUrl: null },
    { id: 'P127-W', name: 'בית המקדש - סגנון W', catalogCode: 'P127-W', parentProductId: 'P127', basePrice: 14500, colorScheme: 'לבן', description: 'לימים נוראים', imageUrl: null },

    // ========== קבוצות עיצוב מעיל ספר תורה (Torah Mantle Design Groups) ==========
    {
        id: 'M101',
        name: 'כתר תורה קלאסי',
        catalogCode: 'M101',
        designTag: 'כתר קלאסי',
        category: 'מעילים',
        status: 'ACTIVE',
        basePrice: 3500,
        productionTime: 21,
        description: 'עיצוב קלאסי עם כתר תורה מפואר',
        parentProductId: 'meil',
        isDesignGroup: true,
        variationCount: 4,
        imageUrl: null
    },
    {
        id: 'M102',
        name: 'עמודי שלמה',
        catalogCode: 'M102',
        designTag: 'עמודים',
        category: 'מעילים',
        status: 'ACTIVE',
        basePrice: 4200,
        productionTime: 25,
        description: 'עיצוב עמודי שלמה עם עיטורים מפוארים',
        parentProductId: 'meil',
        isDesignGroup: true,
        variationCount: 4,
        imageUrl: null
    },
    {
        id: 'M103',
        name: 'לוחות הברית',
        catalogCode: 'M103',
        designTag: 'לוחות',
        category: 'מעילים',
        status: 'ACTIVE',
        basePrice: 3800,
        productionTime: 22,
        description: 'לוחות הברית עם כתב אשורית מפואר',
        parentProductId: 'meil',
        isDesignGroup: true,
        variationCount: 3,
        imageUrl: null
    },
    {
        id: 'M104',
        name: 'שבעת המינים',
        catalogCode: 'M104',
        designTag: 'שבעת המינים',
        category: 'מעילים',
        status: 'ACTIVE',
        basePrice: 4500,
        productionTime: 28,
        description: 'עיצוב שבעת המינים עם רקמה מלאה',
        parentProductId: 'meil',
        isDesignGroup: true,
        variationCount: 3,
        imageUrl: null
    },

    // ========== וריאציות מעיל ספר תורה ==========
    // M101 - כתר תורה קלאסי
    { id: 'M101-A', name: 'כתר תורה קלאסי - זהב', catalogCode: 'M101-A', parentProductId: 'M101', basePrice: 3500, colorScheme: 'זהב קלאסי', description: 'רקמת זהב על קטיפה כחולה', status: 'ACTIVE', imageUrl: null },
    { id: 'M101-B', name: 'כתר תורה קלאסי - כסף', catalogCode: 'M101-B', parentProductId: 'M101', basePrice: 3500, colorScheme: 'כסף מלכותי', description: 'רקמת כסף על קטיפה בורדו', status: 'ACTIVE', imageUrl: null },
    { id: 'M101-C', name: 'כתר תורה קלאסי - מפואר', catalogCode: 'M101-C', parentProductId: 'M101', basePrice: 4000, colorScheme: 'זהב וכסף', description: 'שילוב זהב וכסף יוקרתי', status: 'ACTIVE', imageUrl: null },
    { id: 'M101-W', name: 'כתר תורה קלאסי - לבן', catalogCode: 'M101-W', parentProductId: 'M101', basePrice: 3200, colorScheme: 'לבן', description: 'לימים נוראים', status: 'ACTIVE', imageUrl: null },

    // M102 - עמודי שלמה
    { id: 'M102-A', name: 'עמודי שלמה - מלכותי', catalogCode: 'M102-A', parentProductId: 'M102', basePrice: 4200, colorScheme: 'זהב מלכותי', description: 'עמודים מוזהבים עם בסיס מפואר', status: 'ACTIVE', imageUrl: null },
    { id: 'M102-B', name: 'עמודי שלמה - עתיק', catalogCode: 'M102-B', parentProductId: 'M102', basePrice: 4200, colorScheme: 'עתיק', description: 'סגנון עתיק עם פטינה', status: 'ACTIVE', imageUrl: null },
    { id: 'M102-C', name: 'עמודי שלמה - מודרני', catalogCode: 'M102-C', parentProductId: 'M102', basePrice: 4500, colorScheme: 'מודרני', description: 'פרשנות מודרנית', status: 'ACTIVE', imageUrl: null },
    { id: 'M102-W', name: 'עמודי שלמה - לבן', catalogCode: 'M102-W', parentProductId: 'M102', basePrice: 3900, colorScheme: 'לבן', description: 'לימים נוראים', status: 'ACTIVE', imageUrl: null },

    // M103 - לוחות הברית
    { id: 'M103-A', name: 'לוחות הברית - קלאסי', catalogCode: 'M103-A', parentProductId: 'M103', basePrice: 3800, colorScheme: 'קלאסי', description: 'לוחות עם עשרת הדיברות', status: 'ACTIVE', imageUrl: null },
    { id: 'M103-B', name: 'לוחות הברית - מפואר', catalogCode: 'M103-B', parentProductId: 'M103', basePrice: 4200, colorScheme: 'מפואר', description: 'לוחות עם קרני אור', status: 'ACTIVE', imageUrl: null },
    { id: 'M103-W', name: 'לוחות הברית - לבן', catalogCode: 'M103-W', parentProductId: 'M103', basePrice: 3500, colorScheme: 'לבן', description: 'לימים נוראים', status: 'ACTIVE', imageUrl: null },

    // M104 - שבעת המינים
    { id: 'M104-A', name: 'שבעת המינים - טבעי', catalogCode: 'M104-A', parentProductId: 'M104', basePrice: 4500, colorScheme: 'טבעי', description: 'צבעים טבעיים ורכים', status: 'ACTIVE', imageUrl: null },
    { id: 'M104-B', name: 'שבעת המינים - עשיר', catalogCode: 'M104-B', parentProductId: 'M104', basePrice: 5000, colorScheme: 'עשיר', description: 'צבעים עזים ומלאים', status: 'ACTIVE', imageUrl: null },
    { id: 'M104-W', name: 'שבעת המינים - לבן', catalogCode: 'M104-W', parentProductId: 'M104', basePrice: 4200, colorScheme: 'לבן', description: 'לימים נוראים', status: 'ACTIVE', imageUrl: null },

    // ========== קבוצות עיצוב כיסוי בימה (Bima Cover Design Groups) ==========
    {
        id: 'B101',
        name: 'מסגרת קלאסית',
        catalogCode: 'B101',
        designTag: 'מסגרת',
        category: 'כיסויים',
        status: 'ACTIVE',
        basePrice: 4500,
        productionTime: 28,
        description: 'מסגרת קלאסית עם עיטורי פרחים',
        parentProductId: 'kisui-bima',
        isDesignGroup: true,
        variationCount: 4,
        imageUrl: null
    },
    {
        id: 'B102',
        name: 'ירושלים פנורמי',
        catalogCode: 'B102',
        designTag: 'ירושלים',
        category: 'כיסויים',
        status: 'ACTIVE',
        basePrice: 5500,
        productionTime: 35,
        description: 'נוף ירושלים פנורמי מרשים',
        parentProductId: 'kisui-bima',
        isDesignGroup: true,
        variationCount: 3,
        imageUrl: null
    },
    {
        id: 'B103',
        name: 'אריות יהודה',
        catalogCode: 'B103',
        designTag: 'אריות',
        category: 'כיסויים',
        status: 'ACTIVE',
        basePrice: 5000,
        productionTime: 32,
        description: 'זוג אריות מחזיקים לוחות הברית',
        parentProductId: 'kisui-bima',
        isDesignGroup: true,
        variationCount: 3,
        imageUrl: null
    },

    // ========== וריאציות כיסוי בימה ==========
    // B101 - מסגרת קלאסית
    { id: 'B101-A', name: 'מסגרת קלאסית - זהב', catalogCode: 'B101-A', parentProductId: 'B101', basePrice: 4500, colorScheme: 'זהב', description: 'מסגרת זהובה על כחול כהה', status: 'ACTIVE', imageUrl: null },
    { id: 'B101-B', name: 'מסגרת קלאסית - כסף', catalogCode: 'B101-B', parentProductId: 'B101', basePrice: 4500, colorScheme: 'כסף', description: 'מסגרת כסופה על בורדו', status: 'ACTIVE', imageUrl: null },
    { id: 'B101-C', name: 'מסגרת קלאסית - דלוקס', catalogCode: 'B101-C', parentProductId: 'B101', basePrice: 5200, colorScheme: 'דלוקס', description: 'מסגרת כפולה מפוארת', status: 'ACTIVE', imageUrl: null },
    { id: 'B101-W', name: 'מסגרת קלאסית - לבן', catalogCode: 'B101-W', parentProductId: 'B101', basePrice: 4200, colorScheme: 'לבן', description: 'לימים נוראים', status: 'ACTIVE', imageUrl: null },

    // B102 - ירושלים פנורמי
    { id: 'B102-A', name: 'ירושלים פנורמי - יום', catalogCode: 'B102-A', parentProductId: 'B102', basePrice: 5500, colorScheme: 'יום', description: 'נוף ירושלים באור יום', status: 'ACTIVE', imageUrl: null },
    { id: 'B102-B', name: 'ירושלים פנורמי - זריחה', catalogCode: 'B102-B', parentProductId: 'B102', basePrice: 5500, colorScheme: 'זריחה', description: 'גווני זריחה זהובים', status: 'ACTIVE', imageUrl: null },
    { id: 'B102-W', name: 'ירושלים פנורמי - לבן', catalogCode: 'B102-W', parentProductId: 'B102', basePrice: 5000, colorScheme: 'לבן', description: 'לימים נוראים', status: 'ACTIVE', imageUrl: null },

    // B103 - אריות יהודה
    { id: 'B103-A', name: 'אריות יהודה - מלכותי', catalogCode: 'B103-A', parentProductId: 'B103', basePrice: 5000, colorScheme: 'מלכותי', description: 'אריות זהובים על כחול', status: 'ACTIVE', imageUrl: null },
    { id: 'B103-B', name: 'אריות יהודה - קלאסי', catalogCode: 'B103-B', parentProductId: 'B103', basePrice: 5000, colorScheme: 'קלאסי', description: 'סגנון קלאסי עתיק', status: 'ACTIVE', imageUrl: null },
    { id: 'B103-W', name: 'אריות יהודה - לבן', catalogCode: 'B103-W', parentProductId: 'B103', basePrice: 4500, colorScheme: 'לבן', description: 'לימים נוראים', status: 'ACTIVE', imageUrl: null },

    // ========== קבוצות עיצוב כיסוי טלית ותפילין (Tallit Cover Design Groups) ==========
    {
        id: 'T101',
        name: 'מסגרת פשוטה',
        catalogCode: 'T101',
        designTag: 'מסגרת פשוטה',
        category: 'כיסויים',
        status: 'ACTIVE',
        basePrice: 450,
        productionTime: 7,
        description: 'מסגרת פשוטה ואלגנטית',
        parentProductId: 'kisui-talit',
        isDesignGroup: true,
        variationCount: 4,
        imageUrl: null
    },
    {
        id: 'T102',
        name: 'עיטורי ירושלים',
        catalogCode: 'T102',
        designTag: 'ירושלים',
        category: 'כיסויים',
        status: 'ACTIVE',
        basePrice: 650,
        productionTime: 10,
        description: 'עיטורי ירושלים עדינים',
        parentProductId: 'kisui-talit',
        isDesignGroup: true,
        variationCount: 3,
        imageUrl: null
    },
    {
        id: 'T103',
        name: 'מגן דוד',
        catalogCode: 'T103',
        designTag: 'מגן דוד',
        category: 'כיסויים',
        status: 'ACTIVE',
        basePrice: 550,
        productionTime: 8,
        description: 'מגן דוד מעוטר',
        parentProductId: 'kisui-talit',
        isDesignGroup: true,
        variationCount: 3,
        imageUrl: null
    },

    // ========== וריאציות כיסוי טלית ==========
    // T101 - מסגרת פשוטה
    { id: 'T101-A', name: 'מסגרת פשוטה - כחול', catalogCode: 'T101-A', parentProductId: 'T101', basePrice: 450, colorScheme: 'כחול', description: 'קטיפה כחולה עם רקמת זהב', status: 'ACTIVE', imageUrl: null },
    { id: 'T101-B', name: 'מסגרת פשוטה - בורדו', catalogCode: 'T101-B', parentProductId: 'T101', basePrice: 450, colorScheme: 'בורדו', description: 'קטיפה בורדו עם רקמת זהב', status: 'ACTIVE', imageUrl: null },
    { id: 'T101-C', name: 'מסגרת פשוטה - שחור', catalogCode: 'T101-C', parentProductId: 'T101', basePrice: 450, colorScheme: 'שחור', description: 'קטיפה שחורה עם רקמת כסף', status: 'ACTIVE', imageUrl: null },
    { id: 'T101-W', name: 'מסגרת פשוטה - לבן', catalogCode: 'T101-W', parentProductId: 'T101', basePrice: 400, colorScheme: 'לבן', description: 'סאטן לבן לימים נוראים', status: 'ACTIVE', imageUrl: null },

    // T102 - עיטורי ירושלים
    { id: 'T102-A', name: 'עיטורי ירושלים - זהב', catalogCode: 'T102-A', parentProductId: 'T102', basePrice: 650, colorScheme: 'זהב', description: 'רקמת זהב על כחול', status: 'ACTIVE', imageUrl: null },
    { id: 'T102-B', name: 'עיטורי ירושלים - כסף', catalogCode: 'T102-B', parentProductId: 'T102', basePrice: 650, colorScheme: 'כסף', description: 'רקמת כסף על בורדו', status: 'ACTIVE', imageUrl: null },
    { id: 'T102-W', name: 'עיטורי ירושלים - לבן', catalogCode: 'T102-W', parentProductId: 'T102', basePrice: 600, colorScheme: 'לבן', description: 'לימים נוראים', status: 'ACTIVE', imageUrl: null },

    // T103 - מגן דוד
    { id: 'T103-A', name: 'מגן דוד - קלאסי', catalogCode: 'T103-A', parentProductId: 'T103', basePrice: 550, colorScheme: 'קלאסי', description: 'מגן דוד מוזהב', status: 'ACTIVE', imageUrl: null },
    { id: 'T103-B', name: 'מגן דוד - מודרני', catalogCode: 'T103-B', parentProductId: 'T103', basePrice: 550, colorScheme: 'מודרני', description: 'עיצוב מודרני גיאומטרי', status: 'ACTIVE', imageUrl: null },
    { id: 'T103-W', name: 'מגן דוד - לבן', catalogCode: 'T103-W', parentProductId: 'T103', basePrice: 500, colorScheme: 'לבן', description: 'לימים נוראים', status: 'ACTIVE', imageUrl: null }
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

// Helper to convert step names to step objects
const createStepObjects = (workflowId, stepNames, departments) => {
    const deptMap = { 'עיצוב': '1', 'רקמה': '1', 'חיתוך': '2', 'תפירה': '3', 'בדיקה': '4', 'איכות': '4', 'אריזה': '5', 'משלוח': '5' };
    return stepNames.map((name, index) => {
        const deptKey = Object.keys(deptMap).find(k => name.includes(k));
        return {
            id: `step-${workflowId}-${index}`,
            name: name,
            stepOrder: index + 1,
            departmentId: deptMap[deptKey] || '1',
            estimatedDurationDays: 3,
            isActive: true
        };
    });
};

const defaultMockWorkflows = [
    // ========== תהליכי ייצור פרוכת (PRODUCTION - PAROCHET) ==========
    {
        id: '1',
        name: 'תהליך ייצור פרוכת מלא',
        code: 'PAROCHET_FULL',
        type: 'PRODUCTION',
        productId: 'parochet',
        description: 'תהליך מלא לייצור פרוכת - כולל רקמה מלאה',
        status: 'ACTIVE',
        isActive: true,
        estimatedDays: 45,
        createdAt: '2024-01-15',
        steps: [
            { id: 'step-1-1', name: 'הזמנת קטיפה וחומרים', stepOrder: 1, departmentId: '5', estimatedDurationDays: 3, isActive: true, description: 'הזמנת קטיפה בצבע הנבחר, חוטי רקמה, אביזרים' },
            { id: 'step-1-2', name: 'חיתוך קטיפה למידות', stepOrder: 2, departmentId: '2', estimatedDurationDays: 1, isActive: true, description: 'חיתוך הקטיפה לפי המידות שהוזמנו' },
            { id: 'step-1-3', name: 'הכנת דוגמת רקמה', stepOrder: 3, departmentId: '1', estimatedDurationDays: 2, isActive: true, description: 'הכנת קובץ דיגיטלי והעברה למכונת רקמה' },
            { id: 'step-1-4', name: 'רקמה ראשית - עיצוב מרכזי', stepOrder: 4, departmentId: '1', estimatedDurationDays: 7, isActive: true, description: 'רקמת העיצוב המרכזי (כתר/ירושלים וכו\')' },
            { id: 'step-1-5', name: 'רקמת הקדשות וטקסטים', stepOrder: 5, departmentId: '1', estimatedDurationDays: 3, isActive: true, description: 'רקמת הקדשות, פסוקים ושמות' },
            { id: 'step-1-6', name: 'רקמת מסגרת ועיטורים', stepOrder: 6, departmentId: '1', estimatedDurationDays: 5, isActive: true, description: 'רקמת מסגרת חיצונית ועיטורי פינות' },
            { id: 'step-1-7', name: 'הוספת אבני סברובסקי', stepOrder: 7, departmentId: '1', estimatedDurationDays: 2, isActive: true, description: 'הדבקת אבנים (אם הוזמנו)', isOptional: true },
            { id: 'step-1-8', name: 'תפירת שוליים וכפלים', stepOrder: 8, departmentId: '3', estimatedDurationDays: 2, isActive: true, description: 'תפירת שוליים, כפלים וחיזוקים' },
            { id: 'step-1-9', name: 'הוספת פרנזים', stepOrder: 9, departmentId: '3', estimatedDurationDays: 2, isActive: true, description: 'תפירת פרנזים (אם הוזמנו)', isOptional: true },
            { id: 'step-1-10', name: 'התקנת טבעות/מסילה', stepOrder: 10, departmentId: '3', estimatedDurationDays: 1, isActive: true, description: 'התקנת מערכת תלייה לפי הזמנה' },
            { id: 'step-1-11', name: 'בדיקת איכות סופית', stepOrder: 11, departmentId: '4', estimatedDurationDays: 1, isActive: true, description: 'בדיקת רקמה, תפרים, מידות והתאמה להזמנה' },
            { id: 'step-1-12', name: 'גיהוץ וניקוי', stepOrder: 12, departmentId: '4', estimatedDurationDays: 1, isActive: true, description: 'גיהוץ קל וניקוי סופי' },
            { id: 'step-1-13', name: 'צילום ותיעוד', stepOrder: 13, departmentId: '4', estimatedDurationDays: 0.5, isActive: true, description: 'צילום המוצר הסופי לתיק לקוח' },
            { id: 'step-1-14', name: 'אריזה מהודרת', stepOrder: 14, departmentId: '5', estimatedDurationDays: 0.5, isActive: true, description: 'אריזה בקופסה מהודרת עם נייר משי' },
            { id: 'step-1-15', name: 'משלוח/איסוף', stepOrder: 15, departmentId: '5', estimatedDurationDays: 2, isActive: true, description: 'שליחות או תיאום איסוף עם הלקוח' }
        ]
    },

    // ========== תהליכי ייצור מעיל (PRODUCTION - MEIL) ==========
    {
        id: '2',
        name: 'תהליך ייצור מעיל ספר תורה',
        code: 'MEIL_STD',
        type: 'PRODUCTION',
        productId: 'meil',
        description: 'תהליך מלא לייצור מעיל ספר תורה',
        status: 'ACTIVE',
        isActive: true,
        estimatedDays: 25,
        createdAt: '2024-02-10',
        steps: [
            { id: 'step-2-1', name: 'הזמנת חומרים', stepOrder: 1, departmentId: '5', estimatedDurationDays: 2, isActive: true, description: 'הזמנת קטיפה, בטנה, חוטים ופעמונים' },
            { id: 'step-2-2', name: 'חיתוך לפי גודל', stepOrder: 2, departmentId: '2', estimatedDurationDays: 1, isActive: true, description: 'חיתוך קטיפה ובטנה לפי מידת ההיקף והגובה' },
            { id: 'step-2-3', name: 'הכנת עיצוב רקמה', stepOrder: 3, departmentId: '1', estimatedDurationDays: 1, isActive: true, description: 'הכנת קובץ רקמה לפי העיצוב הנבחר' },
            { id: 'step-2-4', name: 'רקמת עיצוב מרכזי', stepOrder: 4, departmentId: '1', estimatedDurationDays: 4, isActive: true, description: 'רקמת כתר/לוחות/עיצוב נבחר' },
            { id: 'step-2-5', name: 'רקמת שם (אופציונלי)', stepOrder: 5, departmentId: '1', estimatedDurationDays: 1, isActive: true, description: 'רקמת שם על גב המעיל', isOptional: true },
            { id: 'step-2-6', name: 'תפירת גוף המעיל', stepOrder: 6, departmentId: '3', estimatedDurationDays: 3, isActive: true, description: 'תפירת חלקי המעיל לגוף אחד' },
            { id: 'step-2-7', name: 'התקנת בטנה', stepOrder: 7, departmentId: '3', estimatedDurationDays: 1, isActive: true, description: 'תפירת בטנה פנימית' },
            { id: 'step-2-8', name: 'יצירת פתח לרימונים', stepOrder: 8, departmentId: '3', estimatedDurationDays: 0.5, isActive: true, description: 'חיתוך ועיבוד פתח עליון לרימונים' },
            { id: 'step-2-9', name: 'הוספת פעמונים', stepOrder: 9, departmentId: '3', estimatedDurationDays: 1, isActive: true, description: 'תפירת פעמונים לתחתית', isOptional: true },
            { id: 'step-2-10', name: 'בדיקת איכות', stepOrder: 10, departmentId: '4', estimatedDurationDays: 0.5, isActive: true, description: 'בדיקת תפרים, רקמה והתאמה למידות' },
            { id: 'step-2-11', name: 'גיהוץ ואריזה', stepOrder: 11, departmentId: '5', estimatedDurationDays: 0.5, isActive: true, description: 'גיהוץ ואריזה בקופסה' },
            { id: 'step-2-12', name: 'משלוח', stepOrder: 12, departmentId: '5', estimatedDurationDays: 2, isActive: true, description: 'שליחות או איסוף' }
        ]
    },

    // ========== תהליכי ייצור כיסוי בימה (PRODUCTION - BIMA) ==========
    {
        id: '3',
        name: 'תהליך ייצור כיסוי בימה ועמוד',
        code: 'BIMA_STD',
        type: 'PRODUCTION',
        productId: 'kisui-bima',
        description: 'תהליך מלא לייצור כיסוי בימה - כולל אופציה לעמוד חזן',
        status: 'ACTIVE',
        isActive: true,
        estimatedDays: 35,
        createdAt: '2024-03-05',
        steps: [
            { id: 'step-3-1', name: 'הזמנת חומרים', stepOrder: 1, departmentId: '5', estimatedDurationDays: 3, isActive: true, description: 'הזמנת קטיפה בכמות גדולה, פרנזים, בטנה' },
            { id: 'step-3-2', name: 'חיתוך משטח עליון', stepOrder: 2, departmentId: '2', estimatedDurationDays: 1, isActive: true, description: 'חיתוך לפי מידות הבימה' },
            { id: 'step-3-3', name: 'חיתוך נפילות', stepOrder: 3, departmentId: '2', estimatedDurationDays: 1, isActive: true, description: 'חיתוך 4 חלקי נפילה לפי אורך הנפילה' },
            { id: 'step-3-4', name: 'הכנת עיצוב רקמה', stepOrder: 4, departmentId: '1', estimatedDurationDays: 2, isActive: true, description: 'הכנת קבצי רקמה למשטח ונפילות' },
            { id: 'step-3-5', name: 'רקמת משטח עליון', stepOrder: 5, departmentId: '1', estimatedDurationDays: 5, isActive: true, description: 'רקמת העיצוב המרכזי על המשטח' },
            { id: 'step-3-6', name: 'רקמת נפילות', stepOrder: 6, departmentId: '1', estimatedDurationDays: 4, isActive: true, description: 'רקמת עיצובים על הנפילות' },
            { id: 'step-3-7', name: 'רקמת הקדשה', stepOrder: 7, departmentId: '1', estimatedDurationDays: 2, isActive: true, description: 'רקמת הקדשה על הנפילה הקדמית', isOptional: true },
            { id: 'step-3-8', name: 'תפירת נפילות למשטח', stepOrder: 8, departmentId: '3', estimatedDurationDays: 2, isActive: true, description: 'חיבור כל החלקים' },
            { id: 'step-3-9', name: 'הוספת פרנזים', stepOrder: 9, departmentId: '3', estimatedDurationDays: 2, isActive: true, description: 'תפירת פרנזים לתחתית הנפילות', isOptional: true },
            { id: 'step-3-10', name: 'ייצור כיסוי עמוד', stepOrder: 10, departmentId: '3', estimatedDurationDays: 4, isActive: true, description: 'חיתוך, רקמה ותפירת כיסוי עמוד חזן', isOptional: true },
            { id: 'step-3-11', name: 'בדיקת איכות', stepOrder: 11, departmentId: '4', estimatedDurationDays: 1, isActive: true, description: 'בדיקת כל החלקים והתאמה' },
            { id: 'step-3-12', name: 'גיהוץ וקיפול', stepOrder: 12, departmentId: '5', estimatedDurationDays: 1, isActive: true, description: 'גיהוץ וקיפול מקצועי' },
            { id: 'step-3-13', name: 'אריזה', stepOrder: 13, departmentId: '5', estimatedDurationDays: 0.5, isActive: true, description: 'אריזה בקופסה גדולה' },
            { id: 'step-3-14', name: 'משלוח/התקנה', stepOrder: 14, departmentId: '5', estimatedDurationDays: 2, isActive: true, description: 'משלוח או התקנה באתר הלקוח' }
        ]
    },

    // ========== תהליכי ייצור כיסוי טלית (PRODUCTION - TALIT) ==========
    {
        id: '4',
        name: 'תהליך ייצור כיסוי טלית ותפילין',
        code: 'TALIT_STD',
        type: 'PRODUCTION',
        productId: 'kisui-talit',
        description: 'תהליך מהיר לייצור כיסוי טלית/תפילין',
        status: 'ACTIVE',
        isActive: true,
        estimatedDays: 10,
        createdAt: '2024-04-20',
        steps: [
            { id: 'step-4-1', name: 'בחירת בד מהמלאי', stepOrder: 1, departmentId: '5', estimatedDurationDays: 0.5, isActive: true, description: 'בחירת קטיפה/סאטן/משי בצבע הנבחר' },
            { id: 'step-4-2', name: 'חיתוך לפי גודל', stepOrder: 2, departmentId: '2', estimatedDurationDays: 0.5, isActive: true, description: 'חיתוך לגודל טלית או תפילין' },
            { id: 'step-4-3', name: 'הכנת רקמת שם', stepOrder: 3, departmentId: '1', estimatedDurationDays: 0.5, isActive: true, description: 'הקלדת השם והכנת קובץ רקמה' },
            { id: 'step-4-4', name: 'רקמת עיצוב', stepOrder: 4, departmentId: '1', estimatedDurationDays: 2, isActive: true, description: 'רקמת מסגרת/ירושלים/מגן דוד' },
            { id: 'step-4-5', name: 'רקמת שם', stepOrder: 5, departmentId: '1', estimatedDurationDays: 1, isActive: true, description: 'רקמת שם הלקוח' },
            { id: 'step-4-6', name: 'תפירת שוליים', stepOrder: 6, departmentId: '3', estimatedDurationDays: 1, isActive: true, description: 'תפירת שוליים וכפלים' },
            { id: 'step-4-7', name: 'התקנת רוכסן', stepOrder: 7, departmentId: '3', estimatedDurationDays: 0.5, isActive: true, description: 'תפירת רוכסן', isOptional: true },
            { id: 'step-4-8', name: 'ייצור כיסוי תפילין', stepOrder: 8, departmentId: '3', estimatedDurationDays: 2, isActive: true, description: 'ייצור כיסוי תפילין תואם', isOptional: true },
            { id: 'step-4-9', name: 'בדיקת איכות', stepOrder: 9, departmentId: '4', estimatedDurationDays: 0.25, isActive: true, description: 'בדיקה מהירה' },
            { id: 'step-4-10', name: 'אריזה', stepOrder: 10, departmentId: '5', estimatedDurationDays: 0.25, isActive: true, description: 'אריזה בשקית מהודרת או קופסה' },
            { id: 'step-4-11', name: 'משלוח', stepOrder: 11, departmentId: '5', estimatedDurationDays: 2, isActive: true, description: 'משלוח בדואר או שליח' }
        ]
    },

    // ========== תהליך תיקונים ==========
    {
        id: '5',
        name: 'תהליך תיקונים ושיפוצים',
        code: 'REPAIR',
        type: 'PRODUCTION',
        description: 'לתיקון פרוכות וכיסויים קיימים',
        status: 'ACTIVE',
        isActive: true,
        estimatedDays: 14,
        createdAt: '2024-05-12',
        steps: [
            { id: 'step-5-1', name: 'קבלת פריט וצילום מצב', stepOrder: 1, departmentId: '4', estimatedDurationDays: 0.5, isActive: true, description: 'תיעוד מצב הפריט לפני תיקון' },
            { id: 'step-5-2', name: 'הערכת נזקים', stepOrder: 2, departmentId: '4', estimatedDurationDays: 0.5, isActive: true, description: 'רשימת תיקונים נדרשים ועלויות' },
            { id: 'step-5-3', name: 'אישור לקוח', stepOrder: 3, departmentId: '1', estimatedDurationDays: 2, isActive: true, description: 'אישור הצעת מחיר לתיקון' },
            { id: 'step-5-4', name: 'ניקוי וכביסה', stepOrder: 4, departmentId: '5', estimatedDurationDays: 1, isActive: true, description: 'ניקוי מקצועי לפני תיקון' },
            { id: 'step-5-5', name: 'תיקון רקמה', stepOrder: 5, departmentId: '1', estimatedDurationDays: 3, isActive: true, description: 'תיקון חלקי רקמה פגומים', isOptional: true },
            { id: 'step-5-6', name: 'תיקון תפרים', stepOrder: 6, departmentId: '3', estimatedDurationDays: 2, isActive: true, description: 'תפירה מחדש של תפרים פתוחים', isOptional: true },
            { id: 'step-5-7', name: 'החלפת חלקים', stepOrder: 7, departmentId: '3', estimatedDurationDays: 2, isActive: true, description: 'החלפת טבעות/פרנזים בלויים', isOptional: true },
            { id: 'step-5-8', name: 'בדיקה סופית', stepOrder: 8, departmentId: '4', estimatedDurationDays: 0.5, isActive: true, description: 'בדיקה והשוואה לתמונות לפני' },
            { id: 'step-5-9', name: 'החזרה ללקוח', stepOrder: 9, departmentId: '5', estimatedDurationDays: 2, isActive: true, description: 'משלוח או איסוף' }
        ]
    },

    // ========== תהליכי מכירה (SALES) - לפני תשלום ==========
    {
        id: '101',
        name: 'תהליך מכירה עם עיצוב',
        code: 'SALES_WITH_DESIGN',
        type: 'SALES',
        description: 'לפרוכות וכיסויים מותאמים - כולל סקיצה',
        status: 'ACTIVE',
        isActive: true,
        estimatedDays: 14,
        createdAt: '2024-01-15',
        steps: [
            { id: 'step-101-0', name: 'איסוף דרישות מלקוח', stepOrder: 1, departmentId: '1', estimatedDurationDays: 1, isActive: true },
            { id: 'step-101-1', name: 'עיצוב סקיצה', stepOrder: 2, departmentId: '1', estimatedDurationDays: 3, isActive: true },
            { id: 'step-101-2', name: 'הצגה ואישור עיצוב', stepOrder: 3, departmentId: '1', estimatedDurationDays: 2, isActive: true },
            { id: 'step-101-3', name: 'הכנת הצעת מחיר', stepOrder: 4, departmentId: '1', estimatedDurationDays: 1, isActive: true },
            { id: 'step-101-4', name: 'גביית מקדמה', stepOrder: 5, departmentId: '1', estimatedDurationDays: 7, isActive: true, isPaymentStep: true }
        ]
    },
    {
        id: '102',
        name: 'תהליך מכירה עם מדידות',
        code: 'SALES_WITH_MEASURE',
        type: 'SALES',
        description: 'למעילים וכיסויים - כולל מדידות',
        status: 'ACTIVE',
        isActive: true,
        estimatedDays: 7,
        createdAt: '2024-01-15',
        steps: [
            { id: 'step-102-0', name: 'קבלת מידות מלקוח', stepOrder: 1, departmentId: '1', estimatedDurationDays: 2, isActive: true },
            { id: 'step-102-1', name: 'הכנת הצעת מחיר', stepOrder: 2, departmentId: '1', estimatedDurationDays: 1, isActive: true },
            { id: 'step-102-2', name: 'גביית מקדמה', stepOrder: 3, departmentId: '1', estimatedDurationDays: 4, isActive: true, isPaymentStep: true }
        ]
    },
    {
        id: '103',
        name: 'תהליך מכירה מהיר',
        code: 'SALES_FAST',
        type: 'SALES',
        description: 'למוצרים סטנדרטיים - רק מקדמה',
        status: 'ACTIVE',
        isActive: true,
        estimatedDays: 3,
        createdAt: '2024-01-15',
        steps: [
            { id: 'step-103-0', name: 'הכנת הצעת מחיר', stepOrder: 1, departmentId: '1', estimatedDurationDays: 1, isActive: true },
            { id: 'step-103-1', name: 'גביית מקדמה', stepOrder: 2, departmentId: '1', estimatedDurationDays: 2, isActive: true, isPaymentStep: true }
        ]
    },

    // ========== Pipeline ראשי של לידים (LEAD_PIPELINE) - שלבים מותאמים אישית ==========
    {
        id: 'pipeline-main',
        name: 'תהליך מכירות ראשי',
        code: 'LEAD_PIPELINE_MAIN',
        type: 'LEAD_PIPELINE',
        description: 'שלבי Pipeline ראשיים לניהול לידים - ניתן להתאמה אישית',
        status: 'ACTIVE',
        isActive: true,
        isDefault: true,
        createdAt: '2024-01-01',
        steps: [
            { id: 'stage-new', name: 'ליד חדש', stepOrder: 1, color: '#667eea', icon: 'UserPlus', slaHours: 24, isActive: true, description: 'ליד שנכנס למערכת ועדיין לא טופל' },
            { id: 'stage-contacted', name: 'יצירת קשר', stepOrder: 2, color: '#4facfe', icon: 'Phone', slaHours: 48, isActive: true, description: 'נוצר קשר ראשוני עם הליד' },
            { id: 'stage-qualified', name: 'זיהוי צורך', stepOrder: 3, color: '#00f2fe', icon: 'Target', slaHours: 72, isActive: true, description: 'הובהר הצורך והתקציב' },
            { id: 'stage-product', name: 'בחירת מוצר', stepOrder: 4, color: '#a855f7', icon: 'Package', slaHours: 96, isActive: true, description: 'הליד בוחר מוצר ומפרט' },
            { id: 'stage-quote', name: 'הצעת מחיר', stepOrder: 5, color: '#f59e0b', icon: 'FileText', slaHours: 120, isActive: true, description: 'נשלחה הצעת מחיר' },
            { id: 'stage-negotiation', name: 'משא ומתן', stepOrder: 6, color: '#ef4444', icon: 'MessageSquare', slaHours: 168, isActive: true, description: 'מתנהל משא ומתן על המחיר' },
            { id: 'stage-deposit', name: 'ממתין למקדמה', stepOrder: 7, color: '#10b981', icon: 'CreditCard', slaHours: 72, isActive: true, description: 'הליד אישר - ממתינים לתשלום מקדמה' },
            { id: 'stage-won', name: 'זכייה', stepOrder: 100, color: '#22c55e', icon: 'Check', slaHours: null, isActive: true, isClosed: true, isWon: true, description: 'העסקה נסגרה בהצלחה' },
            { id: 'stage-lost', name: 'אבוד', stepOrder: 101, color: '#ef4444', icon: 'X', slaHours: null, isActive: true, isClosed: true, isLost: true, description: 'העסקה לא נסגרה' }
        ]
    }
];

const defaultMockDepartments = [
    { id: '1', name: 'עיצוב רקמה', manager: 'מרים לוי', managerId: '2', employeeCount: 5, activeTasks: 18, status: 'ACTIVE', description: 'עיצוב ותכנון דפוסי רקמה', createdAt: '2024-01-10' },
    { id: '2', name: 'חיתוך', manager: 'יעקב כהן', managerId: '3', employeeCount: 3, activeTasks: 12, status: 'ACTIVE', description: 'חיתוך בדים וחומרים', createdAt: '2024-01-10' },
    { id: '3', name: 'תפירה', manager: 'שרה גולדשטיין', managerId: '4', employeeCount: 8, activeTasks: 22, status: 'ACTIVE', description: 'תפירה והרכבת מוצרים', createdAt: '2024-01-10' },
    { id: '4', name: 'בקרת איכות', manager: 'דוד רוזן', managerId: '5', employeeCount: 2, activeTasks: 8, status: 'ACTIVE', description: 'בדיקת איכות ומוצרים', createdAt: '2024-01-10' },
    { id: '5', name: 'לוגיסטיקה ומשלוחים', manager: 'משה לוי', managerId: '6', employeeCount: 4, activeTasks: 15, status: 'ACTIVE', description: 'אריזה ומשלוחים', createdAt: '2024-01-10' }
];

const defaultMockParameters = [
    // ========== פרמטרים לפרוכת ==========
    {
        id: 'param-parochet-velvet-color',
        productId: 'parochet',
        name: 'צבע הקטיפה',
        code: 'VELVET_COLOR',
        type: 'COLOR',
        description: 'בחר צבע קטיפה לפרוכת',
        isRequired: true,
        isActive: true,
        sortOrder: 1,
        options: [
            { id: 'opt-navy', value: 'navy', label: 'כחול כהה', colorHex: '#000080', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-bordeaux', value: 'bordeaux', label: 'בורדו יין', colorHex: '#722F37', priceImpact: 0, sortOrder: 2, isActive: true },
            { id: 'opt-burgundy', value: 'burgundy', label: 'בורדו חציל', colorHex: '#800020', priceImpact: 0, sortOrder: 3, isActive: true },
            { id: 'opt-royal-blue', value: 'royal-blue', label: 'כחול רויאל', colorHex: '#4169E1', priceImpact: 0, sortOrder: 4, isActive: true },
            { id: 'opt-white', value: 'white', label: 'לבן', colorHex: '#FFFFFF', priceImpact: 0, sortOrder: 5, isActive: true },
            { id: 'opt-black', value: 'black', label: 'שחור', colorHex: '#000000', priceImpact: 0, sortOrder: 6, isActive: true },
            { id: 'opt-green', value: 'green', label: 'ירוק', colorHex: '#228B22', priceImpact: 0, sortOrder: 7, isActive: true },
            { id: 'opt-brown', value: 'brown', label: 'חום', colorHex: '#8B4513', priceImpact: 0, sortOrder: 8, isActive: true },
            { id: 'opt-gray', value: 'gray', label: 'אפור', colorHex: '#808080', priceImpact: 0, sortOrder: 9, isActive: true }
        ]
    },
    {
        id: 'param-parochet-height',
        productId: 'parochet',
        name: 'גובה הפרוכת',
        code: 'HEIGHT',
        type: 'NUMBER',
        description: 'גובה כולל טבעות ופרנזים (ס"מ)',
        isRequired: true,
        isActive: true,
        sortOrder: 2,
        unit: 'ס"מ',
        min: 100,
        max: 300
    },
    {
        id: 'param-parochet-width',
        productId: 'parochet',
        name: 'רוחב הפרוכת',
        code: 'WIDTH',
        type: 'NUMBER',
        description: 'רוחב הפרוכת (ס"מ)',
        isRequired: true,
        isActive: true,
        sortOrder: 3,
        unit: 'ס"מ',
        min: 80,
        max: 250
    },
    {
        id: 'param-parochet-embroidery-color',
        productId: 'parochet',
        name: 'צבע הרקמה',
        code: 'EMBROIDERY_COLOR',
        type: 'SELECT',
        description: 'בחר צבע חוט רקמה',
        isRequired: true,
        isActive: true,
        sortOrder: 4,
        options: [
            { id: 'opt-emb-gold', value: 'gold', label: 'זהב', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-emb-silver', value: 'silver', label: 'כסף', priceImpact: 0, sortOrder: 2, isActive: true }
        ]
    },
    {
        id: 'param-parochet-dedication1',
        productId: 'parochet',
        name: 'הקדשה 1',
        code: 'DEDICATION_1',
        type: 'TEXTAREA',
        description: 'טקסט הקדשה ראשון',
        isRequired: false,
        isActive: true,
        sortOrder: 5
    },
    {
        id: 'param-parochet-dedication2',
        productId: 'parochet',
        name: 'הקדשה 2',
        code: 'DEDICATION_2',
        type: 'TEXTAREA',
        description: 'טקסט הקדשה שני',
        isRequired: false,
        isActive: true,
        sortOrder: 6
    },
    {
        id: 'param-parochet-pasuk',
        productId: 'parochet',
        name: 'פסוק',
        code: 'PASUK',
        type: 'TEXT',
        description: 'פסוק לרקמה',
        isRequired: false,
        isActive: true,
        sortOrder: 7
    },
    {
        id: 'param-parochet-kaporet',
        productId: 'parochet',
        name: 'כפורת אמיתית',
        code: 'KAPORET',
        type: 'BOOLEAN',
        description: 'האם להוסיף כפורת (בד נוסף למעלה)',
        isRequired: false,
        isActive: true,
        sortOrder: 8,
        options: [
            { id: 'opt-kaporet-yes', value: 'yes', label: 'כן', priceImpact: 500, sortOrder: 1, isActive: true },
            { id: 'opt-kaporet-no', value: 'no', label: 'לא', priceImpact: 0, sortOrder: 2, isActive: true }
        ]
    },
    {
        id: 'param-parochet-swarovski',
        productId: 'parochet',
        name: 'אבני סברובסקי',
        code: 'SWAROVSKI',
        type: 'BOOLEAN',
        description: 'האם להוסיף אבני סברובסקי',
        isRequired: false,
        isActive: true,
        sortOrder: 9,
        options: [
            { id: 'opt-swarovski-yes', value: 'yes', label: 'כן', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-swarovski-no', value: 'no', label: 'ללא', priceImpact: 0, sortOrder: 2, isActive: true }
        ]
    },
    {
        id: 'param-parochet-swarovski-count',
        productId: 'parochet',
        name: 'כמות אבנים משוער',
        code: 'SWAROVSKI_COUNT',
        type: 'NUMBER',
        description: 'כמות אבני סברובסקי משוערת',
        isRequired: false,
        isActive: true,
        sortOrder: 10,
        priceImpactFormula: 'count * 5',
        // Conditional visibility - only show if swarovski = yes
        showWhen: {
            parameterId: 'param-parochet-swarovski',
            optionId: 'opt-swarovski-yes'
        }
    },
    {
        id: 'param-parochet-fringes-sides',
        productId: 'parochet',
        name: 'פרנזים בצדדים',
        code: 'FRINGES_SIDES',
        type: 'SELECT',
        description: 'סוג פרנזים בצדדים',
        isRequired: false,
        isActive: true,
        sortOrder: 11,
        options: [
            { id: 'opt-fringe-none', value: 'none', label: 'ללא', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-fringe-gold', value: 'gold', label: 'זהב', priceImpact: 200, sortOrder: 2, isActive: true },
            { id: 'opt-fringe-silver', value: 'silver', label: 'כסף', priceImpact: 200, sortOrder: 3, isActive: true }
        ]
    },
    {
        id: 'param-parochet-holding-type',
        productId: 'parochet',
        name: 'סוג תפיסה',
        code: 'HOLDING_TYPE',
        type: 'SELECT',
        description: 'סוג תפיסה/תלייה',
        isRequired: true,
        isActive: true,
        sortOrder: 12,
        options: [
            { id: 'opt-hold-rail', value: 'rail', label: 'מסילת וילון', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-hold-silver-rings', value: 'silver-rings', label: 'טבעות כסף (מוט 3 ס"מ)', priceImpact: 150, sortOrder: 2, isActive: true },
            { id: 'opt-hold-gold-rings', value: 'gold-rings', label: 'טבעות זהב (מוט 3 ס"מ)', priceImpact: 200, sortOrder: 3, isActive: true },
            { id: 'opt-hold-wood-light', value: 'wood-light', label: 'טבעות עץ צבע בהיר', priceImpact: 100, sortOrder: 4, isActive: true },
            { id: 'opt-hold-wood-dark', value: 'wood-dark', label: 'טבעות עץ חום כהה', priceImpact: 100, sortOrder: 5, isActive: true }
        ]
    },

    // ========== פרמטרים למעיל ספר תורה ==========
    {
        id: 'param-meil-velvet-color',
        productId: 'meil',
        name: 'צבע הקטיפה',
        code: 'VELVET_COLOR',
        type: 'COLOR',
        description: 'בחר צבע קטיפה למעיל',
        isRequired: true,
        isActive: true,
        sortOrder: 1,
        options: [
            { id: 'opt-m-navy', value: 'navy', label: 'כחול כהה', colorHex: '#000080', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-m-bordeaux', value: 'bordeaux', label: 'בורדו', colorHex: '#722F37', priceImpact: 0, sortOrder: 2, isActive: true },
            { id: 'opt-m-white', value: 'white', label: 'לבן', colorHex: '#FFFFFF', priceImpact: 0, sortOrder: 3, isActive: true },
            { id: 'opt-m-black', value: 'black', label: 'שחור', colorHex: '#000000', priceImpact: 0, sortOrder: 4, isActive: true },
            { id: 'opt-m-purple', value: 'purple', label: 'סגול', colorHex: '#800080', priceImpact: 0, sortOrder: 5, isActive: true }
        ]
    },
    {
        id: 'param-meil-size',
        productId: 'meil',
        name: 'גודל המעיל',
        code: 'SIZE',
        type: 'SELECT',
        description: 'בחר גודל מעיל לפי היקף הספר',
        isRequired: true,
        isActive: true,
        sortOrder: 2,
        options: [
            { id: 'opt-m-size-s', value: 'S', label: 'S - היקף 40-45 ס"מ', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-m-size-m', value: 'M', label: 'M - היקף 45-50 ס"מ', priceImpact: 0, sortOrder: 2, isActive: true },
            { id: 'opt-m-size-l', value: 'L', label: 'L - היקף 50-55 ס"מ', priceImpact: 200, sortOrder: 3, isActive: true },
            { id: 'opt-m-size-xl', value: 'XL', label: 'XL - היקף 55-60 ס"מ', priceImpact: 400, sortOrder: 4, isActive: true },
            { id: 'opt-m-size-xxl', value: 'XXL', label: 'XXL - מעל 60 ס"מ', priceImpact: 600, sortOrder: 5, isActive: true }
        ]
    },
    {
        id: 'param-meil-height',
        productId: 'meil',
        name: 'גובה המעיל',
        code: 'HEIGHT',
        type: 'NUMBER',
        description: 'גובה המעיל בס"מ (מהכתף עד התחתית)',
        isRequired: true,
        isActive: true,
        sortOrder: 3,
        unit: 'ס"מ',
        min: 50,
        max: 100
    },
    {
        id: 'param-meil-embroidery-color',
        productId: 'meil',
        name: 'צבע הרקמה',
        code: 'EMBROIDERY_COLOR',
        type: 'SELECT',
        description: 'בחר צבע חוט רקמה',
        isRequired: true,
        isActive: true,
        sortOrder: 4,
        options: [
            { id: 'opt-m-emb-gold', value: 'gold', label: 'זהב', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-m-emb-silver', value: 'silver', label: 'כסף', priceImpact: 0, sortOrder: 2, isActive: true }
        ]
    },
    {
        id: 'param-meil-name',
        productId: 'meil',
        name: 'שם לרקמה',
        code: 'NAME',
        type: 'TEXT',
        description: 'שם לרקמה על המעיל (אופציונלי)',
        isRequired: false,
        isActive: true,
        sortOrder: 5
    },
    {
        id: 'param-meil-bells',
        productId: 'meil',
        name: 'פעמונים',
        code: 'BELLS',
        type: 'BOOLEAN',
        description: 'האם להוסיף פעמונים לתחתית המעיל',
        isRequired: false,
        isActive: true,
        sortOrder: 6,
        options: [
            { id: 'opt-m-bells-yes', value: 'yes', label: 'כן - 12 פעמונים', priceImpact: 180, sortOrder: 1, isActive: true },
            { id: 'opt-m-bells-no', value: 'no', label: 'ללא', priceImpact: 0, sortOrder: 2, isActive: true }
        ]
    },
    {
        id: 'param-meil-rimonim-opening',
        productId: 'meil',
        name: 'פתח לרימונים',
        code: 'RIMONIM_OPENING',
        type: 'SELECT',
        description: 'גודל פתח לרימונים למעלה',
        isRequired: true,
        isActive: true,
        sortOrder: 7,
        options: [
            { id: 'opt-m-rim-standard', value: 'standard', label: 'סטנדרטי - 8 ס"מ', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-m-rim-large', value: 'large', label: 'גדול - 10 ס"מ', priceImpact: 0, sortOrder: 2, isActive: true },
            { id: 'opt-m-rim-xl', value: 'xl', label: 'גדול מאוד - 12 ס"מ', priceImpact: 50, sortOrder: 3, isActive: true }
        ]
    },

    // ========== פרמטרים לכיסוי בימה ==========
    {
        id: 'param-bima-velvet-color',
        productId: 'kisui-bima',
        name: 'צבע הקטיפה',
        code: 'VELVET_COLOR',
        type: 'COLOR',
        description: 'בחר צבע קטיפה לכיסוי',
        isRequired: true,
        isActive: true,
        sortOrder: 1,
        options: [
            { id: 'opt-b-navy', value: 'navy', label: 'כחול כהה', colorHex: '#000080', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-b-bordeaux', value: 'bordeaux', label: 'בורדו', colorHex: '#722F37', priceImpact: 0, sortOrder: 2, isActive: true },
            { id: 'opt-b-white', value: 'white', label: 'לבן', colorHex: '#FFFFFF', priceImpact: 0, sortOrder: 3, isActive: true },
            { id: 'opt-b-green', value: 'green', label: 'ירוק', colorHex: '#228B22', priceImpact: 0, sortOrder: 4, isActive: true }
        ]
    },
    {
        id: 'param-bima-length',
        productId: 'kisui-bima',
        name: 'אורך הבימה',
        code: 'LENGTH',
        type: 'NUMBER',
        description: 'אורך משטח הבימה בס"מ',
        isRequired: true,
        isActive: true,
        sortOrder: 2,
        unit: 'ס"מ',
        min: 80,
        max: 200
    },
    {
        id: 'param-bima-width',
        productId: 'kisui-bima',
        name: 'רוחב הבימה',
        code: 'WIDTH',
        type: 'NUMBER',
        description: 'רוחב משטח הבימה בס"מ',
        isRequired: true,
        isActive: true,
        sortOrder: 3,
        unit: 'ס"מ',
        min: 50,
        max: 120
    },
    {
        id: 'param-bima-drop',
        productId: 'kisui-bima',
        name: 'נפילה',
        code: 'DROP',
        type: 'NUMBER',
        description: 'אורך הנפילה מהמשטח בס"מ',
        isRequired: true,
        isActive: true,
        sortOrder: 4,
        unit: 'ס"מ',
        min: 20,
        max: 60
    },
    {
        id: 'param-bima-embroidery-color',
        productId: 'kisui-bima',
        name: 'צבע הרקמה',
        code: 'EMBROIDERY_COLOR',
        type: 'SELECT',
        description: 'בחר צבע חוט רקמה',
        isRequired: true,
        isActive: true,
        sortOrder: 5,
        options: [
            { id: 'opt-b-emb-gold', value: 'gold', label: 'זהב', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-b-emb-silver', value: 'silver', label: 'כסף', priceImpact: 0, sortOrder: 2, isActive: true }
        ]
    },
    {
        id: 'param-bima-dedication',
        productId: 'kisui-bima',
        name: 'הקדשה',
        code: 'DEDICATION',
        type: 'TEXTAREA',
        description: 'טקסט הקדשה לרקמה',
        isRequired: false,
        isActive: true,
        sortOrder: 6
    },
    {
        id: 'param-bima-fringes',
        productId: 'kisui-bima',
        name: 'פרנזים',
        code: 'FRINGES',
        type: 'SELECT',
        description: 'סוג פרנזים לנפילות',
        isRequired: false,
        isActive: true,
        sortOrder: 7,
        options: [
            { id: 'opt-b-fringe-none', value: 'none', label: 'ללא', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-b-fringe-gold', value: 'gold', label: 'פרנז זהב', priceImpact: 350, sortOrder: 2, isActive: true },
            { id: 'opt-b-fringe-silver', value: 'silver', label: 'פרנז כסף', priceImpact: 350, sortOrder: 3, isActive: true },
            { id: 'opt-b-fringe-bullion', value: 'bullion', label: 'בוליון מפואר', priceImpact: 600, sortOrder: 4, isActive: true }
        ]
    },
    {
        id: 'param-bima-amud',
        productId: 'kisui-bima',
        name: 'כולל כיסוי עמוד',
        code: 'AMUD_COVER',
        type: 'BOOLEAN',
        description: 'האם לכלול כיסוי לעמוד חזן',
        isRequired: false,
        isActive: true,
        sortOrder: 8,
        options: [
            { id: 'opt-b-amud-yes', value: 'yes', label: 'כן - כולל עמוד', priceImpact: 1500, sortOrder: 1, isActive: true },
            { id: 'opt-b-amud-no', value: 'no', label: 'רק בימה', priceImpact: 0, sortOrder: 2, isActive: true }
        ]
    },

    // ========== פרמטרים לכיסוי טלית ותפילין ==========
    {
        id: 'param-talit-fabric',
        productId: 'kisui-talit',
        name: 'סוג בד',
        code: 'FABRIC',
        type: 'SELECT',
        description: 'בחר סוג בד לכיסוי',
        isRequired: true,
        isActive: true,
        sortOrder: 1,
        options: [
            { id: 'opt-t-velvet', value: 'velvet', label: 'קטיפה', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-t-satin', value: 'satin', label: 'סאטן', priceImpact: -50, sortOrder: 2, isActive: true },
            { id: 'opt-t-silk', value: 'silk', label: 'משי', priceImpact: 150, sortOrder: 3, isActive: true }
        ]
    },
    {
        id: 'param-talit-color',
        productId: 'kisui-talit',
        name: 'צבע',
        code: 'COLOR',
        type: 'COLOR',
        description: 'בחר צבע הבד',
        isRequired: true,
        isActive: true,
        sortOrder: 2,
        options: [
            { id: 'opt-t-navy', value: 'navy', label: 'כחול כהה', colorHex: '#000080', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-t-bordeaux', value: 'bordeaux', label: 'בורדו', colorHex: '#722F37', priceImpact: 0, sortOrder: 2, isActive: true },
            { id: 'opt-t-black', value: 'black', label: 'שחור', colorHex: '#000000', priceImpact: 0, sortOrder: 3, isActive: true },
            { id: 'opt-t-white', value: 'white', label: 'לבן', colorHex: '#FFFFFF', priceImpact: 0, sortOrder: 4, isActive: true },
            { id: 'opt-t-silver', value: 'silver', label: 'כסוף', colorHex: '#C0C0C0', priceImpact: 30, sortOrder: 5, isActive: true }
        ]
    },
    {
        id: 'param-talit-name',
        productId: 'kisui-talit',
        name: 'שם לרקמה',
        code: 'NAME',
        type: 'TEXT',
        description: 'שם בעברית לרקמה על הכיסוי',
        isRequired: true,
        isActive: true,
        sortOrder: 3
    },
    {
        id: 'param-talit-embroidery-color',
        productId: 'kisui-talit',
        name: 'צבע הרקמה',
        code: 'EMBROIDERY_COLOR',
        type: 'SELECT',
        description: 'בחר צבע חוט רקמה',
        isRequired: true,
        isActive: true,
        sortOrder: 4,
        options: [
            { id: 'opt-t-emb-gold', value: 'gold', label: 'זהב', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-t-emb-silver', value: 'silver', label: 'כסף', priceImpact: 0, sortOrder: 2, isActive: true },
            { id: 'opt-t-emb-white', value: 'white', label: 'לבן', priceImpact: 0, sortOrder: 3, isActive: true }
        ]
    },
    {
        id: 'param-talit-set',
        productId: 'kisui-talit',
        name: 'סוג סט',
        code: 'SET_TYPE',
        type: 'SELECT',
        description: 'בחר מה כולל הסט',
        isRequired: true,
        isActive: true,
        sortOrder: 5,
        options: [
            { id: 'opt-t-set-talit', value: 'talit', label: 'כיסוי טלית בלבד', priceImpact: 0, sortOrder: 1, isActive: true },
            { id: 'opt-t-set-tefilin', value: 'tefilin', label: 'כיסוי תפילין בלבד', priceImpact: -100, sortOrder: 2, isActive: true },
            { id: 'opt-t-set-both', value: 'both', label: 'סט טלית + תפילין', priceImpact: 120, sortOrder: 3, isActive: true }
        ]
    },
    {
        id: 'param-talit-zipper',
        productId: 'kisui-talit',
        name: 'רוכסן',
        code: 'ZIPPER',
        type: 'BOOLEAN',
        description: 'האם להוסיף רוכסן לכיסוי',
        isRequired: false,
        isActive: true,
        sortOrder: 6,
        options: [
            { id: 'opt-t-zip-yes', value: 'yes', label: 'עם רוכסן', priceImpact: 30, sortOrder: 1, isActive: true },
            { id: 'opt-t-zip-no', value: 'no', label: 'ללא רוכסן', priceImpact: 0, sortOrder: 2, isActive: true }
        ]
    }
];

// ============ MOCK MATERIALS DATA ============
const defaultMockMaterials = [
    // ========== בדים ==========
    {
        id: 'mat-velvet-black',
        name: 'קטיפה שחורה',
        nameEn: 'Black Velvet',
        code: 'VLV-BLK-001',
        category: 'FABRIC',
        type: 'velvet',
        colorHex: '#1a1a1a',
        supplier: 'יבואן בדים איטלקי',
        supplierId: 'sup-1',
        stockQuantity: 150,
        stockUnit: 'מטר',
        reorderLevel: 30,
        reorderQuantity: 100,
        unitCost: 85,
        salePrice: 120,
        location: 'מחסן A - מדף 1',
        notes: 'קטיפה איטלקית איכותית, מתאימה לפרוכות ומעילים',
        isActive: true,
        productIds: ['parochet', 'meil'],
        createdAt: '2025-01-01'
    },
    {
        id: 'mat-velvet-burgundy',
        name: 'קטיפה בורדו',
        nameEn: 'Burgundy Velvet',
        code: 'VLV-BRG-002',
        category: 'FABRIC',
        type: 'velvet',
        colorHex: '#800020',
        supplier: 'יבואן בדים איטלקי',
        supplierId: 'sup-1',
        stockQuantity: 85,
        stockUnit: 'מטר',
        reorderLevel: 30,
        reorderQuantity: 100,
        unitCost: 85,
        salePrice: 120,
        location: 'מחסן A - מדף 1',
        notes: 'קטיפה איטלקית בצבע בורדו קלאסי',
        isActive: true,
        productIds: ['parochet', 'meil', 'kisui-bima'],
        createdAt: '2025-01-01'
    },
    {
        id: 'mat-velvet-navy',
        name: 'קטיפה כחול נייבי',
        nameEn: 'Navy Velvet',
        code: 'VLV-NVY-003',
        category: 'FABRIC',
        type: 'velvet',
        colorHex: '#000080',
        supplier: 'יבואן בדים איטלקי',
        supplierId: 'sup-1',
        stockQuantity: 22,
        stockUnit: 'מטר',
        reorderLevel: 30,
        reorderQuantity: 100,
        unitCost: 85,
        salePrice: 120,
        location: 'מחסן A - מדף 2',
        notes: 'מלאי נמוך!',
        isActive: true,
        productIds: ['parochet', 'kisui-bima'],
        createdAt: '2025-01-01'
    },
    {
        id: 'mat-silk-white',
        name: 'משי לבן',
        nameEn: 'White Silk',
        code: 'SLK-WHT-001',
        category: 'FABRIC',
        type: 'silk',
        colorHex: '#FFFEF0',
        supplier: 'יבואן בדים מזרחי',
        supplierId: 'sup-2',
        stockQuantity: 45,
        stockUnit: 'מטר',
        reorderLevel: 20,
        reorderQuantity: 50,
        unitCost: 150,
        salePrice: 220,
        location: 'מחסן A - מדף 3',
        notes: 'משי טהור, מתאים לפרוכות יוקרתיות',
        isActive: true,
        productIds: ['parochet'],
        createdAt: '2025-01-01'
    },
    {
        id: 'mat-silk-ivory',
        name: 'משי שמנת',
        nameEn: 'Ivory Silk',
        code: 'SLK-IVR-002',
        category: 'FABRIC',
        type: 'silk',
        colorHex: '#FFFFF0',
        supplier: 'יבואן בדים מזרחי',
        supplierId: 'sup-2',
        stockQuantity: 38,
        stockUnit: 'מטר',
        reorderLevel: 20,
        reorderQuantity: 50,
        unitCost: 150,
        salePrice: 220,
        location: 'מחסן A - מדף 3',
        notes: 'משי טהור בגוון שמנת עדין',
        isActive: true,
        productIds: ['parochet', 'kisui-bima'],
        createdAt: '2025-01-01'
    },
    {
        id: 'mat-linen-natural',
        name: 'פשתן טבעי',
        nameEn: 'Natural Linen',
        code: 'LNN-NAT-001',
        category: 'FABRIC',
        type: 'linen',
        colorHex: '#C4B699',
        supplier: 'יבואן בדים אירופאי',
        supplierId: 'sup-3',
        stockQuantity: 120,
        stockUnit: 'מטר',
        reorderLevel: 40,
        reorderQuantity: 80,
        unitCost: 65,
        salePrice: 95,
        location: 'מחסן B - מדף 1',
        notes: 'פשתן בלגי איכותי',
        isActive: true,
        productIds: ['kisui-bima', 'mapa'],
        createdAt: '2025-01-01'
    },
    // ========== חוטי רקמה ==========
    {
        id: 'mat-thread-gold',
        name: 'חוט רקמה זהב',
        nameEn: 'Gold Embroidery Thread',
        code: 'THR-GLD-001',
        category: 'THREAD',
        type: 'metallic',
        colorHex: '#FFD700',
        supplier: 'חוטי רקמה מדריס',
        supplierId: 'sup-4',
        stockQuantity: 250,
        stockUnit: 'סליל',
        reorderLevel: 50,
        reorderQuantity: 100,
        unitCost: 25,
        salePrice: 40,
        location: 'מחסן C - מגירה 1',
        notes: 'חוט מטאלי זהב לרקמה, איכות פרימיום',
        isActive: true,
        productIds: ['parochet', 'meil', 'kisui-bima', 'mapa'],
        createdAt: '2025-01-01'
    },
    {
        id: 'mat-thread-silver',
        name: 'חוט רקמה כסף',
        nameEn: 'Silver Embroidery Thread',
        code: 'THR-SLV-002',
        category: 'THREAD',
        type: 'metallic',
        colorHex: '#C0C0C0',
        supplier: 'חוטי רקמה מדריס',
        supplierId: 'sup-4',
        stockQuantity: 180,
        stockUnit: 'סליל',
        reorderLevel: 50,
        reorderQuantity: 100,
        unitCost: 25,
        salePrice: 40,
        location: 'מחסן C - מגירה 1',
        notes: 'חוט מטאלי כסף לרקמה',
        isActive: true,
        productIds: ['parochet', 'meil', 'kisui-bima', 'mapa'],
        createdAt: '2025-01-01'
    },
    {
        id: 'mat-thread-white',
        name: 'חוט רקמה לבן',
        nameEn: 'White Embroidery Thread',
        code: 'THR-WHT-003',
        category: 'THREAD',
        type: 'cotton',
        colorHex: '#FFFFFF',
        supplier: 'חוטי רקמה מדריס',
        supplierId: 'sup-4',
        stockQuantity: 320,
        stockUnit: 'סליל',
        reorderLevel: 80,
        reorderQuantity: 150,
        unitCost: 12,
        salePrice: 20,
        location: 'מחסן C - מגירה 2',
        notes: 'חוט כותנה לבן לרקמה',
        isActive: true,
        productIds: ['parochet', 'meil', 'kisui-bima', 'mapa', 'kisui-talit'],
        createdAt: '2025-01-01'
    },
    {
        id: 'mat-thread-blue',
        name: 'חוט רקמה כחול',
        nameEn: 'Blue Embroidery Thread',
        code: 'THR-BLU-004',
        category: 'THREAD',
        type: 'cotton',
        colorHex: '#0047AB',
        supplier: 'חוטי רקמה מדריס',
        supplierId: 'sup-4',
        stockQuantity: 15,
        stockUnit: 'סליל',
        reorderLevel: 50,
        reorderQuantity: 100,
        unitCost: 12,
        salePrice: 20,
        location: 'מחסן C - מגירה 2',
        notes: 'מלאי נמוך מאוד!',
        isActive: true,
        productIds: ['parochet', 'kisui-bima', 'kisui-talit'],
        createdAt: '2025-01-01'
    },
    // ========== אביזרים ==========
    {
        id: 'mat-fringe-gold',
        name: 'פרנזים זהב',
        nameEn: 'Gold Fringe',
        code: 'FRN-GLD-001',
        category: 'ACCESSORY',
        type: 'fringe',
        colorHex: '#FFD700',
        supplier: 'אביזרי טקסטיל',
        supplierId: 'sup-5',
        stockQuantity: 200,
        stockUnit: 'מטר',
        reorderLevel: 50,
        reorderQuantity: 100,
        unitCost: 35,
        salePrice: 55,
        location: 'מחסן D - מדף 1',
        notes: 'פרנזים זהב לגימור פרוכות',
        isActive: true,
        productIds: ['parochet', 'kisui-bima'],
        createdAt: '2025-01-01'
    },
    {
        id: 'mat-backing-white',
        name: 'בד תמיכה לבן',
        nameEn: 'White Backing Fabric',
        code: 'BCK-WHT-001',
        category: 'BACKING',
        type: 'interfacing',
        colorHex: '#FFFFFF',
        supplier: 'חומרי גלם טקסטיל',
        supplierId: 'sup-6',
        stockQuantity: 300,
        stockUnit: 'מטר',
        reorderLevel: 80,
        reorderQuantity: 150,
        unitCost: 18,
        salePrice: 28,
        location: 'מחסן B - מדף 4',
        notes: 'בד תמיכה לרקמה',
        isActive: true,
        productIds: ['parochet', 'meil', 'kisui-bima', 'mapa', 'kisui-talit'],
        createdAt: '2025-01-01'
    }
];

// ============ MOCK NOTIFICATIONS DATA ============
const defaultMockNotifications = [
    {
        id: 'notif-1',
        type: 'STOCK_LOW',
        priority: 'high',
        title: 'מלאי נמוך - קטיפה כחול נייבי',
        titleEn: 'Low Stock - Navy Velvet',
        message: 'נותרו רק 22 מטר במלאי. רף מינימום: 30 מטר',
        messageEn: 'Only 22 meters left. Minimum threshold: 30 meters',
        entityType: 'material',
        entityId: 'mat-velvet-navy',
        actionUrl: '/materials',
        read: false,
        dismissed: false,
        userId: null,
        createdAt: new Date().toISOString()
    },
    {
        id: 'notif-2',
        type: 'STOCK_LOW',
        priority: 'critical',
        title: 'מלאי קריטי - חוט רקמה כחול',
        titleEn: 'Critical Stock - Blue Thread',
        message: 'נותרו רק 15 סלילים במלאי. רף מינימום: 50 סלילים',
        messageEn: 'Only 15 spools left. Minimum threshold: 50 spools',
        entityType: 'material',
        entityId: 'mat-thread-blue',
        actionUrl: '/materials',
        read: false,
        dismissed: false,
        userId: null,
        createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: 'notif-3',
        type: 'ORDER_CREATED',
        priority: 'normal',
        title: 'הזמנה חדשה נוצרה',
        titleEn: 'New Order Created',
        message: 'הזמנה #1234 נוצרה עבור בית כנסת אהבת שלום',
        messageEn: 'Order #1234 created for Ahavat Shalom Synagogue',
        entityType: 'order',
        entityId: 'order-1234',
        actionUrl: '/orders',
        read: true,
        dismissed: false,
        userId: null,
        createdAt: new Date(Date.now() - 86400000).toISOString()
    }
];

// ============ ACTUAL MOCK DATA - Load from localStorage or use defaults ============
let mockLeads = loadFromStorage('mockLeads', defaultMockLeads);
let mockLeadTasks = loadFromStorage('mockLeadTasks', defaultMockLeadTasks);
let mockCustomers = loadFromStorage('mockCustomers', defaultMockCustomers);
let mockProducts = loadFromStorage('mockProducts', defaultMockProducts);
let mockOrders = loadFromStorage('mockOrders', defaultMockOrders);
let mockTasks = loadFromStorage('mockTasks', defaultMockTasks);
let mockWorkflows = loadFromStorage('mockWorkflows', defaultMockWorkflows);
let mockDepartments = loadFromStorage('mockDepartments', defaultMockDepartments);
let mockParameters = loadFromStorage('mockParameters', defaultMockParameters);
let mockMaterials = loadFromStorage('mockMaterials', defaultMockMaterials);
let mockNotifications = loadFromStorage('mockNotifications', defaultMockNotifications);

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
    },

    // Select product for lead and create sales tasks from salesWorkflowId
    selectProduct: async (leadId, productId) => {
        if (MOCK_MODE) {
            const leadIndex = mockLeads.findIndex(l => l.id === leadId);
            if (leadIndex === -1) {
                return { success: false, error: { message: 'Lead not found' } };
            }

            const product = mockProducts.find(p => p.id === productId);
            if (!product) {
                return { success: false, error: { message: 'Product not found' } };
            }

            // Find sales workflow for this product
            const salesWorkflowId = product.salesWorkflowId;
            const salesWorkflow = salesWorkflowId ? mockWorkflows.find(w => w.id === salesWorkflowId) : null;

            // Create sales tasks from workflow steps
            const newTaskIds = [];
            if (salesWorkflow && salesWorkflow.steps) {
                const baseDate = new Date();
                let previousTaskId = null;

                salesWorkflow.steps.forEach((step, index) => {
                    const taskId = `lt-${leadId}-${index}`;
                    const dueDate = new Date(baseDate);
                    dueDate.setDate(dueDate.getDate() + (step.estimatedDurationDays || 3) * (index + 1));

                    const newTask = {
                        id: taskId,
                        leadId: leadId,
                        title: step.name,
                        status: index === 0 ? 'IN_PROGRESS' : 'PENDING',
                        stepOrder: step.stepOrder || index + 1,
                        departmentId: step.departmentId,
                        dueDate: dueDate.toISOString().split('T')[0],
                        createdAt: new Date().toISOString().split('T')[0],
                        dependsOnTaskId: previousTaskId,
                        isPaymentStep: step.isPaymentStep || false,
                        notes: step.description || ''
                    };

                    mockLeadTasks.push(newTask);
                    newTaskIds.push(taskId);
                    previousTaskId = taskId;
                });

                saveToStorage('mockLeadTasks', mockLeadTasks);
            }

            // Update lead with selected product and tasks
            mockLeads[leadIndex] = {
                ...mockLeads[leadIndex],
                selectedProductId: productId,
                tasks: newTaskIds,
                stage: mockLeads[leadIndex].stage === 'NEW' ? 'CONTACTED' : mockLeads[leadIndex].stage
            };
            saveToStorage('mockLeads', mockLeads);

            console.log(`[API] Lead ${leadId} selected product ${productId}, created ${newTaskIds.length} sales tasks`);
            return { success: true, data: { lead: mockLeads[leadIndex], tasks: newTaskIds } };
        }
        return api.post(`/leads/${leadId}/select-product`, { productId });
    },

    // Get all tasks for a lead
    getLeadTasks: async (leadId) => {
        if (MOCK_MODE) {
            const tasks = mockLeadTasks.filter(t => t.leadId === leadId);
            return { success: true, data: { tasks: tasks.sort((a, b) => a.stepOrder - b.stepOrder) } };
        }
        return api.get(`/leads/${leadId}/tasks`);
    },

    // Update a lead task
    updateLeadTask: async (taskId, data) => {
        if (MOCK_MODE) {
            const index = mockLeadTasks.findIndex(t => t.id === taskId);
            if (index === -1) {
                return { success: false, error: { message: 'Task not found' } };
            }
            mockLeadTasks[index] = { ...mockLeadTasks[index], ...data };
            saveToStorage('mockLeadTasks', mockLeadTasks);
            return { success: true, data: mockLeadTasks[index] };
        }
        return api.put(`/lead-tasks/${taskId}`, data);
    },

    // Complete a lead task and auto-start next one
    completeLeadTask: async (taskId) => {
        if (MOCK_MODE) {
            const taskIndex = mockLeadTasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) {
                return { success: false, error: { message: 'Task not found' } };
            }

            const task = mockLeadTasks[taskIndex];
            const leadId = task.leadId;

            // Mark task as completed
            mockLeadTasks[taskIndex] = {
                ...task,
                status: 'COMPLETED',
                completedAt: new Date().toISOString()
            };

            // If this was a payment step, update lead stage
            if (task.isPaymentStep) {
                const leadIndex = mockLeads.findIndex(l => l.id === leadId);
                if (leadIndex !== -1) {
                    mockLeads[leadIndex] = {
                        ...mockLeads[leadIndex],
                        stage: 'AWAITING_PAYMENT' // Ready for payment
                    };
                    saveToStorage('mockLeads', mockLeads);
                }
            }

            // Auto-start next task
            const nextTask = mockLeadTasks.find(t => t.dependsOnTaskId === taskId && t.status === 'PENDING');
            if (nextTask) {
                const nextIndex = mockLeadTasks.findIndex(t => t.id === nextTask.id);
                mockLeadTasks[nextIndex] = {
                    ...nextTask,
                    status: 'IN_PROGRESS',
                    startedAt: new Date().toISOString()
                };
            }

            // Check if all tasks completed (except payment step which might be last)
            const leadTasks = mockLeadTasks.filter(t => t.leadId === leadId);
            const allCompleted = leadTasks.every(t => t.status === 'COMPLETED');

            saveToStorage('mockLeadTasks', mockLeadTasks);

            console.log(`[API] Lead task ${taskId} completed, next task started: ${nextTask?.id || 'none'}`);
            return {
                success: true,
                data: {
                    task: mockLeadTasks[taskIndex],
                    nextTask: nextTask || null,
                    allTasksCompleted: allCompleted
                }
            };
        }
        return api.post(`/lead-tasks/${taskId}/complete`);
    },

    // Confirm payment and convert lead to order
    confirmPayment: async (leadId, paymentData) => {
        if (MOCK_MODE) {
            const leadIndex = mockLeads.findIndex(l => l.id === leadId);
            if (leadIndex === -1) {
                return { success: false, error: { message: 'Lead not found' } };
            }

            const lead = mockLeads[leadIndex];
            const product = mockProducts.find(p => p.id === lead.selectedProductId);

            // Mark payment task as complete
            const paymentTask = mockLeadTasks.find(t => t.leadId === leadId && t.isPaymentStep);
            if (paymentTask) {
                const ptIndex = mockLeadTasks.findIndex(t => t.id === paymentTask.id);
                mockLeadTasks[ptIndex] = {
                    ...paymentTask,
                    status: 'COMPLETED',
                    completedAt: new Date().toISOString(),
                    notes: `תשלום התקבל: ₪${paymentData.amount || 0}`
                };
                saveToStorage('mockLeadTasks', mockLeadTasks);
            }

            // Update lead to WON
            mockLeads[leadIndex] = {
                ...lead,
                stage: 'WON',
                paymentConfirmedAt: new Date().toISOString(),
                paymentAmount: paymentData.amount
            };
            saveToStorage('mockLeads', mockLeads);

            console.log(`[API] Lead ${leadId} payment confirmed, ready to create order`);
            return { success: true, data: { lead: mockLeads[leadIndex], product } };
        }
        return api.post(`/leads/${leadId}/confirm-payment`, paymentData);
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

// ============ HELPER: Find least busy user ============
const findLeastBusyUser = (departmentId, role = null, specificUserId = null) => {
    // If specific user is requested, return that user
    if (specificUserId) {
        const user = mockUsers.find(u => u.id === specificUserId);
        return user ? { id: user.id, name: `${user.firstName} ${user.lastName}` } : null;
    }

    // Get users in department (or all users if no department)
    let eligibleUsers = [...mockUsers];

    // Filter by department if specified
    if (departmentId) {
        eligibleUsers = eligibleUsers.filter(u =>
            u.departmentId === departmentId || u.department === departmentId
        );
    }

    // Filter by role if specified
    if (role) {
        eligibleUsers = eligibleUsers.filter(u => u.role === role);
    }

    // If no eligible users, return null
    if (eligibleUsers.length === 0) {
        return null;
    }

    // Count open tasks per user
    const openStatuses = ['PENDING', 'IN_PROGRESS', 'BLOCKED'];
    const taskCounts = eligibleUsers.map(user => {
        const userTasks = mockTasks.filter(t =>
            t.assignedToId === user.id && openStatuses.includes(t.status)
        );
        return {
            user,
            taskCount: userTasks.length
        };
    });

    // Sort by task count (ascending) and return the least busy
    taskCounts.sort((a, b) => a.taskCount - b.taskCount);
    const leastBusy = taskCounts[0];

    return leastBusy ? {
        id: leastBusy.user.id,
        name: `${leastBusy.user.firstName} ${leastBusy.user.lastName}`,
        taskCount: leastBusy.taskCount
    } : null;
};

// ============ ORDERS ============
export const ordersService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const { status, customerId } = params;
            let filtered = [...mockOrders];
            if (status) filtered = filtered.filter(o => o.status === status);
            if (customerId) filtered = filtered.filter(o => o.customerId === customerId);

            // Enrich orders with customer and product objects for display
            const enrichedOrders = filtered.map(order => {
                const customer = mockCustomers.find(c => c.id === order.customerId);
                const product = mockProducts.find(p => p.id === order.productId);

                // Build items array with product info
                const items = order.items || [{ productId: order.productId, quantity: order.quantity || 1 }];
                const enrichedItems = items.map(item => {
                    const itemProduct = mockProducts.find(p => p.id === item.productId) || product;
                    return {
                        ...item,
                        product: itemProduct || { id: item.productId, name: order.productName || 'מוצר' },
                        unitPrice: item.unitPrice || order.totalPrice / (order.quantity || 1) || 0
                    };
                });

                return {
                    ...order,
                    customer: customer || { id: order.customerId, name: order.customerName || 'לקוח לא ידוע' },
                    product: product || { id: order.productId, name: order.productName || 'מוצר לא ידוע' },
                    totalAmount: order.totalPrice || order.totalAmount || 0,
                    items: enrichedItems
                };
            });

            return { success: true, data: { orders: enrichedOrders, total: enrichedOrders.length } };
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
            if (!order) return { success: false, error: { message: 'Order not found' } };

            // Enrich with customer and product objects
            const customer = mockCustomers.find(c => c.id === order.customerId);
            const product = mockProducts.find(p => p.id === order.productId);

            // Build items array with product info
            const items = order.items || [{ productId: order.productId, quantity: order.quantity || 1 }];
            const enrichedItems = items.map(item => {
                const itemProduct = mockProducts.find(p => p.id === item.productId) || product;
                return {
                    ...item,
                    product: itemProduct || { id: item.productId, name: order.productName || 'מוצר' },
                    unitPrice: item.unitPrice || order.totalPrice / (order.quantity || 1) || 0
                };
            });

            const enrichedOrder = {
                ...order,
                customer: customer || { id: order.customerId, name: order.customerName || 'לקוח לא ידוע' },
                product: product || { id: order.productId, name: order.productName || 'מוצר לא ידוע' },
                totalAmount: order.totalPrice || order.totalAmount || 0,
                items: enrichedItems
            };

            return { success: true, data: enrichedOrder };
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
                status: 'PENDING_PAYMENT', // New status - waiting for deposit
                paymentStatus: 'AWAITING_DEPOSIT', // AWAITING_DEPOSIT, DEPOSIT_PAID, FULLY_PAID
                depositAmount: 0,
                depositPaidAt: null,
                createdAt: new Date().toISOString().split('T')[0],
                tasks: []
            };

            // Get customer and product info for task display
            const customer = data.customerId ? mockCustomers.find(c => c.id === data.customerId) : null;
            const product = data.productId ? mockProducts.find(p => p.id === data.productId) : null;
            const taskIds = [];
            const baseDate = new Date();

            // === TASK 1: Request Payment (always first) ===
            const paymentTaskId = `task-${orderId}-payment`;
            const paymentTask = {
                id: paymentTaskId,
                title: `בקשת תשלום מקדמה - ${orderNumber}`,
                orderId: orderId,
                taskType: 'PAYMENT_REQUEST', // Special task type
                workflowStepIndex: -1, // Before production
                workflowStepName: 'בקשת תשלום',
                workflowStep: {
                    name: 'בקשת תשלום מקדמה',
                    stepOrder: 0,
                    estimatedDurationDays: 3
                },
                orderItem: {
                    order: {
                        id: orderId,
                        orderNumber: orderNumber,
                        customer: customer ? { id: customer.id, name: customer.name } : null
                    },
                    product: product ? { id: product.id, name: product.name } : null
                },
                status: 'IN_PROGRESS', // Immediately active
                priority: 'URGENT',
                dueDate: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                createdAt: new Date().toISOString().split('T')[0],
                dependsOnTaskId: null,
                notes: 'יש לגבות מקדמה לפני תחילת הייצור. לאחר קבלת התשלום - לסמן משימה זו כהושלמה.'
            };
            mockTasks.push(paymentTask);
            taskIds.push(paymentTaskId);

            // === PRODUCTION TASKS: Created from workflow but BLOCKED ===
            if (data.workflowId) {
                const workflow = mockWorkflows.find(w => w.id === data.workflowId);
                if (workflow && workflow.steps) {
                    const daysPerStep = Math.ceil((workflow.estimatedDays || 30) / workflow.steps.length);

                    workflow.steps.forEach((step, index) => {
                        // Handle both object steps and string steps (backwards compatibility)
                        const stepName = typeof step === 'string' ? step : step.name;
                        const stepDays = typeof step === 'object' ? step.estimatedDurationDays : daysPerStep;
                        const stepDeptId = typeof step === 'object' ? step.departmentId : null;

                        // Get assignment configuration from workflow step
                        const assignmentType = typeof step === 'object' ? step.assignmentType : 'AUTO_DEPARTMENT';
                        const assignToRole = typeof step === 'object' ? step.assignToRole : null;
                        const assignToUserId = typeof step === 'object' ? step.assignToUserId : null;

                        // Find the assigned user based on configuration
                        let assignedUser = null;
                        if (assignmentType === 'SPECIFIC_USER' && assignToUserId) {
                            assignedUser = findLeastBusyUser(null, null, assignToUserId);
                        } else if (assignmentType === 'SPECIFIC_ROLE' && assignToRole) {
                            assignedUser = findLeastBusyUser(stepDeptId, assignToRole, null);
                        } else {
                            // AUTO_DEPARTMENT - find least busy in department
                            assignedUser = findLeastBusyUser(stepDeptId, null, null);
                        }

                        const taskId = `task-${orderId}-${index}`;
                        const dueDate = new Date(baseDate);
                        // Production starts after payment (add buffer)
                        dueDate.setDate(dueDate.getDate() + 7 + (stepDays * (index + 1)));

                        const newTask = {
                            id: taskId,
                            title: `${stepName} - ${orderNumber}`,
                            orderId: orderId,
                            taskType: 'PRODUCTION', // Production task
                            workflowStepIndex: index,
                            workflowStepName: stepName,
                            departmentId: stepDeptId,
                            // Auto-assigned user
                            assignedToId: assignedUser?.id || null,
                            assignee: assignedUser?.name || null,
                            workflowStep: {
                                name: stepName,
                                stepOrder: index + 1,
                                estimatedDurationDays: stepDays,
                                departmentId: stepDeptId,
                                assignmentType: assignmentType
                            },
                            orderItem: {
                                order: {
                                    id: orderId,
                                    orderNumber: orderNumber,
                                    customer: customer ? { id: customer.id, name: customer.name } : null
                                },
                                product: product ? { id: product.id, name: product.name } : null
                            },
                            // BLOCKED until payment - first production task depends on payment
                            status: 'BLOCKED',
                            blockedReason: 'ממתין לתשלום מקדמה',
                            priority: 'MEDIUM',
                            dueDate: dueDate.toISOString().split('T')[0],
                            createdAt: new Date().toISOString().split('T')[0],
                            // First production task depends on payment task
                            dependsOnTaskId: index === 0 ? paymentTaskId : `task-${orderId}-${index - 1}`,
                            notes: assignedUser
                                ? `שלב ${index + 1} מתוך ${workflow.steps.length} - משויך ל${assignedUser.name}`
                                : `שלב ${index + 1} מתוך ${workflow.steps.length} - יתחיל לאחר תשלום מקדמה`
                        };

                        mockTasks.push(newTask);
                        taskIds.push(taskId);
                    });

                    console.log(`[API] Created payment task + ${workflow.steps.length} production tasks (BLOCKED) for order ${orderId}`);
                }
            }

            newOrder.tasks = taskIds;
            saveToStorage('mockTasks', mockTasks);
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
    },

    // Confirm deposit payment - unlocks production tasks
    confirmDeposit: async (id, depositAmount) => {
        if (MOCK_MODE) {
            const orderIndex = mockOrders.findIndex(o => o.id === id);
            if (orderIndex === -1) {
                return { success: false, error: { message: 'Order not found' } };
            }

            const order = mockOrders[orderIndex];

            // Update order payment status
            mockOrders[orderIndex] = {
                ...order,
                status: 'IN_PRODUCTION',
                paymentStatus: 'DEPOSIT_PAID',
                depositAmount: depositAmount || order.totalPrice * 0.5,
                depositPaidAt: new Date().toISOString()
            };

            // Find and complete the payment task
            const paymentTaskIndex = mockTasks.findIndex(t =>
                t.orderId === id && t.taskType === 'PAYMENT_REQUEST'
            );
            if (paymentTaskIndex !== -1) {
                mockTasks[paymentTaskIndex] = {
                    ...mockTasks[paymentTaskIndex],
                    status: 'COMPLETED',
                    completedAt: new Date().toISOString(),
                    notes: `מקדמה התקבלה: ₪${depositAmount || order.totalPrice * 0.5}`
                };
            }

            // Unblock production tasks - activate the first one
            const productionTasks = mockTasks.filter(t =>
                t.orderId === id && t.taskType === 'PRODUCTION'
            ).sort((a, b) => a.workflowStepIndex - b.workflowStepIndex);

            productionTasks.forEach((task, index) => {
                const taskIndex = mockTasks.findIndex(t => t.id === task.id);
                if (taskIndex !== -1) {
                    mockTasks[taskIndex] = {
                        ...mockTasks[taskIndex],
                        status: index === 0 ? 'IN_PROGRESS' : 'PENDING',
                        blockedReason: null,
                        notes: mockTasks[taskIndex].notes.replace(' - יתחיל לאחר תשלום מקדמה', '')
                    };
                }
            });

            saveToStorage('mockOrders', mockOrders);
            saveToStorage('mockTasks', mockTasks);

            console.log(`[API] Deposit confirmed for order ${id}, unlocked ${productionTasks.length} production tasks`);
            return { success: true, data: mockOrders[orderIndex] };
        }
        return api.post(`/orders/${id}/confirm-deposit`, { depositAmount });
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
        if (MOCK_MODE) {
            const product = mockProducts.find(p => p.id === productId);
            if (product?.workflowId) {
                const workflow = mockWorkflows.find(w => w.id === product.workflowId);
                return { success: true, data: workflow };
            }
            return { success: false, error: { message: 'No workflow for product' } };
        }
        return api.get(`/workflows/product/${productId}`);
    },

    create: async (data) => {
        if (MOCK_MODE) {
            const newWorkflow = {
                id: Date.now().toString(),
                ...data,
                steps: [],
                status: 'ACTIVE',
                isActive: true,
                createdAt: new Date().toISOString().split('T')[0]
            };
            mockWorkflows.push(newWorkflow);
            saveToStorage('mockWorkflows', mockWorkflows);
            return { success: true, data: newWorkflow };
        }
        return api.post('/workflows', data);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            const index = mockWorkflows.findIndex(w => w.id === id);
            if (index !== -1) {
                mockWorkflows[index] = { ...mockWorkflows[index], ...data };
                saveToStorage('mockWorkflows', mockWorkflows);
                return { success: true, data: mockWorkflows[index] };
            }
            return { success: false, error: { message: 'Workflow not found' } };
        }
        return api.put(`/workflows/${id}`, data);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            const index = mockWorkflows.findIndex(w => w.id === id);
            if (index !== -1) {
                mockWorkflows.splice(index, 1);
                saveToStorage('mockWorkflows', mockWorkflows);
                return { success: true };
            }
            return { success: false, error: { message: 'Workflow not found' } };
        }
        return api.delete(`/workflows/${id}`);
    },

    addStep: async (workflowId, stepData) => {
        if (MOCK_MODE) {
            const workflowIndex = mockWorkflows.findIndex(w => w.id === workflowId);
            if (workflowIndex === -1) {
                return { success: false, error: { message: 'Workflow not found' } };
            }

            const workflow = mockWorkflows[workflowIndex];
            const newStep = {
                id: `step-${workflowId}-${Date.now()}`,
                ...stepData,
                stepOrder: stepData.stepOrder || (workflow.steps?.length || 0) + 1,
                isActive: true
            };

            if (!workflow.steps) workflow.steps = [];
            workflow.steps.push(newStep);
            workflow.steps.sort((a, b) => a.stepOrder - b.stepOrder);
            saveToStorage('mockWorkflows', mockWorkflows);

            return { success: true, data: newStep };
        }
        return api.post(`/workflows/${workflowId}/steps`, stepData);
    },

    updateStep: async (stepId, stepData) => {
        if (MOCK_MODE) {
            // Find the step across all workflows
            for (const workflow of mockWorkflows) {
                const stepIndex = workflow.steps?.findIndex(s => s.id === stepId);
                if (stepIndex !== -1 && stepIndex !== undefined) {
                    workflow.steps[stepIndex] = { ...workflow.steps[stepIndex], ...stepData };
                    saveToStorage('mockWorkflows', mockWorkflows);
                    return { success: true, data: workflow.steps[stepIndex] };
                }
            }
            return { success: false, error: { message: 'Step not found' } };
        }
        return api.put(`/workflows/steps/${stepId}`, stepData);
    },

    deleteStep: async (workflowId, stepId) => {
        if (MOCK_MODE) {
            const workflowIndex = mockWorkflows.findIndex(w => w.id === workflowId);
            if (workflowIndex === -1) {
                return { success: false, error: { message: 'Workflow not found' } };
            }

            const workflow = mockWorkflows[workflowIndex];
            const stepIndex = workflow.steps?.findIndex(s => s.id === stepId);
            if (stepIndex !== -1 && stepIndex !== undefined) {
                workflow.steps.splice(stepIndex, 1);
                // Reorder remaining steps
                workflow.steps.forEach((step, i) => step.stepOrder = i + 1);
                saveToStorage('mockWorkflows', mockWorkflows);
                return { success: true };
            }
            return { success: false, error: { message: 'Step not found' } };
        }
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

// ============ MATERIALS (חומרי גלם) ============
export const materialsService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const { category, productId, search, lowStockOnly } = params;
            let filtered = [...mockMaterials];

            if (category && category !== 'all') {
                filtered = filtered.filter(m => m.category === category);
            }
            if (productId) {
                filtered = filtered.filter(m => m.productIds?.includes(productId));
            }
            if (search) {
                const searchLower = search.toLowerCase();
                filtered = filtered.filter(m =>
                    m.name.toLowerCase().includes(searchLower) ||
                    m.nameEn?.toLowerCase().includes(searchLower) ||
                    m.code.toLowerCase().includes(searchLower)
                );
            }
            if (lowStockOnly) {
                filtered = filtered.filter(m => m.stockQuantity <= m.reorderLevel);
            }

            return { success: true, data: { materials: filtered, total: filtered.length } };
        }
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null) queryParams.append(key, val);
        });
        return api.get(`/materials?${queryParams}`);
    },

    getById: async (id) => {
        if (MOCK_MODE) {
            const material = mockMaterials.find(m => m.id === id);
            if (material) {
                return { success: true, data: material };
            }
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
            mockMaterials.push(newMaterial);
            saveToStorage('mockMaterials', mockMaterials);
            return { success: true, data: newMaterial };
        }
        return api.post('/materials', data);
    },

    update: async (id, data) => {
        if (MOCK_MODE) {
            const index = mockMaterials.findIndex(m => m.id === id);
            if (index !== -1) {
                mockMaterials[index] = { ...mockMaterials[index], ...data, updatedAt: new Date().toISOString() };
                saveToStorage('mockMaterials', mockMaterials);
                return { success: true, data: mockMaterials[index] };
            }
            return { success: false, error: { message: 'Material not found' } };
        }
        return api.put(`/materials/${id}`, data);
    },

    delete: async (id) => {
        if (MOCK_MODE) {
            const index = mockMaterials.findIndex(m => m.id === id);
            if (index !== -1) {
                mockMaterials.splice(index, 1);
                saveToStorage('mockMaterials', mockMaterials);
                return { success: true };
            }
            return { success: false, error: { message: 'Material not found' } };
        }
        return api.delete(`/materials/${id}`);
    },

    // Update stock quantity
    updateStock: async (id, quantity, operation = 'SET') => {
        if (MOCK_MODE) {
            const index = mockMaterials.findIndex(m => m.id === id);
            if (index !== -1) {
                const material = mockMaterials[index];
                let newQuantity;

                switch (operation) {
                    case 'ADD':
                        newQuantity = material.stockQuantity + quantity;
                        break;
                    case 'SUBTRACT':
                        newQuantity = Math.max(0, material.stockQuantity - quantity);
                        break;
                    case 'SET':
                    default:
                        newQuantity = quantity;
                }

                mockMaterials[index].stockQuantity = newQuantity;
                mockMaterials[index].updatedAt = new Date().toISOString();
                saveToStorage('mockMaterials', mockMaterials);

                // Check if low stock and create notification
                if (newQuantity <= material.reorderLevel) {
                    const existingNotif = mockNotifications.find(
                        n => n.type === 'STOCK_LOW' && n.entityId === id && !n.dismissed
                    );
                    if (!existingNotif) {
                        const priority = newQuantity <= material.reorderLevel / 2 ? 'critical' : 'high';
                        const newNotif = {
                            id: `notif-${Date.now()}`,
                            type: 'STOCK_LOW',
                            priority,
                            title: `מלאי ${priority === 'critical' ? 'קריטי' : 'נמוך'} - ${material.name}`,
                            titleEn: `${priority === 'critical' ? 'Critical' : 'Low'} Stock - ${material.nameEn || material.name}`,
                            message: `נותרו ${newQuantity} ${material.stockUnit} במלאי. רף מינימום: ${material.reorderLevel}`,
                            messageEn: `Only ${newQuantity} ${material.stockUnit} left. Minimum: ${material.reorderLevel}`,
                            entityType: 'material',
                            entityId: id,
                            actionUrl: '/materials',
                            read: false,
                            dismissed: false,
                            userId: null,
                            createdAt: new Date().toISOString()
                        };
                        mockNotifications.unshift(newNotif);
                        saveToStorage('mockNotifications', mockNotifications);
                    }
                }

                return { success: true, data: mockMaterials[index] };
            }
            return { success: false, error: { message: 'Material not found' } };
        }
        return api.put(`/materials/${id}/stock`, { quantity, operation });
    },

    // Get low stock materials
    getLowStock: async () => {
        if (MOCK_MODE) {
            const lowStock = mockMaterials.filter(m => m.stockQuantity <= m.reorderLevel);
            return { success: true, data: { materials: lowStock, total: lowStock.length } };
        }
        return api.get('/materials/low-stock');
    },

    // Get materials by product
    getByProduct: async (productId) => {
        if (MOCK_MODE) {
            const materials = mockMaterials.filter(m => m.productIds?.includes(productId));
            return { success: true, data: { materials, total: materials.length } };
        }
        return api.get(`/materials/product/${productId}`);
    },

    // Reserve materials for an order (subtract from stock)
    reserveForOrder: async (orderId, materialsUsed) => {
        // materialsUsed = [{ materialId, quantity }, ...]
        if (MOCK_MODE) {
            const results = [];
            let success = true;

            for (const { materialId, quantity } of materialsUsed) {
                const index = mockMaterials.findIndex(m => m.id === materialId);
                if (index !== -1 && mockMaterials[index].stockQuantity >= quantity) {
                    mockMaterials[index].stockQuantity -= quantity;
                    mockMaterials[index].updatedAt = new Date().toISOString();
                    results.push({ materialId, newStock: mockMaterials[index].stockQuantity });

                    // Check for low stock notification
                    const mat = mockMaterials[index];
                    if (mat.stockQuantity <= mat.reorderLevel) {
                        const existingNotif = mockNotifications.find(
                            n => n.type === 'STOCK_LOW' && n.entityId === materialId && !n.dismissed
                        );
                        if (!existingNotif) {
                            const priority = mat.stockQuantity <= mat.reorderLevel / 2 ? 'critical' : 'high';
                            mockNotifications.unshift({
                                id: `notif-${Date.now()}-${materialId}`,
                                type: 'STOCK_LOW',
                                priority,
                                title: `מלאי ${priority === 'critical' ? 'קריטי' : 'נמוך'} - ${mat.name}`,
                                message: `נותרו ${mat.stockQuantity} ${mat.stockUnit} במלאי`,
                                entityType: 'material',
                                entityId: materialId,
                                actionUrl: '/materials',
                                read: false,
                                dismissed: false,
                                createdAt: new Date().toISOString()
                            });
                        }
                    }
                } else {
                    success = false;
                    break;
                }
            }

            if (success) {
                saveToStorage('mockMaterials', mockMaterials);
                saveToStorage('mockNotifications', mockNotifications);
                return { success: true, data: { reserved: results } };
            }
            return { success: false, error: { message: 'Insufficient stock for some materials' } };
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

// ============ NOTIFICATIONS (התראות) ============
export const notificationsService = {
    getAll: async (params = {}) => {
        if (MOCK_MODE) {
            const { unreadOnly, type, limit = 50 } = params;
            let filtered = [...mockNotifications].filter(n => !n.dismissed);

            if (unreadOnly) {
                filtered = filtered.filter(n => !n.read);
            }
            if (type) {
                filtered = filtered.filter(n => n.type === type);
            }

            // Sort by date, newest first
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            const unreadCount = mockNotifications.filter(n => !n.read && !n.dismissed).length;

            return {
                success: true,
                data: {
                    notifications: filtered.slice(0, limit),
                    total: filtered.length,
                    unreadCount
                }
            };
        }
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null) queryParams.append(key, val);
        });
        return api.get(`/notifications?${queryParams}`);
    },

    getUnreadCount: async () => {
        if (MOCK_MODE) {
            const count = mockNotifications.filter(n => !n.read && !n.dismissed).length;
            return { success: true, data: { count } };
        }
        return api.get('/notifications/unread-count');
    },

    markAsRead: async (id) => {
        if (MOCK_MODE) {
            const index = mockNotifications.findIndex(n => n.id === id);
            if (index !== -1) {
                mockNotifications[index].read = true;
                saveToStorage('mockNotifications', mockNotifications);
                return { success: true };
            }
            return { success: false, error: { message: 'Notification not found' } };
        }
        return api.put(`/notifications/${id}/read`);
    },

    markAllAsRead: async () => {
        if (MOCK_MODE) {
            mockNotifications.forEach(n => n.read = true);
            saveToStorage('mockNotifications', mockNotifications);
            return { success: true };
        }
        return api.post('/notifications/mark-all-read');
    },

    dismiss: async (id) => {
        if (MOCK_MODE) {
            const index = mockNotifications.findIndex(n => n.id === id);
            if (index !== -1) {
                mockNotifications[index].dismissed = true;
                saveToStorage('mockNotifications', mockNotifications);
                return { success: true };
            }
            return { success: false, error: { message: 'Notification not found' } };
        }
        return api.put(`/notifications/${id}/dismiss`);
    },

    dismissAll: async () => {
        if (MOCK_MODE) {
            mockNotifications.forEach(n => n.dismissed = true);
            saveToStorage('mockNotifications', mockNotifications);
            return { success: true };
        }
        return api.post('/notifications/dismiss-all');
    },

    // Create a new notification (for internal use)
    create: async (data) => {
        if (MOCK_MODE) {
            const newNotif = {
                id: `notif-${Date.now()}`,
                read: false,
                dismissed: false,
                createdAt: new Date().toISOString(),
                ...data
            };
            mockNotifications.unshift(newNotif);
            saveToStorage('mockNotifications', mockNotifications);
            return { success: true, data: newNotif };
        }
        return api.post('/notifications', data);
    },

    // Delete old notifications (cleanup)
    deleteOld: async (daysOld = 30) => {
        if (MOCK_MODE) {
            const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
            const before = mockNotifications.length;
            mockNotifications = mockNotifications.filter(n => new Date(n.createdAt) > cutoff);
            saveToStorage('mockNotifications', mockNotifications);
            return { success: true, data: { deleted: before - mockNotifications.length } };
        }
        return api.delete(`/notifications/old?days=${daysOld}`);
    }
};

// ============ MOCK DATA RESET ============
// Call this function to reset localStorage to default mock data
export const resetMockData = () => {
    if (MOCK_MODE) {
        // Clear existing localStorage
        localStorage.removeItem('mockLeads');
        localStorage.removeItem('mockCustomers');
        localStorage.removeItem('mockProducts');
        localStorage.removeItem('mockOrders');
        localStorage.removeItem('mockTasks');
        localStorage.removeItem('mockWorkflows');
        localStorage.removeItem('mockDepartments');
        localStorage.removeItem('mockParameters');
        localStorage.removeItem('mockMaterials');
        localStorage.removeItem('mockNotifications');

        // Reload with defaults
        window.location.reload();
        return { success: true, message: 'Mock data reset successfully. Page will reload.' };
    }
    return { success: false, message: 'Not in mock mode' };
};

// Expose resetMockData to window for easy debugging
if (typeof window !== 'undefined') {
    window.resetMockData = resetMockData;
}

// Export default api instance for custom calls
export default api;
