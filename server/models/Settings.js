import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  pharmacyName: {
    type: String,
    required: true,
    default: 'PharmaCare Pharmacy'
  },
  email: {
    type: String,
    default: 'contact@pharmacare.com'
  },
  phone: {
    type: String,
    default: '+91 1234567890'
  },
  address: {
    street: { type: String, default: '123 Health Street' },
    city: { type: String, default: 'Mumbai' },
    state: { type: String, default: 'Maharashtra' },
    zipCode: { type: String, default: '400001' },
    country: { type: String, default: 'India' }
  },
  gstNumber: String,
  drugLicenseNumber: String,
  logo: String,
  taxRate: {
    type: Number,
    default: 18,
    min: 0,
    max: 100
  },
  currency: {
    type: String,
    default: 'INR'
  },
  currencySymbol: {
    type: String,
    default: '₹'
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  enableNotifications: {
    type: Boolean,
    default: true
  },
  notificationSettings: {
    lowStock: { type: Boolean, default: true },
    newOrder: { type: Boolean, default: true },
    orderStatus: { type: Boolean, default: true },
    expiringSoon: { type: Boolean, default: true }
  },
  workingHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
  },
  deliverySettings: {
    enableDelivery: { type: Boolean, default: true },
    freeDeliveryThreshold: { type: Number, default: 500 },
    deliveryCharge: { type: Number, default: 50 },
    estimatedDeliveryDays: { type: Number, default: 3 }
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
