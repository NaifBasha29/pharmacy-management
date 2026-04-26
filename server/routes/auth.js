import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import Clinic from "../models/Clinic.js";
import Patient from "../models/Patient.js";
import AuditLog from "../models/AuditLog.js";
import Session from "../models/Session.js";
import {
  protect,
  generateToken,
  generateRefreshToken,
  getDeviceInfo,
} from "../middleware/auth.js";
import { userValidation } from "../middleware/validation.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { loginRateLimiter, strictOtpLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Gmail transporter for OTP emails
const createMailTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn(
      '[Mailer] GMAIL_USER or GMAIL_APP_PASSWORD is not set. OTP emails may fail.',
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

// @route   POST /api/auth/register/patient
// @desc    Self-register a patient account for mobile app
// @access  Public
router.post(
  "/register/patient",
  asyncHandler(async (req, res) => {
    const {
      name,
      email,
      phone,
      password,
      dateOfBirth,
      bloodGroup,
      allergies,
      chronicConditions,
      address,
    } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingPhone = await Patient.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "An account with this phone number already exists",
      });
    }

    if (email) {
      const existingEmail = await Patient.findOne({
        email: email.toLowerCase().trim(),
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists",
        });
      }
    }

    const patientData = {
      name: name.trim(),
      phone: phone.trim(),
      password,
      gender: "other",
      isActive: true,
      bloodGroup: bloodGroup || "unknown",
      allergies: Array.isArray(allergies) ? allergies : [],
      chronicConditions: Array.isArray(chronicConditions)
        ? chronicConditions
        : [],
    };

    if (email) {
      patientData.email = email.toLowerCase().trim();
    }

    if (dateOfBirth && String(dateOfBirth).trim()) {
      const parsedDate = new Date(String(dateOfBirth).trim());
      if (!Number.isNaN(parsedDate.getTime())) {
        patientData.dateOfBirth = parsedDate;
      }
    }

    if (address && String(address).trim()) {
      patientData.address = { street: String(address).trim() };
    }

    const patient = await Patient.create(patientData);

    const accessToken = generateToken(patient._id, "patient");
    const refreshToken = generateRefreshToken(patient._id, "patient");

    await Session.createSession({
      userId: patient._id,
      userType: "Patient",
      accessToken,
      refreshToken,
      deviceInfo: getDeviceInfo(req),
      expiresIn: 7 * 24 * 60 * 60 * 1000,
    });

    await AuditLog.log({
      action: "CREATE",
      resource: "Patient",
      resourceId: patient._id,
      description: `New patient self-registered: ${patient.patientId}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        user: {
          id: patient._id,
          name: patient.name,
          email: patient.email,
          patientId: patient.patientId,
          phone: patient.phone,
          role: "patient",
          type: "patient",
        },
        patientId: patient.patientId,
        accessToken,
        refreshToken,
      },
    });
  }),
);

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  userValidation.register,
  asyncHandler(async (req, res) => {
    const { name, email, password, phone, address, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
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
      role: userRole,
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
      action: "CREATE",
      resource: "User",
      resourceId: user._id,
      description: `New user registered: ${user.email}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  }),
);

// @route   POST /api/auth/login/admin
// @desc    Login admin user (Users collection)
// @access  Public
router.post(
  "/login/admin",
  loginRateLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // STRICT: Check only Users collection
    const user = await User.findOne({ email }).select("+password");

    if (!user || user.role !== "admin") {
      // If not found OR not an admin role (strict separation)
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account deactivated",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const accessToken = generateToken(user._id, "admin");
    const refreshToken = generateRefreshToken(user._id, "admin");

    // Create session (kills existing sessions - single device enforcement)
    await Session.createSession({
      userId: user._id,
      userType: "User",
      accessToken,
      refreshToken,
      deviceInfo: getDeviceInfo(req),
      expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    await AuditLog.log({
      user: user._id,
      action: "LOGIN",
      resource: "User",
      resourceId: user._id,
      description: `Admin logged in: ${user.email}`,
      ipAddress: req.ip,
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
          type: "admin",
        },
        accessToken,
        refreshToken,
      },
    });
  }),
);

