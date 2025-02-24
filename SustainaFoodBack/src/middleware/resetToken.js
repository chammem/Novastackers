const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Fonction pour générer un token de réinitialisation
function generateResetToken() {
    return crypto.randomBytes(32).toString("hex"); 
}

// Middleware pour vérifier le token JWT
const verifyTokenMiddleware = (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(401).json({ message: "Aucun token fourni" });
        }

        const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
        req.userId = decoded.id; // Ajoute l'ID utilisateur à `req`

        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide ou expiré" });
    }
};

// Exporter correctement les fonctions
module.exports = {
    generateResetToken,
    verifyTokenMiddleware
};
