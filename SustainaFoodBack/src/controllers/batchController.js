const Batch = require("../models/batch");
const FoodItem = require("../models/foodItem");
const FoodDonation = require("../models/foodDonation");
const { createBatches } = require("../utils/clustering");
const Notification = require("../models/notification");
const geolib = require("geolib");
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

// Automatically assign the best volunteer to each batch
exports.autoAssignVolunteers = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    // Get all unassigned batches for this campaign
    const batches = await Batch.find({
      campaignId,
      status: "suggested",
      assignedVolunteer: null
    });
    
    if (batches.length === 0) {
      return res.status(200).json({
        message: "No unassigned batches found for auto-assignment",
        assignedCount: 0
      });
    }
    
    // Get current time details for availability check
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = `${currentHours.toString().padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")}`;
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDayName = dayNames[now.getDay()];
    
    // Get all volunteers for this campaign
    const campaign = await FoodDonation.findById(campaignId).populate({
      path: "volunteers",
      select: "fullName email phone availability transportCapacity lat lng"
    });
    
    if (!campaign || !campaign.volunteers || campaign.volunteers.length === 0) {
      return res.status(200).json({
        message: "No volunteers available for auto-assignment",
        assignedCount: 0
      });
    }
    
    // Transport ranking for capacity comparison
    const transportRanking = {
      small: 1,
      medium: 2,
      large: 3
    };
    
    // Track assignments to avoid double-booking volunteers
    const assignedVolunteers = new Set();
    const assignmentResults = [];
    
    // Process each batch
    for (const batch of batches) {
      // Filter available volunteers who aren't already assigned
      const availableVolunteers = campaign.volunteers.filter(volunteer => {
        // Skip if already assigned to another batch
        if (assignedVolunteers.has(volunteer._id.toString())) {
          return false;
        }
        
        // Check availability for current time
        if (!volunteer.availability || volunteer.availability.size === 0) {
          return false;
        }
        
        const timeSlots = volunteer.availability.get(currentDayName);
        if (!timeSlots || timeSlots.length === 0) {
          return false;
        }
        
        const isAvailableNow = timeSlots.some(slot => 
          slot.start <= currentTime && slot.end >= currentTime
        );
        
        if (!isAvailableNow) {
          return false;
        }
        
        // Check transport capacity is sufficient
        const volunteerCapacity = volunteer.transportCapacity || "small";
        return transportRanking[volunteerCapacity] >= transportRanking[batch.requiredCapacity];
      });
      
      console.log(`\n📦 Batch ${batch._id}: Scoring ${availableVolunteers.length} available volunteers`);
      console.log(`-----------------------------------------------------------------`);
      console.log(`Required capacity: ${batch.requiredCapacity}`);
      console.log(`Batch center: [${batch.centerPoint[0]}, ${batch.centerPoint[1]}]`);
      console.log(`Items count: ${batch.items.length}`);
      
      if (availableVolunteers.length === 0) {
        assignmentResults.push({
          batchId: batch._id,
          assigned: false,
          reason: "No available volunteers with sufficient capacity"
        });
        continue;
      }
      
      // Calculate proximity scores
      const volunteersWithScores = availableVolunteers.map(volunteer => {
        // Calculate distance score if coordinates available
        let proximityScore = 0;
        if (volunteer.lat && volunteer.lng && batch.centerPoint) {
          const distance = geolib.getDistance(
            { latitude: volunteer.lat, longitude: volunteer.lng },
            { latitude: batch.centerPoint[0], longitude: batch.centerPoint[1] }
          ) / 1000; // in km
          
          // Convert distance to a score (closer = higher score)
          proximityScore = Math.max(0, 10 - distance); // 0-10 scale, 10 being closest
        }
        
        // Calculate capacity match score (closer match = higher score)
        const capacityScore = 5 - Math.abs(
          transportRanking[volunteer.transportCapacity || "small"] - 
          transportRanking[batch.requiredCapacity]
        );
        
        // Combined score (proximity + capacity match)
        const totalScore = proximityScore + capacityScore;
        
        return {
          volunteer,
          score: totalScore
        };
      });
      
      console.log(`\nVOLUNTEER SCORING DETAILS:`);
      console.log(`ID | Name | Distance | Proximity | Capacity | Total`);
      console.log(`-----------------------------------------------------------------`);
      volunteersWithScores.forEach(vs => {
        const v = vs.volunteer;
        // Recalculate the distance for logging purposes
        let distance = "unknown";
        if (v.lat && v.lng && batch.centerPoint) {
          distance = (geolib.getDistance(
            { latitude: v.lat, longitude: v.lng },
            { latitude: batch.centerPoint[0], longitude: batch.centerPoint[1] }
          ) / 1000).toFixed(2) + " km"; // in km
        }
        // Get capacity info
        const vCapacity = v.transportCapacity || "small";
        const capacityMatch = 5 - Math.abs(
          transportRanking[vCapacity] - transportRanking[batch.requiredCapacity]
        );
        
        console.log(`${v._id.toString().substring(0,8)}... | ${v.fullName.padEnd(15)} | ${distance.padStart(10)} | ${(vs.score - capacityMatch).toFixed(1).padStart(5)} | ${capacityMatch.toFixed(1).padStart(5)} | ${vs.score.toFixed(1).padStart(5)}`);
      });
      
      // Sort by score (highest first)
      volunteersWithScores.sort((a, b) => b.score - a.score);
      
      if (volunteersWithScores.length > 0) {
        const best = volunteersWithScores[0];
        console.log(`\n✅ SELECTED VOLUNTEER: ${best.volunteer.fullName}`);
        console.log(`   - Score: ${best.score.toFixed(1)}/15 (highest among all volunteers)`);
        
        // Calculate specific details about the selection
        if (best.volunteer.lat && best.volunteer.lng && batch.centerPoint) {
          const distance = (geolib.getDistance(
            { latitude: best.volunteer.lat, longitude: best.volunteer.lng },
            { latitude: batch.centerPoint[0], longitude: batch.centerPoint[1] }
          ) / 1000).toFixed(2);
          console.log(`   - Distance: ${distance} km from batch center`);
          console.log(`   - Proximity score: ${(best.score - (5 - Math.abs(transportRanking[best.volunteer.transportCapacity || "small"] - transportRanking[batch.requiredCapacity]))).toFixed(1)}/10`);
        }
        
        console.log(`   - Capacity: ${best.volunteer.transportCapacity || "small"} (required: ${batch.requiredCapacity})`);
        console.log(`   - Capacity match score: ${(5 - Math.abs(transportRanking[best.volunteer.transportCapacity || "small"] - transportRanking[batch.requiredCapacity])).toFixed(1)}/5`);
        
        // Log other top alternatives if available
        if (volunteersWithScores.length > 1) {
          console.log(`\n   Other top candidates:`);
          for (let i = 1; i < Math.min(volunteersWithScores.length, 3); i++) {
            console.log(`   ${i+1}. ${volunteersWithScores[i].volunteer.fullName} - Score: ${volunteersWithScores[i].score.toFixed(1)}/15`);
          }
        }
        console.log(`-----------------------------------------------------------------`);
      }
      else {
        console.log(`\n❌ NO SUITABLE VOLUNTEERS FOUND FOR THIS BATCH`);
        console.log(`-----------------------------------------------------------------`);
      }
      
      // Assign the highest-scoring volunteer
      if (volunteersWithScores.length > 0) {
        const bestMatch = volunteersWithScores[0].volunteer;
        
        // Update batch with the assigned volunteer
        batch.assignedVolunteer = bestMatch._id;
        batch.status = "requested";
        batch.assignmentStatus = "pending";
        batch.assignmentRequestedAt = new Date();
        await batch.save();
        
        // Update food items status
        await FoodItem.updateMany(
          { _id: { $in: batch.items } },
          {
            assignedVolunteer: bestMatch._id,
            status: "requested",
            assignmentStatus: "pending"
          }
        );
        
        // Create notification for the volunteer
        const notification = await Notification.create({
          user_id: bestMatch._id,
          message: `You have been automatically assigned to a batch with ${batch.items.length} food items for pickup.`,
          type: "assignment-request",
          read: false
        });
        
        // Send real-time notification if socket available
        if (req.io) {
          req.io.to(bestMatch._id.toString()).emit("new-notification", {
            message: `New batch auto-assignment: ${batch.items.length} items`,
            _id: notification._id,
            type: "assignment-request",
            created: notification.createdAt
          });
        }
        
        // Mark volunteer as assigned to prevent double-booking
        assignedVolunteers.add(bestMatch._id.toString());
        
        assignmentResults.push({
          batchId: batch._id,
          assigned: true,
          volunteerId: bestMatch._id,
          volunteerName: bestMatch.fullName
        });
      } else {
        assignmentResults.push({
          batchId: batch._id,
          assigned: false,
          reason: "No suitable volunteer found"
        });
      }
    }
    
    // Return results summary
    const successCount = assignmentResults.filter(r => r.assigned).length;
    
    res.status(200).json({
      message: `Auto-assigned ${successCount} out of ${batches.length} batches`,
      assignedCount: successCount,
      totalBatches: batches.length,
      results: assignmentResults
    });
    
  } catch (error) {
    console.error("Auto-assignment error:", error);
    res.status(500).json({ 
      message: "Error during auto-assignment", 
      error: error.message 
    });
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
    batch.assignmentRequestedAt = new Date();
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
};

