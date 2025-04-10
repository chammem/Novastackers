const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

// Controllers
const foodController = require("../controllers/food/foodItem");
const roleVerification = require("../controllers/roleVerification");
const { registerVerification, userSendVerificationMail, generateOtp, verifyOtp, resetPassword } = require('../controllers/auth/userSignUp');
const userSignInController = require('../controllers/auth/userSignIn');
const userDetailsController = require('../controllers/auth/userDetails');
const userLogout = require('../controllers/auth/userLogout');
const allUsers = require('../controllers/allUsers');
const notificationController = require('../controllers/notifications/notificationController');
const { sendOtp } = require("../controllers/auth/sendOtp");
const { verifyOtp: verifyOtp2FA } = require("../controllers/auth/verifyOtp");

// Middleware
const authToken = require('../middleware/authToken');
const validateRequest = require("../middleware/validateRequest");
const userValidatorSchema = require("../middleware/userValidator");
const upload = require("../middleware/upload");

// Models
const userModel = require("../models/userModel");
const RoleVerification = require("../models/roleVerification");

// Routes
router.get("/auth-endpoint", authToken, (request, response) => {
  response.json({ message: "You are authorized to access me" });
});

router.post("/sign-up", validateRequest(userValidatorSchema), userSendVerificationMail);
router.post("/verification", registerVerification);
router.post("/login", userSignInController);
router.get("/user-details", authToken, userDetailsController);
router.post("/userLogout", userLogout);

// Admin Panel Routes
router.get("/users", allUsers.allUsers);
router.get('/user/:id', allUsers.getUser);
router.put('/updateUser/:id', allUsers.updateUser);
router.delete('/deleteUser/:id', allUsers.deleteUser);
router.put('/disableUser/:id', allUsers.disableUser);

router.put('/update-profile/:userId', allUsers.updateLogedInUser);
router.put('/change-password/:userId', allUsers.updateLogedInPassword);

// Document Upload Routes
router.post("/upload-driver-documents", upload.fields([
  { name: "driverLicense", maxCount: 1 },
  { name: "vehiculeRegistration", maxCount: 1 },
]), roleVerification.uploadDriverDocuments);

router.post("/upload-buisness-documents", upload.fields([
  { name: "taxId", maxCount: 1 },
  { name: "businessLicenseNumber", maxCount: 1 },
]), roleVerification.uploadRestaurantSuperMarketDocuments);

// Role Verification Routes
router.get("/pending-verification", roleVerification.getAllDriverVerifications);
router.post("/verification/:id/:action", roleVerification.verification);

// Password Reset
router.post('/request-otp', generateOtp);
router.post('/verify-otp', verifyOtp2FA);
router.post('/reset-password', resetPassword);

// Food Recommendation
router.get("/recommendations", authToken, foodController.getRecommendations);

// 2FA Routes
router.post("/send-otp", sendOtp);
router.post("/verify-2fa", verifyOtp2FA);

// Food Item Routes
router.post("/add-food", foodController.addFoodItem);
router.delete("/delete-food/:foodId", foodController.deleteFoodItem);

// Google Auth
router.get('/auth/google', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: 'http://localhost:8082/api/auth/google/callback',
    response_type: 'code',
    scope: 'profile email',
    access_type: 'offline',
    prompt: 'consent'
  });
  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.redirect(url);
});

router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code missing' });
  }

  try {
    const params = new URLSearchParams();
    params.append('client_id', process.env.GOOGLE_CLIENT_ID);
    params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
    params.append('code', code);
    params.append('redirect_uri', 'http://localhost:8082/api/auth/google/callback');
    params.append('grant_type', 'authorization_code');

    const { data } = await axios.post('https://oauth2.googleapis.com/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token } = data;

    const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    let phoneNumber = null;
    try {
      const { data: phoneData } = await axios.get(
        'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers',
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      if (phoneData.phoneNumbers && phoneData.phoneNumbers.length > 0) {
        phoneNumber = phoneData.phoneNumbers[0].value;
      }
    } catch (phoneError) {
      console.error('Error fetching phone number:', phoneError.response ? phoneError.response.data : phoneError.message);
    }

    let user = await userModel.findOne({ email: profile.email });

    if (!user) {
      user = new userModel({
        googleId: profile.id,
        email: profile.email,
        fullName: profile.name,
        phoneNumber: phoneNumber,
        role: "user",
      });
      await user.save();
    } else if (!user.phoneNumber && phoneNumber) {
      user.phoneNumber = phoneNumber;
      await user.save();
    }

    const tokenData = {
      _id: user._id,
      email: user.email,
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, {
      expiresIn: '12h',
    });

    const tokenOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 12 * 60 * 60 * 1000,
    };

    res.cookie("token", token, tokenOptions);

    res.redirect("http://localhost:5173/");
  } catch (error) {
    console.error("Google OAuth error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Google OAuth failed" });
  }
});

// Check Auth
router.get('/check-auth', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) throw new Error('No token');

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    res.json({
      success: true,
      user: {
        _id: decoded._id,
        email: decoded.email,
        role: decoded.role
      }
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
});

// Role Verifications Route
router.get("/role-verifications", async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const verifications = await RoleVerification.find(query).populate("userId");
    res.json({ success: true, data: verifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Map Routes
router.get("/search", async (req, res) => {
  const { q } = req.query;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=5&countrycodes=tn`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "SustainaFoodApp/1.0 (ahmedkacem.jebari@esprit.tn)",
        "Accept-Language": "en",
      },
    });
    const data = response.data;
    res.json(data);
  } catch (err) {
    console.error("Nominatim error:", err);
    res.status(500).json({ message: "Failed to fetch address suggestions." });
  }
});

router.post("/route", async (req, res) => {
  const { start, end } = req.body;

  try {
    const response = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        coordinates: [start, end],
      },
      {
        headers: {
          Authorization: process.env.ORS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("ORS error:", err);
    res.status(500).json({ message: "Failed to fetch route" });
  }
});

module.exports = router;
