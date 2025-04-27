const FoodDonation = require("../../models/foodDonation");
const FoodItem = require("../../models/foodItem");
const UserModel = require("../../models/userModel");
const Notification = require("../../models/notification");
const mongoose = require('mongoose');
// ou en ES6
exports.createDonation = async (req, res) => {
  try {
    const { name, location, endingDate, ngoId, description } = req.body;

    // Get the image path from multer (using req.files similar to your driver documents example)
    // Assumes the field name for the image file is "image"
    const imagePath =
      req.files && req.files.image
        ? `uploads/${req.files.image[0].filename}`
        : null;

    // (Optional) Validate that the ngoId corresponds to an actual NGO user if needed
    // const ngoUser = await User.findById(ngoId);
    // if (!ngoUser || ngoUser.role !== 'ngo') {
    //   return res.status(400).json({ message: 'Invalid NGO ID or role' });
    // }

    // Create a new donation record including the image URL if provided
    const donation = new FoodDonation({
      name,
      location,
      endingDate,
      ngoId,
      description,
      imageUrl: imagePath,
    });

    await donation.save();
    res.status(201).json({
      message: "Donation created successfully",
      donation,
    });
  } catch (error) {
    console.log("Error creating donation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addFoodToDonation = async (req, res) => {
  const { donationId } = req.params;
  try {
    const Food = new FoodItem({
      ...req.body,
      donationId: donationId,
    });
    await Food.save();

    const donation = await FoodDonation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    donation.foods.push(Food);
    await donation.save();
    res.status(201).json(donation);
  } catch (error) {
    console.error("Error adding food item:", error);
    res.status(500).json({ message: "Error adding food item", error: error.message });
  }
};




exports.getDonationsByNgo = async (req, res) => {
  try {
    const rawTerm = req.query.search
      ? decodeURIComponent(req.query.search).trim()
      : "";

    let query = {};

    if (rawTerm) {
      const searchTerm = rawTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const ngos = await UserModel.find({
        fullName: { $regex: new RegExp(`\\b${searchTerm}`, "i") },
        role: "charity",
      });
      query.ngoId = { $in: ngos.map((n) => n._id) };
    }

    // Always populate at query level
    const donations = await FoodDonation.find(query)
      .populate("foods")
      .populate("ngoId", "fullName");

    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching donations", error });
  }
};

exports.getDonationByNgoId = async (req, res) => {
  const { ngoId } = req.params;

  try {
    const donations = await FoodDonation.find({ ngoId }).populate("foods");

    if (!donations || donations.length === 0) {
      return res
        .status(404)
        .json({ message: "No donation campaigns found for this NGO." });
    }

    res.status(200).json(donations);
  } catch (error) {
    console.error("Error fetching donations by NGO:", error);
    res.status(500).json({
      message: "Error fetching donations by NGO",
      error: error.message || error,
    });
  }
};

// GET /donations/:id/details
exports.getDonationDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const donation = await FoodDonation.findById(id)
      .populate({
        path: "foods",
        populate: [
          {
            path: "buisiness_id",
            select: "fullName restaurantName supermarketName email",
          },
          {
            path: "assignedVolunteer",
            select: "fullName email",
          },
        ],
      })
      .populate("ngoId", "fullName");

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    const ngo = await UserModel.findById(donation.ngoId);

    res.status(200).json({ donation, ngo });
  } catch (error) {
    console.error(error); // 👈 Add this
    res.status(500).json({
      message: "Error fetching donation or NGO info",
      error: error.message || error,
    });
  }
};

