// Direct API Login Test for ari@gmail.com
import http from 'http';

async function testAPILogin() {
    console.log('Testing admin login API for ari@gmail.com...\n');

    const data = JSON.stringify({
        email: 'ari@gmail.com',
        password: 'Admin@123'
    });

    const options = {
        hostname: 'localhost',
        port: 5005,
        path: '/api/auth/login/admin',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    return new Promise((resolve) => {
        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                console.log('Status:', res.statusCode);
                try {
                    const json = JSON.parse(responseData);
                    console.log('Response:', JSON.stringify(json, null, 2));

                    if (json.success) {
                        console.log('\n✅ LOGIN SUCCESSFUL!');
                    } else {
                        console.log('\n❌ LOGIN FAILED:', json.message);
                    }
                } catch (e) {
                    console.log('Raw response:', responseData);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.error('Error:', error.message);
            resolve();
        });

        req.write(data);
        req.end();
    });
}

testAPILogin();
