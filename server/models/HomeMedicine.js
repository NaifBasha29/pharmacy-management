import mongoose from 'mongoose';

const homeMedicineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  expiryDate: {
    type: Date,
    required: true
  },
  reminderDaysBefore: {
    type: Number,
    default: 30
  },
  notes: {
    type: String,
    maxlength: 300
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

homeMedicineSchema.index({ user: 1, expiryDate: 1 });

homeMedicineSchema.virtual('isExpired').get(function () {
  return this.expiryDate < new Date();
});

homeMedicineSchema.virtual('daysUntilExpiry').get(function () {
  const diff = this.expiryDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

homeMedicineSchema.set('toJSON', { virtuals: true });

const HomeMedicine = mongoose.model('HomeMedicine', homeMedicineSchema);
export default HomeMedicine;
