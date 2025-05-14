const express = require('express');
const router = express.Router();
const mysteryPackController = require('../controllers/MysteryPackController');
const authController = require('../controllers/auth/userDetailsController');
let FoodSale;
try {
  FoodSale = require('../models/FoodSale');
} catch (error) {
  console.error('Error loading FoodSale model:', error);
}

// Mystery Pack routes
router.get('/mystery-packs', mysteryPackController.getAllMysteryPacks);
router.post('/mystery-packs', mysteryPackController.createMysteryPack);
router.put('/mystery-packs/:id', mysteryPackController.updateMysteryPack);
router.delete('/mystery-packs/:id', mysteryPackController.deleteMysteryPack); // Fixed undefined handler

// Food Sales routes
router.get('/food-sales', async (req, res) => {
  try {
    const foodSales = await FoodSale.find({ 
      isAvailable: true,
      expiresAt: { $gt: new Date() }
    })
    .lean()
    .exec();

    return res.status(200).json(foodSales); // Return array directly
  } catch (error) {
    console.error('Error fetching food sales:', error);
    return res.status(500).json([]);  // Return empty array on error
  }
});

// Auth routes
router.get('/auth/user-details', authController.getUserDetails);

module.exports = router;
