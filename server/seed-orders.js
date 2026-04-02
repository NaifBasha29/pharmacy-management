/**
 * Seed Orders — create 5 delivered orders for testing
 * Run: node seed-orders.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');
dotenv.config();

import Order from './models/Order.js';
import Medicine from './models/Medicine.js';
import User from './models/User.js';
import Patient from './models/Patient.js';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Prefer a regular user; fallback to patient; create a user if none found
    let user = await User.findOne({ role: 'user' });
    let userModel = 'User';
    if (!user) {
      const patient = await Patient.findOne();
      if (patient) {
        user = patient;
        userModel = 'Patient';
      }
    }

    if (!user) {
      user = await User.create({
        name: 'Seed User',
        email: 'seeduser@example.com',
        password: 'User@123',
        role: 'user',
        phone: '+919000000000'
      });
      userModel = 'User';
      console.log('Created fallback user:', user.email);
    }

    const medicines = await Medicine.find().limit(10);
    if (!medicines || medicines.length === 0) {
      console.error('No medicines found — run medicine seeder first (seed-medicines.js)');
      process.exit(1);
    }

    const pharmacist = await User.findOne({ role: 'pharmacist' });

    const now = Date.now();
    const created = [];
    for (let i = 0; i < 5; i++) {
      const med = medicines[i % medicines.length];
      const qty = Math.floor(Math.random() * 2) + 1; // 1-2
      const price = med.price || 0;
      const subtotal = Math.round(price * qty * 100) / 100;
      const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5%
      const shipping = 0;
      const discount = 0;
      const total = Math.round((subtotal + tax + shipping - discount) * 100) / 100;

      const daysAgo = Math.floor(Math.random() * 10) + 1; // 1-10 days ago
      const estimatedDelivery = new Date(now - (daysAgo + 2) * 24 * 60 * 60 * 1000);
      const actualDelivery = new Date(now - daysAgo * 24 * 60 * 60 * 1000);

      const orderData = {
        user: user._id,
        userModel,
        items: [
          {
            medicine: med._id,
            name: med.name,
            quantity: qty,
            price,
            discount: 0,
          },
        ],
        subtotal,
        tax,
        shippingCost: shipping,
        discount,
        total,
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        paymentDetails: {
          transactionId: 'TX' + Math.random().toString(36).slice(2, 10).toUpperCase(),
          paidAt: new Date(now - (daysAgo + 1) * 24 * 60 * 60 * 1000),
        },
        shippingAddress: user.address || { name: user.name || 'Recipient', phone: user.phone || '' },
        estimatedDelivery,
        actualDelivery,
        dispensedBy: pharmacist ? pharmacist._id : undefined,
        dispensedAt: actualDelivery,
        trackingHistory: [
          { status: 'pending', timestamp: new Date(now - (daysAgo + 5) * 24 * 60 * 60 * 1000), note: 'Order placed' },
          { status: 'processing', timestamp: new Date(now - (daysAgo + 4) * 24 * 60 * 60 * 1000), note: 'Order processing' },
          { status: 'dispatched', timestamp: new Date(now - (daysAgo + 2) * 24 * 60 * 60 * 1000), note: 'Dispatched' },
          { status: 'delivered', timestamp: actualDelivery, note: 'Delivered' },
        ],
        notes: 'Seeded delivered order',
      };

      const order = new Order(orderData);
      await order.save();
      created.push(order);
      console.log(`Created order ${order.orderNumber} — ₹${order.total} for ${order.userModel}`);
    }

    console.log(`\n✅ Seeded ${created.length} delivered orders`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed orders error:', err);
    process.exit(1);
  }
}

seed();
