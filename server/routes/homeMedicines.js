import express from 'express';
import { protect } from '../middleware/auth.js';
import HomeMedicine from '../models/HomeMedicine.js';

const router = express.Router();

router.use(protect);

/**
 * GET /api/home-medicines - Get user's home medicine inventory
 */
router.get('/', async (req, res) => {
  try {
    const medicines = await HomeMedicine.find({ user: req.user._id, isActive: true })
      .sort('expiryDate');

    res.json({ success: true, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/home-medicines - Add medicine to home inventory
 */
router.post('/', async (req, res) => {
  try {
    const { name, dosage, quantity, expiryDate, reminderDaysBefore, notes } = req.body;

    if (!name || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Name and expiry date are required'
      });
    }

    const medicine = await HomeMedicine.create({
      user: req.user._id,
      name,
      dosage,
      quantity: quantity || 1,
      expiryDate: new Date(expiryDate),
      reminderDaysBefore: reminderDaysBefore || 30,
      notes
    });

    res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/home-medicines/:id - Update home medicine
 */
router.put('/:id', async (req, res) => {
  try {
    const medicine = await HomeMedicine.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const allowed = ['name', 'dosage', 'quantity', 'expiryDate', 'reminderDaysBefore', 'notes'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        medicine[field] = field === 'expiryDate' ? new Date(req.body[field]) : req.body[field];
      }
    });

    await medicine.save();
    res.json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/home-medicines/:id - Remove from home inventory
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await HomeMedicine.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isActive: false }
    );

    if (!result) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    res.json({ success: true, message: 'Removed from inventory' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/home-medicines/expiring - Get medicines expiring soon
 */
router.get('/expiring', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const expiring = await HomeMedicine.find({
      user: req.user._id,
      isActive: true,
      expiryDate: { $lte: futureDate }
    }).sort('expiryDate');

    res.json({ success: true, data: expiring });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
