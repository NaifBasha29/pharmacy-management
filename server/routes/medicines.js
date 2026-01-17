import express from 'express';
import Medicine from '../models/Medicine.js';
import Category from '../models/Category.js';
import AuditLog from '../models/AuditLog.js';
import { protect } from '../middleware/auth.js';
import { authorize, isAdmin, isPharmacistOrAdmin } from '../middleware/roleAuth.js';
import { medicineValidation, validateObjectId } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getIO } from '../config/socket.js';

const router = express.Router();

// @route   GET /api/medicines
// @desc    Get all medicines (with pagination, search, filters)
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const category = req.query.category || '';
  const minPrice = parseFloat(req.query.minPrice) || 0;
  const maxPrice = parseFloat(req.query.maxPrice) || Infinity;
  const inStock = req.query.inStock === 'true';
  const prescriptionRequired = req.query.prescriptionRequired;
  const sortBy = req.query.sortBy || 'name';
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

  const query = { isActive: true };

  // Search by name or generic name
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { genericName: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) {
    query.category = category;
  }

  query.price = { $gte: minPrice };
  if (maxPrice !== Infinity) {
    query.price.$lte = maxPrice;
  }

  if (inStock) {
    query.stock = { $gt: 0 };
  }

  if (prescriptionRequired !== undefined) {
    query.prescription_required = prescriptionRequired === 'true';
  }

  const total = await Medicine.countDocuments(query);
  const medicines = await Medicine.find(query)
    .populate('category', 'name')
    .populate('supplier', 'name')
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: {
      medicines,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   GET /api/medicines/:id
// @desc    Get medicine by ID
// @access  Public
router.get('/:id', validateObjectId, asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id)
    .populate('category', 'name description')
    .populate('supplier', 'name email phone');

  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: 'Medicine not found'
    });
  }

  res.json({
    success: true,
    data: { medicine }
  });
}));

// @route   POST /api/medicines
// @desc    Create a new medicine
// @access  Admin/Pharmacist
router.post('/', protect, isPharmacistOrAdmin, medicineValidation.create, asyncHandler(async (req, res) => {
  const medicine = await Medicine.create(req.body);

  // Log action
  await AuditLog.log({
    user: req.user._id,
    action: 'CREATE',
    resource: 'Medicine',
    resourceId: medicine._id,
    description: `New medicine added: ${medicine.name}`,
    newValue: { name: medicine.name, price: medicine.price, stock: medicine.stock },
    ipAddress: req.ip
  });

  res.status(201).json({
    success: true,
    message: 'Medicine created successfully',
    data: { medicine }
  });
}));

// @route   PUT /api/medicines/:id
// @desc    Update medicine
// @access  Admin/Pharmacist
router.put('/:id', protect, isPharmacistOrAdmin, validateObjectId, medicineValidation.update, asyncHandler(async (req, res) => {
  let medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: 'Medicine not found'
    });
  }

  const previousValue = {
    name: medicine.name,
    price: medicine.price,
    stock: medicine.stock
  };

  medicine = await Medicine.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  // Check for low stock and emit notification
  if (medicine.stock <= medicine.minStockLevel) {
    try {
      const io = getIO();
      io.to('admin').to('pharmacist').emit('stock-notification', {
        type: 'low-stock',
        medicine: {
          id: medicine._id,
          name: medicine.name,
          stock: medicine.stock,
          minStockLevel: medicine.minStockLevel
        },
        message: `Low stock alert: ${medicine.name} has only ${medicine.stock} units left`
      });
    } catch (e) {
      // Socket not initialized, skip notification
    }
  }

  // Log action
  await AuditLog.log({
    user: req.user._id,
    action: 'UPDATE',
    resource: 'Medicine',
    resourceId: medicine._id,
    description: `Medicine updated: ${medicine.name}`,
    previousValue,
    newValue: { name: medicine.name, price: medicine.price, stock: medicine.stock },
    ipAddress: req.ip
  });

  res.json({
    success: true,
    message: 'Medicine updated successfully',
    data: { medicine }
  });
}));

// @route   DELETE /api/medicines/:id
// @desc    Delete medicine (soft delete - set isActive to false)
// @access  Admin only
router.delete('/:id', protect, isAdmin, validateObjectId, asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: 'Medicine not found'
    });
  }

  // Soft delete
  medicine.isActive = false;
  await medicine.save();

  // Log action
  await AuditLog.log({
    user: req.user._id,
    action: 'DELETE',
    resource: 'Medicine',
    resourceId: medicine._id,
    description: `Medicine deleted: ${medicine.name}`,
    ipAddress: req.ip
  });

  res.json({
    success: true,
    message: 'Medicine deleted successfully'
  });
}));

