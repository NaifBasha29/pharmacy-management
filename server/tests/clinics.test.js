import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../server.js';
import Clinic from '../models/Clinic.js';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

dotenv.config();

describe('Clinic API', () => {
    let token;
    let adminUser;

    beforeAll(async () => {
        // Ensure database connection is ready
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        // Create admin user for auth
        const email = `admin_${Date.now()}@test.com`;
        adminUser = await User.create({
            name: 'Test Admin',
            email,
            password: 'password123',
            role: 'admin'
        });

        token = generateToken(adminUser._id);
    });

    afterAll(async () => {
        await User.deleteMany({ email: /@test.com/ });
        await Clinic.deleteMany({ name: 'Test Clinic Integration' });
        await mongoose.connection.close();
    });

    describe('POST /api/clinics', () => {
        it('should create a new clinic draft', async () => {
            const clinicData = {
                name: 'Test Clinic Integration',
                registrationNumber: `REG-${Date.now()}`,
                type: 'retail_pharmacy',
                contact: {
                    personName: 'John Doe',
                    designation: 'manager',
                    email: 'john@test.com',
                    phone: '1234567890'
                },
                address: {
                    line1: '123 Test St',
                    city: 'Test City',
                    state: 'Test State',
                    country: 'India',
                    pincode: '123456'
                },
                regulatory: {
                    licenseNumber: 'LIC-123',
                    issuingAuthority: 'State Health Dept',
                    licenseValidity: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                    licenseDocument: '/uploads/test.pdf',
                    complianceDeclaration: true
                },
                adminAccount: {
                    fullName: 'Clinic Admin',
                    username: 'admin_test',
                    email: 'admin@test-clinic.com'
                }
            };

            const res = await request(app)
                .post('/api/clinics')
                .set('Authorization', `Bearer ${token}`)
                .field('clinicData', JSON.stringify(clinicData));

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.clinic.name).toBe('Test Clinic Integration');
            expect(res.body.data.clinic.code).toBeDefined();
        });

        it('should return 401 if no token provided', async () => {
            const res = await request(app).post('/api/clinics').send({});
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('GET /api/clinics', () => {
        it('should get all clinics', async () => {
            const res = await request(app)
                .get('/api/clinics')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data.clinics)).toBe(true);
        });
    });

    describe('Clinic Operations', () => {
        let clinicId;

        beforeAll(async () => {
            const clinic = await Clinic.create({
                name: 'Test Clinic Ops',
                registrationNumber: `REG-OPS-${Date.now()}`,
                type: 'retail_pharmacy',
                contact: {
                    personName: 'Ops Manager',
                    designation: 'manager',
                    email: 'ops@test.com',
                    phone: '1234567890'
                },
                address: {
                    line1: '123 Ops St',
                    city: 'Ops City',
                    state: 'Ops State',
                    country: 'India',
                    pincode: '123456'
                },
                regulatory: {
                    licenseNumber: 'LIC-OPS',
                    issuingAuthority: 'State Health Dept',
                    licenseValidity: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                    licenseDocument: '/uploads/test.pdf',
                    complianceDeclaration: true
                },
                adminAccount: {
                    fullName: 'Ops Admin',
                    username: 'ops_admin',
                    email: 'ops_admin@test.com'
                }
            });
            clinicId = clinic._id;
        });

        afterAll(async () => {
            await Clinic.findByIdAndDelete(clinicId);
            await User.deleteMany({ email: 'ops_admin@test.com' });
        });

        it('should get a single clinic by ID', async () => {
            const res = await request(app)
                .get(`/api/clinics/${clinicId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.clinic.name).toBe('Test Clinic Ops');
        });

        it('should activate a clinic and create admin user', async () => {
            const res = await request(app)
                .put(`/api/clinics/${clinicId}/activate`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.clinic.verification.clinicStatus).toBe('active');

            // Verify admin user was created
            const adminUser = await User.findOne({ email: 'ops_admin@test.com' });
            expect(adminUser).toBeDefined();
            expect(adminUser.role).toBe('pharmacist');
        });

        it('should update clinic status', async () => {
            const res = await request(app)
                .put(`/api/clinics/${clinicId}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    clinicStatus: 'suspended',
                    adminNotes: 'Testing suspension'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.clinic.verification.clinicStatus).toBe('suspended');
            expect(res.body.data.clinic.verification.adminNotes).toBe('Testing suspension');
        });
    });
});
