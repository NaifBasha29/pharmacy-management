import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  genericName: {
    type: String,
    trim: true,
    maxlength: [100, 'Generic name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  manufacturer: {
    type: String,
    trim: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  batchNumber: {
    type: String,
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative'],
    default: 0
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  minStockLevel: {
    type: Number,
    default: 10,
    min: [0, 'Minimum stock level cannot be negative']
  },
  unit: {
    type: String,
    enum: ['tablet', 'capsule', 'bottle', 'tube', 'vial', 'sachet', 'strip', 'box', 'other'],
    default: 'tablet'
  },
  dosageForm: {
    type: String,
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'inhaler', 'powder', 'gel', 'other'],
    default: 'tablet'
  },
  strength: {
    type: String,
    trim: true
  },
  prescription_required: {
    type: Boolean,
    default: false
  },
  expiryDate: {
    type: Date
  },
  manufactureDate: {
    type: Date
  },
  image: {
    type: String,
    default: ''
  },
  sideEffects: [String],
  uses: [String],
  contraindications: [String],
  storage: {
    type: String,
    default: 'Store in a cool, dry place'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discounted price
medicineSchema.virtual('discountedPrice').get(function() {
  return this.price - (this.price * this.discount / 100);
});

// Virtual for stock status
medicineSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= this.minStockLevel) return 'low_stock';
  return 'in_stock';
});

// Check if medicine is expired
medicineSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Index for search
medicineSchema.index({ name: 'text', genericName: 'text', description: 'text' });

const Medicine = mongoose.model('Medicine', medicineSchema);

export default Medicine;