// @route   POST /api/auth/login/clinic
// @desc    Login clinic admin (Clinics collection)
// @access  Public
router.post(
  "/login/clinic",
  loginRateLimiter,
  asyncHandler(async (req, res) => {
    const { email, password, username } = req.body; // Can login with email or username

    console.log("[Clinic Login] Attempting login with:", {
      email,
      username,
      passwordLength: password?.length,
    });

    let clinic;

    // Check if input looks like an email or username
    const isEmail = email && email.includes("@");

    if (isEmail) {
      // Try to find by admin account email first, then contact email
      clinic = await Clinic.findOne({
        $or: [{ "adminAccount.email": email }, { "contact.email": email }],
      }).select("+adminAccount.password +adminAccount.tempPassword");
      console.log(
        "[Clinic Login] Searched by email, found:",
        clinic ? clinic.name : "NOT FOUND",
      );
    } else if (email) {
      // Treat as username if no @ symbol
      clinic = await Clinic.findOne({ "adminAccount.username": email }).select(
        "+adminAccount.password +adminAccount.tempPassword",
      );
      console.log(
        "[Clinic Login] Searched by username (from email field), found:",
        clinic ? clinic.name : "NOT FOUND",
      );
    } else if (username) {
      clinic = await Clinic.findOne({
        "adminAccount.username": username,
      }).select("+adminAccount.password +adminAccount.tempPassword");
      console.log(
        "[Clinic Login] Searched by username, found:",
        clinic ? clinic.name : "NOT FOUND",
      );
    }

    if (!clinic) {
      return res.status(401).json({
        success: false,
        message: "Invalid clinic credentials",
      });
    }

    // Check verification status
    if (
      clinic.verification?.clinicStatus !== "active" ||
      clinic.verification?.adminAccountStatus !== "enabled"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Clinic account is not active. Please contact the administrator.",
      });
    }

    // Check password - first try hashed password, then tempPassword for first login
    let isMatch = false;
    let isFirstLogin = false;

    console.log("[Clinic Login] Checking password...");
    console.log(
      "[Clinic Login] Has hashed password:",
      !!clinic.adminAccount.password,
    );
    console.log(
      "[Clinic Login] Has tempPassword:",
      !!clinic.adminAccount.tempPassword,
    );

    // First, try the hashed password if it exists
    if (clinic.adminAccount.password) {
      isMatch = await clinic.comparePassword(password);
      console.log("[Clinic Login] Hashed password match:", isMatch);
    }

    // If no match and tempPassword exists, check against tempPassword
    if (!isMatch && clinic.adminAccount.tempPassword) {
      isMatch = password === clinic.adminAccount.tempPassword;
      isFirstLogin = isMatch; // If matched tempPassword, it's first login
      console.log("[Clinic Login] TempPassword match:", isMatch);
    }

    if (!isMatch) {
      console.log("[Clinic Login] Login FAILED - password mismatch");
      return res.status(401).json({
        success: false,
        message: "Invalid clinic credentials",
      });
    }

    console.log("[Clinic Login] Login SUCCESS for:", clinic.name);

    // Reuse User Token generation (using clinic ID) - effectively acting as a 'user' in the system
    // NOTE: protect middleware typically looks up User. We might need to adjust protect middleware or
    // ensure we handle 'clinic' type tokens. For now, sending ID.
    const accessToken = generateToken(clinic._id, "clinic");
    const refreshToken = generateRefreshToken(clinic._id, "clinic");

    // Create session (kills existing sessions - single device enforcement)
    await Session.createSession({
      userId: clinic._id,
      userType: "Clinic",
      accessToken,
      refreshToken,
      deviceInfo: getDeviceInfo(req),
      expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await AuditLog.log({
      user: clinic._id, // Use clinic ID as user for audit logging
      action: "LOGIN",
      resource: "Clinic",
      resourceId: clinic._id,
      description: `Clinic admin logged in: ${clinic.name}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      data: {
        user: {
          // Normalized to 'user' for frontend compatibility
          id: clinic._id,
          clinicId: clinic._id, // Explicitly include clinic ID for routing
          clinicCode: clinic.code,
          name: clinic.name,
          email: clinic.adminAccount?.email || clinic.contact?.email,
          role: "clinic_admin",
          type: "clinic",
          logo: clinic.logo,
          isFirstLogin: isFirstLogin,
        },
        accessToken,
        refreshToken,
      },
    });
  }),
);

// @route   POST /api/auth/login/patient
// @desc    Login patient (Patient collection)
// @access  Public
router.post(
  "/login/patient",
  loginRateLimiter,
  asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or patient ID and password are required",
      });
    }

    const normalizedIdentifier = String(identifier).trim();
    const isEmailLogin = normalizedIdentifier.includes("@");

    const patient = await Patient.findOne(
      isEmailLogin
        ? { email: normalizedIdentifier.toLowerCase() }
        : { patientId: normalizedIdentifier.toUpperCase() },
    ).select("+password");

    if (!patient) {
      return res.status(401).json({
        success: false,
        message: "Invalid patient credentials",
      });
    }

    if (!patient.isActive) {
      return res.status(401).json({
        success: false,
        message: "Patient account is inactive",
      });
    }

    const isMatch = await patient.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid patient credentials",
      });
    }

    const accessToken = generateToken(patient._id, "patient");
    const refreshToken = generateRefreshToken(patient._id, "patient");

    // Create session (kills existing sessions - single device enforcement)
    await Session.createSession({
      userId: patient._id,
      userType: "Patient",
      accessToken,
      refreshToken,
      deviceInfo: getDeviceInfo(req),
      expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await AuditLog.log({
      action: "LOGIN",
      resource: "Patient",
      resourceId: patient._id,
      description: `Patient logged in: ${patient.patientId}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: patient._id,
          name: patient.name,
          email: patient.email,
          role: "patient",
          type: "patient",
          patientId: patient.patientId,
        },
        accessToken,
        refreshToken,
      },
    });
  }),
);

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public
router.post(
  "/refresh-token",
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
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
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
  }),
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    // req.user is already populated by protect middleware for all user types
    // (User, Clinic, Patient)
    const userData = req.user;

    // If it's a patient type, get fresh data from Patient collection
    if (userData.type === "patient") {
      const patient = await Patient.findById(userData._id);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
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
            role: "patient",
            type: "patient",
            createdAt: patient.createdAt,
            // Include health-related fields so frontend dashboards can display them
            bloodGroup: patient.bloodGroup || "",
            allergies: Array.isArray(patient.allergies) ? patient.allergies : [],
            chronicConditions: Array.isArray(patient.chronicConditions) ? patient.chronicConditions : [],
            address: patient.address || {},
            dateOfBirth: patient.dateOfBirth || null,
            age: patient.age || null,
          },
        },
      });
    }

    // If it's a clinic type, get fresh data from Clinic collection
    if (userData.type === "clinic") {
      const clinic = await Clinic.findById(userData._id);
      if (!clinic) {
        return res.status(404).json({
          success: false,
          message: "Clinic not found",
        });
      }
      return res.json({
        success: true,
        data: {
          user: {
            id: clinic._id,
            name: clinic.name,
            email: clinic.adminAccount?.email || clinic.contact?.email,
            role: "clinic_admin",
            type: "clinic",
            clinicId: clinic._id,
            createdAt: clinic.createdAt,
          },
        },
      });
    }

    // Default: User collection
    const user = await User.findById(userData._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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
          createdAt: user.createdAt,
        },
      },
    });
  }),
);

