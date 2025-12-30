#!/usr/bin/env node
/**
 * Seed Script - Push Mock Data to Real API
 * Run with: node scripts/seed-api.js
 */

const API_URL = 'https://crm-api.app.mottidokib.com';
const ADMIN_EMAIL = 'admin@yoel.com';
const ADMIN_PASSWORD = 'Admin1234';

let authToken = null;

// Helper function for API calls
async function apiCall(method, endpoint, data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
        console.error(`❌ Error ${method} ${endpoint}:`, result);
        return null;
    }

    return result;
}

// Login and get token
async function login() {
    console.log('🔐 Logging in...');
    const result = await apiCall('POST', '/auth/login', {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
    });

    if (result?.success) {
        authToken = result.data.token;
        console.log('✅ Logged in as:', result.data.user.email);
        return true;
    }
    return false;
}

// ============ DEPARTMENTS ============
const departments = [
    {
        name: 'עיצוב רקמה',
        code: 'EMBROIDERY_DESIGN',
        description: 'מחלקת עיצוב רקמה - באוקראינה',
        color: '#667eea'
    },
    {
        name: 'חיתוך',
        code: 'CUTTING',
        description: 'מחלקת חיתוך בדים',
        color: '#f5576c'
    },
    {
        name: 'תפירה',
        code: 'SEWING',
        description: 'מחלקת תפירה וגימור',
        color: '#4facfe'
    },
    {
        name: 'איכות',
        code: 'QA',
        description: 'מחלקת בקרת איכות',
        color: '#00f2fe'
    },
    {
        name: 'אריזה',
        code: 'PACKAGING',
        description: 'מחלקת אריזה ומשלוחים',
        color: '#fee140'
    },
    {
        name: 'מפעל ייצור',
        code: 'PRODUCTION',
        description: 'מפעל ייצור - באוקראינה',
        color: '#a855f7'
    }
];

async function seedDepartments() {
    console.log('\n📦 Seeding Departments...');
    const created = [];

    for (const dept of departments) {
        const result = await apiCall('POST', '/departments', dept);
        if (result?.success) {
            console.log(`  ✅ Created department: ${dept.name}`);
            created.push(result.data);
        } else {
            console.log(`  ⚠️ Skipped (may exist): ${dept.name}`);
        }
    }

    // Fetch all departments to get their IDs
    const allDepts = await apiCall('GET', '/departments?limit=100');
    return allDepts?.data?.departments || created;
}

// ============ CUSTOMERS ============
const customers = [
    {
        name: 'בית הכנסת הגדול',
        email: 'contact@bigshul.org',
        phone: '03-1234567',
        companyName: 'עמותת בית הכנסת הגדול',
        status: 'ACTIVE'
    },
    {
        name: 'קהילת אור חדש',
        email: 'info@orchadash.com',
        phone: '02-9876543',
        companyName: 'קהילת אור חדש ירושלים',
        status: 'ACTIVE'
    },
    {
        name: 'בית מדרש תורה ותפילה',
        email: 'office@torahtefila.org',
        phone: '04-5551234',
        companyName: 'בית מדרש תורה ותפילה חיפה',
        status: 'ACTIVE'
    },
    {
        name: 'ישיבת נתיבות התורה',
        email: 'admin@netivot.edu',
        phone: '08-6667777',
        companyName: 'ישיבת נתיבות התורה באר שבע',
        status: 'ACTIVE'
    },
    {
        name: 'עמותת שערי רחמים',
        email: 'contact@shaarei.org',
        phone: '09-8889999',
        companyName: 'עמותת שערי רחמים נתניה',
        status: 'INACTIVE'
    }
];

async function seedCustomers() {
    console.log('\n👥 Seeding Customers...');
    const created = [];

    for (const customer of customers) {
        const result = await apiCall('POST', '/customers', customer);
        if (result?.success) {
            console.log(`  ✅ Created customer: ${customer.name}`);
            created.push(result.data);
        } else {
            console.log(`  ⚠️ Skipped (may exist): ${customer.name}`);
        }
    }

    // Fetch all customers
    const allCustomers = await apiCall('GET', '/customers?limit=100');
    return allCustomers?.data?.customers || created;
}

