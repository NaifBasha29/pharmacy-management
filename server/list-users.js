// List All Users
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        const users = await mongoose.connection.db.collection('users').find({}).toArray();

        console.log('=== ALL USERS IN DATABASE ===');
        console.log('Total users:', users.length);

        for (const user of users) {
            console.log('\n---');
            console.log('Email:', user.email);
            console.log('Name:', user.name);
            console.log('Role:', user.role);
            console.log('Active:', user.isActive);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

listUsers();
