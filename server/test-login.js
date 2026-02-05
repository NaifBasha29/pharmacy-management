// Test Admin Login Script
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function testLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Find admin users
        const users = await mongoose.connection.db.collection('users').find({ role: 'admin' }).toArray();

        console.log('=== ADMIN USERS IN DATABASE ===');
        for (const user of users) {
            console.log(`\nEmail: ${user.email}`);
            console.log(`Name: ${user.name}`);
            console.log(`Role: ${user.role}`);
            console.log(`Active: ${user.isActive}`);
            console.log(`Has Password: ${!!user.password}`);

            // Test password comparison
            if (user.password) {
                const testPassword = 'Admin@123';
                const isMatch = await bcrypt.compare(testPassword, user.password);
                console.log(`Password 'Admin@123' matches: ${isMatch}`);
            }
        }

        console.log('\n================================');
        console.log('\nUse these credentials to login:');
        console.log('Email: admin@pharmacy.com');
        console.log('Password: Admin@123');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

testLogin();
