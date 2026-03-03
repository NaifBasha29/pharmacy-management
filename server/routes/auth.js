import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import Patient from '../models/Patient.js';
import AuditLog from '../models/AuditLog.js';
import Session from '../models/Session.js';
import { protect, generateToken, generateRefreshToken, getDeviceInfo } from '../middleware/auth.js';
import { userValidation } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', userValidation.register, asyncHandler(async (req, res) => {
  const { name, email, password, phone, address, role } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Allow only specific roles
  const allowedRoles = ['admin', 'pharmacist', 'user'];
  const userRole = (role && allowedRoles.includes(role)) ? role : 'user';

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
    role: userRole
  });

  // Generate tokens
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Log action
  await AuditLog.log({
    user: user._id,
    action: 'CREATE',
    resource: 'User',
    resourceId: user._id,
    description: `New user registered: ${user.email}`,
    ipAddress: req.ip
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    }
  });
}));

// @route   POST /api/auth/login/admin
// @desc    Login admin user (Users collection)
// @access  Public
router.post('/login/admin', loginRateLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // STRICT: Check only Users collection
  const user = await User.findOne({ email }).select('+password');

  if (!user || user.role !== 'admin') {
    // If not found OR not an admin role (strict separation)
    return res.status(401).json({
      success: false,
      message: 'Invalid admin credentials'
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account deactivated'
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin credentials'
    });
  }

  const accessToken = generateToken(user._id, 'admin');
  const refreshToken = generateRefreshToken(user._id, 'admin');

  // Create session (kills existing sessions - single device enforcement)
  await Session.createSession({
    userId: user._id,
    userType: 'User',
    accessToken,
    refreshToken,
    deviceInfo: getDeviceInfo(req),
    expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  await AuditLog.log({
    user: user._id,
    action: 'LOGIN',
    resource: 'User',
    resourceId: user._id,
    description: `Admin logged in: ${user.email}`,
    ipAddress: req.ip
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        type: 'admin'
      },
      accessToken,
      refreshToken
    }
  });
}));

