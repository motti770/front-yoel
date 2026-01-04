/**
 * Upload Mock Data to Real Server
 * Run: node scripts/upload-to-server.js
 */

const https = require('https');

const API_URL = 'https://the-shull-api.app.mottidokib.com';

// Disable SSL verification for self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Auth token (will be set after login)
let TOKEN = '';

// Helper function to make API requests
function apiRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, API_URL);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(TOKEN ? { 'Authorization': `Bearer ${TOKEN}` } : {})
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (json.success) {
                        resolve(json.data);
                    } else {
                        reject(new Error(json.error?.message || 'API Error'));
                    }
                } catch (e) {
                    reject(new Error(`Parse error: ${body.substring(0, 100)}`));
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// ============ DATA ============
const departments = [
    { name: 'עיצוב רקמה', code: 'DESIGN', color: '#6366f1', description: 'מחלקת עיצוב' },
    { name: 'רקמה', code: 'EMBROIDERY', color: '#8b5cf6', description: 'מחלקת רקמה' },
    { name: 'תפירה', code: 'SEWING', color: '#ec4899', description: 'מחלקת תפירה' },
    { name: 'בקרת איכות', code: 'QC', color: '#10b981', description: 'בקרת איכות' },
    { name: 'משלוחים', code: 'SHIPPING', color: '#f59e0b', description: 'מחלקת משלוחים' }
];

const customers = [
    { name: 'בית הכנסת אור החיים', email: 'orchaim@gmail.com', phone: '02-1234567', status: 'ACTIVE' },
    { name: 'קהילת בית ישראל', email: 'beitisrael@gmail.com', phone: '03-2345678', status: 'ACTIVE' },
    { name: 'בית מדרש תפארת ציון', email: 'tiferetzion@gmail.com', phone: '02-3456789', status: 'ACTIVE' },
    { name: 'משפחת כהן', email: 'cohen.family@gmail.com', phone: '050-4567890', status: 'ACTIVE' },
    { name: 'בית כנסת נר תמיד', email: 'nertamid@gmail.com', phone: '08-5678901', status: 'ACTIVE' },
    { name: 'Congregation Beth David', email: 'bethdavid@gmail.com', phone: '+1-555-1234', status: 'ACTIVE' },
    { name: 'משפחת לוי', email: 'levi.fam@gmail.com', phone: '054-6789012', status: 'ACTIVE' },
    { name: 'בית הכנסת הגדול', email: 'hagadol@gmail.com', phone: '03-7890123', status: 'ACTIVE' },
    { name: 'Temple Emanuel', email: 'emanuel@temple.org', phone: '+1-555-5678', status: 'ACTIVE' },
    { name: 'ישיבת פונוביז', email: 'ponevezh@yeshiva.org', phone: '03-8901234', status: 'ACTIVE' },
    { name: 'משפחת שטיין', email: 'stein@email.com', phone: '052-9012345', status: 'ACTIVE' },
    { name: 'בית הכנסת חסידי ברסלב', email: 'breslov@shul.com', phone: '02-0123456', status: 'ACTIVE' }
];

const products = [
    { name: 'פרוכת רקומה', sku: 'PAROCHET-EMB', description: 'פרוכת לארון קודש עם רקמה מפוארת', price: 8500, stockQuantity: 0, category: 'RITUAL', status: 'ACTIVE' },
    { name: 'מעיל לספר תורה', sku: 'MEIL-STD', description: 'מעיל מפואר לספר תורה', price: 4500, stockQuantity: 0, category: 'RITUAL', status: 'ACTIVE' },
    { name: 'כיסוי בימה ועמוד', sku: 'BIMA-AMUD', description: 'כיסוי מרהיב לבימה ועמוד החזן', price: 6500, stockQuantity: 0, category: 'RITUAL', status: 'ACTIVE' },
    { name: 'כיסוי טלית ותפילין', sku: 'TALIT-TEFILIN', description: 'כיסוי יוקרתי לטלית ותפילין', price: 1200, stockQuantity: 10, category: 'RITUAL', status: 'ACTIVE' },
    { name: 'פרוכת פשוטה', sku: 'PAROCHET-SIMPLE', description: 'פרוכת בעיצוב קלאסי ופשוט', price: 5500, stockQuantity: 0, category: 'RITUAL', status: 'ACTIVE' },
    { name: 'תיקון פרוכת', sku: 'REPAIR-PAROCHET', description: 'שיפוץ ותיקון פרוכת קיימת', price: 2000, stockQuantity: 0, category: 'RITUAL', status: 'ACTIVE' }
];

const workflows = [
    { name: 'תהליך ייצור פרוכת', code: 'PAROCHET_FULL', description: 'תהליך מלא לייצור פרוכת רקומה' },
    { name: 'תהליך ייצור מעיל', code: 'MEIL_STD', description: 'תהליך ייצור מעיל לספר תורה' },
    { name: 'תהליך ייצור כיסוי בימה', code: 'BIMA_STD', description: 'תהליך ייצור כיסוי לבימה ועמוד' },
    { name: 'תהליך ייצור כיסוי טלית', code: 'TALIT_STD', description: 'תהליך מהיר לכיסוי טלית ותפילין' },
    { name: 'תהליך תיקון', code: 'REPAIR', description: 'תהליך תיקון ושיקום' }
];

// ============ MAIN ============
async function main() {
    console.log('🚀 Starting data upload to server...\n');

    // 1. Login
    console.log('1️⃣  Logging in...');
    try {
        const auth = await apiRequest('POST', '/auth/login', {
            email: 'admin@yoel.com',
            password: 'Admin1234'
        });
        TOKEN = auth.token;
        console.log('   ✅ Logged in as', auth.user.email);
    } catch (e) {
        console.error('   ❌ Login failed:', e.message);
        return;
    }

    // 2. Create Departments
    console.log('\n2️⃣  Creating departments...');
    const createdDepts = {};
    for (const dept of departments) {
        try {
            const result = await apiRequest('POST', '/departments', dept);
            createdDepts[dept.code] = result.id;
            console.log(`   ✅ Created: ${dept.name}`);
        } catch (e) {
            console.log(`   ⚠️  ${dept.name}: ${e.message}`);
        }
    }

    // 3. Create Customers
    console.log('\n3️⃣  Creating customers...');
    for (const customer of customers) {
        try {
            await apiRequest('POST', '/customers', customer);
            console.log(`   ✅ Created: ${customer.name}`);
        } catch (e) {
            console.log(`   ⚠️  ${customer.name}: ${e.message}`);
        }
    }

    // 4. Create Workflows
    console.log('\n4️⃣  Creating workflows...');
    const createdWorkflows = {};
    for (const workflow of workflows) {
        try {
            const result = await apiRequest('POST', '/workflows', workflow);
            createdWorkflows[workflow.code] = result.id;
            console.log(`   ✅ Created: ${workflow.name}`);
        } catch (e) {
            console.log(`   ⚠️  ${workflow.name}: ${e.message}`);
        }
    }

    // 5. Create Products
    console.log('\n5️⃣  Creating products...');
    for (const product of products) {
        try {
            await apiRequest('POST', '/products', product);
            console.log(`   ✅ Created: ${product.name}`);
        } catch (e) {
            console.log(`   ⚠️  ${product.name}: ${e.message}`);
        }
    }

    console.log('\n✨ Data upload complete!');
    console.log('   Check the app to see the data.');
}

main().catch(console.error);
