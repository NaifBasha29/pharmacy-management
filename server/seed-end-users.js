import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');
dotenv.config();

import Patient from './models/Patient.js';
import User from './models/User.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected:', conn.connection.host);
  } catch (error) {
    console.error('DB connection error:', error.message || error);
    process.exit(1);
  }
};

const pad = (n, width = 4) => String(n).padStart(width, '0');

const seed = async () => {
  await connectDB();

  const patientCount = parseInt(process.argv[2] || process.env.PATIENT_COUNT || '20', 10);
  const userCount = parseInt(process.argv[3] || process.env.USER_COUNT || '0', 10);
  const defaultPassword = process.env.DEFAULT_SEED_PASSWORD || 'password123';

  console.log(`Seeding ${patientCount} patients and ${userCount} users (password: ${defaultPassword})`);

  const createdPatients = [];
  for (let i = 0; i < patientCount; i++) {
    try {
      const idx = Date.now().toString().slice(-5) + i;
      const name = `Test Patient ${i + 1}`;
      const email = `patient${i + 1}@example.com`;
      const phone = `900000${pad(1000 + i, 4)}`; // 9000001000, 9000001001, ...
      const gender = ['male', 'female', 'other'][i % 3];

      // Avoid duplicates: prefer unique phone/email
      let existing = null;
      if (email) existing = await Patient.findOne({ $or: [{ email }, { phone }] }).select('+password');

      if (existing) {
        // Update password so we can log in with known credentials
        existing.password = defaultPassword;
        await existing.save();
        createdPatients.push(existing);
        console.log(`Updated existing patient: ${existing.patientId || existing._id} (${email})`);
        continue;
      }

      const patient = await Patient.create({
        name,
        email,
        phone,
        gender,
        password: defaultPassword,
        dateOfBirth: new Date('1990-01-01'),
        address: { city: 'SeedCity' },
      });
      createdPatients.push(patient);
      console.log(`Created patient: ${patient.patientId} (${email})`);
    } catch (err) {
      console.error('Patient create error:', err.message || err);
    }
  }

  const createdUsers = [];
  for (let j = 0; j < userCount; j++) {
    try {
      const name = `End User ${j + 1}`;
      const email = `enduser${j + 1}@example.com`;
      const phone = `910000${pad(1000 + j, 4)}`;

      const existing = await User.findOne({ email }).select('+password');
      if (existing) {
        existing.password = defaultPassword;
        await existing.save();
        createdUsers.push(existing);
        console.log(`Updated existing user: ${existing._id} (${email})`);
        continue;
      }

      const user = await User.create({
        name,
        email,
        phone,
        role: 'user',
        password: defaultPassword,
      });
      createdUsers.push(user);
      console.log(`Created user: ${user._id} (${email})`);
    } catch (err) {
      console.error('User create error:', err.message || err);
    }
  }

  console.log('\nSeeding complete');
  console.log(`Patients created/updated: ${createdPatients.length}`);
  console.log(`Users created/updated: ${createdUsers.length}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed();