exports.assignFoodToVolunteer = async (req, res) => {
  const { foodId } = req.params;
  const { volunteerId } = req.body;

  try {
    const food = await FoodItem.findById(foodId).populate(
      "buisiness_id assignedVolunteer"
    );
    if (!food) return res.status(404).json({ message: "Food item not found" });

    food.assignedVolunteer = volunteerId;
    food.status = "requested"; // Optional: Keep or move this to "accepted"
    food.assignmentStatus = "pending"; // ✨ New
    await food.save();

    const notification = await Notification.create({
      user_id: volunteerId,
      message: `You’ve been requested to pick up food from ${
        food.buisiness_id?.fullName || "a business"
      }.`,
      type: "assignment-request",
      read: false,
    });

    req.io.to(volunteerId.toString()).emit("new-notification", notification);

    res.status(200).json({ message: "Volunteer request sent", food });
  } catch (err) {
    console.error("Assignment error:", err);
    res
      .status(500)
      .json({ message: "Error assigning volunteer", error: err.message });
  }
};
exports.acceptAssignment = async (req, res) => {
  const { foodId } = req.params;

  try {
    const food = await FoodItem.findById(foodId).populate({
      path: "donationId",
      populate: { path: "ngoId" },
    });

    if (!food) return res.status(404).json({ message: "Food not found" });

    food.assignmentStatus = "accepted";
    food.status = "assigned";
    await food.save();

    // 🔔 Notify NGO
    if (food.donationId?.ngoId) {
      const notification = await Notification.create({
        user_id: food.donationId.ngoId._id,
        message: `✅ Volunteer accepted the assignment for "${food.name}".`,
        type: "assignment",
        read: false,
      });

      req.io
        .to(food.donationId.ngoId._id.toString())
        .emit("new-notification", notification);
    }

    res.status(200).json({ message: "Assignment accepted" });
  } catch (err) {
    console.error("Accept error:", err);
    res.status(500).json({ message: "Error accepting assignment" });
  }
};

exports.declineAssignment = async (req, res) => {
  const { foodId } = req.params;

  try {
    const food = await FoodItem.findById(foodId).populate({
      path: "donationId",
      populate: { path: "ngoId" },
    });

    if (!food) return res.status(404).json({ message: "Food not found" });

    food.assignmentStatus = "declined";
    food.assignedVolunteer = null;
    food.status = "pending";
    await food.save();

    // 🔔 Notify NGO
    if (food.donationId?.ngoId) {
      const notification = await Notification.create({
        user_id: food.donationId.ngoId._id,
        message: `❌ Volunteer declined the assignment for "${food.name}".`,
        type: "assignment",
        read: false,
      });

      req.io
        .to(food.donationId.ngoId._id.toString())
        .emit("new-notification", notification);
    }

    res.status(200).json({ message: "Assignment declined" });
  } catch (err) {
    console.error("Decline error:", err);
    res.status(500).json({ message: "Error declining assignment" });
  }
};

exports.confirmPickupByBuisness = async (req, res) => {
  const { foodId } = req.params;

  try {
    const food = await FoodItem.findById(foodId);
    if (!food) return res.status(404).json({ message: "Food item not found" });

    food.supermarketConfirmedAt = new Date();

    if (food.volunteerPickedUpAt) {
      food.status = "picked-up";
    }

    await food.save();
    res.status(200).json({ message: "Pickup confirmed by supermarket", food });
  } catch (err) {
    res.status(500).json({ message: "Error confirming pickup", error: err });
  }
};

// Volunteer for a campaign
exports.volunteerForCampaign = async (req, res) => {
  const { campaignId } = req.params;
  const { userId } = req.body; // ← make sure this is defined

  try {
    const campaign = await FoodDonation.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (!campaign.volunteers) {
      campaign.volunteers = [];
    }

    // This check will always fail if userId is null or undefined
    const alreadyJoined = campaign.volunteers.includes(userId);
    if (alreadyJoined) {
      return res.status(400).json({ message: "You already volunteered." });
    }

    // 💥 If userId is undefined or empty string, Mongoose will store `null`
    campaign.volunteers.push(userId);

    await campaign.save();

    res.status(200).json({ message: "You have successfully volunteered." });
  } catch (error) {
    console.error("Volunteer registration error:", error);
    res
      .status(500)
      .json({ message: "Error volunteering", error: error.message });
  }
};

exports.getVolunteersForCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = await FoodDonation.findById(campaignId).populate(
      "volunteers"
    );

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json({ volunteers: campaign.volunteers });
  } catch (err) {
    console.error("Error fetching campaign volunteers:", err);
    res.status(500).json({ message: "Failed to retrieve volunteers" });
  }
};

exports.getBuisnessFoodDonations = async (req, res) => {
  const { businessId } = req.params;
  try {
    const foodItems = await FoodItem.find({
      buisiness_id: businessId,
    }).populate("assignedVolunteer");
    res.status(200).json(foodItems);
  } catch (error) {
    console.error("Error fetching food donations:", error);
    res.status(500).json({ message: "Failed to fetch food donations" });
  }
};