// ============ PRODUCTS ============
const products = [
    // פרוכות - 9 עיצובים מהקטלוג
    {
        name: 'פרוכת כתר זהב - עיצוב קלאסי',
        sku: 'PAR-B1Z0',
        description: 'פרוכת מהודרת עם כתר זהב ועיטורים קלאסיים - עיצוב B1Z0/A1Z0/BW1Z0',
        price: 15000,
        stockQuantity: 5,
        category: 'RITUAL',
        status: 'ACTIVE'
    },
    {
        name: 'פרוכת ירושלים עזול - עיצוב מודרני',
        sku: 'PAR-B1Z1',
        description: 'פרוכת בעיצוב מודרני עם מעגל מעוצב ורקמות צבעוניות - עיצוב B1Z1/A1Z1/BW1Z1',
        price: 16000,
        stockQuantity: 4,
        category: 'RITUAL',
        status: 'ACTIVE'
    },
    {
        name: 'פרוכת מסגרת מלכות - עיצוב שחור זהב',
        sku: 'PAR-B1Z2',
        description: 'פרוכת מפוארת בעיצוב שחור-זהב עם כתר מלכותי - עיצוב B1Z2/A1Z2/BW1Z2',
        price: 17500,
        stockQuantity: 3,
        category: 'RITUAL',
        status: 'ACTIVE'
    },
    {
        name: 'פרוכת שער וילנא וקמה מלאה - בית מקדש',
        sku: 'PAR-B1Z3',
        description: 'פרוכת ייחודית עם עיטורי בית המקדש ושערים מעוצבים - עיצוב B1Z3/A1Z3/BW1Z3',
        price: 18000,
        stockQuantity: 2,
        category: 'RITUAL',
        status: 'ACTIVE'
    },
    {
        name: 'פרוכת עץ חיים - עיצוב טבעי',
        sku: 'PAR-B1Z4',
        description: 'פרוכת עם עיצוב עץ החיים ועלים מרהיבים - עיצוב B1Z4/A1Z4/BW1Z4',
        price: 16500,
        stockQuantity: 4,
        category: 'RITUAL',
        status: 'ACTIVE'
    },
    {
        name: 'פרוכת כתר ואבני חברובסקי - עיצוב מפואר',
        sku: 'PAR-B1Z5',
        description: 'פרוכת יוקרתית עם כתר ועיטורי דמשק מעודנים - עיצוב B1Z5/A1Z5/BW1Z5',
        price: 19000,
        stockQuantity: 2,
        category: 'RITUAL',
        status: 'ACTIVE'
    },
    {
        name: 'פרוכת שער וילנא תחום - עיצוב מסורתי',
        sku: 'PAR-B1Z6',
        description: 'פרוכת בעיצוב מסורתי עם מסגרת מעוצבת ושער מרכזי - עיצוב B1Z6/A1Z6/BW1Z6',
        price: 17000,
        stockQuantity: 3,
        category: 'RITUAL',
        status: 'ACTIVE'
    },
    {
        name: 'פרוכת בית מקדש וקמה מלאה - עיצוב מיוחד',
        sku: 'PAR-B1Z7',
        description: 'פרוכת מרשימה עם תיאור בית המקדש המפואר - עיצוב B1Z7/A1Z7/BW1Z7',
        price: 22000,
        stockQuantity: 1,
        category: 'RITUAL',
        status: 'ACTIVE'
    },
    {
        name: 'פרוכת כינת שער צבי - עיצוב אלגנטי',
        sku: 'PAR-B1Z8',
        description: 'פרוכת אלגנטית עם כתר ועיטורים מעודנים בפינות - עיצוב B1Z8/A1Z8/BW1Z8',
        price: 17500,
        stockQuantity: 3,
        category: 'RITUAL',
        status: 'ACTIVE'
    },
    {
        name: 'פרוכת שער והרחמים - עיצוב גיאומטרי',
        sku: 'PAR-B1Z9',
        description: 'פרוכת בעיצוב גיאומטרי ייחודי עם כתר מרכזי - עיצוב B1Z9/A1Z9/BW1Z9',
        price: 18500,
        stockQuantity: 2,
        category: 'RITUAL',
        status: 'ACTIVE'
    },

    // מוצרים אחרים
    {
        name: 'מעיל לספר תורה',
        sku: 'MEI-001',
        description: 'מעיל מפואר לספר תורה עם רקמות זהב',
        price: 8000,
        stockQuantity: 5,
        category: 'RITUAL',
        status: 'ACTIVE'
    },
    {
        name: 'כיסוי לבימה',
        sku: 'BIM-001',
        description: 'כיסוי מהודר לבימה עם עיטורים',
        price: 5000,
        stockQuantity: 8,
        category: 'FURNITURE',
        status: 'ACTIVE'
    },
    {
        name: 'טלית מהודרת',
        sku: 'TAL-001',
        description: 'טלית גדול עם עטרה מרוקמת',
        price: 2500,
        stockQuantity: 20,
        category: 'PERSONAL',
        status: 'ACTIVE'
    },
    {
        name: 'כתר לספר תורה',
        sku: 'KET-001',
        description: 'כתר מפואר לספר תורה',
        price: 25000,
        stockQuantity: 1,
        category: 'RITUAL',
        status: 'ACTIVE'
    },
    {
        name: 'רימונים לספר תורה',
        sku: 'RIM-001',
        description: 'זוג רימונים מעוצבים',
        price: 12000,
        stockQuantity: 2,
        category: 'RITUAL',
        status: 'ACTIVE'
    }
];