// Add these batch verification functions to your batchController.js file

// Start pickup for items from a single business in a batch
exports.startBatchPickup = async (req, res) => {
  const { batchId } = req.params;
  const { businessId } = req.body; // The business/restaurant ID

  try {
    // Find the batch
    const batch = await Batch.findById(batchId)
      .populate({
        path: "items",
        populate: { path: "buisiness_id", select: "_id fullName" }
      });

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Filter items that belong to this business and still need pickup
    const itemsFromBusiness = batch.items.filter(item => 
      item.buisiness_id && 
      item.buisiness_id._id.toString() === businessId &&
      (item.status === "assigned" || item.status === "pending")
    );

    if (itemsFromBusiness.length === 0) {
      return res.status(400).json({ 
        message: "No items from this business found in this batch or all items already picked up" 
      });
    }

    // Generate a single pickup code for all items
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Update all items with the same pickup code
    const itemIds = itemsFromBusiness.map(item => item._id);
    await FoodItem.updateMany(
      { _id: { $in: itemIds } },
      { 
        pickupCode: code,
        pickupCodeGeneratedAt: new Date()
      }
    );

    // Send notification to business
    const notification = await Notification.create({
      user_id: businessId,
      message: `Volunteer is here to pick up ${itemsFromBusiness.length} items. Pickup code: ${code}`,
      type: 'pickup_code'
    });

    // Emit to business via socket
    if (req.io) {
      req.io.to(businessId.toString()).emit('new-notification', notification);
    }

    res.status(200).json({ 
      message: `Pickup code sent for ${itemsFromBusiness.length} items from this business` 
    });
  } catch (error) {
    console.error("startBatchPickup error:", error);
    res.status(500).json({ message: "Error starting batch pickup", error: error.message });
  }
};

