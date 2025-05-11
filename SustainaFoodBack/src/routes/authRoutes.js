const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const userDetailsController = require('../controllers/auth/userDetailsController');

router.get('/user-details', authenticateToken, userDetailsController.getUserDetails);

module.exports = router;