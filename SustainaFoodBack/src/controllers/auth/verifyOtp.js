const User = require("../../models/userModel"); // Adapter au nom réel du modèle

exports.verifyOtp = async (req, res) => {
  const { userId, code } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || user.otpCode !== code || Date.now() > user.otpExpiry) {
      return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }

    // Supprimer le code après succès
    user.otpCode = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};
