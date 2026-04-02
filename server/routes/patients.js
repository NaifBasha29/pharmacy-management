import express from 'express';
import Patient from '../models/Patient.js';
import { protect } from '../middleware/auth.js';
import { isPharmacistOrAdmin } from '../middleware/roleAuth.js';
import { validateObjectId } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   PUT /api/patients/profile
// @desc    Update own patient profile (medical info)
// @access  Private (patient)
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const { bloodGroup, allergies, chronicConditions, address, phone, name, email } = req.body;

  const patient = await Patient.findById(req.user._id);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  if (bloodGroup) patient.bloodGroup = bloodGroup;
  if (Array.isArray(allergies)) patient.allergies = allergies;
  if (Array.isArray(chronicConditions)) patient.chronicConditions = chronicConditions;
  if (address) patient.address = address;
  if (phone) patient.phone = phone;
  if (name) patient.name = name;
  if (email) patient.email = email;

  await patient.save();

  res.json({
    success: true,
    message: 'Patient profile updated successfully',
    data: { patient }
  });
}));

// @route   GET /api/patients
// @desc    Get all patients
// @access  Pharmacist/Admin
router.get('/', protect, isPharmacistOrAdmin, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';

  const query = { isActive: true };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { patientId: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Patient.countDocuments(query);
  const patients = await Patient.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: {
      patients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   GET /api/patients/:id
// @desc    Get patient by ID
// @access  Pharmacist/Admin
router.get('/:id', protect, isPharmacistOrAdmin, validateObjectId, asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate('user', 'name email');

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  res.json({
    success: true,
    data: { patient }
  });
}));

// @route   POST /api/patients
// @desc    Create a new patient
// @access  Pharmacist/Admin
router.post('/', protect, isPharmacistOrAdmin, asyncHandler(async (req, res) => {
  const patient = await Patient.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Patient created successfully',
    data: { patient }
  });
}));

// @route   PUT /api/patients/:id
// @desc    Update patient
// @access  Pharmacist/Admin
router.put('/:id', protect, isPharmacistOrAdmin, validateObjectId, asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  res.json({
    success: true,
    message: 'Patient updated successfully',
    data: { patient }
  });
}));

// @route   PUT /api/patients/:id/medical-history
// @desc    Add to medical history
// @access  Pharmacist/Admin
router.put('/:id/medical-history', protect, isPharmacistOrAdmin, validateObjectId, asyncHandler(async (req, res) => {
  const { condition, diagnosedDate, notes } = req.body;

  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    { $push: { medicalHistory: { condition, diagnosedDate, notes } } },
    { new: true }
  );

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  res.json({
    success: true,
    message: 'Medical history updated',
    data: { patient }
  });
}));

// @route   DELETE /api/patients/:id
// @desc    Delete patient (soft delete)
// @access  Admin only
router.delete('/:id', protect, isPharmacistOrAdmin, validateObjectId, asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  res.json({
    success: true,
    message: 'Patient deleted successfully'
  });
}));

export default router;