// @route   POST /api/auth/logout
// @desc    Logout user - destroys session completely
// @access  Private
router.post(
  "/logout",
  protect,
  asyncHandler(async (req, res) => {
    const token = req.token; // Token from protect middleware

    // Destroy session from Session store
    await Session.destroySession(token, "manual");

    // Also clear refresh token from User model if user type
    if (req.user.type !== "clinic" && req.user.type !== "patient") {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }

    // Log action
    await AuditLog.log({
      user: req.user._id,
      action: "LOGOUT",
      resource:
        req.user.type === "clinic"
          ? "Clinic"
          : req.user.type === "patient"
            ? "Patient"
            : "User",
      resourceId: req.user._id,
      description: `User logged out: ${req.user.email || req.user.name}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: "Logged out successfully. All sessions destroyed.",
    });
  }),
);

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put(
  "/change-password",
  protect,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
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
      message: "Password changed successfully",
    });
  }),
);

// ─── Forgot Password with Gmail OTP ───

// @route   POST /api/auth/forgot-password
// @desc    Send OTP to patient's email for password reset
// @access  Public
router.post('/forgot-password', loginRateLimiter, asyncHandler(async (req, res) => {
  const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "Email or Patient ID is required",
      });
    }

    const normalizedIdentifier = String(identifier).trim();
    const isEmail = normalizedIdentifier.includes("@");

    const patient = await Patient.findOne(
      isEmail
        ? { email: normalizedIdentifier.toLowerCase() }
        : { patientId: normalizedIdentifier.toUpperCase() },
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email or patient ID",
      });
    }

    if (!patient.email) {
      return res.status(400).json({
        success: false,
        message:
          "No email address linked to this account. Please contact support.",
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    patient.resetPasswordOTP = { code: otp, expiresAt: otpExpiry };
    await patient.save({ validateBeforeSave: false });
    // DEV fallback: log OTP to terminal when explicitly enabled
    if (process.env.DEV_SEND_OTP_IN_TERMINAL === 'true') {
      console.log(`\n[DEV OTP] Password reset OTP for ${patient.email} (patientId: ${patient.patientId || ''}): ${otp}\n`);
      const [localPart, domain] = patient.email.split('@');
      const maskedEmail = `${localPart.slice(0, 2)}${'*'.repeat(Math.max(localPart.length - 2, 0))}@${domain}`;
      return res.json({
        success: true,
        message: 'OTP sent to your registered email (dev-mode: logged to server)',
        data: { maskedEmail },
      });
    }

    // Send OTP email (catch SMTP errors to provide a friendly response)
    const transporter = createMailTransporter();
    try {
      // Verify transporter connection quickly (helps surface auth errors)
      if (transporter.verify) {
        await transporter.verify();
      }

      await transporter.sendMail({
        from: `"PharmaCare" <${process.env.GMAIL_USER}>`,
        to: patient.email,
        subject: "PharmaCare - Password Reset OTP",
        html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#2563eb;margin-bottom:8px;">PharmaCare</h2>
        <p>Hi <strong>${patient.name}</strong>,</p>
        <p>Your password reset OTP is:</p>
        <div style="text-align:center;margin:24px 0;">
          <span style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#2563eb;background:#eff6ff;padding:12px 24px;border-radius:8px;">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:14px;">This code expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#9ca3af;font-size:12px;text-align:center;">PharmaCare Pharmacy Management</p>
      </div>
    `,
      });
    } catch (mailErr) {
      console.error('[Forgot Password] Failed to send OTP email:', mailErr && mailErr.message ? mailErr.message : mailErr);
      // Clear stored OTP so client can retry cleanly
      patient.resetPasswordOTP = undefined;
      await patient.save({ validateBeforeSave: false });

      // Give a helpful, non-sensitive error message
      return res.status(502).json({
        success: false,
        message:
          'Failed to send OTP email. Check mail server configuration (GMAIL_USER / GMAIL_APP_PASSWORD) and ensure SMTP access is allowed.',
      });
    }

    // Mask email for response
    const [localPart, domain] = patient.email.split("@");
    const maskedEmail = `${localPart.slice(0, 2)}${"*".repeat(Math.max(localPart.length - 2, 0))}@${domain}`;

    res.json({
      success: true,
      message: "OTP sent to your registered email",
      data: { maskedEmail },
    });
  }),
);

