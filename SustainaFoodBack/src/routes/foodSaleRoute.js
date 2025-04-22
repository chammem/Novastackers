const express = require('express');
const router = express.Router();
const foodSaleController = require('../controllers/sales/foodSaleController');

// GET all food sales
router.get('/', foodSaleController.getAllFoodSales);

// POST new food sale (existing route)
router.post('/', foodSaleController.createFoodSale);

module.exports = router;