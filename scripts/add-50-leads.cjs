/**
 * Add 50 Leads to Server
 * Run: node scripts/add-50-leads.cjs
 */

const https = require('https');

const API_URL = 'https://the-shull-api.app.mottidokib.com';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let TOKEN = '';

function apiRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, API_URL);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
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
                    resolve(json);
                } catch (e) {
                    reject(new Error(`Parse error: ${body.substring(0, 200)}`));
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// Hebrew first names
const firstNames = ['יוסי', 'משה', 'דוד', 'אברהם', 'יעקב', 'שמואל', 'אליהו', 'חיים', 'מנחם', 'שלמה',
    'רחל', 'שרה', 'לאה', 'רבקה', 'מרים', 'חנה', 'דבורה', 'אסתר', 'נעמי', 'רות'];

const lastNames = ['כהן', 'לוי', 'מזרחי', 'פרץ', 'ביטון', 'אברהם', 'דוד', 'יוסף', 'גבאי', 'שלום',
    'אזולאי', 'עמר', 'אוחיון', 'דהן', 'בן דוד', 'חדד', 'סויסה', 'אלון', 'שמעון', 'רוזן'];

const companies = ['בית הכנסת הגדול', 'קהילת אור התורה', 'בית מדרש חסידי', 'ישיבת נר ישראל',
    'Congregation Beth Israel', 'Temple Shalom', 'Kehilat Yaakov', 'עמותת תורה ועבודה',
    'מרכז קהילתי אחדות', 'בית הכנסת המרכזי', 'קהילת בני ציון', 'מרכז יהדות'];

const sources = ['WEBSITE', 'REFERRAL', 'PHONE', 'EMAIL', 'FACEBOOK', 'INSTAGRAM', 'OTHER'];
const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
const products = ['PAROCHET', 'MEIL', 'BIMA', 'TALIT'];

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone() {
    const prefix = ['050', '052', '053', '054', '055', '058'][Math.floor(Math.random() * 6)];
    const num = Math.floor(Math.random() * 9000000) + 1000000;
    return `${prefix}-${num}`;
}

function randomEmail(firstName, lastName) {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'walla.co.il', 'hotmail.com'];
    const name = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z.]/g, '');
    return `${name || 'user' + Math.random().toString(36).substr(2, 5)}@${randomItem(domains)}`;
}

function generateLead(index) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const stage = randomItem(stages);

    // Weighted distribution - more leads in early stages
    const stageWeights = { NEW: 30, CONTACTED: 25, QUALIFIED: 20, PROPOSAL: 12, NEGOTIATION: 8, WON: 3, LOST: 2 };

    return {
        name: `${firstName} ${lastName}`,
        email: randomEmail(firstName, lastName),
        phone: randomPhone(),
        company: Math.random() > 0.4 ? randomItem(companies) : null,
        source: randomItem(sources),
        stage: stage,
        estimatedValue: Math.floor(Math.random() * 20000) + 2000,
        notes: `ליד מספר ${index + 1} - ${stage === 'NEW' ? 'פנייה חדשה' : stage === 'CONTACTED' ? 'יצרנו קשר' : stage === 'QUALIFIED' ? 'מתאים' : stage === 'PROPOSAL' ? 'שלחנו הצעה' : stage === 'NEGOTIATION' ? 'במו"מ' : stage === 'WON' ? 'נסגר בהצלחה!' : 'לא התקדם'}`,
        productInterest: randomItem(products),
        nextFollowUp: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
}

async function main() {
    console.log('Starting to add 50 leads...\n');

    // 1. Login
    console.log('Logging in...');
    try {
        const auth = await apiRequest('POST', '/auth/login', {
            email: 'admin@yoel.com',
            password: 'Admin1234'
        });
        if (!auth.success) {
            console.error('Login failed:', auth.error);
            return;
        }
        TOKEN = auth.data.token;
        console.log('Logged in successfully!\n');
    } catch (e) {
        console.error('Login error:', e.message);
        return;
    }

    // 2. Check if leads endpoint exists
    console.log('Checking leads endpoint...');
    const leadsCheck = await apiRequest('GET', '/leads');
    if (!leadsCheck.success && leadsCheck.error?.code === 'NOT_FOUND') {
        console.log('\n Leads endpoint does not exist on server!');
        console.log('The backend needs to implement /leads first.');
        console.log('See API-EXTENSIONS-NEEDED.md for details.');
        return;
    }
    console.log('Leads endpoint exists!\n');

    // 3. Add 50 leads
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < 50; i++) {
        const lead = generateLead(i);
        try {
            const result = await apiRequest('POST', '/leads', lead);
            if (result.success) {
                successCount++;
                console.log(`[${i + 1}/50] Added: ${lead.name} (${lead.stage})`);
            } else {
                failCount++;
                console.log(`[${i + 1}/50] Failed: ${lead.name} - ${result.error?.message || 'Unknown error'}`);
            }
        } catch (e) {
            failCount++;
            console.log(`[${i + 1}/50] Error: ${lead.name} - ${e.message}`);
        }
    }

    console.log('\n=== Summary ===');
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log('\nDone!');
}

main().catch(console.error);
