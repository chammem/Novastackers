const User = require("../../models/userModel"); // Ensure this is correct
const sendMail = require("../../utils/sendMail"); // Correct import

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
  
    // Check if email is correct
    console.log("Received email:", email);
  
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }
  
      // Generate OTP and expiry time
      const otp = Math.floor(100000 + Math.random() * 900000);  // Generate a 6-digit OTP
      const otpExpiry = Date.now() + 10 * 60 * 1000;  // 10 minutes expiry time
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save({ validateBeforeSave: false });
  
      // Send OTP via email using sendMail function
      const emailResponse = await sendMail(email, otp);  // Correct function call here
      if (emailResponse.success) {
        return res.status(200).json({ message: "OTP sent successfully." });
      } else {
        return res.status(500).json({ message: "Error sending OTP via email. Please try again later." });
      }
  
    } catch (error) {
      console.error("Error in /api/forgot-password:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
};