async function seedProducts() {
    console.log('\n📦 Seeding Products...');
    const created = [];

    for (const product of products) {
        const result = await apiCall('POST', '/products', product);
        if (result?.success) {
            console.log(`  ✅ Created product: ${product.name}`);
            created.push(result.data);
        } else {
            console.log(`  ⚠️ Skipped (may exist): ${product.name}`);
        }
    }

    // Fetch all products
    const allProducts = await apiCall('GET', '/products?limit=100');
    return allProducts?.data?.products || created;
}

// ============ PARAMETERS ============
const parameters = [
    // עיצוב פרוכת
    {
        name: 'עיצוב פרוכת',
        code: 'parochet_design',
        type: 'SELECT',
        description: 'בחר עיצוב פרוכת',
        isRequired: true,
        options: [
            { value: 'design_b1z0', label: 'כתר זהב - קלאסי', priceImpact: 0, sortOrder: 1 },
            { value: 'design_b1z1', label: 'ירושלים עזול - מודרני', priceImpact: 1000, sortOrder: 2 },
            { value: 'design_b1z2', label: 'מסגרת מלכות - שחור זהב', priceImpact: 2500, sortOrder: 3 },
            { value: 'design_b1z3', label: 'שער וילנא - בית מקדש', priceImpact: 3000, sortOrder: 4 },
            { value: 'design_b1z4', label: 'עץ חיים - טבעי', priceImpact: 1500, sortOrder: 5 },
            { value: 'design_b1z5', label: 'כתר ואבני חברובסקי - מפואר', priceImpact: 4000, sortOrder: 6 },
            { value: 'design_b1z6', label: 'שער וילנא תחום - מסורתי', priceImpact: 2000, sortOrder: 7 },
            { value: 'design_b1z7', label: 'בית מקדש וקמה מלאה', priceImpact: 7000, sortOrder: 8 },
            { value: 'design_b1z8', label: 'כינת שער צבי - אלגנטי', priceImpact: 2500, sortOrder: 9 },
            { value: 'design_b1z9', label: 'שער והרחמים - גיאומטרי', priceImpact: 3500, sortOrder: 10 }
        ]
    },
    // גודל פרוכת
    {
        name: 'גודל פרוכת',
        code: 'parochet_size',
        type: 'SELECT',
        description: 'בחר גודל פרוכת (ביזה/איזה/בוויזה)',
        isRequired: true,
        options: [
            { value: 'size_biza', label: 'ביזה (B1Z*)', priceImpact: 0, sortOrder: 1 },
            { value: 'size_aiza', label: 'איזה (A1Z*)', priceImpact: -2000, sortOrder: 2 },
            { value: 'size_bwiza', label: 'בוויזה (BW1Z*)', priceImpact: 3000, sortOrder: 3 }
        ]
    },
    // צבע רקמה
    {
        name: 'צבע רקמה',
        code: 'embroidery_color',
        type: 'COLOR',
        description: 'בחר צבע לרקמה',
        isRequired: true,
        options: [
            { value: 'gold', label: 'זהב', priceImpact: 500, colorHex: '#FFD700', sortOrder: 1 },
            { value: 'silver', label: 'כסף', priceImpact: 300, colorHex: '#C0C0C0', sortOrder: 2 },
            { value: 'white', label: 'לבן', priceImpact: 0, colorHex: '#FFFFFF', sortOrder: 3 },
            { value: 'multicolor', label: 'צבעוני', priceImpact: 800, colorHex: '#FF6B6B', sortOrder: 4 }
        ]
    },
    // סוג בד
    {
        name: 'סוג בד',
        code: 'fabric_type',
        type: 'SELECT',
        description: 'בחר סוג בד',
        isRequired: true,
        options: [
            { value: 'velvet_blue_dark', label: 'קטיפה כחולה כהה', priceImpact: 0, colorHex: '#00008B', sortOrder: 1 },
            { value: 'velvet_black', label: 'קטיפה שחורה', priceImpact: 200, colorHex: '#000000', sortOrder: 2 },
            { value: 'velvet_white', label: 'קטיפה לבנה', priceImpact: 200, colorHex: '#FFFFF0', sortOrder: 3 },
            { value: 'velvet_gold', label: 'קטיפה זהובה', priceImpact: 400, colorHex: '#DAA520', sortOrder: 4 },
            { value: 'silk', label: 'משי', priceImpact: 1000, colorHex: '#F5F5DC', sortOrder: 5 }
        ]
    },
    // טקסט לרקמה
    {
        name: 'טקסט לרקמה',
        code: 'embroidery_text',
        type: 'TEXT',
        description: 'הזן טקסט מותאם אישית לרקמה',
        isRequired: false,
        options: []
    },
    // פרנזים (גדילים)
    {
        name: 'סוג פרנזים',
        code: 'fringe_type',
        type: 'SELECT',
        description: 'בחר סוג גדילים/פרנזים',
        isRequired: true,
        options: [
            { value: 'fringe_gold', label: 'פרנזים זהב', priceImpact: 500, sortOrder: 1 },
            { value: 'fringe_silver', label: 'פרנזים כסף', priceImpact: 400, sortOrder: 2 },
            { value: 'fringe_white', label: 'פרנזים לבן', priceImpact: 300, sortOrder: 3 },
            { value: 'no_fringe', label: 'ללא פרנזים', priceImpact: -500, sortOrder: 4 }
        ]
    },
    // גודל כללי (למוצרים אחרים)
    {
        name: 'גודל',
        code: 'size',
        type: 'SELECT',
        description: 'בחר גודל',
        isRequired: true,
        options: [
            { value: 'small', label: 'קטן', priceImpact: -500, sortOrder: 1 },
            { value: 'medium', label: 'בינוני', priceImpact: 0, sortOrder: 2 },
            { value: 'large', label: 'גדול', priceImpact: 800, sortOrder: 3 },
            { value: 'xl', label: 'גדול מאוד', priceImpact: 1500, sortOrder: 4 }
        ]
    }
];

