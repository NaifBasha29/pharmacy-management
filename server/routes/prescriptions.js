import express from 'express';
import multer from 'multer';
import path from 'path';
import Prescription from '../models/Prescription.js';
import AuditLog from '../models/AuditLog.js';
import { protect } from '../middleware/auth.js';
import { isPharmacistOrAdmin } from '../middleware/roleAuth.js';
import { validateObjectId } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/prescriptions');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `prescription-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// @route   GET /api/prescriptions
// @desc    Get prescriptions (user: own, pharmacist/admin: all)
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status || '';

  let query = {};

  if (req.user.role === 'user') {
    query.user = req.user._id;
  }

  if (status) {
    query.status = status;
  }

  const total = await Prescription.countDocuments(query);
  const prescriptions = await Prescription.find(query)
    .populate('user', 'name email')
    .populate('patient', 'name patientId')
    .populate('verifiedBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: {
      prescriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   GET /api/prescriptions/:id
// @desc    Get prescription by ID
// @access  Private
router.get('/:id', protect, validateObjectId, asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('patient', 'name patientId phone')
    .populate('verifiedBy', 'name')
    .populate('orders');

  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found'
    });
  }

  // Users can only view their own prescriptions
  if (req.user.role === 'user' && prescription.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this prescription'
    });
  }

  res.json({
    success: true,
    data: { prescription }
  });
}));

// @route   POST /api/prescriptions
// @desc    Upload a new prescription
// @access  Private
router.post('/', protect, upload.single('prescription'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Prescription image is required'
    });
  }

  const { doctorName, doctorPhone, doctorRegistrationNumber, hospitalName, prescriptionDate, diagnosis, notes } = req.body;

  const prescription = await Prescription.create({
    user: req.user._id,
    doctorName,
    doctorPhone,
    doctorRegistrationNumber,
    hospitalName,
    prescriptionDate: prescriptionDate || new Date(),
    image: req.file.path,
    diagnosis,
    notes
  });

  res.status(201).json({
    success: true,
    message: 'Prescription uploaded successfully',
    data: { prescription }
  });
}));

// @route   PUT /api/prescriptions/:id/verify
// @desc    Verify prescription
// @access  Pharmacist/Admin
router.put('/:id/verify', protect, isPharmacistOrAdmin, validateObjectId, asyncHandler(async (req, res) => {
  const { action, rejectionReason, medicines, validUntil } = req.body;

  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found'
    });
  }

  if (prescription.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Prescription already processed'
    });
  }

  if (action === 'verify') {
    prescription.status = 'verified';
    prescription.verifiedBy = req.user._id;
    prescription.verifiedAt = new Date();
    prescription.validUntil = validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Valid for 30 days
    if (medicines) {
      prescription.medicines = medicines;
    }
  } else if (action === 'reject') {
    prescription.status = 'rejected';
    prescription.verifiedBy = req.user._id;
    prescription.verifiedAt = new Date();
    prescription.rejectionReason = rejectionReason || 'Prescription could not be verified';
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid action. Use "verify" or "reject"'
    });
  }

  await prescription.save();

  // Log action
  await AuditLog.log({
    user: req.user._id,
    action: 'PRESCRIPTION_VERIFY',
    resource: 'Prescription',
    resourceId: prescription._id,
    description: `Prescription ${prescription.prescriptionNumber} ${action === 'verify' ? 'verified' : 'rejected'}`,
    ipAddress: req.ip
  });

  res.json({
    success: true,
    message: `Prescription ${action === 'verify' ? 'verified' : 'rejected'} successfully`,
    data: { prescription }
  });
}));

// @route   PUT /api/prescriptions/:id/fulfill
// @desc    Mark prescription as fulfilled
// @access  Pharmacist/Admin
router.put('/:id/fulfill', protect, isPharmacistOrAdmin, validateObjectId, asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return res.status(404).json({
      success: false,
      message: 'Prescription not found'
    });
  }

  if (prescription.status !== 'verified') {
    return res.status(400).json({
      success: false,
      message: 'Only verified prescriptions can be fulfilled'
    });
  }

  prescription.status = 'fulfilled';
  if (orderId) {
    prescription.orders.push(orderId);
  }

  await prescription.save();

  res.json({
    success: true,
    message: 'Prescription marked as fulfilled',
    data: { prescription }
  });
}));

export default router;
