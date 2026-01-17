import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

import User from '../models/User.js';
import Category from '../models/Category.js';
import Supplier from '../models/Supplier.js';
import Medicine from '../models/Medicine.js';
import Settings from '../models/Settings.js';

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Supplier.deleteMany({});
    await Medicine.deleteMany({});
    await Settings.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@pharmacy.com',
        password: 'Admin@123',
        role: 'admin',
        phone: '+91 9876543210'
      },
      {
        name: 'Dr. Priya Sharma',
        email: 'pharmacist1@pharmacy.com',
        password: 'Pharma@123',
        role: 'pharmacist',
        phone: '+91 9876543211'
      },
      {
        name: 'Rahul Kumar',
        email: 'pharmacist2@pharmacy.com',
        password: 'Pharma@123',
        role: 'pharmacist',
        phone: '+91 9876543212'
      },
      {
        name: 'Amit Singh',
        email: 'user1@example.com',
        password: 'User@123',
        role: 'user',
        phone: '+91 9876543213',
        address: { street: '123 MG Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001' }
      },
      {
        name: 'Sneha Patel',
        email: 'user2@example.com',
        password: 'User@123',
        role: 'user',
        phone: '+91 9876543214',
        address: { street: '456 Park Street', city: 'Delhi', state: 'Delhi', zipCode: '110001' }
      },
      {
        name: 'Vikram Reddy',
        email: 'user3@example.com',
        password: 'User@123',
        role: 'user',
        phone: '+91 9876543215'
      },
      {
        name: 'Meera Krishnan',
        email: 'user4@example.com',
        password: 'User@123',
        role: 'user',
        phone: '+91 9876543216'
      },
      {
        name: 'Arjun Gupta',
        email: 'user5@example.com',
        password: 'User@123',
        role: 'user',
        phone: '+91 9876543217'
      }
    ]);
    console.log('👥 Created users');

    // Create Categories
    const categories = await Category.create([
      { name: 'Pain Relief', description: 'Medicines for pain management' },
      { name: 'Antibiotics', description: 'Anti-bacterial medicines' },
      { name: 'Vitamins & Supplements', description: 'Nutritional supplements' },
      { name: 'Digestive Health', description: 'Medicines for digestive issues' },
      { name: 'Cold & Flu', description: 'Medicines for cold and flu symptoms' },
      { name: 'Diabetes Care', description: 'Diabetes management medicines' },
      { name: 'Heart & BP', description: 'Cardiovascular medicines' },
      { name: 'Skin Care', description: 'Dermatological products' },
      { name: 'Eye & Ear Care', description: 'Ophthalmic and otic products' },
      { name: 'First Aid', description: 'First aid supplies and medicines' }
    ]);
    console.log('📁 Created categories');

    // Create Suppliers
    const suppliers = await Supplier.create([
      {
        name: 'Sun Pharma',
        email: 'orders@sunpharma.com',
        phone: '+91 22 43243424',
        address: { city: 'Mumbai', state: 'Maharashtra' },
        paymentTerms: 'net30',
        rating: 4.5
      },
      {
        name: 'Cipla Ltd',
        email: 'supply@cipla.com',
        phone: '+91 22 24826000',
        address: { city: 'Mumbai', state: 'Maharashtra' },
        paymentTerms: 'net15',
        rating: 4.8
      },
      {
        name: 'Dr. Reddy\'s',
        email: 'orders@drreddys.com',
        phone: '+91 40 66515000',
        address: { city: 'Hyderabad', state: 'Telangana' },
        paymentTerms: 'net30',
        rating: 4.6
      },
      {
        name: 'Lupin Ltd',
        email: 'supply@lupin.com',
        phone: '+91 22 66402323',
        address: { city: 'Mumbai', state: 'Maharashtra' },
        paymentTerms: 'net45',
        rating: 4.4
      },
      {
        name: 'Mankind Pharma',
        email: 'orders@mankind.in',
        phone: '+91 11 46561000',
        address: { city: 'New Delhi', state: 'Delhi' },
        paymentTerms: 'net30',
        rating: 4.3
      }
    ]);
    console.log('🏭 Created suppliers');

    // Create Medicines
    const medicines = await Medicine.create([
      // Pain Relief
      { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: categories[0]._id, supplier: suppliers[0]._id, price: 25, costPrice: 15, stock: 500, minStockLevel: 50, unit: 'strip', dosageForm: 'tablet', strength: '500mg', uses: ['Fever', 'Headache', 'Body pain'], manufacturer: 'Sun Pharma' },
      { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: categories[0]._id, supplier: suppliers[1]._id, price: 45, costPrice: 30, stock: 350, minStockLevel: 40, unit: 'strip', dosageForm: 'tablet', strength: '400mg', uses: ['Pain relief', 'Inflammation'], manufacturer: 'Cipla' },
      { name: 'Diclofenac Gel', genericName: 'Diclofenac', category: categories[0]._id, supplier: suppliers[0]._id, price: 85, costPrice: 55, stock: 200, minStockLevel: 25, unit: 'tube', dosageForm: 'gel', strength: '1%', uses: ['Muscle pain', 'Joint pain'], manufacturer: 'Sun Pharma' },
      
      // Antibiotics
      { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: categories[1]._id, supplier: suppliers[2]._id, price: 120, costPrice: 80, stock: 250, minStockLevel: 30, unit: 'strip', dosageForm: 'capsule', strength: '500mg', prescription_required: true, uses: ['Bacterial infections'], manufacturer: 'Dr. Reddy\'s' },
      { name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: categories[1]._id, supplier: suppliers[1]._id, price: 150, costPrice: 100, stock: 180, minStockLevel: 25, unit: 'strip', dosageForm: 'tablet', strength: '500mg', prescription_required: true, uses: ['Respiratory infections'], manufacturer: 'Cipla' },
      { name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', category: categories[1]._id, supplier: suppliers[2]._id, price: 95, costPrice: 60, stock: 220, minStockLevel: 30, unit: 'strip', dosageForm: 'tablet', strength: '500mg', prescription_required: true, uses: ['UTI', 'Bacterial infections'], manufacturer: 'Dr. Reddy\'s' },

      // Vitamins
      { name: 'Vitamin C 1000mg', genericName: 'Ascorbic Acid', category: categories[2]._id, supplier: suppliers[3]._id, price: 180, costPrice: 120, stock: 400, minStockLevel: 50, unit: 'bottle', dosageForm: 'tablet', strength: '1000mg', uses: ['Immunity boost', 'Antioxidant'], manufacturer: 'Lupin' },
      { name: 'Vitamin D3 60K', genericName: 'Cholecalciferol', category: categories[2]._id, supplier: suppliers[3]._id, price: 120, costPrice: 75, stock: 300, minStockLevel: 40, unit: 'strip', dosageForm: 'capsule', strength: '60000 IU', uses: ['Bone health', 'Calcium absorption'], manufacturer: 'Lupin' },
      { name: 'B-Complex Forte', genericName: 'B Vitamins', category: categories[2]._id, supplier: suppliers[4]._id, price: 95, costPrice: 60, stock: 450, minStockLevel: 60, unit: 'bottle', dosageForm: 'tablet', uses: ['Energy', 'Nerve health'], manufacturer: 'Mankind' },
      { name: 'Multivitamin Plus', genericName: 'Multivitamins', category: categories[2]._id, supplier: suppliers[4]._id, price: 250, costPrice: 170, stock: 280, minStockLevel: 35, unit: 'bottle', dosageForm: 'tablet', uses: ['Overall health', 'Daily nutrition'], manufacturer: 'Mankind' },

      // Digestive
      { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: categories[3]._id, supplier: suppliers[0]._id, price: 65, costPrice: 40, stock: 380, minStockLevel: 45, unit: 'strip', dosageForm: 'capsule', strength: '20mg', uses: ['Acidity', 'GERD'], manufacturer: 'Sun Pharma' },
      { name: 'Pantoprazole 40mg', genericName: 'Pantoprazole', category: categories[3]._id, supplier: suppliers[1]._id, price: 80, costPrice: 50, stock: 320, minStockLevel: 40, unit: 'strip', dosageForm: 'tablet', strength: '40mg', uses: ['Acid reflux', 'Ulcers'], manufacturer: 'Cipla' },
      { name: 'Digene Gel', genericName: 'Antacid', category: categories[3]._id, supplier: suppliers[4]._id, price: 110, costPrice: 75, stock: 200, minStockLevel: 30, unit: 'bottle', dosageForm: 'syrup', uses: ['Acidity relief', 'Gas'], manufacturer: 'Mankind' },

      // Cold & Flu
      { name: 'Crocin Cold & Flu', genericName: 'Paracetamol + Phenylephrine', category: categories[4]._id, supplier: suppliers[0]._id, price: 45, costPrice: 28, stock: 600, minStockLevel: 80, unit: 'strip', dosageForm: 'tablet', uses: ['Cold', 'Flu', 'Fever'], manufacturer: 'Sun Pharma' },
      { name: 'Cetirizine 10mg', genericName: 'Cetirizine', category: categories[4]._id, supplier: suppliers[1]._id, price: 35, costPrice: 20, stock: 480, minStockLevel: 60, unit: 'strip', dosageForm: 'tablet', strength: '10mg', uses: ['Allergies', 'Cold symptoms'], manufacturer: 'Cipla' },
      { name: 'Sinarest', genericName: 'Paracetamol + Chlorpheniramine', category: categories[4]._id, supplier: suppliers[4]._id, price: 55, costPrice: 35, stock: 420, minStockLevel: 55, unit: 'strip', dosageForm: 'tablet', uses: ['Sinus', 'Cold'], manufacturer: 'Mankind' },
      { name: 'Benadryl Syrup', genericName: 'Diphenhydramine', category: categories[4]._id, supplier: suppliers[3]._id, price: 95, costPrice: 60, stock: 180, minStockLevel: 25, unit: 'bottle', dosageForm: 'syrup', uses: ['Cough', 'Cold'], manufacturer: 'Lupin' },

      // Diabetes
      { name: 'Metformin 500mg', genericName: 'Metformin', category: categories[5]._id, supplier: suppliers[2]._id, price: 45, costPrice: 25, stock: 500, minStockLevel: 60, unit: 'strip', dosageForm: 'tablet', strength: '500mg', prescription_required: true, uses: ['Type 2 Diabetes'], manufacturer: 'Dr. Reddy\'s' },
      { name: 'Glimepiride 2mg', genericName: 'Glimepiride', category: categories[5]._id, supplier: suppliers[0]._id, price: 75, costPrice: 45, stock: 280, minStockLevel: 35, unit: 'strip', dosageForm: 'tablet', strength: '2mg', prescription_required: true, uses: ['Type 2 Diabetes'], manufacturer: 'Sun Pharma' },

      // Heart & BP
      { name: 'Amlodipine 5mg', genericName: 'Amlodipine', category: categories[6]._id, supplier: suppliers[1]._id, price: 55, costPrice: 32, stock: 400, minStockLevel: 50, unit: 'strip', dosageForm: 'tablet', strength: '5mg', prescription_required: true, uses: ['Hypertension', 'Angina'], manufacturer: 'Cipla' },
      { name: 'Atenolol 50mg', genericName: 'Atenolol', category: categories[6]._id, supplier: suppliers[2]._id, price: 40, costPrice: 22, stock: 350, minStockLevel: 45, unit: 'strip', dosageForm: 'tablet', strength: '50mg', prescription_required: true, uses: ['High BP', 'Heart conditions'], manufacturer: 'Dr. Reddy\'s' },
      { name: 'Aspirin 75mg', genericName: 'Acetylsalicylic Acid', category: categories[6]._id, supplier: suppliers[0]._id, price: 30, costPrice: 15, stock: 550, minStockLevel: 70, unit: 'strip', dosageForm: 'tablet', strength: '75mg', uses: ['Blood thinner', 'Heart health'], manufacturer: 'Sun Pharma' },

      // Skin Care
      { name: 'Betadine Cream', genericName: 'Povidone-Iodine', category: categories[7]._id, supplier: suppliers[4]._id, price: 85, costPrice: 55, stock: 220, minStockLevel: 30, unit: 'tube', dosageForm: 'cream', uses: ['Antiseptic', 'Wound care'], manufacturer: 'Mankind' },
      { name: 'Candid Cream', genericName: 'Clotrimazole', category: categories[7]._id, supplier: suppliers[3]._id, price: 95, costPrice: 60, stock: 190, minStockLevel: 25, unit: 'tube', dosageForm: 'cream', uses: ['Fungal infections'], manufacturer: 'Lupin' },
      { name: 'Lacto Calamine', genericName: 'Calamine', category: categories[7]._id, supplier: suppliers[0]._id, price: 120, costPrice: 80, stock: 250, minStockLevel: 30, unit: 'bottle', dosageForm: 'other', uses: ['Skin soothing', 'Acne'], manufacturer: 'Sun Pharma' },

      // Eye Care
      { name: 'Refresh Tears', genericName: 'Carboxymethylcellulose', category: categories[8]._id, supplier: suppliers[1]._id, price: 150, costPrice: 100, stock: 180, minStockLevel: 25, unit: 'bottle', dosageForm: 'drops', uses: ['Dry eyes', 'Eye lubrication'], manufacturer: 'Cipla' },
      { name: 'Ciprofloxacin Eye Drops', genericName: 'Ciprofloxacin', category: categories[8]._id, supplier: suppliers[2]._id, price: 65, costPrice: 40, stock: 160, minStockLevel: 20, unit: 'bottle', dosageForm: 'drops', prescription_required: true, uses: ['Eye infections'], manufacturer: 'Dr. Reddy\'s' },

      // First Aid
      { name: 'Dettol Antiseptic', genericName: 'Chloroxylenol', category: categories[9]._id, supplier: suppliers[4]._id, price: 120, costPrice: 80, stock: 300, minStockLevel: 40, unit: 'bottle', dosageForm: 'other', uses: ['Antiseptic', 'First aid'], manufacturer: 'Mankind' },
      { name: 'Band-Aid Strips', genericName: 'Adhesive Bandage', category: categories[9]._id, supplier: suppliers[4]._id, price: 45, costPrice: 28, stock: 400, minStockLevel: 50, unit: 'box', dosageForm: 'other', uses: ['Wound covering'], manufacturer: 'Mankind' },
      { name: 'Cotton Roll', genericName: 'Absorbent Cotton', category: categories[9]._id, supplier: suppliers[3]._id, price: 60, costPrice: 35, stock: 350, minStockLevel: 45, unit: 'box', dosageForm: 'other', uses: ['First aid', 'Wound care'], manufacturer: 'Lupin' }
    ]);
    console.log(`💊 Created ${medicines.length} medicines`);

    // Create Settings
    await Settings.create({
      pharmacyName: 'PharmaCare Plus',
      email: 'contact@pharmacareplus.com',
      phone: '+91 22 12345678',
      address: {
        street: '100 Health Plaza, Sector 5',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      workingHours: {
        monday: { open: '09:00', close: '21:00', isOpen: true },
        tuesday: { open: '09:00', close: '21:00', isOpen: true },
        wednesday: { open: '09:00', close: '21:00', isOpen: true },
        thursday: { open: '09:00', close: '21:00', isOpen: true },
        friday: { open: '09:00', close: '21:00', isOpen: true },
        saturday: { open: '10:00', close: '18:00', isOpen: true },
        sunday: { open: '10:00', close: '14:00', isOpen: true }
      }
    });
    console.log('⚙️  Created settings');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📋 Test Credentials:');
    console.log('   Admin: admin@pharmacy.com / Admin@123');
    console.log('   Pharmacist: pharmacist1@pharmacy.com / Pharma@123');
    console.log('   User: user1@example.com / User@123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
