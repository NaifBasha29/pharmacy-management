import express from 'express';
import { protect } from '../middleware/auth.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';

const router = express.Router();

router.use(protect);

/**
 * POST /api/reviews - Create a review for a delivered order
 */
router.post('/', async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating) {
      return res.status(400).json({ success: false, message: 'Order ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Can only review delivered orders' });
    }

    const existing = await Review.findOne({ user: req.user._id, order: orderId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already reviewed this order' });
    }

    const review = await Review.create({
      user: req.user._id,
      order: orderId,
      rating,
      comment: comment || ''
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/reviews - Get user's reviews
 */
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('order', 'orderNumber total items createdAt')
      .sort('-createdAt');

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/reviews/order/:orderId - Check if order has been reviewed
 */
router.get('/order/:orderId', async (req, res) => {
  try {
    const review = await Review.findOne({
      user: req.user._id,
      order: req.params.orderId
    });
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
