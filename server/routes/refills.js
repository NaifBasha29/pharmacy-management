import express from 'express';
import { protect } from '../middleware/auth.js';
import Order from '../models/Order.js';
import Medicine from '../models/Medicine.js';

const router = express.Router();

router.use(protect);

/**
 * POST /api/refills - Create a refill order from a previous order
 */
router.post('/', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const previousOrder = await Order.findById(orderId).populate('items.medicine');
    if (!previousOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (previousOrder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Build new items list, checking stock availability
    const newItems = [];
    const unavailable = [];

    for (const item of previousOrder.items) {
      const medicine = await Medicine.findById(item.medicine._id || item.medicine);
      if (!medicine || !medicine.isActive) {
        unavailable.push(item.name);
        continue;
      }
      if (medicine.stock < item.quantity) {
        unavailable.push(`${item.name} (only ${medicine.stock} in stock)`);
        continue;
      }
      newItems.push({
        medicine: medicine._id,
        name: medicine.name,
        quantity: item.quantity,
        price: medicine.price,
        discount: medicine.discount || 0
      });
    }

    if (newItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items available for refill',
        unavailable
      });
    }

    // Calculate totals
    const subtotal = newItems.reduce((sum, item) => {
      const effectivePrice = item.price - (item.price * item.discount / 100);
      return sum + (effectivePrice * item.quantity);
    }, 0);

    const tax = subtotal * 0.18;
    const shippingCost = subtotal >= 500 ? 0 : 50;
    const total = subtotal + tax + shippingCost;

    // Create new order
    const newOrder = await Order.create({
      user: req.user._id,
      items: newItems,
      subtotal,
      tax,
      shippingCost,
      total,
      shippingAddress: previousOrder.shippingAddress,
      paymentMethod: previousOrder.paymentMethod || 'cod',
      prescription: previousOrder.prescription,
      trackingHistory: [{
        status: 'pending',
        timestamp: new Date(),
        note: `Refill from order ${previousOrder.orderNumber}`
      }]
    });

    // Decrease stock
    for (const item of newItems) {
      await Medicine.findByIdAndUpdate(item.medicine, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json({
      success: true,
      data: newOrder,
      unavailable: unavailable.length > 0 ? unavailable : undefined
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
