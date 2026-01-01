/**
 * Comprehensive Demo Data Seed Script
 * Run this to populate the system with realistic demo data
 */

// ============ USERS / EMPLOYEES ============
const mockUsers = [
    { id: 'user-1', firstName: 'יואל', lastName: 'כהן', email: 'yoel@example.com', role: 'ADMIN', phone: '050-1234567', departmentId: '1' },
    { id: 'user-2', firstName: 'מרים', lastName: 'לוי', email: 'miriam@example.com', role: 'MANAGER', phone: '050-2345678', departmentId: '1' },
    { id: 'user-3', firstName: 'אביגיל', lastName: 'רוזנברג', email: 'avigail@example.com', role: 'EMPLOYEE', phone: '050-3456789', departmentId: '1' },
    { id: 'user-4', firstName: 'חיה', lastName: 'גולדשטיין', email: 'chaya@example.com', role: 'EMPLOYEE', phone: '050-4567890', departmentId: '2' },
    { id: 'user-5', firstName: 'אסתי', lastName: 'פרידמן', email: 'esti@example.com', role: 'EMPLOYEE', phone: '050-5678901', departmentId: '2' },
    { id: 'user-6', firstName: 'שרה', lastName: 'בלום', email: 'sarah@example.com', role: 'EMPLOYEE', phone: '050-6789012', departmentId: '3' },
    { id: 'user-7', firstName: 'שניאור', lastName: 'זלמן', email: 'shneor@example.com', role: 'EMPLOYEE', phone: '050-7890123', departmentId: '3' },
    { id: 'user-8', firstName: 'ישראל', lastName: 'מאיר', email: 'israel@example.com', role: 'EMPLOYEE', phone: '050-8901234', departmentId: '4' },
    { id: 'user-9', firstName: 'לוי', lastName: 'יצחק', email: 'levi@example.com', role: 'EMPLOYEE', phone: '050-9012345', departmentId: '5' },
    { id: 'user-10', firstName: 'פערי', lastName: 'שטרן', email: 'perri@example.com', role: 'EMPLOYEE', phone: '050-0123456', departmentId: '1' }
];

// ============ DEPARTMENTS ============
const mockDepartments = [
    { id: '1', name: 'עיצוב רקמה', nameEn: 'Embroidery Design', code: 'DESIGN', color: '#6366f1', manager: 'מרים לוי', managerId: 'user-2', employeeCount: 3, activeTasks: 12, status: 'ACTIVE' },
    { id: '2', name: 'רקמה', nameEn: 'Embroidery', code: 'EMBROIDERY', color: '#8b5cf6', manager: 'חיה גולדשטיין', managerId: 'user-4', employeeCount: 2, activeTasks: 18, status: 'ACTIVE' },
    { id: '3', name: 'תפירה', nameEn: 'Sewing', code: 'SEWING', color: '#ec4899', manager: 'שרה בלום', managerId: 'user-6', employeeCount: 2, activeTasks: 15, status: 'ACTIVE' },
    { id: '4', name: 'בקרת איכות', nameEn: 'Quality Control', code: 'QC', color: '#10b981', manager: 'ישראל מאיר', managerId: 'user-8', employeeCount: 1, activeTasks: 8, status: 'ACTIVE' },
    { id: '5', name: 'משלוחים', nameEn: 'Shipping', code: 'SHIPPING', color: '#f59e0b', manager: 'לוי יצחק', managerId: 'user-9', employeeCount: 1, activeTasks: 5, status: 'ACTIVE' }
];

