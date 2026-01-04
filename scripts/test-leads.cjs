const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_URL = 'https://the-shull-api.app.mottidokib.com';

function request(method, path, data, token) {
    return new Promise((resolve) => {
        const url = new URL(path, API_URL);
        const req = https.request({
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response: ${body}`);
                resolve(body);
            });
        });
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function main() {
    // Login
    console.log('=== LOGIN ===');
    const authResp = await request('POST', '/auth/login', { email: 'admin@yoel.com', password: 'Admin1234' });
    const token = JSON.parse(authResp).data?.token;

    // Test GET /leads
    console.log('\n=== GET /leads ===');
    await request('GET', '/leads', null, token);

    // Test POST /leads
    console.log('\n=== POST /leads ===');
    await request('POST', '/leads', {
        name: 'Test Lead',
        email: 'test123@test.com',
        phone: '050-1234567',
        source: 'WEBSITE',
        stage: 'NEW',
        estimatedValue: 5000
    }, token);
}

main();
