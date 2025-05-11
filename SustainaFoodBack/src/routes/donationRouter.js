const express = require("express");
const upload = require("../middleware/upload");
const donationRouter = express.Router();
const donationController = require("../controllers/donations/donationController");
const batchController = require("../controllers/batchController");
const FoodItem = require("../models/foodItem");
const FoodDonation = require("../models/foodDonation");

// Remove this line that's causing the error:
// const campaignMetricsController = require('../controllers/campaignMetricsController');

donationRouter.post(
  "/create-donation",
  upload.fields([{ name: "image", maxCount: 1 }]),
  donationController.createDonation
);
donationRouter.post(
  "/add-food-to-donation/:donationId",
  donationController.addFoodToDonation
);
donationRouter.get("/get-all-donations", donationController.getAllDonations);
donationRouter.get(
  "/get-donations-by-ngo",
  donationController.getDonationsByNgo
);
donationRouter.get(
  "/get-donation-by-id/:ngoId",
  donationController.getDonationByNgoId
);
donationRouter.get("/:id/details", donationController.getDonationDetails);
donationRouter.post(
  "/assign-volunteer/:foodId",
  donationController.assignFoodToVolunteer
);
donationRouter.patch(
  "/accept-assignment/:foodId",
  donationController.acceptAssignment
);
donationRouter.patch(
  "/decline-assignment/:foodId",
  donationController.declineAssignment
);

// donationRouter.put('/pickup/volunteer/:foodId', donationController.markAsPickedUpByVolunteer);
donationRouter.put(
  "/pickup/buisness/:foodId",
  donationController.confirmPickupByBuisness
);
donationRouter.post(
  "/:campaignId/volunteer",
  donationController.volunteerForCampaign
);
donationRouter.get(
  "/:campaignId/volunteer",
  donationController.getVolunteersForCampaign
);
donationRouter.get(
  "/get-donations-by-buisiness/:businessId",
  donationController.getBuisnessFoodDonations
);
donationRouter.get(
  "/:campaignId/businesses",
  donationController.getBusinessesForCampaign
);
donationRouter.get(
  "/:campaignId/foods/paginated",
  donationController.getPaginatedFoodsByCampaign
);
donationRouter.get("/food/:id", donationController.getFoodById);
donationRouter.get(
  "/campaign/:campaignId/available-volunteers",
  donationController.getAvailableVolunteersForCampaign
);

// Add these routes to your existing donations router

// Generate batches
donationRouter.post(
  "/:campaignId/batches/generate",
  batchController.generateBatches
);

// Get batches
donationRouter.get(
  "/:campaignId/batches",
  batchController.getBatchesForCampaign
);

// Get volunteers for batch
donationRouter.get(
  "/batches/:batchId/available-volunteers",
  batchController.getAvailableVolunteersForBatch
);

// Assign volunteer to batch
donationRouter.post(
  "/batches/:batchId/assign",
  batchController.assignVolunteerToBatch
);

// Add these routes

donationRouter.patch(
  "/accept-batch-assignment/:batchId",
  batchController.acceptBatchAssignment
);
donationRouter.patch(
  "/decline-batch-assignment/:batchId",
  batchController.declineBatchAssignment
);
// Add this route

donationRouter.get(
  "/:volunteerId/batch-assignments",
  batchController.getVolunteerBatchAssignments
);
// donationRouter.get('/:batchId',  batchController.getBatchById);
// donationRouter.post('/:batchId/complete',  batchController.completeBatch);

// Add this route
donationRouter.patch(
  "/batches/:batchId/check-status",
  batchController.checkBatchCompletion
);

// Add this route to donationRouter:

// Get optimized route for batch
// donationRouter.post(
//   "/batches/:batchId/route",
//   batchController.calculateBatchRoute
// );
donationRouter.get("/batch-route-data/:batchId",batchController.batchRouteData);
donationRouter.post("/campaigns/:campaignId/auto-assign", batchController.autoAssignVolunteers);

// Add these routes for batch pickup/delivery

// Start pickup for items from a business in a batch
donationRouter.patch(
  "/batches/:batchId/start-pickup", 
  batchController.startBatchPickup
);

// Verify pickup for items from a business in a batch
donationRouter.post(
  "/batches/:batchId/verify-pickup", 
  batchController.verifyBatchPickup
);

