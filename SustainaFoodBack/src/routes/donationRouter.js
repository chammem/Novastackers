const express = require("express");
const upload = require("../middleware/upload");
const donationRouter = express.Router();
const donationController = require("../controllers/donations/donationController");
const batchController = require("../controllers/batchController");

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
donationRouter.delete('/deleteDonation/:id',donationController.deleteDonation);


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

// New routes for edit and delete
donationRouter.put("/update-food-item/:foodId", donationController.updateFoodItem);
donationRouter.delete("/delete-food-item/:foodId", donationController.deleteFoodItem);

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

module.exports = donationRouter;
