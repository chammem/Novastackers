const express = require('express');
const upload = require('../middleware/upload');
const donationRouter = express.Router();
const donationController = require('../controllers/donations/donationController');

donationRouter.post('/create-donation',upload.fields([{name:"image",maxCount:1}]),donationController.createDonation);
donationRouter.post('/add-food-to-donation/:donationId',donationController.addFoodToDonation);
donationRouter.get('/get-all-donations',donationController.getAllDonations);
donationRouter.delete('/deleteDonation/:id',donationController.deleteDonation);
donationRouter.get('/get-donations-by-ngo',donationController.getDonationsByNgo);
donationRouter.get('/get-donation-by-id/:ngoId',donationController.getDonationByNgoId);
donationRouter.get('/:id/details', donationController.getDonationDetails);
donationRouter.post('/assign-volunteer/:foodId', donationController.assignFoodToVolunteer);
donationRouter.patch('/accept-assignment/:foodId', donationController.acceptAssignment);
donationRouter.patch('/decline-assignment/:foodId', donationController.declineAssignment);

// donationRouter.put('/pickup/volunteer/:foodId', donationController.markAsPickedUpByVolunteer);
donationRouter.put('/pickup/buisness/:foodId',donationController.confirmPickupByBuisness);
donationRouter.post("/:campaignId/volunteer", donationController.volunteerForCampaign);
donationRouter.get("/:campaignId/volunteer",donationController.getVolunteersForCampaign);
donationRouter.get("/get-donations-by-buisiness/:businessId",donationController.getBuisnessFoodDonations);
donationRouter.get("/:campaignId/businesses",donationController.getBusinessesForCampaign);
donationRouter.get("/:campaignId/foods/paginated", donationController.getPaginatedFoodsByCampaign);
donationRouter.get("/food/:id", donationController.getFoodById);
module.exports = donationRouter;