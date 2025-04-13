const Batch = require("../models/batch");
const FoodItem = require("../models/foodItem");
const FoodDonation = require("../models/foodDonation");
const { createBatches } = require("../utils/clustering");
const Notification = require("../models/notification");

// Generate batches for a campaign
exports.generateBatches = async (req, res) => {
  try {
    const { campaignId } = req.params;

    // Get unassigned food items
    const foodItems = await FoodItem.find({
      donationId: campaignId,
      assignedVolunteer: null,
      status: "pending",
    }).populate("buisiness_id", "fullName address lat lng");

    if (foodItems.length === 0) {
      return res.status(200).json({
        message: "No unassigned food items found to batch",
      });
    }

    // Check if any food items have valid business coordinates
    const itemsWithCoordinates = foodItems.filter(
      (item) =>
        item.buisiness_id &&
        typeof item.buisiness_id.lat === "number" &&
        typeof item.buisiness_id.lng === "number"
    );

    if (itemsWithCoordinates.length === 0) {
      return res.status(400).json({
        message:
          "Cannot create batches - no food items have valid location data",
      });
    }

    // Delete existing unassigned batches
    await Batch.deleteMany({
      campaignId,
      status: "suggested",
      assignedVolunteer: null,
    });

    // Create new batches
    const batchClusters = await createBatches(foodItems);

    // Save to database
    const savedBatches = await Promise.all(
      batchClusters.map((batch) => {
        return new Batch({
          campaignId,
          items: batch.items,
          requiredCapacity: batch.requiredCapacity,
          centerPoint: batch.centerPoint,
          status: "suggested",
        }).save();
      })
    );

    res.status(200).json({
      message: `Successfully generated ${savedBatches.length} batches`,
      batches: savedBatches,
    });
  } catch (error) {
    console.error("Batch generation error:", error);
    res
      .status(500)
      .json({ message: "Error generating batches", error: error.message });
  }
};

// Get all batches for a campaign
exports.getBatchesForCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const batches = await Batch.find({ campaignId })
      .populate({
        path: "items",
        populate: { path: "buisiness_id", select: "fullName address lat lng" },
      })
      .populate("assignedVolunteer", "fullName email transportCapacity");

    res.status(200).json(batches);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching batches", error: error.message });
  }
};

// Get available volunteers for a batch
exports.getAvailableVolunteersForBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Get current time details
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

    // Get campaign volunteers
    const campaign = await FoodDonation.findById(batch.campaignId).populate({
      path: "volunteers",
      select: "fullName email phone availability transportCapacity",
    });

    if (!campaign || !campaign.volunteers || campaign.volunteers.length === 0) {
      return res
        .status(200)
        .json({ message: "No volunteers found", volunteers: [] });
    }

    // Transport ranking for comparison
    const transportRanking = {
      small: 1,
      medium: 2,
      large: 3,
    };

    // Filter by availability and sufficient capacity
    const availableVolunteers = campaign.volunteers.filter((volunteer) => {
      // Check availability
      if (!volunteer.availability || volunteer.availability.size === 0)
        return false;

      const timeSlots = volunteer.availability.get(currentDayName);
      if (!timeSlots || timeSlots.length === 0) return false;

      const isAvailableNow = timeSlots.some(
        (slot) => slot.start <= currentTime && slot.end >= currentTime
      );
      if (!isAvailableNow) return false;

      // Check sufficient capacity
      const volunteerCapacity = volunteer.transportCapacity || "small";
      return (
        transportRanking[volunteerCapacity] >=
        transportRanking[batch.requiredCapacity]
      );
    });

    // Sort by closest capacity match
    availableVolunteers.sort((a, b) => {
      const aCapacity = transportRanking[a.transportCapacity || "small"];
      const bCapacity = transportRanking[b.transportCapacity || "small"];
      const requiredCapacity = transportRanking[batch.requiredCapacity];

      return (
        Math.abs(aCapacity - requiredCapacity) -
        Math.abs(bCapacity - requiredCapacity)
      );
    });

    return res.status(200).json({
      message:
        availableVolunteers.length > 0
          ? "Found available volunteers"
          : "No volunteers match criteria",
      volunteers: availableVolunteers.map((v) => ({
        _id: v._id,
        fullName: v.fullName,
        email: v.email,
        transportCapacity: v.transportCapacity,
      })),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error finding volunteers", error: error.message });
  }
};

