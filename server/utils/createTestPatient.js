import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import Patient from '../models/Patient.js';

const createTestPatient = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing test patient if exists
    await Patient.deleteOne({ patientId: 'PAT001' });
    console.log('🗑️  Cleared existing test patient');

    // Create test patient - password will be hashed by the model's pre-save hook
    const patient = new Patient({
      patientId: 'PAT001',
      password: 'Patient@123',  // Plain password - model will hash it
      name: 'Test Patient',
      email: 'patient@test.com',
      phone: '+91 9876543210',
      gender: 'male',
      age: 30,
      dateOfBirth: new Date('1996-01-15'),
      bloodGroup: 'O+',
      address: {
        street: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      isActive: true
    });

    await patient.save();

    console.log('✅ Test patient created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 Mobile App Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Patient ID: PAT001');
    console.log('   Password:   Patient@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestPatient();
