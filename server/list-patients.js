import mongoose from 'mongoose';
import Patient from './models/Patient.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

const listPatients = async () => {
    await connectDB();
    try {
        const patients = await Patient.find({});
        console.log('=== PATIENTS ===');
        console.log(`Total Patients: ${patients.length}`);
        
        if (patients.length === 0) {
            console.log('No patients found. Creating a test patient...');
            const newPatient = await Patient.create({
                name: 'Test Patient',
                email: 'patient@test.com',
                phone: '1234567890',
                password: 'password123',
                gender: 'male',
                dateOfBirth: new Date('1990-01-01'),
                address: {
                    street: '123 Test St',
                    city: 'Test City',
                    state: 'Test State',
                    zipCode: '12345'
                }
            });
            console.log('Test Patient Created:');
            console.log(`Patient ID: ${newPatient.patientId}`);
            console.log(`Password: password123`);
        } else {
            patients.forEach(p => {
                console.log(`\nID: ${p._id}`);
                console.log(`Name: ${p.name}`);
                console.log(`Patient ID: ${p.patientId}`);
                console.log(`Email: ${p.email}`);
            });
        }
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

listPatients();