// ============ CUSTOMERS ============
const mockCustomers = [
    { id: 'cust-1', name: 'בית הכנסת אור החיים', email: 'orchaim@gmail.com', phone: '02-1234567', city: 'ירושלים', address: 'רחוב הנביאים 45', totalOrders: 5, totalSpent: 45000, status: 'ACTIVE', type: 'SYNAGOGUE' },
    { id: 'cust-2', name: 'קהילת בית ישראל', email: 'beitisrael@gmail.com', phone: '03-2345678', city: 'בני ברק', address: 'רחוב רבי עקיבא 12', totalOrders: 3, totalSpent: 28000, status: 'ACTIVE', type: 'SYNAGOGUE' },
    { id: 'cust-3', name: 'בית מדרש תפארת ציון', email: 'tiferetzion@gmail.com', phone: '02-3456789', city: 'ירושלים', address: 'רחוב יפו 100', totalOrders: 2, totalSpent: 18500, status: 'ACTIVE', type: 'SYNAGOGUE' },
    { id: 'cust-4', name: 'משפחת כהן', email: 'cohen.family@gmail.com', phone: '050-4567890', city: 'פתח תקווה', address: 'רחוב הרצל 55', totalOrders: 1, totalSpent: 3500, status: 'ACTIVE', type: 'PRIVATE' },
    { id: 'cust-5', name: 'בית כנסת נר תמיד', email: 'nertamid@gmail.com', phone: '08-5678901', city: 'באר שבע', address: 'שדרות בן גוריון 20', totalOrders: 4, totalSpent: 52000, status: 'ACTIVE', type: 'SYNAGOGUE' },
    { id: 'cust-6', name: 'Congregation Beth David', email: 'bethdavid@gmail.com', phone: '+1-555-1234', city: 'New York', address: '123 Main St', totalOrders: 2, totalSpent: 15000, status: 'ACTIVE', type: 'INTERNATIONAL' },
    { id: 'cust-7', name: 'משפחת לוי', email: 'levi.fam@gmail.com', phone: '054-6789012', city: 'רמת גן', address: 'רחוב ביאליק 30', totalOrders: 1, totalSpent: 4200, status: 'ACTIVE', type: 'PRIVATE' },
    { id: 'cust-8', name: 'בית הכנסת הגדול', email: 'hagadol@gmail.com', phone: '03-7890123', city: 'תל אביב', address: 'רחוב אלנבי 80', totalOrders: 6, totalSpent: 75000, status: 'ACTIVE', type: 'SYNAGOGUE' },
    { id: 'cust-9', name: 'Temple Emanuel', email: 'emanuel@temple.org', phone: '+1-555-5678', city: 'Los Angeles', address: '456 Oak Ave', totalOrders: 1, totalSpent: 8500, status: 'ACTIVE', type: 'INTERNATIONAL' },
    { id: 'cust-10', name: 'ישיבת פונוביז\'', email: 'ponevezh@yeshiva.org', phone: '03-8901234', city: 'בני ברק', address: 'רחוב הרב שך 1', totalOrders: 8, totalSpent: 120000, status: 'VIP', type: 'INSTITUTION' },
    { id: 'cust-11', name: 'משפחת שטיין', email: 'stein@email.com', phone: '052-9012345', city: 'חיפה', address: 'רחוב הנשיא 15', totalOrders: 2, totalSpent: 7800, status: 'ACTIVE', type: 'PRIVATE' },
    { id: 'cust-12', name: 'בית הכנסת חסידי ברסלב', email: 'breslov@shul.com', phone: '02-0123456', city: 'ירושלים', address: 'רחוב מאה שערים 50', totalOrders: 3, totalSpent: 35000, status: 'ACTIVE', type: 'SYNAGOGUE' }
];

// ============ PRODUCTS ============
const mockProducts = [
    {
        id: 'prod-1',
        name: 'פרוכת רקומה',
        nameEn: 'Embroidered Parochet',
        code: 'PAROCHET-EMB',
        category: 'PAROCHET',
        description: 'פרוכת לארון קודש עם רקמה מפוארת',
        basePrice: 8500,
        image: '/products/parochet.jpeg',
        workflowId: '1',
        isActive: true,
        parameters: ['velvet_color', 'embroidery_color', 'size', 'dedication', 'swarovski', 'fringes', 'kaporet']
    },
    {
        id: 'prod-2',
        name: 'מעיל לספר תורה',
        nameEn: 'Torah Cover (Meil)',
        code: 'MEIL-STD',
        category: 'MEIL',
        description: 'מעיל מפואר לספר תורה',
        basePrice: 4500,
        image: '/products/meil-sefer-tora.jpeg',
        workflowId: '2',
        isActive: true,
        parameters: ['velvet_color', 'embroidery_color', 'size', 'dedication']
    },
    {
        id: 'prod-3',
        name: 'כיסוי בימה ועמוד',
        nameEn: 'Bima & Amud Cover',
        code: 'BIMA-AMUD',
        category: 'BIMA',
        description: 'כיסוי מרהיב לבימה ועמוד החזן',
        basePrice: 6500,
        image: '/products/kisui-bima-amud.jpeg',
        workflowId: '3',
        isActive: true,
        parameters: ['velvet_color', 'embroidery_color', 'size_bima', 'size_amud', 'dedication']
    },
    {
        id: 'prod-4',
        name: 'כיסוי טלית ותפילין',
        nameEn: 'Tallit & Tefillin Cover',
        code: 'TALIT-TEFILIN',
        category: 'TALIT',
        description: 'כיסוי יוקרתי לטלית ותפילין',
        basePrice: 1200,
        image: '/products/kisui-talit-tefilin.png',
        workflowId: '4',
        isActive: true,
        parameters: ['velvet_color', 'embroidery_color', 'name_embroidery']
    },
    {
        id: 'prod-5',
        name: 'פרוכת פשוטה',
        nameEn: 'Simple Parochet',
        code: 'PAROCHET-SIMPLE',
        category: 'PAROCHET',
        description: 'פרוכת בעיצוב קלאסי ופשוט',
        basePrice: 5500,
        image: '/products/parochet.jpeg',
        workflowId: '1',
        isActive: true,
        parameters: ['velvet_color', 'embroidery_color', 'size']
    },
    {
        id: 'prod-6',
        name: 'תיקון/שיפוץ פרוכת',
        nameEn: 'Parochet Repair',
        code: 'REPAIR-PAROCHET',
        category: 'REPAIR',
        description: 'שיפוץ ותיקון פרוכת קיימת',
        basePrice: 2000,
        image: '/products/parochet.jpeg',
        workflowId: '5',
        isActive: true,
        parameters: ['repair_type', 'repair_description']
    }
];