async function seedParameters() {
    console.log('\n⚙️ Seeding Parameters...');
    const created = [];

    for (const param of parameters) {
        const result = await apiCall('POST', '/parameters', param);
        if (result?.success) {
            console.log(`  ✅ Created parameter: ${param.name}`);
            created.push(result.data);
        } else {
            console.log(`  ⚠️ Skipped (may exist): ${param.name}`);
        }
    }

    // Fetch all parameters
    const allParams = await apiCall('GET', '/parameters?limit=100');
    return allParams?.data?.parameters || created;
}

// ============ WORKFLOWS ============
async function seedWorkflows(deptMap) {
    console.log('\n🔄 Seeding Workflows...');

    const workflows = [
        {
            name: 'תהליך פרוכת',
            code: 'PAROCHET_WF',
            description: 'תהליך ייצור פרוכת מלא'
        },
        {
            name: 'תהליך מעיל',
            code: 'MEIL_WF',
            description: 'תהליך ייצור מעיל לספר תורה'
        },
        {
            name: 'תהליך כיסוי בימה',
            code: 'BIMA_WF',
            description: 'תהליך ייצור כיסוי בימה'
        },
        {
            name: 'תהליך טלית',
            code: 'TALIT_WF',
            description: 'תהליך ייצור טלית'
        }
    ];

    const created = [];

    for (const wf of workflows) {
        const result = await apiCall('POST', '/workflows', wf);
        if (result?.success) {
            console.log(`  ✅ Created workflow: ${wf.name}`);
            created.push(result.data);
        } else {
            console.log(`  ⚠️ Skipped (may exist): ${wf.name}`);
        }
    }

    // Fetch all workflows
    const allWfs = await apiCall('GET', '/workflows?limit=100');
    const workflowList = allWfs?.data?.workflows || created;

    // Add steps to workflows if we have department mapping
    if (deptMap && Object.keys(deptMap).length > 0) {
        console.log('\n📋 Adding Workflow Steps...');

        for (const wf of workflowList) {
            if (wf.code === 'PAROCHET_WF') {
                const steps = [
                    { name: 'חיתוך בד', departmentId: deptMap['CUTTING'], estimatedDurationDays: 1, sortOrder: 1 },
                    { name: 'רקמה ראשית', departmentId: deptMap['EMBROIDERY_DESIGN'], estimatedDurationDays: 5, sortOrder: 2 },
                    { name: 'תפירה וגימור', departmentId: deptMap['SEWING'], estimatedDurationDays: 2, sortOrder: 3 },
                    { name: 'בקרת איכות', departmentId: deptMap['QA'], estimatedDurationDays: 1, sortOrder: 4 },
                    { name: 'אריזה', departmentId: deptMap['PACKAGING'], estimatedDurationDays: 1, sortOrder: 5 }
                ];

                for (const step of steps) {
                    if (step.departmentId) {
                        await apiCall('POST', `/workflows/${wf.id}/steps`, step);
                        console.log(`    ✅ Added step: ${step.name} to ${wf.name}`);
                    }
                }
            }

            if (wf.code === 'MEIL_WF') {
                const steps = [
                    { name: 'חיתוך בד', departmentId: deptMap['CUTTING'], estimatedDurationDays: 1, sortOrder: 1 },
                    { name: 'רקמה', departmentId: deptMap['EMBROIDERY_DESIGN'], estimatedDurationDays: 3, sortOrder: 2 },
                    { name: 'תפירה', departmentId: deptMap['SEWING'], estimatedDurationDays: 2, sortOrder: 3 },
                    { name: 'בקרת איכות', departmentId: deptMap['QA'], estimatedDurationDays: 1, sortOrder: 4 }
                ];

                for (const step of steps) {
                    if (step.departmentId) {
                        await apiCall('POST', `/workflows/${wf.id}/steps`, step);
                        console.log(`    ✅ Added step: ${step.name} to ${wf.name}`);
                    }
                }
            }

            if (wf.code === 'BIMA_WF') {
                const steps = [
                    { name: 'חיתוך', departmentId: deptMap['CUTTING'], estimatedDurationDays: 1, sortOrder: 1 },
                    { name: 'רקמה', departmentId: deptMap['EMBROIDERY_DESIGN'], estimatedDurationDays: 2, sortOrder: 2 },
                    { name: 'תפירה', departmentId: deptMap['SEWING'], estimatedDurationDays: 1, sortOrder: 3 }
                ];

                for (const step of steps) {
                    if (step.departmentId) {
                        await apiCall('POST', `/workflows/${wf.id}/steps`, step);
                        console.log(`    ✅ Added step: ${step.name} to ${wf.name}`);
                    }
                }
            }

            if (wf.code === 'TALIT_WF') {
                const steps = [
                    { name: 'חיתוך', departmentId: deptMap['CUTTING'], estimatedDurationDays: 1, sortOrder: 1 },
                    { name: 'רקמת עטרה', departmentId: deptMap['EMBROIDERY_DESIGN'], estimatedDurationDays: 1, sortOrder: 2 },
                    { name: 'תפירה', departmentId: deptMap['SEWING'], estimatedDurationDays: 1, sortOrder: 3 }
                ];

                for (const step of steps) {
                    if (step.departmentId) {
                        await apiCall('POST', `/workflows/${wf.id}/steps`, step);
                        console.log(`    ✅ Added step: ${step.name} to ${wf.name}`);
                    }
                }
            }
        }
    }

    return workflowList;
}

