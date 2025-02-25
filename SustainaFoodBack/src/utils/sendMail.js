const nodemailer = require("nodemailer");
require("dotenv").config();

// Create a transporter using nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your password or App password
  },
});

// Function to send OTP email
const sendResetPasswordEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Recovery OTP",
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP sent successfully to:", email);
    return { success: true, message: "OTP sent successfully." };
  } catch (error) {
    console.error("Error while sending OTP:", error);
    if (error.response) {
      console.error("SMTP Error Response:", error.response);
    }
    return { success: false, message: "Error sending OTP." };
  }
};


// Export the function
module.exports = sendResetPasswordEmail;
