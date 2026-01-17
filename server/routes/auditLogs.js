import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roleAuth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/audit-logs
// @desc    Get audit logs
// @access  Admin only
router.get('/', protect, isAdmin, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  
  const action = req.query.action || '';
  const resource = req.query.resource || '';
  const userId = req.query.userId || '';
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  const query = {};

  if (action) query.action = action;
  if (resource) query.resource = resource;
  if (userId) query.user = userId;
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const total = await AuditLog.countDocuments(query);
  const logs = await AuditLog.find(query)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   GET /api/audit-logs/actions
// @desc    Get distinct actions for filtering
// @access  Admin only
router.get('/actions', protect, isAdmin, asyncHandler(async (req, res) => {
  const actions = await AuditLog.distinct('action');
  const resources = await AuditLog.distinct('resource');

  res.json({
    success: true,
    data: { actions, resources }
  });
}));

export default router;