// Assign volunteer to batch
exports.assignVolunteerToBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { volunteerId } = req.body;

    console.log(
      `[BATCH ASSIGN] Starting batch request process for batch ${batchId} to volunteer ${volunteerId}`
    );

    const batch = await Batch.findById(batchId);
    if (!batch) {
      console.log(`[BATCH ASSIGN] Batch not found with ID: ${batchId}`);
      return res.status(404).json({ message: "Batch not found" });
    }
    console.log(
      `[BATCH ASSIGN] Found batch with ${batch.items.length} items, status: ${batch.status}`
    );

    // Update batch - now just requested, not fully assigned
    batch.assignedVolunteer = volunteerId;
    batch.status = "requested";
    batch.assignmentStatus = "pending";
    await batch.save();
    console.log(
      `[BATCH ASSIGN] Batch saved with assignedVolunteer=${volunteerId}, status=requested, assignmentStatus=pending`
    );

    // Update all food items in batch to requested status
    const updateResult = await FoodItem.updateMany(
      { _id: { $in: batch.items } },
      {
        assignedVolunteer: volunteerId,
        status: "requested",
        assignmentStatus: "pending",
      }
    );
    console.log(
      `[BATCH ASSIGN] Updated ${updateResult.modifiedCount}/${batch.items.length} food items to requested status`
    );

    // Create notification
    console.log(
      `[BATCH ASSIGN] Creating notification for volunteer ${volunteerId}`
    );
    const notification = await Notification.create({
      user_id: volunteerId,
      message: `You have a new batch assignment request with ${batch.items.length} food items for pickup.`,
      type: "assignment-request", // Use existing notification type
      read: false,
    });
    console.log(
      `[BATCH ASSIGN] Notification created with ID: ${notification._id}`
    );

    // Socket notification
    console.log(`[BATCH ASSIGN] Socket available?`, req.io ? "YES" : "NO");
    if (req.io) {
      console.log(
        `[BATCH ASSIGN] Emitting notification to room: ${volunteerId.toString()}`
      );
      req.io.to(volunteerId.toString()).emit("new-notification", {
        message: `New batch assignment request: ${batch.items.length} items`,
        _id: notification._id,
        type: "assignment-request",
        created: notification.createdAt,
      });
      console.log(`[BATCH ASSIGN] Socket notification emitted`);
    } else {
      console.log(
        `[BATCH ASSIGN] Socket notification skipped - req.io not available`
      );
    }

    res
      .status(200)
      .json({
        message: "Batch assignment requested. Volunteer will be notified.",
        batch,
      });
  } catch (error) {
    console.error(`[BATCH ASSIGN] ERROR:`, error);
    res
      .status(500)
      .json({
        message: "Error requesting batch assignment",
        error: error.message,
      });
  }
};

exports.acceptBatchAssignment = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { volunteerId } = req.body; // Get volunteerId from request body

    console.log(
      `[BATCH ACCEPT] Processing acceptance for batch ${batchId} by volunteer ${volunteerId}`
    );

    if (!volunteerId) {
      return res.status(400).json({ message: "Volunteer ID is required" });
    }

    const batch = await Batch.findById(batchId).populate("items");

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    if (batch.assignedVolunteer.toString() !== volunteerId.toString()) {
      return res
        .status(403)
        .json({ message: "This batch is not assigned to this volunteer" });
    }

    if (batch.status !== "requested" || batch.assignmentStatus !== "pending") {
      return res
        .status(400)
        .json({ message: "This batch is not in a requestable state" });
    }

    // Update batch status
    batch.status = "assigned";
    batch.assignmentStatus = "accepted";
    await batch.save();

    // Update all food items in the batch
    await FoodItem.updateMany(
      { _id: { $in: batch.items } },
      {
        status: "assigned",
        assignmentStatus: "accepted",
      }
    );

    // Notify the campaign organizer/NGO
    const campaign = await FoodDonation.findById(batch.campaignId);
    if (campaign && campaign.ngoId) {
      const notification = await Notification.create({
        user_id: campaign.ngoId,
        message: `Volunteer has accepted batch assignment with ${batch.items.length} items.`,
        type: "status_update",
        read: false,
      });

      if (req.io) {
        req.io
          .to(campaign.ngoId.toString())
          .emit("new-notification", notification);
      }
    }

    res.status(200).json({
      message: "Batch assignment accepted successfully",
      batch: batch,
    });
  } catch (error) {
    console.error("Error accepting batch:", error);
    res
      .status(500)
      .json({
        message: "Failed to accept batch assignment",
        error: error.message,
      });
  }
};

