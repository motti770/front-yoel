/**
 * Seed All Data to Server
 * Adds: Leads, Orders, Tasks, and more sample data
 * Run: node scripts/seed-all-data.cjs
 */

const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_URL = 'https://the-shull-api.app.mottidokib.com';
let TOKEN = '';

// Store created IDs for relationships
const createdData = {
    customers: [],
    products: [],
    workflows: [],
    departments: [],
    leads: [],
    orders: []
};

function request(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, API_URL);
        const req = https.request({
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(TOKEN ? { 'Authorization': `Bearer ${TOKEN}` } : {})
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve(json);
                } catch (e) {
                    resolve({ success: false, error: { message: body } });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// ========== DATA GENERATORS ==========

const hebrewFirstNames = ['יוסי', 'משה', 'דוד', 'אברהם', 'יעקב', 'שמואל', 'אליהו', 'חיים', 'מנחם', 'שלמה',
    'רחל', 'שרה', 'לאה', 'רבקה', 'מרים', 'חנה', 'דבורה', 'אסתר', 'נעמי', 'רות'];

const hebrewLastNames = ['כהן', 'לוי', 'מזרחי', 'פרץ', 'ביטון', 'אברהם', 'דוד', 'יוסף', 'גבאי', 'שלום',
    'אזולאי', 'עמר', 'אוחיון', 'דהן', 'בן דוד', 'חדד', 'סויסה', 'אלון', 'שמעון', 'רוזן'];

const companies = ['בית הכנסת הגדול', 'קהילת אור התורה', 'בית מדרש חסידי גור', 'ישיבת נר ישראל',
    'Congregation Beth Israel', 'Temple Shalom', 'Kehilat Yaakov', 'עמותת תורה ועבודה',
    'מרכז קהילתי אחדות', 'בית הכנסת המרכזי', 'קהילת בני ציון', 'מרכז יהדות העיר'];

const sources = ['WEBSITE', 'REFERRAL', 'PHONE', 'EMAIL', 'FACEBOOK', 'OTHER'];
const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomPhone = () => `05${Math.floor(Math.random() * 10)}-${Math.floor(1000000 + Math.random() * 9000000)}`;

function generateLead(index) {
    const firstName = random(hebrewFirstNames);
    const lastName = random(hebrewLastNames);
    const stage = random(stages);

    return {
        name: `${firstName} ${lastName}`,
        email: `lead${index}@example.com`,
        phone: randomPhone(),
        company: Math.random() > 0.3 ? random(companies) : null,
        source: random(sources),
        stage: stage,
        estimatedValue: Math.floor(2000 + Math.random() * 18000),
        notes: `ליד ${index + 1} - התעניין ב${random(['פרוכת', 'מעיל', 'כיסוי בימה', 'טלית'])}`,
        nextFollowUp: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
}

function generateOrder(index, customerId, productId) {
    const statuses = ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'DELIVERED'];
    const priorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

    return {
        customerId: customerId,
        productId: productId,
        status: random(statuses),
        priority: random(priorities),
        totalAmount: Math.floor(3000 + Math.random() * 12000),
        notes: `הזמנה מספר ${index + 1}`,
        dueDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
}

// ========== MAIN ==========

async function main() {
    console.log('=== Starting Full Data Seed ===\n');

    // 1. Login
    console.log('1. Logging in...');
    const auth = await request('POST', '/auth/login', { email: 'admin@yoel.com', password: 'Admin1234' });
    if (!auth.success) {
        console.error('Login failed:', auth.error);
        return;
    }
    TOKEN = auth.data.token;
    console.log('   Logged in!\n');

    // 2. Get existing data
    console.log('2. Fetching existing data...');

    const customersRes = await request('GET', '/customers?limit=100');
    if (customersRes.success) {
        createdData.customers = customersRes.data.customers || [];
        console.log(`   Found ${createdData.customers.length} customers`);
    }

    const productsRes = await request('GET', '/products?limit=100');
    if (productsRes.success) {
        createdData.products = productsRes.data.products || [];
        console.log(`   Found ${createdData.products.length} products`);
    }

    const workflowsRes = await request('GET', '/workflows?limit=100');
    if (workflowsRes.success) {
        createdData.workflows = workflowsRes.data.workflows || workflowsRes.data || [];
        console.log(`   Found ${createdData.workflows.length} workflows`);
    }

    const deptsRes = await request('GET', '/departments?limit=100');
    if (deptsRes.success) {
        createdData.departments = deptsRes.data.departments || deptsRes.data || [];
        console.log(`   Found ${createdData.departments.length} departments`);
    }
    console.log('');

    // 3. Add 50 Leads
    console.log('3. Adding 50 leads...');
    let leadSuccess = 0;
    for (let i = 0; i < 50; i++) {
        const lead = generateLead(i);
        const res = await request('POST', '/leads', lead);
        if (res.success) {
            leadSuccess++;
            createdData.leads.push(res.data);
            if ((i + 1) % 10 === 0) console.log(`   Added ${i + 1}/50 leads...`);
        }
    }
    console.log(`   Done! Added ${leadSuccess} leads\n`);

    // 4. Add Orders (if we have customers and products)
    if (createdData.customers.length > 0 && createdData.products.length > 0) {
        console.log('4. Adding 30 orders...');
        let orderSuccess = 0;
        for (let i = 0; i < 30; i++) {
            const customer = random(createdData.customers);
            const product = random(createdData.products);
            const order = generateOrder(i, customer.id, product.id);
            const res = await request('POST', '/orders', order);
            if (res.success) {
                orderSuccess++;
                createdData.orders.push(res.data);
                if ((i + 1) % 10 === 0) console.log(`   Added ${i + 1}/30 orders...`);
            } else {
                console.log(`   Order ${i + 1} failed:`, res.error?.message || 'Unknown');
            }
        }
        console.log(`   Done! Added ${orderSuccess} orders\n`);
    } else {
        console.log('4. Skipping orders (need customers and products)\n');
    }

    // 5. Summary
    console.log('=== SUMMARY ===');
    console.log(`Customers: ${createdData.customers.length}`);
    console.log(`Products: ${createdData.products.length}`);
    console.log(`Leads: ${createdData.leads.length}`);
    console.log(`Orders: ${createdData.orders.length}`);
    console.log(`Workflows: ${createdData.workflows.length}`);
    console.log(`Departments: ${createdData.departments.length}`);
    console.log('\nDone!');
}

main().catch(console.error);