// @route   PUT /api/medicines/:id/stock
// @desc    Update stock (for dispensing or restocking)
// @access  Admin/Pharmacist
router.put('/:id/stock', protect, isPharmacistOrAdmin, validateObjectId, asyncHandler(async (req, res) => {
  const { quantity, action } = req.body; // action: 'add' or 'subtract'

  if (!quantity || !action) {
    return res.status(400).json({
      success: false,
      message: 'Quantity and action are required'
    });
  }

  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: 'Medicine not found'
    });
  }

  const previousStock = medicine.stock;

  if (action === 'add') {
    medicine.stock += quantity;
  } else if (action === 'subtract') {
    if (medicine.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }
    medicine.stock -= quantity;
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid action. Use "add" or "subtract"'
    });
  }

  await medicine.save();

  // Check for low stock
  if (medicine.stock <= medicine.minStockLevel) {
    try {
      const io = getIO();
      io.to('admin').to('pharmacist').emit('stock-notification', {
        type: 'low-stock',
        medicine: {
          id: medicine._id,
          name: medicine.name,
          stock: medicine.stock,
          minStockLevel: medicine.minStockLevel
        }
      });
    } catch (e) {
      // Socket not initialized
    }
  }

  // Log action
  await AuditLog.log({
    user: req.user._id,
    action: action === 'add' ? 'RESTOCK' : 'DISPENSE',
    resource: 'Medicine',
    resourceId: medicine._id,
    description: `Stock ${action === 'add' ? 'added' : 'subtracted'}: ${medicine.name} (${quantity} units)`,
    previousValue: { stock: previousStock },
    newValue: { stock: medicine.stock },
    ipAddress: req.ip
  });

  res.json({
    success: true,
    message: `Stock ${action === 'add' ? 'added' : 'subtracted'} successfully`,
    data: {
      medicine: {
        id: medicine._id,
        name: medicine.name,
        stock: medicine.stock,
        stockStatus: medicine.stockStatus
      }
    }
  });
}));

// @route   GET /api/medicines/low-stock
// @desc    Get medicines with low stock
// @access  Admin/Pharmacist
router.get('/alerts/low-stock', protect, isPharmacistOrAdmin, asyncHandler(async (req, res) => {
  const medicines = await Medicine.find({
    isActive: true,
    $expr: { $lte: ['$stock', '$minStockLevel'] }
  }).populate('category', 'name').populate('supplier', 'name');

  res.json({
    success: true,
    data: {
      count: medicines.length,
      medicines
    }
  });
}));

// @route   GET /api/medicines/expiring-soon
// @desc    Get medicines expiring within 30 days
// @access  Admin/Pharmacist
router.get('/alerts/expiring-soon', protect, isPharmacistOrAdmin, asyncHandler(async (req, res) => {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const medicines = await Medicine.find({
    isActive: true,
    expiryDate: { $lte: thirtyDaysFromNow, $gte: new Date() }
  }).populate('category', 'name').sort({ expiryDate: 1 });

  res.json({
    success: true,
    data: {
      count: medicines.length,
      medicines
    }
  });
}));

// @route   GET /api/medicines/stats
// @desc    Get medicine statistics
// @access  Admin/Pharmacist
router.get('/stats/overview', protect, isPharmacistOrAdmin, asyncHandler(async (req, res) => {
  const totalMedicines = await Medicine.countDocuments({ isActive: true });
  const outOfStock = await Medicine.countDocuments({ isActive: true, stock: 0 });
  const lowStock = await Medicine.countDocuments({
    isActive: true,
    $expr: { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$minStockLevel'] }] }
  });

  const totalValue = await Medicine.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$stock'] } } } }
  ]);

  const categoryStats = await Medicine.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$stock' } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: '$category' },
    { $project: { name: '$category.name', count: 1, totalStock: 1 } }
  ]);

  res.json({
    success: true,
    data: {
      totalMedicines,
      outOfStock,
      lowStock,
      inStock: totalMedicines - outOfStock,
      totalInventoryValue: totalValue[0]?.total || 0,
      categoryStats
    }
  });
}));

export default router;
