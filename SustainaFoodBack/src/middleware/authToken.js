const jwt = require('jsonwebtoken');

const authToken = async (req, res, next) => {
  try {
    // Récupération du token soit depuis les cookies, soit depuis les headers d'autorisation
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "User not logged in", error: true });
    }

    // Vérification du token JWT
    const decodedToken = await jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    req.userId = decodedToken._id; // Attacher l'ID de l'utilisateur à la requête

    next(); // Passer à la suite de la chaîne de middlewares
  } catch (err) {
    return res.status(401).json({
      message: err.message || "Invalid token",
      error: true,
      success: false,
    });
  }
};

module.exports = authToken;