// Start delivery for entire batch
donationRouter.patch(
  "/batches/:batchId/start-delivery", 
  batchController.startBatchDelivery
);

// Verify delivery for entire batch
donationRouter.post(
  "/batches/:batchId/verify-delivery", 
  batchController.verifyBatchDelivery
);

// Ajouter la route pour la mise à jour d'une donation
donationRouter.put(
  "/updateDonation/:id",
  upload.fields([{ name: "image", maxCount: 1 }]),
  donationController.updateDonation
);

// Autre format d'URL pour la même fonction (pour compatibilité)
donationRouter.put(
  "/update/:id",
  upload.fields([{ name: "image", maxCount: 1 }]),
  donationController.updateDonation
);

// Replace them with routes to donationController instead:
donationRouter.post('/get-campaigns-metrics', async (req, res) => {
  try {
    const { campaignIds } = req.body;
    
    if (!campaignIds || !Array.isArray(campaignIds)) {
      return res.status(400).json({ success: false, message: 'Invalid campaign IDs' });
    }
    
    // Process each campaign ID
    const results = await Promise.all(
      campaignIds.map(async (donationId) => {
        // Calculate using the same logic from forceUpdateMetrics
        const foodItems = await FoodItem.find({ donationId });
        const itemCount = foodItems.length;
        const impactScore = Math.min(100, itemCount * 5);
        
        return {
          campaignId: donationId,
          impactScore: impactScore,
          itemsCount: itemCount,
          lastCalculated: new Date()
        };
      })
    );
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Keep this route if it already exists:
donationRouter.get('/force-update-metrics/:donationId', donationController.forceUpdateMetrics);

// Add this route specifically for getting campaign metrics 
donationRouter.get('/get-campaign-metrics/:donationId', async (req, res) => {
  try {
    const { donationId } = req.params;
    const donation = await FoodDonation.findById(donationId);
    
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }
    
    // If impact score is 0 or not set, calculate it
    if (!donation.impactScore) {
      // Use the existing controller function
      return donationController.forceUpdateMetrics(req, res);
    }
    
    // Return existing metrics
    const metrics = {
      campaignId: donationId,
      impactScore: donation.impactScore || 0,
      itemsCount: donation.foods?.length || 0,
      lastCalculated: donation.updatedAt || new Date()
    };
    
    return res.status(200).json({ 
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Error fetching campaign metrics:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Add route handlers for food items
donationRouter.get('/getAllFoodItems', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'created_at', 
      order = 'desc', 
      status,
      category,
      size,
      search,
      businessId
    } = req.query;

    // Build query object
    const query = {};
    
    // Add filters if provided
    if (status) query.status = status;
    if (category) query.category = category;
    if (size) query.size = size;
    if (businessId) query.buisiness_id = businessId;
    
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Prepare sort object
    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    // Count total documents for pagination
    const total = await FoodItem.countDocuments(query);
    
    // Get food items with pagination, sorting and populate related fields
    const foodItems = await FoodItem.find(query)
      .populate('buisiness_id', 'fullName email phone businessRole')
      .populate('assignedVolunteer', 'fullName email phone')
      .populate('donationId', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Return response with pagination info
    return res.status(200).json({
      success: true,
      data: foodItems,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching food items:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch food items',
      error: error.message
    });
  }
});

// Get a single food item by ID
donationRouter.get('/getFoodItemById/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const foodItem = await FoodItem.findById(id)
      .populate('buisiness_id', 'fullName email phone businessRole')
      .populate('assignedVolunteer', 'fullName email phone transportCapacity')
      .populate('donationId', 'name description imageUrl ngoId');
      
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: foodItem
    });
  } catch (error) {
    console.error('Error fetching food item:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch food item',
      error: error.message
    });
  }
});

