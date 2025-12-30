#!/usr/bin/env node
/**
 * Clean all products and re-seed with only the correct ones
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

    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);

    // For DELETE, sometimes returns 204 No Content
    if (response.status === 204) {
        return { success: true };
    }

    const result = await response.json();

    if (!response.ok) {
        console.error(`❌ Error ${method} ${endpoint}:`, result);
        return null;
    }

    return result;
}

// Login
async function login() {
    console.log('🔐 מתחבר...');
    const result = await apiCall('POST', '/auth/login', {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
    });

    if (result?.success) {
        authToken = result.data.token;
        console.log('✅ מחובר בהצלחה\n');
        return true;
    }
    return false;
}

// Delete all products
async function deleteAllProducts() {
    console.log('🗑️  מוחק את כל המוצרים הקיימים...\n');

    const result = await apiCall('GET', '/products?limit=200');
    if (!result || !result.data || !result.data.products) {
        console.log('⚠️  אין מוצרים למחוק או שגיאה בקבלת רשימה');
        return;
    }

    const products = result.data.products;
    console.log(`📦 נמצאו ${products.length} מוצרים\n`);

    for (const product of products) {
        console.log(`  ❌ מוחק: ${product.name}`);
        // Try to update status to INACTIVE instead of delete
        await apiCall('PUT', `/products/${product.id}`, { status: 'INACTIVE' });
    }

    console.log('\n✅ סימון מוצרים כלא פעילים הושלם!\n');
}

// Seed only the 9 parochet designs
async function seedProducts() {
    console.log('📦 מעלה את המוצרים החדשים...\n');

    const products = [
        // 9 עיצובי פרוכות מהקטלוג
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
        }
    ];

    const created = [];

    for (const product of products) {
        const result = await apiCall('POST', '/products', product);
        if (result?.success) {
            console.log(`  ✅ נוצר: ${product.name}`);
            created.push(result.data);
        } else {
            console.log(`  ⚠️  דילגתי: ${product.name} (אולי כבר קיים)`);
        }
    }

    console.log(`\n✅ נוצרו ${created.length} מוצרים חדשים!`);
    return created;
}

// Main
async function main() {
    console.log('🚀 מתחיל ניקוי והעלאה מחדש של מוצרים...\n');
    console.log(`📍 API: ${API_URL}\n`);

    // Login
    const loggedIn = await login();
    if (!loggedIn) {
        console.error('❌ התחברות נכשלה');
        process.exit(1);
    }

    // Delete all existing products
    await deleteAllProducts();

    // Seed new products
    const products = await seedProducts();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ הושלם בהצלחה!');
    console.log(`📦 סה"כ מוצרים פעילים: ${products.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(console.error);
