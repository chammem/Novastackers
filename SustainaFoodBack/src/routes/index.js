const express = require('express')
const userValidatorSchema = require("../middleware/userValidator");   
const validateRequest = require("../middleware/validateRequest");
const router = express.Router()
const foodController = require("../controllers/food/foodItem")
const roleVerification = require("../controllers/roleVerification")
require("dotenv").config();
const axios = require('axios');
const cors = require('cors');
const userModel = require("../models/userModel");
const jwt = require('jsonwebtoken');
const donationController = require("../controllers/donations/donationController");
const RoleVerification = require("../models/roleVerification")
const  {registerVerification, userSendVerificationMail, generateOtp, verifyOtp, resetPassword} = require('../controllers/auth/userSignUp')
const userSignInController = require('../controllers/auth/userSignIn')
const authToken = require('../middleware/authToken')
const userDetailsController = require('../controllers/auth/userDetails')
const userLogout = require('../controllers/auth/userLogout')
const allUsers = require('../controllers/allUsers');
const { addFoodItem } = require('../controllers/food/foodItem');
const { uploadDriverDocuments } = require('../controllers/roleVerification');
const upload = require("../middleware/upload");
const notificationController = require('../controllers/notifications/notificationController');
const Batch = require('../models/batch')
const routerController = require('../controllers/route/routeController')
const recommendationController = require('../controllers/recommendationController');

router.get("/auth-endpoint",authToken,(request, response) => {
  response.json({ message: "You are authorized to access me" });
});

router.post("/sign-up",validateRequest(userValidatorSchema), userSendVerificationMail);
router.post("/verification",registerVerification);
router.post("/login",userSignInController)
router.get("/user-details",authToken,userDetailsController)
router.post("/userLogout",userLogout)
router.get("/verification",registerVerification);

//admin panel
router.get("/users",allUsers.allUsers)
router.get('/user/:id', allUsers.getUser);
router.put('/updateUser/:id', allUsers.updateUser);
router.delete('/deleteUser/:id', allUsers.deleteUser);
router.put('/disableUser/:id', allUsers.disableUser);

router.put('/update-profile/:userId',allUsers.updateLogedInUser);
router.put('/change-password/:userId',allUsers.updateLogedInPassword);
// DOCUMENT UPLOADING //
router.post("/upload-driver-documents", upload.fields([
    { name: "driverLicense", maxCount: 1 },
    { name: "vehiculeRegistration", maxCount: 1 },
  ]),roleVerification.uploadDriverDocuments);
router.post("/upload-buisness-documents",upload.fields([
    { name: "taxId", maxCount: 1 },
    { name: "businessLicenseNumber", maxCount: 1 },
  ]),roleVerification.uploadRestaurantSuperMarketDocuments);

  //role verification//

  router.get("/pending-verification",roleVerification.getAllDriverVerifications)
  router.post("/verification/:id/:action",roleVerification.verification)
  //forgot -password
  router.post('/request-otp',generateOtp);
  router.post('/verify-otp',verifyOtp)
  router.post('/reset-password',resetPassword);

//Food Related Routes//

router.post("/add-food",foodController.addFoodItem);
router.delete("/delete-food/:foodId",foodController.deleteFoodItem);
/////Google auth
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
    // Step 1: Exchange Authorization Code for Access Token
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

    // Step 2: Retrieve User Information from Google OAuth API
    const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // Step 3: Retrieve Phone Number from Google People API
    let phoneNumber = null;
    try {
      const { data: phoneData } = await axios.get(
        'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers',
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      if (phoneData.phoneNumbers && phoneData.phoneNumbers.length > 0) {
        phoneNumber = phoneData.phoneNumbers[0].value; // Get the first phone number
      }
    } catch (phoneError) {
      console.error('Error fetching phone number:', phoneError.response ? phoneError.response.data : phoneError.message);
    }
// Gestion des erreurs globales
router.use((err, req, res, next) => {
  console.error(err); // Affiche l'erreur dans la console pour le débogage
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Une erreur interne est survenue.',
  });
});

    // Step 4: Check if the User Exists in the Database
    let user = await userModel.findOne({ email: profile.email });

    if (!user) {
      user = new userModel({
        googleId: profile.id,
        email: profile.email,
        fullName: profile.name,
        phoneNumber: phoneNumber, // Store phone number if available
        role: "user",
      });
      await user.save();
    } else if (!user.phoneNumber && phoneNumber) {
      // Update existing user if phone number was not previously stored
      user.phoneNumber = phoneNumber;
      await user.save();
    }

    // Step 5: Generate JWT Token
    const tokenData = {
      _id: user._id,
      email: user.email,
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, {
      expiresIn: '12h',
    });

    // Step 6: Set Token in HTTP-Only Cookie
    const tokenOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: "Strict", // Prevent CSRF attacks
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    };

    res.cookie("token", token, tokenOptions);

    // Step 7: Redirect to the frontend home page
    res.redirect("http://localhost:5173/");

  } catch (error) {
    console.error("Google OAuth error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Google OAuth failed" });
  }
});

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
        role: decoded.role // Include role here
      }
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
});

