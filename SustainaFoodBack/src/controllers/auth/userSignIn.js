const bcrypt = require('bcryptjs');
const userModel = require("../../models/userModel");
const jwt = require('jsonwebtoken');

async function userSignInController(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password"
      });
    }

    const user = await userModel.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isDisabled) {
      return res.status(403).json({
        success: false,
        message: "Account disabled"
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    
    if (!checkPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Token payload
    const tokenData = {
      _id: user._id,
      email: user.email,
      role: user.role // Ensure role exists in user model
    };

    // Generate token
    const token = jwt.sign(
      tokenData,
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: '7d' } // Fixed expiration format
    );

    // Cookie options
    const tokenOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    return res.cookie("token", token, tokenOption).status(200).json({
      success: true,
      message: "Logged in successfully",
      user: tokenData
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

module.exports = userSignInController;
