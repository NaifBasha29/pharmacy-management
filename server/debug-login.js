// Debug Admin Login
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function debugLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Find admin user
        const user = await mongoose.connection.db.collection('users').findOne({ email: 'admin@pharmacy.com' });

        if (!user) {
            console.log('User admin@pharmacy.com NOT FOUND!');
            await mongoose.disconnect();
            return;
        }

        console.log('User found:');
        console.log('  _id:', user._id);
        console.log('  email:', user.email);
        console.log('  name:', user.name);
        console.log('  role:', user.role);
        console.log('  isActive:', user.isActive);
        console.log('  password length:', user.password?.length);
        console.log('  password starts with $2:', user.password?.startsWith('$2'));

        // Test password
        const testPassword = 'Admin@123';
        console.log('\nTesting password:', testPassword);

        if (user.password) {
            const isMatch = await bcrypt.compare(testPassword, user.password);
            console.log('bcrypt.compare result:', isMatch);

            // Try re-hashing and comparing
            const salt = await bcrypt.genSalt(12);
            const newHash = await bcrypt.hash(testPassword, salt);
            console.log('\nNew hash for same password:', newHash.substring(0, 30) + '...');
            console.log('Stored hash:', user.password.substring(0, 30) + '...');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

debugLogin();
