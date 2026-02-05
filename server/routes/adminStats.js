import express from 'express';
import Clinic from '../models/Clinic.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Medicine from '../models/Medicine.js';
import Order from '../models/Order.js';
import Prescription from '../models/Prescription.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get comprehensive admin dashboard statistics
// @access  Admin only
router.get('/stats', protect, authorize('admin'), asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Clinics statistics
    const clinicsStats = await Promise.all([
        Clinic.countDocuments(),
        Clinic.countDocuments({ 'verification.clinicStatus': 'active' }),
        Clinic.countDocuments({ 'verification.clinicStatus': 'pending' }),
        Clinic.countDocuments({ 'verification.clinicStatus': 'suspended' })
    ]);

    // Users statistics
    const usersStats = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ role: 'pharmacist' }),
        Patient.countDocuments()
    ]);

    // Medicines statistics
    const medicinesStats = await Promise.all([
        Medicine.countDocuments({ isActive: true }),
        Medicine.countDocuments({
            isActive: true,
            $expr: { $lte: ['$stock', '$minStockLevel'] }
        }),
        Medicine.countDocuments({
            isActive: true,
            expiryDate: {
                $gte: today,
                $lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
            }
        })
    ]);

    // Orders statistics
    const ordersStats = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ createdAt: { $gte: today } }),
        Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ])
    ]);

    // Expiring medicines list (top 5)
    const expiringMedicines = await Medicine.find({
        isActive: true,
        expiryDate: {
            $gte: today,
            $lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
        }
    })
        .select('name stock expiryDate')
        .sort({ expiryDate: 1 })
        .limit(5);

    // Low stock medicines (top 5)
    const lowStockMedicines = await Medicine.find({
        isActive: true,
        $expr: { $lte: ['$stock', '$minStockLevel'] }
    })
        .select('name stock minStockLevel')
        .sort({ stock: 1 })
        .limit(5);

    // Recent orders for revenue chart (last 7 days)
    const revenueData = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) },
                paymentStatus: 'paid'
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                revenue: { $sum: '$total' },
                orders: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.json({
        success: true,
        data: {
            clinics: {
                total: clinicsStats[0],
                active: clinicsStats[1],
                pending: clinicsStats[2],
                suspended: clinicsStats[3]
            },
            users: {
                total: usersStats[0],
                admins: usersStats[1],
                pharmacists: usersStats[2],
                patients: usersStats[3]
            },
            medicines: {
                total: medicinesStats[0],
                lowStock: medicinesStats[1],
                expiringSoon: medicinesStats[2]
            },
            orders: {
                total: ordersStats[0],
                pending: ordersStats[1],
                today: ordersStats[2],
                totalRevenue: ordersStats[3][0]?.total || 0
            },
            expiringMedicines: expiringMedicines.map(m => ({
                name: m.name,
                stock: m.stock,
                daysUntilExpiry: Math.ceil((m.expiryDate - today) / (1000 * 60 * 60 * 24))
            })),
            lowStockMedicines: lowStockMedicines.map(m => ({
                name: m.name,
                stock: m.stock,
                minStock: m.minStockLevel,
                percentage: Math.round((m.stock / m.minStockLevel) * 100)
            })),
            revenueChart: revenueData
        }
    });
}));

// @route   GET /api/admin/clinics/overview
// @desc    Get clinics overview with expiry and stock info
// @access  Admin only
router.get('/clinics/overview', protect, authorize('admin'), asyncHandler(async (req, res) => {
    const clinics = await Clinic.find({ 'verification.clinicStatus': 'active' })
        .select('name code verification.clinicStatus license.expiryDate')
        .limit(10);

    const clinicsWithStatus = clinics.map(clinic => {
        const daysUntilExpiry = clinic.license?.expiryDate
            ? Math.ceil((new Date(clinic.license.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
            : null;

        return {
            id: clinic._id,
            name: clinic.name,
            code: clinic.code,
            status: clinic.verification?.clinicStatus,
            licenseExpiry: daysUntilExpiry,
            isExpiringSoon: daysUntilExpiry !== null && daysUntilExpiry <= 30
        };
    });

    res.json({
        success: true,
        data: clinicsWithStatus
    });
}));

export default router;