exports.getBusinessesForCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params; // ← Changed from "id" to "campaignId"
    console.log("Fetching businesses for campaign:", campaignId);

    const foods = await FoodItem.find({ donationId: campaignId }).populate(
      "buisiness_id"
    );
    console.log(`Found ${foods.length} food items for this campaign`);

    // Rest of your function...
    // Make sure to change any other instances of "id" to "campaignId"

    let businesses = [];
    for (const food of foods) {
      if (
        food.buisiness_id &&
        businesses.findIndex(
          (b) => b._id.toString() === food.buisiness_id._id.toString()
        ) === -1
      ) {
        businesses.push(food.buisiness_id);
      }
    }

    return res.status(200).json({ businesses });
  } catch (err) {
    console.error("Error fetching businesses:", err);
    return res.status(500).json({ error: "Failed to fetch businesses" });
  }
};

exports.getPaginatedFoodsByCampaign = async (req, res) => {
  const { campaignId } = req.params;
  const { page = 1, limit = 10, status, search } = req.query;

  try {
    const query = { donationId: campaignId };

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { name: searchRegex },
        { category: searchRegex },
        { "buisiness_id.fullName": searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const totalItems = await FoodItem.countDocuments(query);

    const items = await FoodItem.find(query)
      .populate("buisiness_id assignedVolunteer")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      data: items,
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    });
  } catch (err) {
    console.error("Error paginating food items:", err);
    res.status(500).json({ message: "Failed to fetch paginated food" });
  }
};
exports.getFoodById = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id)
      .populate({
        path: "donationId",
        populate: { path: "ngoId" },
      })
      .populate("buisiness_id");

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    res.json(food);
  } catch (err) {
    console.error("Error fetching food:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAvailableVolunteersForCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { foodId } = req.query;
    console.log(foodId);
    // Get current date and time for availability check
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = `${currentHours
      .toString()
      .padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")}`;

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const currentDayName = dayNames[now.getDay()];

    console.log("Current time:", currentTime);
    console.log("Current day:", currentDayName);

    // Get the food item to check its size if foodId is provided
    let requiredCapacity = "small"; // Default
    if (foodId) {
      console.log("Looking for food item with ID:", foodId);
      const foodItem = await FoodItem.findById(foodId);
      console.log("Found food item:", foodItem); // Log the entire item
      if (foodItem) {
        requiredCapacity = foodItem.size || "small";
        console.log("Food item size:", requiredCapacity);
      } else {
        console.log("Food item not found with ID:", foodId);
      }
    }

    // Find campaign and get its volunteers
    const campaign = await FoodDonation.findById(campaignId).populate({
      path: "volunteers",
      select:
        "fullName email phone availability profileImage transportType transportCapacity",
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (!campaign.volunteers || campaign.volunteers.length === 0) {
      return res.status(200).json({
        message: "No volunteers are assigned to this campaign",
        volunteers: [],
      });
    }

    console.log(
      `Total volunteers before filtering: ${campaign.volunteers.length}`
    );

    // Define transportRanking here so it's accessible to both filter and sort
    const transportRanking = {
      small: 1,
      medium: 2,
      large: 3,
    };

    // Updated filtering with debugging
    const availableVolunteers = campaign.volunteers.filter((volunteer) => {
      console.log(`\nChecking volunteer: ${volunteer.fullName}`);

      // Check availability
      if (!volunteer.availability || volunteer.availability.size === 0) {
        console.log("No availability data");
        return false;
      }

      const timeSlots = volunteer.availability.get(currentDayName);
      if (!timeSlots || timeSlots.length === 0) {
        console.log(`No time slots for ${currentDayName}`);
        return false;
      }

      console.log(
        `Time slots for ${currentDayName}:`,
        JSON.stringify(timeSlots)
      );

      const isAvailableNow = timeSlots.some((slot) => {
        const result = slot.start <= currentTime && slot.end >= currentTime;
        console.log(
          `Slot ${slot.start}-${slot.end} matches current time ${currentTime}? ${result}`
        );
        return result;
      });

      if (!isAvailableNow) {
        console.log("Not available at current time");
        return false;
      }

      // Check transport capacity
      const volunteerCapacity = volunteer.transportCapacity || "small";
      console.log(
        `Transport capacity: ${volunteerCapacity}, Required: ${requiredCapacity}`
      );

      const hasCapacity =
        transportRanking[volunteerCapacity] >=
        transportRanking[requiredCapacity];
      console.log(`Has required capacity? ${hasCapacity}`);

      return hasCapacity;
    });

    console.log(`Volunteers after filtering: ${availableVolunteers.length}`);

    if (availableVolunteers.length > 0) {
      // Sort volunteers by closest capacity match
      availableVolunteers.sort((a, b) => {
        const aCapacity = a.transportCapacity || "small";
        const bCapacity = b.transportCapacity || "small";

        const capacityDiffA =
          transportRanking[aCapacity] - transportRanking[requiredCapacity];
        const capacityDiffB =
          transportRanking[bCapacity] - transportRanking[requiredCapacity];

        if (capacityDiffA >= 0 && capacityDiffB >= 0) {
          return capacityDiffA - capacityDiffB;
        }

        return capacityDiffB - capacityDiffA;
      });
    }

    return res.status(200).json({
      message:
        availableVolunteers.length > 0
          ? "Available volunteers retrieved successfully"
          : "No available volunteers match the criteria",
      volunteers: availableVolunteers.map((v) => ({
        _id: v._id,
        fullName: v.fullName,
        email: v.email,
        phone: v.phone,
        profileImage: v.profileImage,
        transportCapacity: v.transportCapacity,
      })),
    });
  } catch (error) {
    console.error("Error finding available volunteers:", error);
    return res.status(500).json({
      message: "Error finding available volunteers",
      error: error.message,
    });
  }
};
exports.getMyVolunteeredCampaigns = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        message: "User ID is required" 
      });
    }
    
    // Find campaigns where this user is a volunteer
    const campaigns = await FoodDonation.find({
      volunteers: userId
    }).select('_id name imageUrl description');
    
    res.status(200).json(campaigns);
  } catch (error) {
    console.error("Error fetching volunteered campaigns:", error);
    res.status(500).json({ 
      message: "Failed to fetch volunteered campaigns", 
      error: error.message 
    });
  }
};


