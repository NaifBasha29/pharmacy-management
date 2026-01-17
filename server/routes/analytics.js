import express from 'express';
import Order from '../models/Order.js';
import Medicine from '../models/Medicine.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { isAdmin, isPharmacistOrAdmin } from '../middleware/roleAuth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard overview statistics
// @access  Admin/Pharmacist
router.get('/dashboard', protect, isPharmacistOrAdmin, asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  // Orders statistics
  const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });
  const thisMonthOrders = await Order.countDocuments({ createdAt: { $gte: thisMonth } });
  const pendingOrders = await Order.countDocuments({ status: 'pending' });

  // Revenue calculations
  const todayRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: today }, paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);

  const thisMonthRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: thisMonth }, paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);

  const lastMonthRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: lastMonth, $lte: lastMonthEnd }, paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);

  // Inventory stats
  const totalMedicines = await Medicine.countDocuments({ isActive: true });
  const lowStockCount = await Medicine.countDocuments({
    isActive: true,
    $expr: { $lte: ['$stock', '$minStockLevel'] }
  });
  const outOfStockCount = await Medicine.countDocuments({ isActive: true, stock: 0 });

  // User stats
  const totalUsers = await User.countDocuments({ role: 'user' });
  const newUsersThisMonth = await User.countDocuments({
    role: 'user',
    createdAt: { $gte: thisMonth }
  });

  res.json({
    success: true,
    data: {
      orders: {
        today: todayOrders,
        thisMonth: thisMonthOrders,
        pending: pendingOrders
      },
      revenue: {
        today: todayRevenue[0]?.total || 0,
        thisMonth: thisMonthRevenue[0]?.total || 0,
        lastMonth: lastMonthRevenue[0]?.total || 0,
        growth: lastMonthRevenue[0]?.total 
          ? (((thisMonthRevenue[0]?.total || 0) - lastMonthRevenue[0].total) / lastMonthRevenue[0].total * 100).toFixed(2)
          : 0
      },
      inventory: {
        total: totalMedicines,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount
      },
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth
      }
    }
  });
}));

// @route   GET /api/analytics/sales
// @desc    Get sales analytics
// @access  Admin only
router.get('/sales', protect, isAdmin, asyncHandler(async (req, res) => {
  const period = req.query.period || 'week'; // week, month, year
  let startDate = new Date();

  if (period === 'week') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === 'month') {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (period === 'year') {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  // Daily sales for the period
  const dailySales = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Sales by payment method
  const salesByPayment = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
    {
      $group: {
        _id: '$paymentMethod',
        revenue: { $sum: '$total' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Total revenue
  const totalRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
  ]);

  res.json({
    success: true,
    data: {
      period,
      dailySales,
      salesByPayment,
      summary: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrders: totalRevenue[0]?.count || 0,
        averageOrderValue: totalRevenue[0]?.count 
          ? (totalRevenue[0].total / totalRevenue[0].count).toFixed(2)
          : 0
      }
    }
  });
}));

// @route   GET /api/analytics/popular-medicines
// @desc    Get popular medicines
// @access  Admin/Pharmacist
router.get('/popular-medicines', protect, isPharmacistOrAdmin, asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const popularMedicines = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.medicine',
        name: { $first: '$items.name' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'medicines',
        localField: '_id',
        foreignField: '_id',
        as: 'medicine'
      }
    },
    { $unwind: { path: '$medicine', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        medicineId: '$_id',
        name: { $ifNull: ['$medicine.name', '$name'] },
        totalQuantity: 1,
        totalRevenue: 1,
        orderCount: 1
      }
    }
  ]);

  res.json({
    success: true,
    data: { popularMedicines }
  });
}));

// @route   GET /api/analytics/transactions
// @desc    Get transaction history
// @access  Admin only
router.get('/transactions', protect, isAdmin, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const total = await Order.countDocuments({ paymentStatus: 'paid' });
  const transactions = await Order.find({ paymentStatus: 'paid' })
    .select('orderNumber total paymentMethod paymentDetails createdAt')
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

export default router;
