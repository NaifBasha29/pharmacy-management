import express from 'express';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { protect } from '../middleware/auth.js';
import { authorize, isAdmin } from '../middleware/roleAuth.js';
import { userValidation, validateObjectId } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (with pagination)
// @access  Admin only
router.get('/', protect, isAdmin, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const role = req.query.role || '';

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (role) {
    query.role = role;
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password -refreshToken')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Admin only
router.get('/:id', protect, isAdmin, validateObjectId, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: { user }
  });
}));

// @route   POST /api/users
// @desc    Create a new user (admin can create pharmacist/user)
// @access  Admin only
router.post('/', protect, isAdmin, userValidation.register, asyncHandler(async (req, res) => {
  const { name, email, password, phone, address, role } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
    role: role || 'user'
  });

  // Log action
  await AuditLog.log({
    user: req.user._id,
    action: 'CREATE',
    resource: 'User',
    resourceId: user._id,
    description: `Admin created new ${user.role}: ${user.email}`,
    ipAddress: req.ip
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
}));

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Admin only
router.put('/:id', protect, isAdmin, validateObjectId, userValidation.update, asyncHandler(async (req, res) => {
  const { name, email, phone, address, role, isActive } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Store previous values for audit
  const previousValue = {
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  };

  // Update fields
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (role) user.role = role;
  if (typeof isActive === 'boolean') user.isActive = isActive;

  await user.save();

  // Log action
  await AuditLog.log({
    user: req.user._id,
    action: 'UPDATE',
    resource: 'User',
    resourceId: user._id,
    description: `Admin updated user: ${user.email}`,
    previousValue,
    newValue: { name, email, role, isActive },
    ipAddress: req.ip
  });

  res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    }
  });
}));

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Admin only
router.delete('/:id', protect, isAdmin, validateObjectId, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot delete your own account'
    });
  }

  await User.findByIdAndDelete(req.params.id);

  // Log action
  await AuditLog.log({
    user: req.user._id,
    action: 'DELETE',
    resource: 'User',
    resourceId: user._id,
    description: `Admin deleted user: ${user.email}`,
    previousValue: { name: user.name, email: user.email, role: user.role },
    ipAddress: req.ip
  });

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
}));

// @route   PUT /api/users/profile
// @desc    Update own profile
// @access  Private
router.put('/profile', protect, userValidation.update, asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = address;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    }
  });
}));

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Admin only
router.get('/stats/overview', protect, isAdmin, asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const adminCount = await User.countDocuments({ role: 'admin' });
  const pharmacistCount = await User.countDocuments({ role: 'pharmacist' });
  const userCount = await User.countDocuments({ role: 'user' });

  // Recently registered users (last 7 days)
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: lastWeek } });

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      byRole: {
        admin: adminCount,
        pharmacist: pharmacistCount,
        user: userCount
      },
      newUsersThisWeek
    }
  });
}));

export default router;