// Verify pickup for multiple items from a single business
exports.verifyBatchPickup = async (req, res) => {
  const { batchId } = req.params;
  const { businessId, code } = req.body;

  try {
    // Find the batch
    const batch = await Batch.findById(batchId)
      .populate({
        path: "items",
        populate: [
          { path: "buisiness_id", select: "_id fullName" },
          { path: "assignedVolunteer", select: "_id fullName" }
        ]
      });

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Filter items that belong to this business
    const itemsFromBusiness = batch.items.filter(item => 
      item.buisiness_id && 
      item.buisiness_id._id.toString() === businessId &&
      (item.status === "assigned" || item.status === "pending")
    );

    if (itemsFromBusiness.length === 0) {
      return res.status(400).json({ 
        message: "No items from this business found in this batch or all items already picked up" 
      });
    }

    // Verify code for first item (all items should have the same code)
    const firstItem = itemsFromBusiness[0];
    if (firstItem.pickupCode !== code) {
      return res.status(400).json({ message: "Invalid pickup code" });
    }

    // Update all items status
    const itemIds = itemsFromBusiness.map(item => item._id);
    await FoodItem.updateMany(
      { _id: { $in: itemIds } },
      { 
        volunteerPickedUpAt: new Date(),
        supermarketConfirmedAt: new Date(),
        status: "picked-up"
      }
    );

    // Create notification for business
    const notification = await Notification.create({
      user_id: businessId,
      message: `${itemsFromBusiness.length} items were picked up by volunteer ${firstItem.assignedVolunteer?.fullName || 'assigned volunteer'}.`,
      type: "status_update",
      read: false
    });

    // Emit notification
    if (req.io) {
      req.io.to(businessId.toString()).emit("new-notification", notification);
    }

    // Check if all batch items are picked up and update batch status if needed
    await exports.checkAndUpdateBatchStatus(batchId);

    res.status(200).json({ 
      message: `Pickup confirmed for ${itemsFromBusiness.length} items from this business` 
    });
  } catch (error) {
    console.error("verifyBatchPickup error:", error);
    res.status(500).json({ message: "Error verifying batch pickup", error: error.message });
  }
};

