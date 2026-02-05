// Fix Admin Password - Direct Update
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function fixAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Hash the password correctly
        const password = 'Admin@123';
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('New password hash created');

        // Update ari@gmail.com directly
        const result = await mongoose.connection.db.collection('users').updateOne(
            { email: 'ari@gmail.com' },
            {
                $set: {
                    password: hashedPassword,
                    role: 'admin',
                    isActive: true
                }
            }
        );

        console.log('Updated ari@gmail.com:', result.modifiedCount > 0 ? 'SUCCESS' : 'No change');

        // Verify the update worked
        const user = await mongoose.connection.db.collection('users').findOne({ email: 'ari@gmail.com' });
        const testMatch = await bcrypt.compare(password, user.password);
        console.log('Password verification:', testMatch ? 'PASS' : 'FAIL');

        console.log('\n=============================');
        console.log('LOGIN CREDENTIALS:');
        console.log('Email: ari@gmail.com');
        console.log('Password: Admin@123');
        console.log('=============================\n');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

fixAdmin();
