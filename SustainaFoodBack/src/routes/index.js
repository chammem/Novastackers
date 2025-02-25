const express = require("express");
const router = express.Router();

// Import des contrôleurs
const { forgotPassword } = require("../controllers/auth/forgotPwd");  // Make sure the import matches

const { resetPassword } = require("../controllers/auth/resetPwd");

// Routes de réinitialisation de mot de passe
router.post('/forgot-password', forgotPassword); // Corrected the name here
router.post('/reset-password', resetPassword);

// Export du routeur
module.exports = router;
