import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import Clinic from "../models/Clinic.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import { protect, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads", "clinics");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/pjpeg",
    "image/png",
    "image/gif",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      "Invalid file type. Only JPEG, PNG, GIF and PDF are allowed.",
    );
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// @route   GET /api/clinics
// @desc    Get all clinics with filters
// @access  Private/Admin
router.get(
  "/",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { status, type, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status && status !== "all") {
      query["verification.clinicStatus"] = status;
    }

    if (type && type !== "all") {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { "contact.email": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [clinics, total] = await Promise.all([
      Clinic.find(query)
        .populate("audit.createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Clinic.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        clinics,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }),
);

// @route   GET /api/clinics/stats
// @desc    Get clinic statistics
// @access  Private/Admin
router.get(
  "/stats",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const [total, active, pending, inactive] = await Promise.all([
      Clinic.countDocuments(),
      Clinic.countDocuments({ "verification.clinicStatus": "active" }),
      Clinic.countDocuments({
        "verification.clinicStatus": "pending_verification",
      }),
      Clinic.countDocuments({ "verification.clinicStatus": "inactive" }),
    ]);

    res.json({
      success: true,
      data: { total, active, pending, inactive },
    });
  }),
);

// @route   GET /api/clinics/:id
// @desc    Get single clinic by ID
// @access  Private/Admin
router.get(
  "/:id",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const clinic = await Clinic.findById(req.params.id)
      .populate("audit.createdBy", "name email")
      .populate("audit.approvedBy", "name email");

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    res.json({
      success: true,
      data: { clinic },
    });
  }),
);

// @route   POST /api/clinics
// @desc    Create a new clinic
// @access  Private/Admin
router.post(
  "/",
  protect,
  authorize("admin"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "licenseDocument", maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    const rawClinicData = req.body.clinicData;
    let clinicData = {};

    try {
      clinicData =
        typeof rawClinicData === "string"
          ? JSON.parse(rawClinicData || "{}")
          : rawClinicData || {};
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid clinic data format. Ensure clinicData is valid JSON.",
      });
    }

    const missingSections = [
      "name",
      "registrationNumber",
      "type",
      "contact",
      "address",
      "regulatory",
      "adminAccount",
    ].filter((field) => !clinicData[field]);

    if (missingSections.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required clinic sections: ${missingSections.join(", ")}`,
      });
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.logo) {
        clinicData.logo = `/uploads/clinics/${req.files.logo[0].filename}`;
      }
      if (req.files.licenseDocument) {
        if (!clinicData.regulatory) clinicData.regulatory = {};
        clinicData.regulatory.licenseDocument = `/uploads/clinics/${req.files.licenseDocument[0].filename}`;
      }
    }

    // Set audit information
    clinicData.audit = {
      createdBy: req.user._id,
      createdAt: new Date(),
      ipAddress: req.ip,
    };

    // Generate temp password if needed
    if (clinicData.adminAccount && !clinicData.adminAccount.tempPassword) {
      clinicData.adminAccount.tempPassword = crypto
        .randomBytes(8)
        .toString("hex");
    }

    const clinic = await Clinic.create(clinicData);

    // Log action
    await AuditLog.log({
      user: req.user._id,
      action: "CREATE",
      resource: "Clinic",
      resourceId: clinic._id,
      description: `New clinic enrolled: ${clinic.name} (${clinic.code})`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: "Clinic enrolled successfully",
      data: { clinic },
    });
  }),
);

// @route   PUT /api/clinics/:id
// @desc    Update clinic
// @access  Private/Admin
router.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "licenseDocument", maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    let clinic = await Clinic.findById(req.params.id);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    const updateData = JSON.parse(req.body.clinicData || "{}");

    // Handle file uploads
    if (req.files) {
      if (req.files.logo) {
        updateData.logo = `/uploads/clinics/${req.files.logo[0].filename}`;
      }
      if (req.files.licenseDocument) {
        if (!updateData.regulatory) updateData.regulatory = {};
        updateData.regulatory.licenseDocument = `/uploads/clinics/${req.files.licenseDocument[0].filename}`;
      }
    }

    // Add modification log
    if (!updateData.audit) updateData.audit = clinic.audit || {};
    if (!updateData.audit.modificationLogs)
      updateData.audit.modificationLogs = [];
    updateData.audit.modificationLogs.push({
      modifiedBy: req.user._id,
      modifiedAt: new Date(),
      changes: "Clinic details updated",
      ipAddress: req.ip,
    });

    clinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    // Log action
    await AuditLog.log({
      user: req.user._id,
      action: "UPDATE",
      resource: "Clinic",
      resourceId: clinic._id,
      description: `Clinic updated: ${clinic.name}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: "Clinic updated successfully",
      data: { clinic },
    });
  }),
);

