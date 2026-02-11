const testLogin = async () => {
    try {
        console.log('Attempting login with PAT000002 / password123...');
        const response = await fetch('http://localhost:5005/api/auth/login/patient', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patientId: 'PAT000002',
                password: 'password123'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Login Successful!');
            console.log('Token:', data.data.accessToken ? 'Present' : 'Missing');
        } else {
            console.error('❌ Login Failed');
            console.error('Status:', response.status);
            console.error('Message:', data.message);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testLogin();