exports.getAllDonations = async (req, res) => {
  try {
    const search = req.query.search || "";
    const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    let query = {};

    if (sanitizedSearch) {
      const ngos = await UserModel.find({
        fullName: { $regex: new RegExp(`\\b${sanitizedSearch}`, "i") },
        role: "charity",
      });
      query.ngoId = { $in: ngos.map((n) => n._id) };
    }

    const donations = await FoodDonation.find(query)
      .populate("foods")
      .populate("ngoId", "fullName");

    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching donations", error });
  }
};

exports.deleteDonation = async (req, res) => {
  try {
  const deletedDonation = await FoodDonation.findByIdAndDelete(req.params.id);
      if (!deletedDonation) {
        return res.status(404).json({ success: false, message: "donation not found" });
      }
       
    if (!deletedDonation) {
      return res.status(404).json({ 
        success: false,
        message: 'Donation introuvable'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donation supprimée définitivement',
      data: deletedDonation
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Update a food item
exports.updateFoodItem = async (req, res) => {
  const { foodId } = req.params;
  const { quantity, category } = req.body;

  try {
    const foodItem = await FoodItem.findById(foodId);
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    // Update only quantity and category
    foodItem.quantity = quantity;
    foodItem.category = category;
    await foodItem.save();

    res.status(200).json({ message: "Food item updated successfully", foodItem });
  } catch (error) {
    console.error("Error updating food item:", error);
    res.status(500).json({ message: "Error updating food item", error: error.message });
  }
};

// Delete a food item
exports.deleteFoodItem = async (req, res) => {
  const { foodId } = req.params;

  try {
    const foodItem = await FoodItem.findById(foodId);
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    // Remove the food item from the associated donation
    const donation = await FoodDonation.findById(foodItem.donationId);
    if (donation) {
      donation.foods = donation.foods.filter((food) => food.toString() !== foodId);
      await donation.save();
    }

    await FoodItem.findByIdAndDelete(foodId);
    res.status(200).json({ message: "Food item deleted successfully" });
  } catch (error) {
    console.error("Error deleting food item:", error);
    res.status(500).json({ message: "Error deleting food item", error: error.message });
  }
};