// ============ LEADS ============
const mockLeads = [
    { id: 'lead-1', name: 'הרב משה גרין', email: 'mgreen@gmail.com', phone: '050-1111111', company: 'בית כנסת שערי צדק', source: 'WEBSITE', stage: 'NEW', estimatedValue: 12000, productId: 'prod-1', assignedToId: 'user-3', notes: 'מעוניין בפרוכת גדולה לחגים', nextFollowUp: '2026-01-05', createdAt: '2025-12-28' },
    { id: 'lead-2', name: 'דוד כהן', email: 'dcohen@email.com', phone: '052-2222222', company: '', source: 'REFERRAL', stage: 'CONTACTED', estimatedValue: 4500, productId: 'prod-2', assignedToId: 'user-3', notes: 'הומלץ ע"י לקוח קיים', nextFollowUp: '2026-01-03', createdAt: '2025-12-25' },
    { id: 'lead-3', name: 'שמואל ברג', email: 'sberg@temple.org', phone: '+1-555-3333', company: 'Temple Shalom', source: 'PHONE', stage: 'QUALIFIED', estimatedValue: 15000, productId: 'prod-1', assignedToId: 'user-2', notes: 'מקהילה גדולה באמריקה', nextFollowUp: '2026-01-07', createdAt: '2025-12-20' },
    { id: 'lead-4', name: 'אברהם לוי', email: 'alevi@gmail.com', phone: '054-4444444', company: 'ישיבת מרכז הרב', source: 'WEBSITE', stage: 'QUOTE', estimatedValue: 35000, productId: 'prod-3', assignedToId: 'user-2', notes: 'מעוניינים בסט מלא - פרוכת + בימה + עמוד', nextFollowUp: '2026-01-02', createdAt: '2025-12-15' },
    { id: 'lead-5', name: 'יעקב שטיין', email: 'jstein@email.com', phone: '053-5555555', company: '', source: 'REFERRAL', stage: 'NEGOTIATION', estimatedValue: 8500, productId: 'prod-1', assignedToId: 'user-3', notes: 'מתלבט בין דגמים', nextFollowUp: '2026-01-04', createdAt: '2025-12-10' },
    { id: 'lead-6', name: 'משה פרידמן', email: 'mfriedman@email.com', phone: '050-6666666', company: 'בית מדרש אור יצחק', source: 'WEBSITE', stage: 'DEPOSIT', estimatedValue: 22000, productId: 'prod-1', assignedToId: 'user-2', notes: 'שילם מקדמה, ממתין לאישור עיצוב', nextFollowUp: '2026-01-06', createdAt: '2025-12-05' },
    { id: 'lead-7', name: 'רחל גולד', email: 'rgold@gmail.com', phone: '052-7777777', company: '', source: 'PHONE', stage: 'NEW', estimatedValue: 1200, productId: 'prod-4', assignedToId: 'user-3', notes: 'מחפשת מתנה לחתן', nextFollowUp: '2026-01-08', createdAt: '2025-12-30' },
    { id: 'lead-8', name: 'נתן וייס', email: 'nweiss@shul.org', phone: '03-8888888', company: 'בית כנסת מגן אברהם', source: 'REFERRAL', stage: 'CONTACTED', estimatedValue: 6500, productId: 'prod-3', assignedToId: 'user-3', notes: 'מעוניין בכיסוי בימה בלבד', nextFollowUp: '2026-01-05', createdAt: '2025-12-27' },
    { id: 'lead-9', name: 'Rabbi David Miller', email: 'dmiller@temple.org', phone: '+1-555-9999', company: 'Beth Israel Congregation', source: 'WEBSITE', stage: 'QUALIFIED', estimatedValue: 18000, productId: 'prod-1', assignedToId: 'user-2', notes: 'From Miami, interested in premium parochet', nextFollowUp: '2026-01-10', createdAt: '2025-12-22' },
    { id: 'lead-10', name: 'חיים רוזן', email: 'crosen@gmail.com', phone: '054-0000000', company: '', source: 'PHONE', stage: 'LOST', estimatedValue: 4500, productId: 'prod-2', assignedToId: 'user-3', notes: 'בחר בספק אחר', nextFollowUp: null, createdAt: '2025-12-01' },
    { id: 'lead-11', name: 'יצחק ברקוביץ', email: 'iberk@email.com', phone: '050-1212121', company: 'בית כנסת אהבת ישראל', source: 'WEBSITE', stage: 'NEW', estimatedValue: 9500, productId: 'prod-1', assignedToId: 'user-3', notes: 'פנייה חדשה מהאתר', nextFollowUp: '2026-01-02', createdAt: '2025-12-31' },
    { id: 'lead-12', name: 'שלמה גרוס', email: 'sgross@yeshiva.edu', phone: '02-1313131', company: 'ישיבת חברון', source: 'REFERRAL', stage: 'PRODUCT', estimatedValue: 45000, productId: 'prod-1', assignedToId: 'user-2', notes: 'פרויקט גדול - 3 פרוכות', nextFollowUp: '2026-01-03', createdAt: '2025-12-18' }
];

