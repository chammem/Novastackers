const express = require("express");
const router = express.Router();

// Import des contrôleurs d'authentification
const { forgotPassword } = require("../controllers/auth/forgotPwd");
const { resetPassword } = require("../controllers/auth/resetPwd");

// Routes API pour la gestion du mot de passe
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
