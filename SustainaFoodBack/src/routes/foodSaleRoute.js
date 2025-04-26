const express = require('express');
const router = express.Router();
const foodSaleController = require('../controllers/sales/foodSaleController');

// Existing routes
router.get('/', foodSaleController.getAllFoodSales);
router.post('/', foodSaleController.createFoodSale);

// New routes for restaurant details
router.get('/restaurant/:restaurantId', foodSaleController.getRestaurantDetails);
router.get('/restaurant/:restaurantId/items', foodSaleController.getRestaurantFoodSales);

// Make sure you have this route defined:
router.get('/:id', foodSaleController.getFoodSaleById);

module.exports = router;