// Update a food item
donationRouter.put('/updateFoodItem/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      quantity, 
      category, 
      status, 
      size,
      price,
      discountedPrice,
      isAvailable,
      quantityAvailable,
      expiresAt,
      assignmentStatus
    } = req.body;
    
    // Find the food item
    const foodItem = await FoodItem.findById(id);
    
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }
    
    // Update fields if provided
    if (name !== undefined) foodItem.name = name;
    if (quantity !== undefined) foodItem.quantity = quantity;
    if (category !== undefined) foodItem.category = category;
    if (status !== undefined) foodItem.status = status;
    if (size !== undefined) foodItem.size = size;
    if (price !== undefined) foodItem.price = price;
    if (discountedPrice !== undefined) foodItem.discountedPrice = discountedPrice;
    if (isAvailable !== undefined) foodItem.isAvailable = isAvailable;
    if (quantityAvailable !== undefined) foodItem.quantityAvailable = quantityAvailable;
    if (expiresAt !== undefined) foodItem.expiresAt = expiresAt;
    if (assignmentStatus !== undefined) foodItem.assignmentStatus = assignmentStatus;
    
    // Save the updated food item
    await foodItem.save();
    
    // Update the campaign's impact score if needed
    if (foodItem.donationId) {
      try {
        const donation = await FoodDonation.findById(foodItem.donationId);
        if (donation) {
          const foodItems = await FoodItem.find({ donationId: donation._id });
          const itemCount = foodItems.length;
          donation.impactScore = Math.min(100, itemCount * 5);
          await donation.save();
        }
      } catch (err) {
        console.log('Error updating donation impact score:', err);
        // Don't fail the request if this fails
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Food item updated successfully',
      data: foodItem
    });
  } catch (error) {
    console.error('Error updating food item:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update food item',
      error: error.message
    });
  }
});

// Delete a food item
donationRouter.delete('/deleteFoodItem/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const foodItem = await FoodItem.findById(id);
    
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }
    
    // Store the donation ID before deleting
    const donationId = foodItem.donationId;
    
    // Delete the food item
    await FoodItem.findByIdAndDelete(id);
    
    // Update the donation's impact score
    if (donationId) {
      try {
        const donation = await FoodDonation.findById(donationId);
        if (donation) {
          // Remove the food item from the foods array if it exists
          donation.foods = donation.foods.filter(
            food => food.toString() !== id.toString()
          );
          
          // Update impact score
          const foodItems = await FoodItem.find({ donationId });
          const itemCount = foodItems.length;
          donation.impactScore = Math.min(100, itemCount * 5);
          await donation.save();
        }
      } catch (err) {
        console.log('Error updating donation after food item deletion:', err);
        // Don't fail the request if this fails
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Food item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting food item:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete food item',
      error: error.message
    });
  }
});

// Get food item statistics
donationRouter.get('/food-stats', async (req, res) => {
  try {
    // Get total count
    const totalItems = await FoodItem.countDocuments();
    
    // Get counts by status
    const statusCounts = await FoodItem.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Get counts by category
    const categoryCounts = await FoodItem.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    
    // Get counts by size
    const sizeCounts = await FoodItem.aggregate([
      { $group: { _id: "$size", count: { $sum: 1 } } }
    ]);
    
    // Get categories and sizes for dropdowns
    const categories = await FoodItem.distinct('category');
    const sizes = await FoodItem.distinct('size');
    
    // Get recent items (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentItems = await FoodItem.countDocuments({
      created_at: { $gte: oneWeekAgo }
    });
    
    return res.status(200).json({
      success: true,
      data: {
        totalItems,
        statusCounts: statusCounts.reduce((acc, curr) => {
          acc[curr._id || 'undefined'] = curr.count;
          return acc;
        }, {}),
        categoryCounts: categoryCounts.reduce((acc, curr) => {
          acc[curr._id || 'undefined'] = curr.count;
          return acc;
        }, {}),
        sizeCounts: sizeCounts.reduce((acc, curr) => {
          acc[curr._id || 'undefined'] = curr.count;
          return acc;
        }, {}),
        categories,
        sizes,
        recentItems
      }
    });
  } catch (error) {
    console.error('Error fetching food item statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch food item statistics',
      error: error.message
    });
  }
});

// Get food item categories
donationRouter.get('/item-categories', async (req, res) => {
  try {
    const categories = await FoodItem.distinct('category');
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch categories' 
    });
  }
});

// Get food item sizes
donationRouter.get('/item-sizes', async (req, res) => {
  try {
    const sizes = await FoodItem.distinct('size');
    return res.status(200).json(sizes);
  } catch (error) {
    console.error('Error fetching sizes:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch sizes' 
    });
  }
});

module.exports = donationRouter;