exports.declineBatchAssignment = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { volunteerId } = req.body; // Get volunteerId from request body

    console.log(
      `[BATCH DECLINE] Processing decline for batch ${batchId} by volunteer ${volunteerId}`
    );

    if (!volunteerId) {
      return res.status(400).json({ message: "Volunteer ID is required" });
    }

    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    if (batch.assignedVolunteer.toString() !== volunteerId.toString()) {
      return res
        .status(403)
        .json({ message: "This batch is not assigned to this volunteer" });
    }

    if (batch.status !== "requested" || batch.assignmentStatus !== "pending") {
      return res
        .status(400)
        .json({ message: "This batch is not in a requestable state" });
    }

    // Reset batch state
    batch.status = "suggested";
    batch.assignmentStatus = "declined";
    batch.assignedVolunteer = null;
    await batch.save();

    // Reset all food items in the batch
    await FoodItem.updateMany(
      { _id: { $in: batch.items } },
      {
        status: "pending",
        assignmentStatus: null,
        assignedVolunteer: null,
      }
    );

    // Notify the campaign organizer/NGO
    const campaign = await FoodDonation.findById(batch.campaignId);
    if (campaign && campaign.ngoId) {
      const notification = await Notification.create({
        user_id: campaign.ngoId,
        message: `Volunteer has declined batch assignment with ${batch.items.length} items.`,
        type: "status_update",
        read: false,
      });

      if (req.io) {
        req.io
          .to(campaign.ngoId.toString())
          .emit("new-notification", notification);
      }
    }

    res.status(200).json({
      message: "Batch assignment declined successfully",
    });
  } catch (error) {
    console.error("Error declining batch:", error);
    res
      .status(500)
      .json({
        message: "Failed to decline batch assignment",
        error: error.message,
      });
  }
};

// Add this function to your volunteerController

exports.getVolunteerBatchAssignments = async (req, res) => {
  try {
    const { volunteerId } = req.params;

    const batches = await Batch.find({
      assignedVolunteer: volunteerId,
    }).populate({
      path: "items",
      populate: { path: "buisiness_id", select: "fullName address lat lng" },
    });

    res.status(200).json(batches);
  } catch (error) {
    console.error("Error fetching volunteer batch assignments:", error);
    res
      .status(500)
      .json({
        message: "Failed to fetch batch assignments",
        error: error.message,
      });
  }
};

// Add this helper function at the bottom of the file

// Helper function to check and update batch status based on items
exports.checkAndUpdateBatchStatus = async (batchId) => {
  try {
    // Find the batch with all its items
    const batch = await Batch.findById(batchId).populate("items");

    if (!batch || !batch.items || batch.items.length === 0) {
      console.log(`Batch ${batchId} not found or has no items`);
      return false;
    }

    // Check if all items are delivered
    const allDelivered = batch.items.every(
      (item) => item.status === "delivered"
    );

    // If all are delivered, update batch status to completed
    if (allDelivered && batch.status !== "completed") {
      batch.status = "completed";
      await batch.save();
      console.log(
        `Batch ${batchId} marked as completed as all items are delivered`
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error updating batch status: ${error}`);
    return false;
  }
};

// Add a public endpoint to manually check batch status
exports.checkBatchCompletion = async (req, res) => {
  try {
    const { batchId } = req.params;
    const updated = await exports.checkAndUpdateBatchStatus(batchId);

    if (updated) {
      res.status(200).json({ message: "Batch status updated to completed" });
    } else {
      res.status(200).json({ message: "Batch status not changed" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating batch status", error: error.message });
  }
};

exports.batchRouteData = async (req,res) => {
  try {
    
    const batch = await Batch.findById(req.params.batchId)
      .populate({
        path: "items",
        populate: { path: "buisiness_id", select: "lat lng" },
      })
      .populate({
        path: "campaignId",
        select: "ngoId",
        populate: { path: "ngoId", select: "lat lng" },
      });

      const pickups = batch.items
      .filter(item => item.status !== "picked-up" && item.status !== "delivered")
      .map(item => [item.buisiness_id.lng, item.buisiness_id.lat]);
    
    const end = [batch.campaignId.ngoId.lng, batch.campaignId.ngoId.lat];

    return res.json({ pickups, end });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load batch route data", error: err.message });
  }
}





