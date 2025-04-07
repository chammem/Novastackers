const FoodDonation = require("../../models/foodDonation");
const FoodItem = require("../../models/foodItem");
const UserModel = require("../../models/userModel");
const Notification = require("../../models/notification");

exports.createDonation = async (req, res) => {
  try {
    const { name, location, endingDate, ngoId, description } = req.body;

    // Get the image path from multer (using req.files similar to your driver documents example)
    // Assumes the field name for the image file is "image"
    const imagePath = req.files && req.files.image ? `uploads/${req.files.image[0].filename}` : null;

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


exports.addFoodToDonation = async (req,res) => {
    const {donationId} = req.params;
    const {buisiness_id,name,quantity,category} = req.body;
    try {
        const Food = new FoodItem({buisiness_id,name,quantity,category,donationId:donationId});
        await Food.save();

        const donation = await FoodDonation.findById(donationId);

        if(!donation){
            return res.status(404).json({message:"Donation not found"});
        }
        donation.foods.push(Food);

        await donation.save();
        res.status(201).json(donation);
    } catch (error) {
        res.status(500).json({ message: 'Error adding food item', error });
    }

}

exports.getAllDonations = async (req, res) => {
    try {
      const search = req.query.search || '';
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      let query = {};
      
      if (sanitizedSearch) {
        const ngos = await UserModel.find({
          fullName: { $regex: new RegExp(`\\b${sanitizedSearch}`, 'i') },
          role: "charity"
        });
        query.ngoId = { $in: ngos.map(n => n._id) };
      }
  
      const donations = await FoodDonation.find(query)
        .populate('foods')
        .populate('ngoId', 'fullName');
  
      res.status(200).json(donations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching donations', error });
    }
  };

  exports.getDonationsByNgo = async (req, res) => {  
    try {
      const rawTerm = req.query.search ? decodeURIComponent(req.query.search).trim() : '';
  
      let query = {};
      
      if (rawTerm) {
        const searchTerm = rawTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const ngos = await UserModel.find({
          fullName: { $regex: new RegExp(`\\b${searchTerm}`, 'i') },
          role: "charity"
        });
        query.ngoId = { $in: ngos.map(n => n._id) };
      }
  
      // Always populate at query level
      const donations = await FoodDonation.find(query)
        .populate('foods')
        .populate('ngoId', 'fullName');
  
      res.status(200).json(donations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching donations', error });
    }
  };


  exports.getDonationByNgoId = async (req, res) => {
    const { ngoId } = req.params;
  
    try {
      const donations = await FoodDonation.find({ ngoId }).populate('foods');
  
      if (!donations || donations.length === 0) {
        return res.status(404).json({ message: "No donation campaigns found for this NGO." });
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
    path: 'foods',
    populate: [
      {
        path: 'buisiness_id',
        select: 'fullName restaurantName supermarketName email',
      },
      {
        path: 'assignedVolunteer',
        select: 'fullName email',
      }
    ]
  })
  .populate('ngoId', 'fullName');


    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const ngo = await UserModel.findById(donation.ngoId);

    res.status(200).json({ donation, ngo });
  } catch (error) {
    console.error(error); // 👈 Add this
    res.status(500).json({
      message: 'Error fetching donation or NGO info',
      error: error.message || error,
    });
  }
  
};


exports.assignFoodToVolunteer = async (req, res) => {
  const { foodId } = req.params;
  const { volunteerId } = req.body;

  try {
    const food = await FoodItem.findById(foodId).populate("buisiness_id assignedVolunteer");
    if (!food) return res.status(404).json({ message: "Food item not found" });

    food.assignedVolunteer = volunteerId;
    food.status = "requested"; // Optional: Keep or move this to "accepted"
    food.assignmentStatus = "pending"; // ✨ New
    await food.save();

    const notification = await Notification.create({
      user_id: volunteerId,
      message: `You’ve been requested to pick up food from ${food.buisiness_id?.fullName || "a business"}.`,
      type: "assignment-request",
      read: false
    });

    req.io.to(volunteerId.toString()).emit("new-notification", notification);

    res.status(200).json({ message: "Volunteer request sent", food });
  } catch (err) {
    console.error("Assignment error:", err);
    res.status(500).json({ message: "Error assigning volunteer", error: err.message });
  }
};
exports.acceptAssignment = async (req, res) => {
  const { foodId } = req.params;

  try {
    const food = await FoodItem.findById(foodId).populate({
      path: 'donationId',
      populate: { path: 'ngoId' }
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
        read: false
      });

      req.io.to(food.donationId.ngoId._id.toString()).emit("new-notification", notification);
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
      path: 'donationId',
      populate: { path: 'ngoId' }
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
        read: false
      });

      req.io.to(food.donationId.ngoId._id.toString()).emit("new-notification", notification);
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
    if (!food) return res.status(404).json({ message: 'Food item not found' });

    food.supermarketConfirmedAt = new Date();

    if (food.volunteerPickedUpAt) {
      food.status = 'picked-up';
    }

    await food.save();
    res.status(200).json({ message: 'Pickup confirmed by supermarket', food });
  } catch (err) {
    res.status(500).json({ message: 'Error confirming pickup', error: err });
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
    res.status(500).json({ message: "Error volunteering", error: error.message });
  }
};


exports.getVolunteersForCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = await FoodDonation.findById(campaignId).populate("volunteers");

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
    const foodItems = await FoodItem.find({ buisiness_id: businessId }).populate("assignedVolunteer");
    res.status(200).json(foodItems);
  } catch (error) {
    console.error("Error fetching food donations:", error);
    res.status(500).json({ message: "Failed to fetch food donations" });
  }
};

exports.getBusinessesForCampaign = async (req, res) => {
  const { campaignId } = req.params;

  try {
    const campaign = await FoodDonation.findById(campaignId).populate({
      path: 'foods',
      populate: {
        path: 'buisiness_id',
        model: 'User'
      }
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const businesses = campaign.foods
      .map(food => food.buisiness_id)
      .filter((value, index, self) =>
        value && self.findIndex(v => v._id.toString() === value._id.toString()) === index
      );
      console.log(businesses);
    res.status(200).json({ businesses });
  } catch (err) {
    console.error("Error fetching businesses:", err);
    res.status(500).json({ message: "Failed to retrieve businesses" });
  }
};



exports.getPaginatedFoodsByCampaign = async (req, res) => {
  const { campaignId } = req.params;
  const { page = 1, limit = 10, status, search } = req.query;

  try {
    const query = { donationId: campaignId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { category: searchRegex },
        { 'buisiness_id.fullName': searchRegex },
      ];
    }

    const skip = (page - 1) * limit;

    const totalItems = await FoodItem.countDocuments(query);

    const items = await FoodItem.find(query)
      .populate('buisiness_id assignedVolunteer')
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
        populate: { path: "ngoId" } 
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
}







