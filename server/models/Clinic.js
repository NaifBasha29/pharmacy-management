import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Sub-schemas for simplified structure
const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  pincode: { type: String, required: true }
}, { _id: false });

const contactSchema = new mongoose.Schema({
  personName: { type: String, required: true },
  designation: {
    type: String,
    enum: ['owner', 'manager', 'pharmacist_in_charge', 'other'],
    default: 'manager'
  },
  email: {
    type: String,
    required: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: { type: String, required: true }
}, { _id: false });

const regulatorySchema = new mongoose.Schema({
  licenseNumber: { type: String, required: true },
  issuingAuthority: { type: String, default: 'State Pharmacy Council' },
  licenseValidity: { type: Date, required: true },
  licenseDocument: { type: String, default: '' }
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
  password: { type: String, select: false },
  forcePasswordReset: { type: Boolean, default: true }
}, { _id: false });

const verificationSchema = new mongoose.Schema({
  clinicStatus: {
    type: String,
    enum: ['active', 'inactive', 'pending_verification', 'suspended'],
    default: 'pending_verification'
  },
  adminAccountStatus: {
    type: String,
    enum: ['enabled', 'pending', 'disabled'],
    default: 'pending'
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

// Main Clinic Schema - Simplified 6 sections
const clinicSchema = new mongoose.Schema({
  // Section 1: Clinic Basic Details
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
    enum: ['hospital_pharmacy', 'retail_pharmacy', 'multi_specialty_clinic'],
    required: true
  },
  logo: String, // File path (optional)

  // Section 2: Contact Information
  contact: {
    type: contactSchema,
    required: true
  },

  // Section 3: Clinic Address
  address: {
    type: addressSchema,
    required: true
  },

  // Section 4: Regulatory / License Info
  regulatory: {
    type: regulatorySchema,
    required: true
  },

  // Section 5: Clinic Admin Account Setup
  adminAccount: {
    type: adminAccountSchema,
    required: true
  },

  // Section 6: System Access & Status
  verification: {
    type: verificationSchema,
    default: () => ({})
  },

  // Audit Trail
  audit: {
    type: auditSchema,
    default: () => ({})
  },

  // Draft status for partial saves
  isDraft: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Pre-save middleware to generate clinic code
clinicSchema.pre('save', function (next) {
  // Generate clinic code if not exists
  if (!this.code) {
    const prefix = this.type === 'hospital_pharmacy' ? 'HP' :
      this.type === 'retail_pharmacy' ? 'RP' : 'MC';
    this.code = `${prefix}-${Date.now().toString(36).toUpperCase()}`;
  }

  next();
});

// Generate temporary password
clinicSchema.methods.generateTempPassword = function () {
  const password = crypto.randomBytes(8).toString('hex');
  this.adminAccount.tempPassword = password;
  return password;
};

// Static method to find active clinics
clinicSchema.statics.findActive = function () {
  return this.find({ 'verification.clinicStatus': 'active' });
};

// Index for efficient queries
clinicSchema.index({ 'verification.clinicStatus': 1 });
clinicSchema.index({ code: 1 });
clinicSchema.index({ 'contact.email': 1 });

// Hash password before saving
clinicSchema.pre('save', async function (next) {
  // Hash admin account password if modified
  if (this.isModified('adminAccount.password') && this.adminAccount.password) {
    const salt = await bcrypt.genSalt(12);
    this.adminAccount.password = await bcrypt.hash(this.adminAccount.password, salt);
  }
  next();
});

// Compare password method
clinicSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.adminAccount || !this.adminAccount.password) return false;
  return await bcrypt.compare(candidatePassword, this.adminAccount.password);
};

const Clinic = mongoose.model('Clinic', clinicSchema);

export default Clinic;