// ============ ORDERS ============
async function seedOrders(customerList, productList) {
    console.log('\n🛒 Seeding Orders...');

    if (!customerList.length || !productList.length) {
        console.log('  ⚠️ No customers or products to create orders');
        return [];
    }

    // Map products by SKU
    const productBySku = {};
    for (const p of productList) {
        productBySku[p.sku] = p;
    }

    // Map customers by email
    const customerByEmail = {};
    for (const c of customerList) {
        customerByEmail[c.email] = c;
    }

    const orders = [
        {
            customerId: customerByEmail['contact@bigshul.org']?.id,
            items: [
                { productId: productBySku['PAR-001']?.id, quantity: 1, unitPrice: 15000 },
                { productId: productBySku['MEI-001']?.id, quantity: 1, unitPrice: 8000 }
            ],
            notes: 'להכין לפני חג הפסח'
        },
        {
            customerId: customerByEmail['info@orchadash.com']?.id,
            items: [
                { productId: productBySku['PAR-001']?.id, quantity: 1, unitPrice: 15000 }
            ],
            notes: ''
        },
        {
            customerId: customerByEmail['admin@netivot.edu']?.id,
            items: [
                { productId: productBySku['KET-001']?.id, quantity: 1, unitPrice: 25000 },
                { productId: productBySku['MEI-001']?.id, quantity: 1, unitPrice: 8000 }
            ],
            notes: 'הזמנה מיוחדת'
        },
        {
            customerId: customerByEmail['office@torahtefila.org']?.id,
            items: [
                { productId: productBySku['BIM-001']?.id, quantity: 1, unitPrice: 5000 },
                { productId: productBySku['TAL-001']?.id, quantity: 2, unitPrice: 2500 }
            ],
            notes: ''
        }
    ];

    const created = [];

    for (const order of orders) {
        // Filter out items with missing product IDs
        order.items = order.items.filter(item => item.productId);

        if (order.customerId && order.items.length > 0) {
            const result = await apiCall('POST', '/orders', order);
            if (result?.success) {
                console.log(`  ✅ Created order for customer: ${order.customerId}`);
                created.push(result.data);
            } else {
                console.log(`  ⚠️ Failed to create order`);
            }
        }
    }

    return created;
}

