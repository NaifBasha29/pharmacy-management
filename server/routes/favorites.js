import express from 'express';
import { protect } from '../middleware/auth.js';
import Favorite from '../models/Favorite.js';
import Medicine from '../models/Medicine.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * GET /api/favorites - Get user's favorites
 */
router.get('/', async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate('medicine', 'name price image stock description dosageForm strength discount')
      .sort('-createdAt');

    // Filter out favorites where medicine was deleted
    const activeFavorites = favorites.filter(f => f.medicine);

    res.json({
      success: true,
      data: activeFavorites
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/favorites - Add to favorites
 */
router.post('/', async (req, res) => {
  try {
    const { medicineId } = req.body;
    if (!medicineId) {
      return res.status(400).json({ success: false, message: 'Medicine ID is required' });
    }

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    const existing = await Favorite.findOne({ user: req.user._id, medicine: medicineId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already in favorites' });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      medicine: medicineId
    });

    await favorite.populate('medicine', 'name price image stock description dosageForm strength discount');

    res.status(201).json({
      success: true,
      data: favorite
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/favorites/:medicineId - Remove from favorites
 */
router.delete('/:medicineId', async (req, res) => {
  try {
    const result = await Favorite.findOneAndDelete({
      user: req.user._id,
      medicine: req.params.medicineId
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/favorites/check/:medicineId - Check if medicine is favorited
 */
router.get('/check/:medicineId', async (req, res) => {
  try {
    const exists = await Favorite.findOne({
      user: req.user._id,
      medicine: req.params.medicineId
    });
    res.json({ success: true, data: { isFavorite: !!exists } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
