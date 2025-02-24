const User = require("../../models/userModel");
const bcrypt = require("bcrypt");

const resetPassword = async (req, res) => {
  const { token, email, newPassword } = req.body;

  try {
    // 1. Trouver l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // 2. Valider le token et vérifier s'il a expiré
    if (user.resetPasswordToken !== token || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "Lien de réinitialisation invalide ou expiré." });
    }

    // 3. Valider le nouveau mot de passe
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères." });
    }

    // 4. Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Mettre à jour le mot de passe de l'utilisateur et effacer le token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // 6. Envoyer une réponse de succès
    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la réinitialisation du mot de passe." });
  }
};

module.exports = { resetPassword };