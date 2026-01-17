import express from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// In-memory store for support tickets (in production, use a database model)
const supportTickets = [];

// @route   POST /api/support
// @desc    Submit a support ticket/inquiry
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const { subject, message, category } = req.body;

  if (!subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'Subject and message are required'
    });
  }

  const ticket = {
    id: Date.now().toString(),
    user: req.user._id,
    userName: req.user.name,
    userEmail: req.user.email,
    subject,
    message,
    category: category || 'general',
    status: 'open',
    createdAt: new Date(),
    responses: []
  };

  supportTickets.push(ticket);

  res.status(201).json({
    success: true,
    message: 'Support ticket submitted successfully',
    data: { ticketId: ticket.id }
  });
}));

// @route   GET /api/support
// @desc    Get user's support tickets
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const userTickets = supportTickets.filter(
    t => t.user.toString() === req.user._id.toString()
  );

  res.json({
    success: true,
    data: { tickets: userTickets }
  });
}));

// @route   GET /api/support/:id
// @desc    Get specific ticket
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const ticket = supportTickets.find(t => t.id === req.params.id);

  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Ticket not found'
    });
  }

  // Users can only view their own tickets
  if (req.user.role === 'user' && ticket.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  res.json({
    success: true,
    data: { ticket }
  });
}));

export default router;