// Start delivery for the entire batch to NGO
exports.startBatchDelivery = async (req, res) => {
  const { batchId } = req.params;

  try {
    // Find the batch
    const batch = await Batch.findById(batchId)
      .populate({
        path: "items",
        select: "status name"
      })
      .populate({
        path: "campaignId",
        select: "ngoId",
        populate: { path: "ngoId", select: "_id fullName" }
      });

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Check if all items are picked up
    const allPickedUp = batch.items.every(item => item.status === "picked-up");
    if (!allPickedUp) {
      return res.status(400).json({ 
        message: "Cannot start delivery - not all items in this batch have been picked up" 
      });
    }

    // Generate a single delivery code for the entire batch
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store code in the batch
    batch.deliveryCode = code;
    batch.deliveryCodeGeneratedAt = new Date();
    await batch.save();

    // Get NGO ID from the campaign
    const ngoId = batch.campaignId?.ngoId?._id;
    if (!ngoId) {
      return res.status(400).json({ message: "NGO information not found for this batch" });
    }

    // Send notification to NGO
    const notification = await Notification.create({
      user_id: ngoId,
      message: `Volunteer is delivering ${batch.items.length} items. Delivery code: ${code}`,
      type: 'delivery_code'
    });

    // Emit to NGO via socket
    if (req.io) {
      req.io.to(ngoId.toString()).emit('new-notification', notification);
    }

    res.status(200).json({ 
      message: "Delivery code generated and sent to NGO" 
    });
  } catch (error) {
    console.error("startBatchDelivery error:", error);
    res.status(500).json({ message: "Error starting batch delivery", error: error.message });
  }
};

// Verify delivery for the entire batch
exports.verifyBatchDelivery = async (req, res) => {
  const { batchId } = req.params;
  const { code } = req.body;

  try {
    // Find the batch
    const batch = await Batch.findById(batchId)
      .populate({
        path: "items",
        select: "_id name status"
      })
      .populate({
        path: "campaignId",
        select: "ngoId name",
        populate: { path: "ngoId", select: "_id fullName" }
      })
      .populate("assignedVolunteer", "_id fullName");

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Verify delivery code
    if (batch.deliveryCode !== code) {
      return res.status(400).json({ message: "Invalid delivery code" });
    }

    // Update all items in the batch to delivered
    const itemIds = batch.items.map(item => item._id);
    await FoodItem.updateMany(
      { _id: { $in: itemIds } },
      { 
        deliveryConfirmedAt: new Date(),
        status: "delivered"
      }
    );

    // Update batch status
    batch.status = "completed";
    batch.completedAt = new Date();
    await batch.save();

    // Create notification for NGO
    const notification = await Notification.create({
      user_id: batch.campaignId.ngoId._id,
      message: `${batch.items.length} items have been successfully delivered by ${batch.assignedVolunteer?.fullName || 'the volunteer'}.`,
      type: "status_update",
      read: false
    });

    // Emit notification
    if (req.io) {
      req.io.to(batch.campaignId.ngoId._id.toString()).emit("new-notification", notification);
    }

    res.status(200).json({ 
      message: `Delivery confirmed for all ${batch.items.length} items in this batch` 
    });
  } catch (error) {
    console.error("verifyBatchDelivery error:", error);
    res.status(500).json({ message: "Error verifying batch delivery", error: error.message });
  }
};





