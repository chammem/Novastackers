const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// Route to get recommendations for a user
router.get('/:userId', recommendationController.getFoodRecommendations);
router.post('/update', recommendationController.updateRecommendations);

module.exports = router;