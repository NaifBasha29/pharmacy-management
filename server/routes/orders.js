import express from "express";
import Order from "../models/Order.js";
import Medicine from "../models/Medicine.js";
import AuditLog from "../models/AuditLog.js";
import { protect } from "../middleware/auth.js";
import {
  authorize,
  isAdmin,
  isPharmacistOrAdmin,
} from "../middleware/roleAuth.js";
import { orderValidation, validateObjectId } from "../middleware/validation.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { getIO } from "../config/socket.js";

const router = express.Router();

// @route   GET /api/orders
// @desc    Get orders (admin/pharmacist: all, user: own orders)
// @access  Private
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || "";

    let query = {};

    // Users can only see their own orders
    if (["user", "patient"].includes(req.user.role)) {
      query.user = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .populate("items.medicine", "name price")
      .populate("dispensedBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }),
);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get(
  "/:id",
  protect,
  validateObjectId,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.medicine", "name price image")
      .populate("prescription")
      .populate("dispensedBy", "name");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

  // Users can only view their own orders
  if (req.user.role === 'user' && order.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this order'
    });
  }

    res.json({
      success: true,
      data: { order },
    });
  }),
);

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post(
  "/",
  protect,
  orderValidation.create,
  asyncHandler(async (req, res) => {
    const { items, shippingAddress, paymentMethod, prescription, notes } =
      req.body;

    let subtotal = 0;
    const orderItems = [];

    // Validate and calculate totals
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine);

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: `Medicine not found: ${item.medicine}`,
        });
      }

      if (!medicine.isActive) {
        return res.status(400).json({
          success: false,
          message: `Medicine not available: ${medicine.name}`,
        });
      }

      if (medicine.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${medicine.name}. Available: ${medicine.stock}`,
        });
      }

      // Prescription upload is now optional, but log a warning if required and missing
      if (medicine.prescription_required && !prescription) {
        // Optionally, you can log or flag this order for review
        // e.g., add a note or set a flag for pharmacist verification
        // For now, just allow the order to proceed
      }

      const itemPrice = medicine.discountedPrice || medicine.price;
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        medicine: medicine._id,
        name: medicine.name,
        quantity: item.quantity,
        price: itemPrice,
        discount: medicine.discount,
      });
    }

    // Calculate totals
    const tax = subtotal * 0.18; // 18% GST
    const shippingCost = subtotal >= 500 ? 0 : 50; // Free shipping over ₹500
    const total = subtotal + tax + shippingCost;

    const order = await Order.create({
      user: req.user._id,
      userModel: req.user.role === "user" ? "User" : "Patient",
      items: orderItems,
      prescription,
      subtotal,
      tax,
      shippingCost,
      total,
      paymentMethod: paymentMethod || "cod",
      shippingAddress: shippingAddress || req.user.address,
      notes,
      trackingHistory: [
        {
          status: "pending",
          note: "Order placed",
          updatedBy: req.user._id,
        },
      ],
    });

    // Emit notification to admin/pharmacist
    try {
      const io = getIO();
      io.to("admin").to("pharmacist").emit("new-order", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        itemCount: order.items.length,
      });
    } catch (e) {
      // Socket not initialized
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: { order },
    });
  }),
);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Admin/Pharmacist
router.put(
  "/:id/status",
  protect,
  isPharmacistOrAdmin,
  validateObjectId,
  asyncHandler(async (req, res) => {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const previousStatus = order.status;
    order.status = status;

    // Add to tracking history
    order.trackingHistory.push({
      status,
      note,
      updatedBy: req.user._id,
    });

  // If dispensed, update stock and record
  if (status === 'dispatched' && previousStatus !== 'dispatched') {
    order.dispensedBy = req.user._id;
    order.dispensedAt = new Date();

    // Reduce stock
    for (const item of order.items) {
      await Medicine.findByIdAndUpdate(item.medicine, {
        $inc: { stock: -item.quantity }
      });
    }
  }

  if (status === 'delivered') {
    order.actualDelivery = new Date();
  }

    await order.save();

    // Notify user
    try {
      const io = getIO();
      io.to(`user-${order.user}`).emit("order-status", {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status,
        message: `Your order ${order.orderNumber} is now ${status}`,
      });
    } catch (e) {
      // Socket not initialized
    }

    // Log action
    await AuditLog.log({
      user: req.user._id,
      action: "ORDER_STATUS_CHANGE",
      resource: "Order",
      resourceId: order._id,
      description: `Order ${order.orderNumber} status changed from ${previousStatus} to ${status}`,
      previousValue: { status: previousStatus },
      newValue: { status },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: "Order status updated",
      data: { order },
    });
  }),
);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private (user can cancel own pending orders)
router.put(
  "/:id/cancel",
  protect,
  validateObjectId,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

  // Users can only cancel their own orders
  if (req.user.role === 'user' && order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this order'
    });
  }

    // Can only cancel pending or confirmed orders
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel order in current status",
      });
    }

    order.status = "cancelled";
    order.trackingHistory.push({
      status: "cancelled",
      note: req.body.reason || "Cancelled by user",
      updatedBy: req.user._id,
    });

    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: { order },
    });
  }),
);

// @route   GET /api/orders/:id/track
// @desc    Track order
// @access  Private
router.get(
  "/:id/track",
  protect,
  validateObjectId,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).select(
      "orderNumber status trackingHistory estimatedDelivery actualDelivery",
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

  // Users can only track their own orders
  if (req.user.role === 'user') {
    const fullOrder = await Order.findById(req.params.id);
    if (fullOrder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to track this order'
      });
    }
  }

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        trackingHistory: order.trackingHistory,
        estimatedDelivery: order.estimatedDelivery,
        actualDelivery: order.actualDelivery,
      },
    });
  }),
);

// @route   POST /api/orders/:id/dispense
// @desc    Dispense order (pharmacist action)
// @access  Pharmacist/Admin
router.post(
  "/:id/dispense",
  protect,
  isPharmacistOrAdmin,
  validateObjectId,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      "items.medicine",
    );

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

    if (order.status !== "confirmed" && order.status !== "processing") {
      return res.status(400).json({
        success: false,
        message: "Order must be confirmed or processing to dispense",
      });
    }

    if (order.dispensedAt) {
      return res.status(400).json({
        success: false,
        message: "Order already dispensed",
      });
    }

    // Check stock availability
    for (const item of order.items) {
      const medicine = await Medicine.findById(item.medicine);
      if (medicine.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${medicine.name}`,
        });
      }
    }

    // Reduce stock
    for (const item of order.items) {
      await Medicine.findByIdAndUpdate(item.medicine._id || item.medicine, {
        $inc: { stock: -item.quantity },
      });
    }

    order.status = "dispatched";
    order.dispensedBy = req.user._id;
    order.dispensedAt = new Date();
    order.trackingHistory.push({
      status: "dispatched",
      note: "Order dispensed and ready for delivery",
      updatedBy: req.user._id,
    });

    await order.save();

    // Log action
    await AuditLog.log({
      user: req.user._id,
      action: "DISPENSE",
      resource: "Order",
      resourceId: order._id,
      description: `Order ${order.orderNumber} dispensed`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: "Order dispensed successfully",
      data: { order },
    });
  }),
);

export default router;
