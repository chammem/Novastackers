const express = require('express');
const router = express.Router();
const MysteryPack = require('../models/MysteryPac');

// Get all mystery packs
router.get('/', async (req, res) => {
  try {
    const mysteryPacks = await MysteryPack.find({ status: 'available' })
      .populate('restaurant', 'name address');
    res.json(mysteryPacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new mystery pack
router.post('/', async (req, res) => {
  const mysteryPack = new MysteryPack({
    ...req.body,
    status: 'available'
  });

  try {
    const newPack = await mysteryPack.save();
    res.status(201).json(newPack);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update mystery pack
router.patch('/:id', async (req, res) => {
  try {
    const pack = await MysteryPack.findById(req.params.id);
    if (!pack) {
      return res.status(404).json({ message: 'Mystery pack not found' });
    }

    Object.assign(pack, req.body);
    const updatedPack = await pack.save();
    res.json(updatedPack);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reserve mystery pack
router.post('/:id/reserve', async (req, res) => {
  try {
    const pack = await MysteryPack.findById(req.params.id);
    if (!pack) {
      return res.status(404).json({ message: 'Mystery pack not found' });
    }

    if (pack.availableQuantity < 1) {
      return res.status(400).json({ message: 'Pack is sold out' });
    }

    pack.availableQuantity -= 1;
    if (pack.availableQuantity === 0) {
      pack.status = 'sold_out';
    }

    const updatedPack = await pack.save();
    res.json(updatedPack);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;