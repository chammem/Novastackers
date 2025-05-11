const express = require("express");
const upload = require("../middleware/upload");
const donationRouter = express.Router();
const donationController = require("../controllers/donations/donationController");
const batchController = require("../controllers/batchController");

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

module.exports = donationRouter;
