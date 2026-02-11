// Create/Reset Admin User Script
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Direct database operation to ensure password is hashed
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);

        // Update or insert admin@pharmacy.com user
        const result1 = await mongoose.connection.db.collection('users').updateOne(
            { email: 'admin@pharmacy.com' },
            {
                $set: {
                    name: 'Super Admin',
                    email: 'admin@pharmacy.com',
                    password: hashedPassword,
                    role: 'admin',
                    isActive: true,
                    updatedAt: new Date()
                },
                $setOnInsert: {
                    createdAt: new Date()
                }
            },
            { upsert: true }
        );

        console.log('admin@pharmacy.com:', result1.modifiedCount > 0 || result1.upsertedCount > 0 ? 'OK' : 'No change');

        // Also fix ari@gmail.com if it exists
        const result2 = await mongoose.connection.db.collection('users').updateOne(
            { email: 'ari@gmail.com' },
            {
                $set: {
                    password: hashedPassword,
                    role: 'admin',
                    isActive: true
                }
            }
        );

        console.log('ari@gmail.com:', result2.modifiedCount > 0 ? 'Updated' : 'Not found or no change');

        console.log('\n=== LOGIN CREDENTIALS ===');
        console.log('Email: admin@pharmacy.com  OR  ari@gmail.com');
        console.log('Password: Admin@123');
        console.log('=========================\n');

        await mongoose.disconnect();
        console.log('Done!');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

createAdmin();