// @route   PUT /api/clinics/:id/status
// @desc    Update clinic status
// @access  Private/Admin
router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { clinicStatus, adminAccountStatus, adminNotes } = req.body;

    const clinic = await Clinic.findById(req.params.id);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    const updateObj = {};
    if (clinicStatus) updateObj["verification.clinicStatus"] = clinicStatus;
    if (adminAccountStatus)
      updateObj["verification.adminAccountStatus"] = adminAccountStatus;
    if (adminNotes !== undefined)
      updateObj["verification.adminNotes"] = adminNotes;

    const updatedClinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateObj,
        $push: {
          "audit.modificationLogs": {
            modifiedBy: req.user._id,
            modifiedAt: new Date(),
            changes: `Status changed to: ${clinicStatus || "unchanged"}`,
            ipAddress: req.ip,
          },
        },
      },
      { new: true },
    );

    // Log action
    await AuditLog.log({
      user: req.user._id,
      action: "STATUS_CHANGE",
      resource: "Clinic",
      resourceId: clinic._id,
      description: `Clinic status changed: ${clinic.name} -> ${clinicStatus}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: "Clinic status updated",
      data: { clinic: updatedClinic },
    });
  }),
);

// @route   PUT /api/clinics/:id/verify
// @desc    Verify and approve clinic
// @access  Private/Admin
router.put(
  "/:id/verify",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { verificationChecklist } = req.body;

    const clinic = await Clinic.findById(req.params.id);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    const updatedClinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "verification.verificationChecklist": verificationChecklist,
          "verification.clinicStatus": "pending_verification",
          "audit.approvalTimestamp": new Date(),
          "audit.approvedBy": req.user._id,
          isDraft: false,
        },
      },
      { new: true },
    );

    res.json({
      success: true,
      message: "Clinic verification updated",
      data: { clinic: updatedClinic },
    });
  }),
);

// @route   PUT /api/clinics/:id/activate
// @desc    Activate clinic and create admin user
// @access  Private/Admin
router.put(
  "/:id/activate",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const clinic = await Clinic.findById(req.params.id).select(
      "+adminAccount.tempPassword",
    );

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    // Check if admin user already exists
    let adminUser = await User.findOne({ email: clinic.adminAccount.email });

    if (!adminUser) {
      // Create admin user for the clinic
      const tempPassword =
        clinic.adminAccount.tempPassword ||
        crypto.randomBytes(8).toString("hex");

      adminUser = await User.create({
        name: clinic.adminAccount.fullName,
        email: clinic.adminAccount.email,
        password: tempPassword,
        role: "pharmacist", // Clinic admin is a pharmacist role
        phone: clinic.contact.phone,
        isActive: true,
      });

      // Update clinic with the temp password for sending
      clinic.adminAccount.tempPassword = tempPassword;
      await clinic.save({ validateBeforeSave: false });
    }

    // Activate the clinic
    const updatedClinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "verification.clinicStatus": "active",
          "verification.adminAccountStatus": "enabled",
          isDraft: false,
        },
      },
      { new: true },
    );

    // Log action
    await AuditLog.log({
      user: req.user._id,
      action: "ACTIVATE",
      resource: "Clinic",
      resourceId: clinic._id,
      description: `Clinic activated: ${clinic.name}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: "Clinic activated successfully",
      data: {
        clinic: updatedClinic,
        adminUserCreated: !!adminUser,
      },
    });
  }),
);

// @route   POST /api/clinics/:id/send-credentials
// @desc    Send login credentials to clinic admin
// @access  Private/Admin
router.post(
  "/:id/send-credentials",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const clinic = await Clinic.findById(req.params.id).select(
      "+adminAccount.tempPassword",
    );

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    // In a real application, you would send an email here
    // For now, we'll just return the credentials (in production, remove this)
    const credentials = {
      email: clinic.adminAccount.email,
      tempPassword: clinic.adminAccount.tempPassword,
      loginUrl: `${process.env.CLIENT_URL}/login`,
    };

    // Log action
    await AuditLog.log({
      user: req.user._id,
      action: "SEND_CREDENTIALS",
      resource: "Clinic",
      resourceId: clinic._id,
      description: `Credentials sent for clinic: ${clinic.name}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: "Credentials sent successfully",
      data: {
        sent: true,
        // Remove this in production
        credentials:
          process.env.NODE_ENV === "development" ? credentials : undefined,
      },
    });
  }),
);

// @route   DELETE /api/clinics/:id
// @desc    Delete clinic
// @access  Private/Admin
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const clinic = await Clinic.findById(req.params.id);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    await Clinic.findByIdAndDelete(req.params.id);

    // Log action
    await AuditLog.log({
      user: req.user._id,
      action: "DELETE",
      resource: "Clinic",
      resourceId: clinic._id,
      description: `Clinic deleted: ${clinic.name}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: "Clinic deleted successfully",
    });
  }),
);

export default router;
