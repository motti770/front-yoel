const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_URL = 'https://the-shull-api.app.mottidokib.com';
let TOKEN = '';

function request(method, path, data = null) {
    return new Promise((resolve) => {
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
                console.log(`[${res.statusCode}] ${method} ${path}`);
                console.log(body);
                console.log('---\n');
                resolve(JSON.parse(body || '{}'));
            });
        });
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function main() {
    // Login
    const auth = await request('POST', '/auth/login', { email: 'admin@yoel.com', password: 'Admin1234' });
    TOKEN = auth.data.token;

    // Get one customer and one product
    const customers = await request('GET', '/customers?limit=1');
    const products = await request('GET', '/products?limit=1');

    const customerId = customers.data?.customers?.[0]?.id;
    const productId = products.data?.products?.[0]?.id;

    console.log('Customer ID:', customerId);
    console.log('Product ID:', productId);
    console.log('---\n');

    // Try to create a lead
    console.log('=== Creating Lead ===');
    await request('POST', '/leads', {
        name: 'Test Debug Lead',
        email: 'debug@test.com',
        phone: '050-1111111',
        source: 'WEBSITE',
        stage: 'NEW',
        estimatedValue: 5000
    });

    // Try to create an order with minimal data
    console.log('=== Creating Order (minimal) ===');
    await request('POST', '/orders', {
        customerId: customerId,
        productId: productId
    });

    // Try with more fields
    console.log('=== Creating Order (with status) ===');
    await request('POST', '/orders', {
        customerId: customerId,
        productId: productId,
        status: 'PENDING'
    });
}

main();