// @route   POST /api/auth/login/clinic
// @desc    Login clinic admin (Clinics collection)
// @access  Public
router.post('/login/clinic', loginRateLimiter, asyncHandler(async (req, res) => {
  const { email, password, username } = req.body; // Can login with email or username

  console.log('[Clinic Login] Attempting login with:', { email, username, passwordLength: password?.length });

  let clinic;

  // Check if input looks like an email or username
  const isEmail = email && email.includes('@');

  if (isEmail) {
    // Try to find by admin account email first, then contact email
    clinic = await Clinic.findOne({
      $or: [
        { 'adminAccount.email': email },
        { 'contact.email': email }
      ]
    }).select('+adminAccount.password +adminAccount.tempPassword');
    console.log('[Clinic Login] Searched by email, found:', clinic ? clinic.name : 'NOT FOUND');
  } else if (email) {
    // Treat as username if no @ symbol
    clinic = await Clinic.findOne({ 'adminAccount.username': email }).select('+adminAccount.password +adminAccount.tempPassword');
    console.log('[Clinic Login] Searched by username (from email field), found:', clinic ? clinic.name : 'NOT FOUND');
  } else if (username) {
    clinic = await Clinic.findOne({ 'adminAccount.username': username }).select('+adminAccount.password +adminAccount.tempPassword');
    console.log('[Clinic Login] Searched by username, found:', clinic ? clinic.name : 'NOT FOUND');
  }

  if (!clinic) {
    return res.status(401).json({
      success: false,
      message: 'Invalid clinic credentials'
    });
  }

  // Check verification status
  if (clinic.verification?.clinicStatus !== 'active' || clinic.verification?.adminAccountStatus !== 'enabled') {
    return res.status(401).json({
      success: false,
      message: 'Clinic account is not active. Please contact the administrator.'
    });
  }

  // Check password - first try hashed password, then tempPassword for first login
  let isMatch = false;
  let isFirstLogin = false;

  console.log('[Clinic Login] Checking password...');
  console.log('[Clinic Login] Has hashed password:', !!clinic.adminAccount.password);
  console.log('[Clinic Login] Has tempPassword:', !!clinic.adminAccount.tempPassword);

  // First, try the hashed password if it exists
  if (clinic.adminAccount.password) {
    isMatch = await clinic.comparePassword(password);
    console.log('[Clinic Login] Hashed password match:', isMatch);
  }

  // If no match and tempPassword exists, check against tempPassword
  if (!isMatch && clinic.adminAccount.tempPassword) {
    isMatch = (password === clinic.adminAccount.tempPassword);
    isFirstLogin = isMatch; // If matched tempPassword, it's first login
    console.log('[Clinic Login] TempPassword match:', isMatch);
  }

  if (!isMatch) {
    console.log('[Clinic Login] Login FAILED - password mismatch');
    return res.status(401).json({
      success: false,
      message: 'Invalid clinic credentials'
    });
  }

  console.log('[Clinic Login] Login SUCCESS for:', clinic.name);

  // Reuse User Token generation (using clinic ID) - effectively acting as a 'user' in the system
  // NOTE: protect middleware typically looks up User. We might need to adjust protect middleware or 
  // ensure we handle 'clinic' type tokens. For now, sending ID.
  const accessToken = generateToken(clinic._id, 'clinic');
  const refreshToken = generateRefreshToken(clinic._id, 'clinic');

  // Create session (kills existing sessions - single device enforcement)
  await Session.createSession({
    userId: clinic._id,
    userType: 'Clinic',
    accessToken,
    refreshToken,
    deviceInfo: getDeviceInfo(req),
    expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  await AuditLog.log({
    user: clinic._id,  // Use clinic ID as user for audit logging
    action: 'LOGIN',
    resource: 'Clinic',
    resourceId: clinic._id,
    description: `Clinic admin logged in: ${clinic.name}`,
    ipAddress: req.ip
  });

  res.json({
    success: true,
    data: {
      user: { // Normalized to 'user' for frontend compatibility
        id: clinic._id,
        clinicId: clinic._id,  // Explicitly include clinic ID for routing
        clinicCode: clinic.code,
        name: clinic.name,
        email: clinic.adminAccount?.email || clinic.contact?.email,
        role: 'clinic_admin',
        type: 'clinic',
        logo: clinic.logo,
        isFirstLogin: isFirstLogin
      },
      accessToken,
      refreshToken
    }
  });
}));

// @route   POST /api/auth/login/patient
// @desc    Login patient (Patient collection)
// @access  Public
router.post('/login/patient', loginRateLimiter, asyncHandler(async (req, res) => {
  const { patientId, password } = req.body;

  const patient = await Patient.findOne({ patientId }).select('+password');

  if (!patient) {
    return res.status(401).json({
      success: false,
      message: 'Invalid patient credentials'
    });
  }

  if (!patient.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Patient account is inactive'
    });
  }

  const isMatch = await patient.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid patient credentials'
    });
  }

  const accessToken = generateToken(patient._id, 'patient');
  const refreshToken = generateRefreshToken(patient._id, 'patient');

  // Create session (kills existing sessions - single device enforcement)
  await Session.createSession({
    userId: patient._id,
    userType: 'Patient',
    accessToken,
    refreshToken,
    deviceInfo: getDeviceInfo(req),
    expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  await AuditLog.log({
    action: 'LOGIN',
    resource: 'Patient',
    resourceId: patient._id,
    description: `Patient logged in: ${patient.patientId}`,
    ipAddress: req.ip
  });

  res.json({
    success: true,
    data: {
      user: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        role: 'user',
        type: 'patient',
        patientId: patient.patientId
      },
      accessToken,
      refreshToken
    }
  });
}));

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public
router.post('/refresh-token', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
}));

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
  // req.user is already populated by protect middleware for all user types
  // (User, Clinic, Patient)
  const userData = req.user;

  // If it's a patient type, get fresh data from Patient collection
  if (userData.type === 'patient') {
    const patient = await Patient.findById(userData._id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    return res.json({
      success: true,
      data: {
        user: {
          id: patient._id,
          name: patient.name,
          email: patient.email,
          patientId: patient.patientId,
          phone: patient.phone,
          role: 'user',
          type: 'patient',
          createdAt: patient.createdAt
        }
      }
    });
  }

  // If it's a clinic type, get fresh data from Clinic collection
  if (userData.type === 'clinic') {
    const clinic = await Clinic.findById(userData._id);
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }
    return res.json({
      success: true,
      data: {
        user: {
          id: clinic._id,
          name: clinic.name,
          email: clinic.adminAccount?.email || clinic.contact?.email,
          role: 'clinic_admin',
          type: 'clinic',
          clinicId: clinic._id,
          createdAt: clinic.createdAt
        }
      }
    });
  }

  // Default: User collection
  const user = await User.findById(userData._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    }
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout user - destroys session completely
// @access  Private
router.post('/logout', protect, asyncHandler(async (req, res) => {
  const token = req.token; // Token from protect middleware

  // Destroy session from Session store
  await Session.destroySession(token, 'manual');

  // Also clear refresh token from User model if user type
  if (req.user.type !== 'clinic' && req.user.type !== 'patient') {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  }

  // Log action
  await AuditLog.log({
    user: req.user._id,
    action: 'LOGOUT',
    resource: req.user.type === 'clinic' ? 'Clinic' : req.user.type === 'patient' ? 'Patient' : 'User',
    resourceId: req.user._id,
    description: `User logged out: ${req.user.email || req.user.name}`,
    ipAddress: req.ip
  });

  res.json({
    success: true,
    message: 'Logged out successfully. All sessions destroyed.'
  });
}));

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required'
    });
  }

  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();

  // Log action
  await AuditLog.log({
    user: req.user._id,
    action: 'PASSWORD_CHANGE',
    resource: 'User',
    resourceId: req.user._id,
    description: `Password changed for user: ${req.user.email}`,
    ipAddress: req.ip
  });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

export default router;
