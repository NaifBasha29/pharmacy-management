// Reset admin password script
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function resetAdminPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const admin = await User.findOne({ role: 'admin' });

        if (!admin) {
            console.log('No admin found! Creating one...');
            const newAdmin = await User.create({
                name: 'Super Admin',
                email: 'admin@pharmacy.com',
                password: 'Admin@123',
                role: 'admin',
                isActive: true
            });
            console.log('Admin created:', newAdmin.email);
        } else {
            console.log('Admin found:', admin.email);
            admin.password = 'Admin@123';
            await admin.save();
            console.log('Password reset to: Admin@123');
        }

        await mongoose.disconnect();
        console.log('Done!');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

resetAdminPassword();
