import express from 'express';
import Supplier from '../models/Supplier.js';
import { protect } from '../middleware/auth.js';
import { isAdmin, isPharmacistOrAdmin } from '../middleware/roleAuth.js';
import { validateObjectId } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/suppliers
// @desc    Get all suppliers
// @access  Admin/Pharmacist
router.get('/', protect, isPharmacistOrAdmin, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';

  const query = { isActive: true };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Supplier.countDocuments(query);
  const suppliers = await Supplier.find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: {
      suppliers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   GET /api/suppliers/:id
// @desc    Get supplier by ID
// @access  Admin/Pharmacist
router.get('/:id', protect, isPharmacistOrAdmin, validateObjectId, asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  res.json({
    success: true,
    data: { supplier }
  });
}));

// @route   POST /api/suppliers
// @desc    Create a new supplier
// @access  Admin only
router.post('/', protect, isAdmin, asyncHandler(async (req, res) => {
  const supplier = await Supplier.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Supplier created successfully',
    data: { supplier }
  });
}));

// @route   PUT /api/suppliers/:id
// @desc    Update supplier
// @access  Admin only
router.put('/:id', protect, isAdmin, validateObjectId, asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  res.json({
    success: true,
    message: 'Supplier updated successfully',
    data: { supplier }
  });
}));

// @route   DELETE /api/suppliers/:id
// @desc    Delete supplier (soft delete)
// @access  Admin only
router.delete('/:id', protect, isAdmin, validateObjectId, asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: 'Supplier not found'
    });
  }

  res.json({
    success: true,
    message: 'Supplier deleted successfully'
  });
}));

export default router;