// @route   POST /api/auth/verify-otp
// @desc    Verify the OTP code
// @access  Public
router.post('/verify-otp', loginRateLimiter, asyncHandler(async (req, res) => {
  const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({
        success: false,
        message: "Identifier and OTP are required",
      });
    }

    const normalizedIdentifier = String(identifier).trim();
    const isEmail = normalizedIdentifier.includes("@");

    const patient = await Patient.findOne(
      isEmail
        ? { email: normalizedIdentifier.toLowerCase() }
        : { patientId: normalizedIdentifier.toUpperCase() },
    );

    if (!patient || !patient.resetPasswordOTP?.code) {
      return res.status(400).json({
        success: false,
        message: "No OTP request found. Please request a new one.",
      });
    }

    if (new Date() > new Date(patient.resetPasswordOTP.expiresAt)) {
      patient.resetPasswordOTP = undefined;
      await patient.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (patient.resetPasswordOTP.code !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // OTP is valid — generate a short-lived reset token
    const resetToken = jwt.sign(
      { id: patient._id, purpose: "password-reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    // Clear OTP after successful verification
    patient.resetPasswordOTP = undefined;
    await patient.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: "OTP verified successfully",
      data: { resetToken },
    });
  }),
);

// @route   POST /api/auth/reset-password
// @desc    Reset password using the reset token from OTP verification
// @access  Public (requires valid resetToken)
router.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Reset link has expired. Please start over.",
      });
    }

    if (decoded.purpose !== "password-reset") {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    const patient = await Patient.findById(decoded.id).select("+password");
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    patient.password = newPassword;
    patient.resetPasswordOTP = undefined;
    await patient.save();

    await AuditLog.log({
      action: "PASSWORD_RESET",
      resource: "Patient",
      resourceId: patient._id,
      description: `Password reset via OTP for patient: ${patient.patientId}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  }),
);

export default router;