// ============ MAIN ============
async function main() {
    console.log('🚀 Starting API Seed Process...');
    console.log(`📍 API URL: ${API_URL}\n`);

    // Login first
    const loggedIn = await login();
    if (!loggedIn) {
        console.error('❌ Failed to login. Exiting.');
        process.exit(1);
    }

    // Seed departments first
    const deptList = await seedDepartments();
    const deptMap = {};
    for (const dept of deptList) {
        deptMap[dept.code] = dept.id;
    }
    console.log(`  📊 Total departments: ${deptList.length}`);

    // Seed customers
    const customerList = await seedCustomers();
    console.log(`  📊 Total customers: ${customerList.length}`);

    // Seed products
    const productList = await seedProducts();
    console.log(`  📊 Total products: ${productList.length}`);

    // Seed parameters
    const paramList = await seedParameters();
    console.log(`  📊 Total parameters: ${paramList.length}`);

    // Seed workflows with steps
    const workflowList = await seedWorkflows(deptMap);
    console.log(`  📊 Total workflows: ${workflowList.length}`);

    // Seed orders
    const orderList = await seedOrders(customerList, productList);
    console.log(`  📊 Total orders: ${orderList.length}`);

    console.log('\n✅ Seeding complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Summary:');
    console.log(`  • Departments: ${deptList.length}`);
    console.log(`  • Customers: ${customerList.length}`);
    console.log(`  • Products: ${productList.length}`);
    console.log(`  • Parameters: ${paramList.length}`);
    console.log(`  • Workflows: ${workflowList.length}`);
    console.log(`  • Orders: ${orderList.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(console.error);
