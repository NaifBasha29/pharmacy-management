import mongoose from 'mongoose';
import Patient from './models/Patient.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

const testPatientLogin = async () => {
    await connectDB();
    const patientId = 'PAT001';
    const password = 'password123';

    try {
        console.log(`Testing login for Patient ID: ${patientId}`);
        const patient = await Patient.findOne({ patientId }).select('+password');

        if (!patient) {
            console.log('❌ Patient not found');
            return;
        }

        console.log('✅ Patient found:', patient.name);
        console.log('Has password hash:', !!patient.password);

        const isMatch = await bcrypt.compare(password, patient.password);
        if (isMatch) {
             console.log('✅ Password match success!');
        } else {
             console.log('❌ Password mismatch! Resetting password...');
             patient.password = 'password123';
             await patient.save();
             console.log('✅ Password reset to: password123');
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

testPatientLogin();
