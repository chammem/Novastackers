const express = require("express");
const router = express.Router();

// Import des contrôleurs
const ForgotPassword = require("../controllers/auth/forgotPwd"); // Importez sans accolades
const { resetPassword } = require("../controllers/auth/resetPwd");

// Routes de réinitialisation de mot de passe
router.post('/forgot-password', ForgotPassword); // Utilisez ForgotPassword ici
router.post('/reset-password', resetPassword);

// Export du routeur
module.exports = router;