const User = require("../../models/userModel");
const bcrypt = require("bcrypt");

const resetPassword = async (req, res) => {
  const { token, email, newPassword } = req.body;

  try {
    console.log("🔹 Étape 1 : Vérification des données reçues...");
    if (!email || !token || !newPassword) {
      console.log("❌ Données manquantes : ", { email, token, newPassword });
      return res.status(400).json({ message: "Données incomplètes." });
    }

    console.log("🔹 Étape 2 : Recherche de l'utilisateur avec l'email ->", email);
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ Utilisateur non trouvé !");
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    console.log("🔹 Étape 3 : Vérification du token...");
    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      console.log("❌ Aucun token enregistré pour cet utilisateur !");
      return res.status(400).json({ message: "Aucun token de réinitialisation trouvé." });
    }

    if (user.resetPasswordToken !== token) {
      console.log("❌ Token invalide !");
      return res.status(400).json({ message: "Lien de réinitialisation invalide." });
    }

    if (user.resetPasswordExpires < Date.now()) {
      console.log("❌ Token expiré !");
      return res.status(400).json({ message: "Lien de réinitialisation expiré." });
    }

    console.log("🔹 Étape 4 : Validation du mot de passe...");
    if (newPassword.length < 8) {
      console.log("❌ Mot de passe trop court !");
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères." });
    }

    console.log("🔹 Étape 5 : Hashage et mise à jour du mot de passe...");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log("✅ Mot de passe réinitialisé avec succès !");
    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error("🚨 Erreur lors de la réinitialisation du mot de passe :", error);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer plus tard." });
  }
};

module.exports = { resetPassword };
