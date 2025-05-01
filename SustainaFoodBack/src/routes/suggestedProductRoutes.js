const express = require('express');
const router = express.Router();
const { saveSuggestedProduct, getSuggestedProducts } = require('../controllers/suggestedProductController');

// Route to save suggested products
router.post('/save', saveSuggestedProduct);

// Route to get all suggested products
router.get('/', getSuggestedProducts);

module.exports = router;