// ============ ORDERS ============
const mockOrders = [
    {
        id: 'order-1',
        orderNumber: 'ORD-2025-001',
        customerId: 'cust-1',
        items: [{ productId: 'prod-1', quantity: 1, unitPrice: 12000, selectedParameters: { velvet_color: 'כחול כהה', embroidery_color: 'זהב', size: '180x120', dedication: 'לע"נ הרב יעקב בן שרה' } }],
        totalPrice: 12000,
        status: 'COMPLETED',
        paymentStatus: 'FULLY_PAID',
        dueDate: '2025-12-15',
        createdAt: '2025-11-01',
        notes: 'פרוכת מפוארת עם רקמת זהב'
    },
    {
        id: 'order-2',
        orderNumber: 'ORD-2025-002',
        customerId: 'cust-2',
        items: [{ productId: 'prod-2', quantity: 2, unitPrice: 4500, selectedParameters: { velvet_color: 'בורדו', embroidery_color: 'כסף' } }],
        totalPrice: 9000,
        status: 'IN_PRODUCTION',
        paymentStatus: 'DEPOSIT_PAID',
        depositAmount: 4500,
        dueDate: '2026-01-15',
        createdAt: '2025-12-10',
        notes: '2 מעילים לספרי תורה'
    },
    {
        id: 'order-3',
        orderNumber: 'ORD-2025-003',
        customerId: 'cust-5',
        items: [
            { productId: 'prod-1', quantity: 1, unitPrice: 15000, selectedParameters: { velvet_color: 'שחור', embroidery_color: 'זהב', swarovski: true } },
            { productId: 'prod-3', quantity: 1, unitPrice: 8000, selectedParameters: { velvet_color: 'שחור', embroidery_color: 'זהב' } }
        ],
        totalPrice: 23000,
        status: 'IN_PRODUCTION',
        paymentStatus: 'DEPOSIT_PAID',
        depositAmount: 11500,
        dueDate: '2026-01-25',
        createdAt: '2025-12-05',
        notes: 'סט מלא - פרוכת וכיסוי בימה'
    },
    {
        id: 'order-4',
        orderNumber: 'ORD-2025-004',
        customerId: 'cust-6',
        items: [{ productId: 'prod-1', quantity: 1, unitPrice: 10000, selectedParameters: { velvet_color: 'לבן', embroidery_color: 'כסף', size: '200x140' } }],
        totalPrice: 10000,
        status: 'PENDING_PAYMENT',
        paymentStatus: 'AWAITING_DEPOSIT',
        dueDate: '2026-02-01',
        createdAt: '2025-12-20',
        notes: 'משלוח לניו יורק'
    },
    {
        id: 'order-5',
        orderNumber: 'ORD-2025-005',
        customerId: 'cust-4',
        items: [{ productId: 'prod-4', quantity: 1, unitPrice: 1500, selectedParameters: { velvet_color: 'כחול רויאל', name_embroidery: 'יצחק בן אברהם' } }],
        totalPrice: 1500,
        status: 'COMPLETED',
        paymentStatus: 'FULLY_PAID',
        dueDate: '2025-12-25',
        createdAt: '2025-12-01',
        notes: 'כיסוי טלית - מתנה לבר מצווה'
    },
    {
        id: 'order-6',
        orderNumber: 'ORD-2025-006',
        customerId: 'cust-10',
        items: [
            { productId: 'prod-1', quantity: 2, unitPrice: 18000, selectedParameters: { velvet_color: 'בורדו חציל', embroidery_color: 'זהב', swarovski: true, kaporet: true } }
        ],
        totalPrice: 36000,
        status: 'IN_PRODUCTION',
        paymentStatus: 'DEPOSIT_PAID',
        depositAmount: 18000,
        dueDate: '2026-02-15',
        createdAt: '2025-12-15',
        notes: '2 פרוכות מפוארות לישיבה'
    },
    {
        id: 'order-7',
        orderNumber: 'ORD-2025-007',
        customerId: 'cust-8',
        items: [{ productId: 'prod-6', quantity: 1, unitPrice: 3500, selectedParameters: { repair_type: 'תיקון קרעים', repair_description: 'פרוכת ישנה שדורשת שיקום' } }],
        totalPrice: 3500,
        status: 'IN_PRODUCTION',
        paymentStatus: 'FULLY_PAID',
        dueDate: '2026-01-10',
        createdAt: '2025-12-22',
        notes: 'תיקון פרוכת עתיקה'
    },
    {
        id: 'order-8',
        orderNumber: 'ORD-2026-001',
        customerId: 'cust-3',
        items: [{ productId: 'prod-2', quantity: 1, unitPrice: 5500, selectedParameters: { velvet_color: 'ירוק', embroidery_color: 'זהב', dedication: 'נתרם ע"י משפחת גולדברג' } }],
        totalPrice: 5500,
        status: 'PENDING_PAYMENT',
        paymentStatus: 'AWAITING_DEPOSIT',
        dueDate: '2026-02-20',
        createdAt: '2025-12-30',
        notes: 'מעיל ירוק עם הקדשה'
    }
];

