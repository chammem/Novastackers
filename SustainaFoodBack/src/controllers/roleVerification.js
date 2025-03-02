const RoleVerification = require("../models/roleVerification");
const upload = require("../middleware/upload");
const User = require("../models/userModel")

exports.uploadDriverDocuments = async (req, res) => {
  try {
    const { driverId, vehiculeType } = req.body;

    // Validate user exists and is a driver
    const user = await User.findById(driverId);
    if (!user || user.role !== "driver") {
      return res.status(400).json({ message: "Invalid driver ID or role" });
    }

    // Get file paths from multer
    const driverLicensePath = vehiculeType === "motor" ? null : `uploads/${req.files.driverLicense[0].filename}`;
    const vehiculeRegistrationPath = `uploads/${req.files.vehiculeRegistration[0].filename}`;

    // Update user's vehicle type
    user.vehicleType = vehiculeType;

    // If vehiculeType is "bike", set user as active
    if (vehiculeType === "bike") {
      user.isActive = true; // Activate the user
    }

    await user.save();

    // Set verification status based on vehiculeType
    const verificationStatus = vehiculeType === "bike" ? "approved" : "pending";

    const verification = await RoleVerification.findOneAndUpdate(
      { userId: driverId },
      {
        vehiculeType,
        driverLicense: { url: driverLicensePath, verified: false },
        vehiculeRegistration: { url: vehiculeRegistrationPath, verified: false },
        status: verificationStatus, // Set status to "approved" if bike, otherwise "pending"
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "Documents uploaded successfully",
      verification,
    });
  } catch (error) {
    console.log("Error uploading documents:", error);
    res.status(500).json({ message: "An error occurred while uploading documents" });
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
      user.isActive = true; // Activate the user
    } else if (action === "reject") {
      verification.status = "rejected";
      user.isActive = false; // Deactivate the user
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