// routes/roleVerification.js
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
router.post("/test", upload.fields([
  { name: "vehiculeRegistration", maxCount: 1 },
]),roleVerification.testTenserFlowApi)

router.get("/user/:id",allUsers.getUserById);
router.get("/users-by-role", allUsers.getAllVolunteers);
router.get("/notification", notificationController.getNotifications);
router.get("/volunteer/:volunteerId/assignments",allUsers.getAssignedFoodForVolunteer);


//food pick up verification //
router.patch("/food/:foodId/start-delivery", foodController.startDelivery);
router.post("/food/:foodId/verify-delivery", foodController.verifyDeliveryCode);

router.patch("/food/:foodId/start-pickup", foodController.startPickup);
router.post("/food/:foodId/verify-pickup", foodController.verifyPickupCode);
router.delete("/notification/:id",notificationController.deleteNotification);
router.delete("/notification/clear-all/:userId",notificationController.clearAllNotifications);
router.put( "/update-ngo-profile",upload.single("logo"),allUsers.updateNgoProfile);






////MAP THINGS /////

router.get("/search", async (req, res) => {
  console.log("🔍 Address search endpoint hit");
  const { q } = req.query;
  
  console.log(`🔍 Search query: "${q}"`);
  
  if (!q) {
    console.log("❌ Empty search query received");
    return res.status(400).json({ message: "Search query is required" });
  }
  
  try {
    console.log(`🔍 Building Nominatim URL for query: "${q}"`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      q
    )}&addressdetails=1&limit=5&countrycodes=tn`;
    
    console.log(`🔍 Making external API request to: ${url}`);
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "SustainaFoodApp/1.0 (ahmedkacem.jebari@esprit.tn)",
        "Accept-Language": "en",
      },
    });
    
    const data = response.data;
    console.log(`✅ Nominatim API response received: ${data.length} results found`);
    
    if (data.length === 0) {
      console.log("⚠️ No results found for this query");
    } else {
      console.log(`✅ First result: ${JSON.stringify(data[0].display_name)}`);
    }
    
    res.json(data);
  } catch (err) {
    console.error("❌ Nominatim API error:", err);
    console.error("❌ Error details:", err.response ? err.response.data : "No response data");
    res.status(500).json({ message: "Failed to fetch address suggestions." });
  }
});

// routes/map.js
router.post("/route", async (req, res) => {
  const { start, end ,mode="driving-car"} = req.body;

  try {
    const orsRes = await axios.post(
     `https://api.openrouteservice.org/v2/directions/${mode}`,
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

    console.log("ORS route data:", JSON.stringify(orsRes.data, null, 2)); // Log full response
    res.json(orsRes.data);
  } catch (err) {
    console.error("ORS error:", err?.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch route from ORS." });
  }
});

router.post("/route-multi", async (req, res) => {
  const { coordinates, mode = "driving-car" } = req.body;

  try {
    const orsRes = await axios.post("https://api.openrouteservice.org/v2/directions/" + mode, {
      coordinates
    }, {
      headers: {
        Authorization: process.env.ORS_API_KEY,
        "Content-Type": "application/json",
      }
    });

    res.status(200).json(orsRes.data);
  } catch (error) {
    console.error("ORS route error:", error);
    res.status(500).json({ message: "Error fetching route", error });
  }
});



router.get('/volunteer/availability/:userId',allUsers.getVolunteerAvailability);
router.post('/volunteer/availability/:userId',allUsers.updateVolunteerAvailability);