// ============ MATERIALS ============
const mockMaterials = [
    // Fabrics
    { id: 'mat-1', name: 'קטיפה כחול כהה', nameEn: 'Navy Blue Velvet', code: 'VEL-NAVY', category: 'FABRIC', type: 'velvet', colorHex: '#1e3a5f', supplier: 'טקסטיל ישראל', stockQuantity: 45, stockUnit: 'מטר', reorderLevel: 10, unitCost: 150, salePrice: 250, location: 'A1', isActive: true },
    { id: 'mat-2', name: 'קטיפה בורדו', nameEn: 'Bordeaux Velvet', code: 'VEL-BORD', category: 'FABRIC', type: 'velvet', colorHex: '#722f37', supplier: 'טקסטיל ישראל', stockQuantity: 38, stockUnit: 'מטר', reorderLevel: 10, unitCost: 150, salePrice: 250, location: 'A2', isActive: true },
    { id: 'mat-3', name: 'קטיפה שחורה', nameEn: 'Black Velvet', code: 'VEL-BLACK', category: 'FABRIC', type: 'velvet', colorHex: '#1a1a1a', supplier: 'טקסטיל ישראל', stockQuantity: 52, stockUnit: 'מטר', reorderLevel: 10, unitCost: 140, salePrice: 230, location: 'A3', isActive: true },
    { id: 'mat-4', name: 'קטיפה לבנה', nameEn: 'White Velvet', code: 'VEL-WHITE', category: 'FABRIC', type: 'velvet', colorHex: '#f5f5f5', supplier: 'טקסטיל ישראל', stockQuantity: 25, stockUnit: 'מטר', reorderLevel: 10, unitCost: 160, salePrice: 260, location: 'A4', isActive: true },
    { id: 'mat-5', name: 'קטיפה ירוקה', nameEn: 'Green Velvet', code: 'VEL-GREEN', category: 'FABRIC', type: 'velvet', colorHex: '#2e5939', supplier: 'טקסטיל ישראל', stockQuantity: 18, stockUnit: 'מטר', reorderLevel: 10, unitCost: 155, salePrice: 255, location: 'A5', isActive: true },
    { id: 'mat-6', name: 'קטיפה כחול רויאל', nameEn: 'Royal Blue Velvet', code: 'VEL-ROYAL', category: 'FABRIC', type: 'velvet', colorHex: '#4169e1', supplier: 'טקסטיל ישראל', stockQuantity: 30, stockUnit: 'מטר', reorderLevel: 10, unitCost: 155, salePrice: 255, location: 'A6', isActive: true },
    { id: 'mat-7', name: 'קטיפה חציל בורדו', nameEn: 'Eggplant Burgundy Velvet', code: 'VEL-EGGPLANT', category: 'FABRIC', type: 'velvet', colorHex: '#614051', supplier: 'טקסטיל ישראל', stockQuantity: 22, stockUnit: 'מטר', reorderLevel: 10, unitCost: 160, salePrice: 260, location: 'A7', isActive: true },

    // Threads
    { id: 'mat-10', name: 'חוט רקמה זהב', nameEn: 'Gold Embroidery Thread', code: 'THR-GOLD', category: 'THREAD', type: 'metallic', colorHex: '#ffd700', supplier: 'מדלן', stockQuantity: 150, stockUnit: 'סליל', reorderLevel: 30, unitCost: 45, salePrice: 80, location: 'B1', isActive: true },
    { id: 'mat-11', name: 'חוט רקמה כסף', nameEn: 'Silver Embroidery Thread', code: 'THR-SILVER', category: 'THREAD', type: 'metallic', colorHex: '#c0c0c0', supplier: 'מדלן', stockQuantity: 120, stockUnit: 'סליל', reorderLevel: 30, unitCost: 45, salePrice: 80, location: 'B2', isActive: true },
    { id: 'mat-12', name: 'חוט רקמה לבן', nameEn: 'White Embroidery Thread', code: 'THR-WHITE', category: 'THREAD', type: 'cotton', colorHex: '#ffffff', supplier: 'מדלן', stockQuantity: 200, stockUnit: 'סליל', reorderLevel: 50, unitCost: 25, salePrice: 45, location: 'B3', isActive: true },

    // Accessories
    { id: 'mat-20', name: 'אבני סברובסקי קטנות', nameEn: 'Small Swarovski Stones', code: 'ACC-SWAR-S', category: 'ACCESSORY', type: 'stones', colorHex: '#e8e8e8', supplier: 'קריסטל בע"מ', stockQuantity: 500, stockUnit: 'יחידה', reorderLevel: 100, unitCost: 5, salePrice: 12, location: 'C1', isActive: true },
    { id: 'mat-21', name: 'אבני סברובסקי גדולות', nameEn: 'Large Swarovski Stones', code: 'ACC-SWAR-L', category: 'ACCESSORY', type: 'stones', colorHex: '#e8e8e8', supplier: 'קריסטל בע"מ', stockQuantity: 200, stockUnit: 'יחידה', reorderLevel: 50, unitCost: 12, salePrice: 25, location: 'C2', isActive: true },
    { id: 'mat-22', name: 'טבעות כסף 3 ס"מ', nameEn: 'Silver Rings 3cm', code: 'ACC-RING-S3', category: 'ACCESSORY', type: 'rings', colorHex: '#c0c0c0', supplier: 'אביזרי רקמה', stockQuantity: 80, stockUnit: 'יחידה', reorderLevel: 20, unitCost: 15, salePrice: 30, location: 'C3', isActive: true },
    { id: 'mat-23', name: 'טבעות זהב 3 ס"מ', nameEn: 'Gold Rings 3cm', code: 'ACC-RING-G3', category: 'ACCESSORY', type: 'rings', colorHex: '#ffd700', supplier: 'אביזרי רקמה', stockQuantity: 65, stockUnit: 'יחידה', reorderLevel: 20, unitCost: 18, salePrice: 35, location: 'C4', isActive: true },
    { id: 'mat-24', name: 'פרנזים זהב', nameEn: 'Gold Fringes', code: 'ACC-FRN-GOLD', category: 'ACCESSORY', type: 'fringes', colorHex: '#ffd700', supplier: 'אביזרי רקמה', stockQuantity: 35, stockUnit: 'מטר', reorderLevel: 10, unitCost: 85, salePrice: 150, location: 'C5', isActive: true },
    { id: 'mat-25', name: 'פרנזים כסף', nameEn: 'Silver Fringes', code: 'ACC-FRN-SILV', category: 'ACCESSORY', type: 'fringes', colorHex: '#c0c0c0', supplier: 'אביזרי רקמה', stockQuantity: 28, stockUnit: 'מטר', reorderLevel: 10, unitCost: 85, salePrice: 150, location: 'C6', isActive: true },

    // Backing
    { id: 'mat-30', name: 'בטנה לבנה', nameEn: 'White Backing', code: 'BAK-WHITE', category: 'BACKING', type: 'lining', colorHex: '#ffffff', supplier: 'טקסטיל ישראל', stockQuantity: 60, stockUnit: 'מטר', reorderLevel: 15, unitCost: 35, salePrice: 60, location: 'D1', isActive: true },
    { id: 'mat-31', name: 'ספוג 5 מ"מ', nameEn: 'Sponge 5mm', code: 'BAK-SPNG-5', category: 'BACKING', type: 'sponge', colorHex: '#f0f0f0', supplier: 'ספוגים בע"מ', stockQuantity: 40, stockUnit: 'מטר', reorderLevel: 10, unitCost: 25, salePrice: 45, location: 'D2', isActive: true },
    { id: 'mat-32', name: 'ספוג 10 מ"מ', nameEn: 'Sponge 10mm', code: 'BAK-SPNG-10', category: 'BACKING', type: 'sponge', colorHex: '#f0f0f0', supplier: 'ספוגים בע"מ', stockQuantity: 25, stockUnit: 'מטר', reorderLevel: 10, unitCost: 35, salePrice: 60, location: 'D3', isActive: true }
];

