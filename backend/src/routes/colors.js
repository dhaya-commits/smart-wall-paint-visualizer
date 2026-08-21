const express = require('express');
const Color = require('../models/Color');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all colors
router.get('/', async (req, res) => {
  try {
    const colors = await Color.find().sort({ name: 1 });
    res.json(colors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new color (Admin only)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { name, hexCode, rgbCode, brand, category, finish } = req.body;
    
    if (!name || !hexCode) {
      return res.status(400).json({ error: 'Name and hexCode are required' });
    }

    const color = new Color({
      name, hexCode, rgbCode, brand, category, finish
    });

    await color.save();
    res.status(201).json(color);
  } catch (err) {
    if (err.code === 11000) {
       return res.status(400).json({ error: 'Color name must be unique' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Seed some sample colors (just for testing/demo purposes)
router.post('/seed', async (req, res) => {
  try {
    const count = await Color.countDocuments();
    if (count > 0) {
      return res.status(400).json({ message: 'Colors already seeded' });
    }

    const sampleColors = [
      { name: 'Ocean Breeze', hexCode: '#C1D5E0', rgbCode: '193, 213, 224', category: ['Living Room'] },
      { name: 'Desert Sand', hexCode: '#E5D3B3', rgbCode: '229, 211, 179', category: ['Living Room', 'Bedroom'] },
      { name: 'Forest Green', hexCode: '#2E472D', rgbCode: '46, 71, 45', category: ['Accent'] },
      { name: 'Classic White', hexCode: '#F8F9FA', rgbCode: '248, 249, 250', category: ['All'] },
      { name: 'Charcoal', hexCode: '#36454F', rgbCode: '54, 69, 79', category: ['Accent', 'Exterior'] },
      { name: 'Sunset Orange', hexCode: '#FD5E53', rgbCode: '253, 94, 83', category: ['Accent'] },
      { name: 'Lavender Blush', hexCode: '#FFF0F5', rgbCode: '255, 240, 245', category: ['Bedroom'] }
    ];

    await Color.insertMany(sampleColors);
    res.status(201).json({ message: 'Sample colors added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
