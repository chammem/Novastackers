const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// Route for user-based recommendations
router.post('/recommendations/user', recommendationController.getUserRecommendations);

// Route for product-based recommendations
router.post('/recommendations/product', recommendationController.getProductRecommendations);

module.exports = router;