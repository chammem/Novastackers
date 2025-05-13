const RoleVerification = require("../models/roleVerification");
const upload = require("../middleware/upload");
const User = require("../models/userModel")
const axios = require("axios")
const fs = require("fs");

exports.uploadDriverDocuments = async (req, res) => {
  try {
    const { userId, transportType, transportCapacity } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }
    
    // Check if this is a no-document transport type
    const isNoDocumentRequired = ["walking", "bicycle"].includes(transportType);
    
    // Update the user profile with transport information
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Update transport type and capacity
    user.transportType = transportType;
    user.transportCapacity = transportCapacity;
    
    // Auto-activate users with bicycle or walking transport types
    if (isNoDocumentRequired) {
      user.isActive = true; // Automatically make user active
    }
    
    await user.save();
    
    // Handle role verification record
    let verification = await RoleVerification.findOne({ userId });
    
    if (!verification) {
      verification = new RoleVerification({ 
        userId,
        vehiculeType: transportType,
        transportCapacity: transportCapacity
      });
    } else {
      verification.vehiculeType = transportType;
      verification.transportCapacity = transportCapacity;
    }
    
    // Auto-approve verification for bicycle and walking
    if (isNoDocumentRequired) {
      verification.status = "approved";
    } else {
      // For other vehicle types, process document upload
      verification.status = "pending";
      
      if (req.files) {
        if (req.files.driverLicense && req.files.driverLicense[0]) {
          verification.driverLicense = {
            url: req.files.driverLicense[0].path,
            verified: false
          };
        }
        
        if (req.files.vehiculeRegistration && req.files.vehiculeRegistration[0]) {
          verification.vehiculeRegistration = {
            url: req.files.vehiculeRegistration[0].path,
            verified: false
          };
        }
      }
    }
    
    await verification.save();
    
    // Return appropriate message based on transport type
    return res.status(200).json({
      success: true,
      message: isNoDocumentRequired 
        ? "Your account has been automatically activated for walking/bicycle delivery" 
        : "Documents submitted successfully and awaiting verification",
      user: {
        _id: user._id,
        transportType: user.transportType,
        transportCapacity: user.transportCapacity,
        isActive: user.isActive
      }
    });
    
  } catch (error) {
    console.error("Error in uploadDriverDocuments:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing your request"
    });
  }
};

exports.uploadRestaurantSuperMarketDocuments = async (req, res) => {
  try {
    const { businessId } = req.body;

    // Validate user exists and is a business (restaurant or supermarket)
    const user = await User.findById(businessId);
    if (!user || !["restaurant", "supermarket"].includes(user.role)) {
      return res.status(400).json({ message: "Invalid business ID or role" });
    }

    // Get file paths from multer
    const businessLicenseNumberPath = `uploads/${req.files.businessLicenseNumber[0].filename}`;
    const taxIdPath = `uploads/${req.files.taxId[0].filename}`;

    // Create or update the verification document
    const verification = await RoleVerification.findOneAndUpdate(
      { userId: businessId },
      {
        businessLicenseNumber: { url: businessLicenseNumberPath, verified: false },
        taxId: { url: taxIdPath, verified: false },
        status: "pending",
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "Business documents uploaded successfully",
      verification,
    });
  } catch (error) {
    console.log("Error uploading business documents:", error);
    res.status(500).json({ message: "An error occurred while uploading documents" });
  }
};
exports.verification = async (req,res)=>{
  const { id, action } = req.params;

  try {
    // Find the verification by ID
    const verification = await RoleVerification.findById(id).populate("userId");
    if (!verification) {
      return res.status(404).json({ success: false, message: "Verification not found" });
    }

    // Find the user associated with the verification
    const user = await User.findById(verification.userId._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update the status and isActive based on the action
    if (action === "accept") {
      verification.status = "approved";
      user.isActive = true;
      user.verificationStatus = "verified" // Activate the user
    } else if (action === "reject") {
      verification.status = "rejected";
      user.isActive = false;
      user.verificationStatus="rejected"; // Deactivate the user
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    // Save the updated verification and user
    await verification.save();
    await user.save();

    res.status(200).json({ success: true, message: `Verification ${action}ed successfully` });
  } catch (error) {
    console.error(`Error ${action}ing verification:`, error);
    res.status(500).json({ success: false, message: `An error occurred while ${action}ing verification` });
  }

} 



exports.getAllDriverVerifications = async (req,res) => {
    try {
        const verifications = await RoleVerification.find({ status: "pending" })
          .populate("userId", "email role fullName") // Populate user details
          .exec();
        res.status(200).json(verifications);
      } catch (error) {
        console.error("Error fetching pending verifications:", error);
        res.status(500).json({ message: "An error occurred while fetching verifications" });
      }


}

exports.testTenserFlowApi = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || !req.files.vehiculeRegistration) {
      return res.status(400).json({ message: "No files were uploaded" });
    }

    // Get the path of the uploaded file
    const vehiculeRegistrationPath = `uploads/${req.files.vehiculeRegistration[0].filename}`;

    // Read the uploaded file and encode it in base64
    const image = fs.readFileSync(vehiculeRegistrationPath, { encoding: "base64" });

    // Make a POST request to the Roboflow API
    const roboflowResponse = await axios({
      method: "POST",
      url: "https://detect.roboflow.com/carte_grise-93igw/4", // Replace with your model endpoint
      params: {
        api_key: "YZV3QhelravXCokeC6ey", // Replace with your API key
      },
      data: image,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Delete the uploaded file after processing
    fs.unlinkSync(vehiculeRegistrationPath);

    // Return the Roboflow API response
    res.json(roboflowResponse.data);
  } catch (error) {
    console.log("Error uploading documents:", error);
    res.status(500).json({ message: "An error occurred while uploading documents" });
  }
};