// ============ WORKFLOWS ============
const mockWorkflows = [
    {
        id: '1',
        name: 'תהליך ייצור פרוכת',
        code: 'PAROCHET_FULL',
        type: 'PRODUCTION',
        description: 'תהליך מלא לייצור פרוכת רקומה',
        estimatedDays: 45,
        isActive: true,
        steps: [
            { id: 'step-1-1', name: 'קליטת הזמנה ואישור עיצוב', stepOrder: 1, departmentId: '1', estimatedDurationDays: 2, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-1-2', name: 'הכנת קובץ רקמה', stepOrder: 2, departmentId: '1', estimatedDurationDays: 3, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-1-3', name: 'הזמנת חומרים', stepOrder: 3, departmentId: '5', estimatedDurationDays: 5, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-1-4', name: 'חיתוך בד', stepOrder: 4, departmentId: '3', estimatedDurationDays: 1, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-1-5', name: 'רקמה ראשית', stepOrder: 5, departmentId: '2', estimatedDurationDays: 10, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-1-6', name: 'רקמת פרטים', stepOrder: 6, departmentId: '2', estimatedDurationDays: 5, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-1-7', name: 'הדבקת אבנים', stepOrder: 7, departmentId: '2', estimatedDurationDays: 3, isActive: true, isOptional: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-1-8', name: 'תפירת בטנה', stepOrder: 8, departmentId: '3', estimatedDurationDays: 2, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-1-9', name: 'תפירת פרנזים וטבעות', stepOrder: 9, departmentId: '3', estimatedDurationDays: 2, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-1-10', name: 'בקרת איכות', stepOrder: 10, departmentId: '4', estimatedDurationDays: 1, isActive: true, assignmentType: 'SPECIFIC_ROLE', assignToRole: 'MANAGER' },
            { id: 'step-1-11', name: 'אריזה ומשלוח', stepOrder: 11, departmentId: '5', estimatedDurationDays: 2, isActive: true, assignmentType: 'AUTO_DEPARTMENT' }
        ]
    },
    {
        id: '2',
        name: 'תהליך ייצור מעיל',
        code: 'MEIL_STD',
        type: 'PRODUCTION',
        description: 'תהליך ייצור מעיל לספר תורה',
        estimatedDays: 25,
        isActive: true,
        steps: [
            { id: 'step-2-1', name: 'אישור עיצוב', stepOrder: 1, departmentId: '1', estimatedDurationDays: 2, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-2-2', name: 'הכנת קובץ רקמה', stepOrder: 2, departmentId: '1', estimatedDurationDays: 2, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-2-3', name: 'חיתוך ורקמה', stepOrder: 3, departmentId: '2', estimatedDurationDays: 8, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-2-4', name: 'תפירה וגימור', stepOrder: 4, departmentId: '3', estimatedDurationDays: 4, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-2-5', name: 'בקרת איכות', stepOrder: 5, departmentId: '4', estimatedDurationDays: 1, isActive: true, assignmentType: 'SPECIFIC_ROLE', assignToRole: 'MANAGER' },
            { id: 'step-2-6', name: 'אריזה', stepOrder: 6, departmentId: '5', estimatedDurationDays: 1, isActive: true, assignmentType: 'AUTO_DEPARTMENT' }
        ]
    },
    {
        id: '3',
        name: 'תהליך ייצור כיסוי בימה',
        code: 'BIMA_STD',
        type: 'PRODUCTION',
        description: 'תהליך ייצור כיסוי לבימה ועמוד',
        estimatedDays: 35,
        isActive: true,
        steps: [
            { id: 'step-3-1', name: 'מדידות ואישור', stepOrder: 1, departmentId: '1', estimatedDurationDays: 3, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-3-2', name: 'עיצוב והכנת קבצים', stepOrder: 2, departmentId: '1', estimatedDurationDays: 3, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-3-3', name: 'רקמה', stepOrder: 3, departmentId: '2', estimatedDurationDays: 12, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-3-4', name: 'תפירה והרכבה', stepOrder: 4, departmentId: '3', estimatedDurationDays: 6, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-3-5', name: 'בקרת איכות', stepOrder: 5, departmentId: '4', estimatedDurationDays: 1, isActive: true, assignmentType: 'SPECIFIC_ROLE', assignToRole: 'MANAGER' },
            { id: 'step-3-6', name: 'אריזה ומשלוח', stepOrder: 6, departmentId: '5', estimatedDurationDays: 2, isActive: true, assignmentType: 'AUTO_DEPARTMENT' }
        ]
    },
    {
        id: '4',
        name: 'תהליך ייצור כיסוי טלית',
        code: 'TALIT_STD',
        type: 'PRODUCTION',
        description: 'תהליך מהיר לכיסוי טלית ותפילין',
        estimatedDays: 10,
        isActive: true,
        steps: [
            { id: 'step-4-1', name: 'אישור שם ועיצוב', stepOrder: 1, departmentId: '1', estimatedDurationDays: 1, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-4-2', name: 'רקמה', stepOrder: 2, departmentId: '2', estimatedDurationDays: 3, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-4-3', name: 'תפירה וגימור', stepOrder: 3, departmentId: '3', estimatedDurationDays: 2, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-4-4', name: 'אריזה', stepOrder: 4, departmentId: '5', estimatedDurationDays: 1, isActive: true, assignmentType: 'AUTO_DEPARTMENT' }
        ]
    },
    {
        id: '5',
        name: 'תהליך תיקון',
        code: 'REPAIR',
        type: 'PRODUCTION',
        description: 'תהליך תיקון ושיקום',
        estimatedDays: 14,
        isActive: true,
        steps: [
            { id: 'step-5-1', name: 'הערכת מצב', stepOrder: 1, departmentId: '4', estimatedDurationDays: 1, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-5-2', name: 'תיקון/שיקום', stepOrder: 2, departmentId: '3', estimatedDurationDays: 7, isActive: true, assignmentType: 'AUTO_DEPARTMENT' },
            { id: 'step-5-3', name: 'בקרת איכות', stepOrder: 3, departmentId: '4', estimatedDurationDays: 1, isActive: true, assignmentType: 'SPECIFIC_ROLE', assignToRole: 'MANAGER' },
            { id: 'step-5-4', name: 'החזרה ללקוח', stepOrder: 4, departmentId: '5', estimatedDurationDays: 1, isActive: true, assignmentType: 'AUTO_DEPARTMENT' }
        ]
    }
];

// ============ TASKS ============
const mockTasks = [
    { id: 'task-1', title: 'עיצוב רקמה - פרוכת בית הכנסת הגדול', orderId: 'order-6', status: 'IN_PROGRESS', priority: 'HIGH', departmentId: '1', assignedToId: 'user-3', dueDate: '2026-01-05', createdAt: '2025-12-15' },
    { id: 'task-2', title: 'רקמה ראשית - הזמנה ORD-2025-003', orderId: 'order-3', status: 'IN_PROGRESS', priority: 'HIGH', departmentId: '2', assignedToId: 'user-4', dueDate: '2026-01-10', createdAt: '2025-12-20' },
    { id: 'task-3', title: 'תפירת בטנה - מעיל קהילת בית ישראל', orderId: 'order-2', status: 'PENDING', priority: 'MEDIUM', departmentId: '3', assignedToId: 'user-6', dueDate: '2026-01-12', createdAt: '2025-12-22' },
    { id: 'task-4', title: 'בקרת איכות - תיקון פרוכת', orderId: 'order-7', status: 'PENDING', priority: 'MEDIUM', departmentId: '4', assignedToId: 'user-8', dueDate: '2026-01-08', createdAt: '2025-12-25' },
    { id: 'task-5', title: 'הכנת משלוח - הזמנה לניו יורק', orderId: 'order-4', status: 'BLOCKED', priority: 'LOW', departmentId: '5', assignedToId: 'user-9', dueDate: '2026-02-05', createdAt: '2025-12-28', blockedReason: 'ממתין לתשלום' },
    { id: 'task-6', title: 'הדבקת אבני סברובסקי - ישיבת פונוביז', orderId: 'order-6', status: 'PENDING', priority: 'HIGH', departmentId: '2', assignedToId: 'user-5', dueDate: '2026-01-15', createdAt: '2025-12-28' },
    { id: 'task-7', title: 'חיתוך בד קטיפה ירוקה', orderId: 'order-8', status: 'PENDING', priority: 'MEDIUM', departmentId: '3', assignedToId: 'user-7', dueDate: '2026-01-20', createdAt: '2025-12-30' },
    { id: 'task-8', title: 'עדכון עיצוב לפי בקשת לקוח', orderId: 'order-3', status: 'IN_PROGRESS', priority: 'URGENT', departmentId: '1', assignedToId: 'user-2', dueDate: '2026-01-02', createdAt: '2025-12-31' }
];

// ============ SAVE TO LOCALSTORAGE ============
function seedData() {
    localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
    localStorage.setItem('mockDepartments', JSON.stringify(mockDepartments));
    localStorage.setItem('mockCustomers', JSON.stringify(mockCustomers));
    localStorage.setItem('mockProducts', JSON.stringify(mockProducts));
    localStorage.setItem('mockLeads', JSON.stringify(mockLeads));
    localStorage.setItem('mockOrders', JSON.stringify(mockOrders));
    localStorage.setItem('mockMaterials', JSON.stringify(mockMaterials));
    localStorage.setItem('mockWorkflows', JSON.stringify(mockWorkflows));
    localStorage.setItem('mockTasks', JSON.stringify(mockTasks));

    console.log('✅ Demo data seeded successfully!');
    console.log(`   - ${mockUsers.length} users`);
    console.log(`   - ${mockDepartments.length} departments`);
    console.log(`   - ${mockCustomers.length} customers`);
    console.log(`   - ${mockProducts.length} products`);
    console.log(`   - ${mockLeads.length} leads`);
    console.log(`   - ${mockOrders.length} orders`);
    console.log(`   - ${mockMaterials.length} materials`);
    console.log(`   - ${mockWorkflows.length} workflows`);
    console.log(`   - ${mockTasks.length} tasks`);
}

// Export for Node.js or run in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { seedData, mockUsers, mockDepartments, mockCustomers, mockProducts, mockLeads, mockOrders, mockMaterials, mockWorkflows, mockTasks };
} else {
    seedData();
}
