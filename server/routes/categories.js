import express from 'express';
import Category from '../models/Category.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roleAuth.js';
import { validateObjectId } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });

  res.json({
    success: true,
    data: { categories }
  });
}));

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', validateObjectId, asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.json({
    success: true,
    data: { category }
  });
}));

// @route   POST /api/categories
// @desc    Create a new category
// @access  Admin only
router.post('/', protect, isAdmin, asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;

  const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: 'Category already exists'
    });
  }

  const category = await Category.create({ name, description, image });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category }
  });
}));

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Admin only
router.put('/:id', protect, isAdmin, validateObjectId, asyncHandler(async (req, res) => {
  const { name, description, image, isActive } = req.body;

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, description, image, isActive },
    { new: true, runValidators: true }
  );

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: { category }
  });
}));

// @route   DELETE /api/categories/:id
// @desc    Delete category (soft delete)
// @access  Admin only
router.delete('/:id', protect, isAdmin, validateObjectId, asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
}));

export default router;