router.post("/optimized-route", async (req, res) => {
  try {
    const { start, end, pickups } = req.body;

    if (
      !Array.isArray(start) || start.length !== 2 ||
      !Array.isArray(end) || end.length !== 2 ||
      !Array.isArray(pickups) || pickups.some(p => !Array.isArray(p) || p.length !== 2)
    ) {
      return res.status(400).json({ message: "Invalid coordinate format" });
    }

    // 👉 STEP 1: Send to ORS /optimization (NO profile here)
    const jobs = pickups.map((point, i) => ({
      id: i + 1,
      service: 300,
      amount: [1],
      location: point, // [lng, lat]
    }));

    const vehicles = [{
      id: 1,
      profile: "driving-car", // This is OK here
      start,
      end,
      capacity: [pickups.length],
    }];

    const optimizationRes = await axios.post(
      "https://api.openrouteservice.org/optimization",
      { jobs, vehicles },
      {
        headers: {
          Authorization: process.env.ORS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const route = optimizationRes.data.routes[0];

    const orderedWaypoints = route.steps
      .filter(step => step.type === "job")
      .map(step => step.location);

    const coordinates = [start, ...orderedWaypoints, end];

    // 👉 STEP 2: Get polyline route using ORS Directions API
    const directionsRes = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      { coordinates },
      {
        headers: {
          Authorization: process.env.ORS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const encodedPolyline = directionsRes.data.routes[0].geometry;

    return res.status(200).json({
      orderedWaypoints,
      encodedPolyline,
    });

  } catch (err) {
    console.error("ORS optimization error:", err.response?.data || err.message);
    return res.status(500).json({
      message: "Failed to optimize route",
      error: err.response?.data || err.message,
    });
  }
});

router.post('/optimized-route-with-constraints', async (req, res) => {
  try {
    const { start, end, pickups, constraints } = req.body;
    
    // If there are no constraints, use regular optimization
    if (!constraints || constraints.length === 0) {
      return optimizeRoute(req, res);
    }
    
    // First, try to use ORS optimizer with constraints
    // If that fails, we'll use our own constraint enforcement
    
    // TODO: Call to OpenRouteService with constraints if supported
    
    // Fallback: Custom constraint handling
    // We'll manually ensure pickups come before deliveries
    
    // 1. Get an optimized route without constraints first
    const optimizedResult = await getOptimizedRoute(start, end, pickups);
    
    // 2. Check if any constraints are violated
    let orderedWaypoints = optimizedResult.orderedWaypoints;
    let constraintsViolated = false;
    
    // Check each constraint
    constraints.forEach(constraint => {
      const beforeIndex = findPointIndex(orderedWaypoints, constraint.before);
      const afterIndex = findPointIndex(orderedWaypoints, constraint.after);
      
      if (beforeIndex > afterIndex) {
        constraintsViolated = true;
      }
    });
    
    // 3. If constraints are violated, enforce them
    if (constraintsViolated) {
      // Simplified approach: Group by orders and enforce pickup before delivery
      const orderedWithConstraints = [];
      
      // Add start point
      orderedWithConstraints.push(start);
      
      // For each order, add pickup then delivery
      Object.values(groupPointsByOrder(pickups, constraints)).forEach(orderPoints => {
        if (orderPoints.before) orderedWithConstraints.push(orderPoints.before);
        if (orderPoints.after) orderedWithConstraints.push(orderPoints.after);
      });
      
      // Add end point
      orderedWithConstraints.push(end);
      
      // Generate new route with these ordered points
      const newRoute = await getDirectRoute(orderedWithConstraints);
      
      return res.json({
        orderedWaypoints: orderedWithConstraints,
        encodedPolyline: newRoute.encodedPolyline
      });
    }
    
    // Otherwise, return the original optimization
    return res.json(optimizedResult);
    
  } catch (error) {
    console.error('Route optimization error:', error);
    res.status(500).json({ error: 'Failed to optimize route' });
  }
});

// Helper functions
function findPointIndex(points, target) {
  return points.findIndex(p => 
    Math.abs(p[0] - target[0]) < 0.0001 && Math.abs(p[1] - target[1]) < 0.0001
  );
}

function groupPointsByOrder(points, constraints) {
  const orderMap = {};
  
  constraints.forEach((constraint, i) => {
    orderMap[`order_${i}`] = {
      before: constraint.before,
      after: constraint.after
    };
  });
  
  return orderMap;
}

router.get('/volunteer/:userId/campaigns', donationController.getMyVolunteeredCampaigns);


// Route to fetch all available food items

router.get('/', foodController.getAllAvailableFood);

// Route to fetch food recommendations for a user
router.get('/recommendations/:userId', recommendationController.getFoodRecommendations);


module.exports = router