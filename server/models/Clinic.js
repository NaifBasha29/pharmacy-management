import mongoose from 'mongoose';
import crypto from 'crypto';

// Sub-schemas for better organization
const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  pincode: { type: String, required: true },
  mapsLink: String,
  geoCoordinates: {
    lat: Number,
    lng: Number
  }
}, { _id: false });

const contactSchema = new mongoose.Schema({
  personName: { type: String, required: true },
  designation: { 
    type: String, 
    enum: ['owner', 'manager', 'pharmacist_in_charge', 'other'],
    required: true 
  },
  email: { 
    type: String, 
    required: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: { type: String, required: true },
  altPhone: String,
  supportEmail: String
}, { _id: false });

const regulatorySchema = new mongoose.Schema({
  licenseNumber: { type: String, required: true },
  issuingAuthority: { type: String, required: true },
  licenseValidity: { type: Date, required: true },
  drugControlId: String,
  licenseDocument: { type: String, required: true }, // File path
  complianceDeclaration: { type: Boolean, required: true, default: false }
}, { _id: false });

const operationalSchema = new mongoose.Schema({
  workingHours: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '21:00' }
  },
  workingDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  orderCutoffTime: { type: String, default: '18:00' },
  deliverySupport: { type: Boolean, default: false },
  emergencyService: { type: Boolean, default: false },
  timezone: { type: String, default: 'Asia/Kolkata' },
  currency: { type: String, default: 'INR' }
}, { _id: false });

const subscriptionSchema = new mongoose.Schema({
  plan: {
    type: String,
    enum: ['trial', 'basic', 'pro', 'enterprise'],
    default: 'trial'
  },
  validityPeriod: { type: Date },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  maxUsers: { type: Number, default: 5 },
  storageLimit: { type: Number, default: 1024 } // MB
}, { _id: false });

const adminAccountSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true },
  email: { 
    type: String, 
    required: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  tempPassword: { type: String, select: false },
  forcePasswordReset: { type: Boolean, default: true }
}, { _id: false });

const permissionsSchema = new mongoose.Schema({
  dashboardAccess: { type: String, enum: ['full', 'restricted'], default: 'full' },
  inventoryAccess: { type: Boolean, default: true },
  orderManagementAccess: { type: Boolean, default: true },
  staffManagementAccess: { type: Boolean, default: true },
  financialAccess: { type: Boolean, default: false },
  prescriptionApprovalAccess: { type: Boolean, default: true }
}, { _id: false });

const integrationSchema = new mongoose.Schema({
  apiKey: { type: String },
  webhookUrl: String,
  thirdPartyIntegration: { type: Boolean, default: false },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true }
  }
}, { _id: false });

const verificationSchema = new mongoose.Schema({
  clinicStatus: {
    type: String,
    enum: ['active', 'inactive', 'pending_verification', 'suspended'],
    default: 'pending_verification'
  },
  adminAccountStatus: {
    type: String,
    enum: ['enabled', 'disabled', 'pending'],
    default: 'pending'
  },
  verificationChecklist: {
    documentsVerified: { type: Boolean, default: false },
    licenseVerified: { type: Boolean, default: false },
    addressVerified: { type: Boolean, default: false },
    contactVerified: { type: Boolean, default: false }
  },
  adminNotes: String
}, { _id: false });

const auditSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  ipAddress: String,
  approvalTimestamp: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  modificationLogs: [{
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    modifiedAt: { type: Date, default: Date.now },
    changes: String,
    ipAddress: String
  }]
}, { _id: false });

// Main Clinic Schema
const clinicSchema = new mongoose.Schema({
  // Section 1: Basic Information
  name: { 
    type: String, 
    required: [true, 'Clinic name is required'],
    trim: true 
  },
  code: {
    type: String,
    unique: true,
    uppercase: true
  },
  registrationNumber: { 
    type: String, 
    required: [true, 'Registration number is required'],
    unique: true 
  },
  type: {
    type: String,
    enum: ['hospital_pharmacy', 'retail_pharmacy', 'multi_specialty_clinic', 'diagnostic_center'],
    required: true
  },
  yearEstablished: Number,
  logo: String, // File path
  website: String,
  taxId: String,

  // Section 2: Contact Information
  contact: {
    type: contactSchema,
    required: true
  },

  // Section 3: Address Details
  address: {
    type: addressSchema,
    required: true
  },

  // Section 4: Regulatory & Compliance
  regulatory: {
    type: regulatorySchema,
    required: true
  },

  // Section 5: Operational Configuration
  operational: {
    type: operationalSchema,
    default: () => ({})
  },

  // Section 6: Subscription/Plan Configuration
  subscription: {
    type: subscriptionSchema,
    default: () => ({})
  },

  // Section 7: Clinic Admin Account
  adminAccount: {
    type: adminAccountSchema,
    required: true
  },

  // Section 8: Role & Access Permissions
  permissions: {
    type: permissionsSchema,
    default: () => ({})
  },

  // Section 9: Integration & System Settings
  integration: {
    type: integrationSchema,
    default: () => ({})
  },

  // Section 10: Verification & Activation Controls
  verification: {
    type: verificationSchema,
    default: () => ({})
  },

  // Section 11: Security & Audit (Auto-Logged)
  audit: {
    type: auditSchema,
    default: () => ({})
  },

  // Draft status for partial saves
  isDraft: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Pre-save middleware to generate clinic code and API key
clinicSchema.pre('save', function(next) {
  // Generate clinic code if not exists
  if (!this.code) {
    const prefix = this.type === 'hospital_pharmacy' ? 'HP' :
                   this.type === 'retail_pharmacy' ? 'RP' :
                   this.type === 'multi_specialty_clinic' ? 'MC' : 'DC';
    this.code = `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  }
  
  // Generate API key if not exists
  if (!this.integration.apiKey) {
    this.integration.apiKey = `pk_${crypto.randomBytes(24).toString('hex')}`;
  }
  
  next();
});

// Generate temporary password
clinicSchema.methods.generateTempPassword = function() {
  const password = crypto.randomBytes(8).toString('hex');
  this.adminAccount.tempPassword = password;
  return password;
};

// Static method to find active clinics
clinicSchema.statics.findActive = function() {
  return this.find({ 'verification.clinicStatus': 'active' });
};

// Index for efficient queries
clinicSchema.index({ 'verification.clinicStatus': 1 });
clinicSchema.index({ code: 1 });
clinicSchema.index({ 'contact.email': 1 });

const Clinic = mongoose.model('Clinic', clinicSchema);

export default Clinic;
