const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');

// Route pour obtenir toutes les ventes
router.get('/food-sales', foodController.getAllFoodSales);

// Route pour obtenir les ventes par rôle
router.get('/food-sales/role/:role', foodController.getFoodSalesByRole);

module.exports = router;