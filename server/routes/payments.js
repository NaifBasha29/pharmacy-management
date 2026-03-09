import express from 'express';
import { protect } from '../middleware/auth.js';
import Order from '../models/Order.js';

const router = express.Router();

router.use(protect);

/**
 * POST /api/payments/create-intent - Create a mock payment intent
 * In production, replace with Razorpay/Stripe SDK
 */
router.post('/create-intent', async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Mock payment processing
    const transactionId = `PAY${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Simulate payment based on method
    const method = paymentMethod || 'cod';
    let paymentStatus = 'pending';

    if (method === 'cod') {
      paymentStatus = 'pending'; // COD is paid on delivery
    } else {
      // For card/upi/netbanking/wallet — simulate successful payment
      paymentStatus = 'paid';
    }

    order.paymentMethod = method;
    order.paymentStatus = paymentStatus;
    order.paymentDetails = {
      transactionId,
      paidAt: paymentStatus === 'paid' ? new Date() : undefined
    };

    if (paymentStatus === 'paid') {
      order.status = 'confirmed';
      order.trackingHistory.push({
        status: 'confirmed',
        timestamp: new Date(),
        note: `Payment confirmed via ${method}. Transaction: ${transactionId}`
      });
    }

    await order.save();

    res.json({
      success: true,
      data: {
        transactionId,
        paymentStatus,
        paymentMethod: method,
        amount: order.total,
        orderId: order._id,
        orderNumber: order.orderNumber
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/payments/verify - Verify payment status (mock)
 */
router.post('/verify', async (req, res) => {
  try {
    const { transactionId, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Mock verification - always succeeds
    res.json({
      success: true,
      data: {
        verified: true,
        transactionId: transactionId || order.paymentDetails?.transactionId,
        paymentStatus: order.paymentStatus,
        amount: order.total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
