import mongoose from 'mongoose';
import Patient from './models/Patient.js';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');
dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const createPatient = async () => {
    await connectDB();
    try {
        // Check if a test patient exists by phone, or just create a new one
        let existing = await Patient.findOne({ phone: '9988776655' });
        
        if (!existing) {
             console.log('Creating new test patient...');
             existing = await Patient.create({
                name: 'Mobile Test User',
                phone: '9988776655',
                gender: 'male',
                password: 'password123',
                email: 'mobile.test@example.com',
                address: {
                    street: '123 Mobile Lane',
                    city: 'App City',
                    state: 'React Native',
                    zipCode: '10001',
                    country: 'India'
                },
                dateOfBirth: new Date('1990-01-01')
            });
        } else {
            console.log('Test patient already exists. Updating password...');
            existing.password = 'password123';
            await existing.save();
        }

        console.log('\n================================');
        console.log('✅ TEST PATIENT READY');
        console.log('================================');
        console.log(`Patient ID: ${existing.patientId}`);
        console.log(`Password:   password123`);
        console.log('================================\n');

    } catch (error) {
        console.error('Error creating patient:', error);
    } finally {
        await mongoose.disconnect();
    }
};

createPatient();
