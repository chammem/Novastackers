const crypto = require("crypto");
const { sendMail } = require("../../config/mailer"); // ton fichier de configuration d'envoi d'email
const User = require("../../models/userModel"); // Adapter au nom réel du modèle

exports.sendOtp = async (req, res) => {
  const { userId } = req.body;

  try {
    // Génère un OTP de 6 chiffres
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Trouver l'utilisateur dans la base de données
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Enregistrer l'OTP et son expiration dans la base
    user.otpCode = otp;
    user.otpExpiry = expiry;
    await user.save();

    // Envoi de l'email
    await sendMail({
      to: user.email,
      subject: "Your 2FA Code",
      text: `Your verification code is ${otp}`,
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error(error); // Log l'erreur pour le débogage
    res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
  }
};
