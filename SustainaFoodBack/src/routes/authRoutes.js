const express = require('express');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const dotenv = require('dotenv');
const { authenticateToken } = require('../middleware/auth');
const userDetailsController = require('../controllers/auth/userDetailsController');
const { generate2FA, verify2FA } = require('../controllers/auth/twoFactorAuthController');
const { checkAuth } = require('../controllers/auth/checkAuthController');

dotenv.config();

const router = express.Router();

router.post('/generate-2fa', generate2FA);
router.post('/verify-2fa', verify2FA);

// Route pour obtenir les détails de l'utilisateur (après authentification)
router.get('/user-details', authenticateToken, userDetailsController.getUserDetails);

router.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/check-auth', checkAuth);

module.exports = router;
