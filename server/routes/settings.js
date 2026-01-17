import express from 'express';
import Settings from '../models/Settings.js';
import AuditLog from '../models/AuditLog.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roleAuth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/settings
// @desc    Get pharmacy settings
// @access  Admin
router.get('/', protect, isAdmin, asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();

  res.json({
    success: true,
    data: { settings }
  });
}));

// @route   GET /api/settings/public
// @desc    Get public pharmacy settings
// @access  Public
router.get('/public', asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();

  // Only return public information
  res.json({
    success: true,
    data: {
      pharmacyName: settings.pharmacyName,
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
      workingHours: settings.workingHours,
      currency: settings.currency,
      currencySymbol: settings.currencySymbol
    }
  });
}));

// @route   PUT /api/settings
// @desc    Update pharmacy settings
// @access  Admin
router.put('/', protect, isAdmin, asyncHandler(async (req, res) => {
  let settings = await Settings.getSettings();
  
  const previousValue = settings.toObject();

  // Update settings
  Object.assign(settings, req.body);
  await settings.save();

  // Log action
  await AuditLog.log({
    user: req.user._id,
    action: 'SETTINGS_CHANGE',
    resource: 'Settings',
    resourceId: settings._id,
    description: 'Pharmacy settings updated',
    previousValue,
    newValue: settings.toObject(),
    ipAddress: req.ip
  });

  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: { settings }
  });
}));

export default router;
