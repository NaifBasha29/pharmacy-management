import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Clinic from '../models/Clinic.js';
import Patient from '../models/Patient.js';
import Session from '../models/Session.js';

// Protect routes - verify JWT token and session
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - no token provided',
      code: 'NO_TOKEN'
    });
  }

  try {
    // Verify JWT signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate session is active (STRICT session tracking)
    const session = await Session.validateSession(token);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid. Please login again.',
        code: 'SESSION_INVALID'
      });
    }

    // Find user based on type (supports User, Clinic, Patient)
    let user = null;

    // Try to find in Users collection first
    user = await User.findById(decoded.id).select('-password');

    if (!user) {
      // Try Clinic collection
      const clinic = await Clinic.findById(decoded.id);
      if (clinic) {
        user = {
          _id: clinic._id,
          id: clinic._id,
          name: clinic.name,
          email: clinic.adminAccount?.email || clinic.contact?.email,
          role: 'clinic_admin',
          type: 'clinic',
          clinicId: clinic._id
        };
      }
    }

    if (!user) {
      // Try Patient collection
      const patient = await Patient.findById(decoded.id);
      if (patient) {
        user = {
          _id: patient._id,
          id: patient._id,
          name: patient.name,
          email: patient.email,
          role: 'patient',
          type: 'patient',
          patientId: patient.patientId
        };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized - invalid token',
      code: 'INVALID_TOKEN'
    });
  }
};

// Authorize roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Generate JWT Token
export const generateToken = (id, type = 'user') => {
  return jwt.sign({ id, type }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m'
  });
};

// Generate Refresh Token
export const generateRefreshToken = (id, type = 'user') => {
  return jwt.sign({ id, type }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};

// Extract device info from request
export const getDeviceInfo = (req) => {
  return {
    ip: req.ip || req.connection?.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    browser: req.headers['user-agent']?.split('/')[0] || 'unknown',
    os: 'unknown' // Can be parsed from user-agent
  };
};

export default { protect, authorize, generateToken, generateRefreshToken, getDeviceInfo };
