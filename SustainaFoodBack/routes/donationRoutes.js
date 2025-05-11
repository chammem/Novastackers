const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const campaignMetricsController = require('../controllers/campaignMetricsController');
const { auth } = require('../middlewares/auth');

// Routes existantes pour les donations
router.post('/create-donation', auth, donationController.createDonation);
router.get('/get-all-donations', donationController.getAllDonations);
router.get('/get-donation/:id', donationController.getDonationById);
router.get('/get-donation-by-id/:id', donationController.getDonationByUserId);
router.put('/updateDonation/:id', auth, donationController.updateDonation);
router.delete('/deleteDonation/:id', auth, donationController.deleteDonation);

// Routes pour les métriques des campagnes
router.post('/get-campaigns-metrics', auth, campaignMetricsController.getCampaignsMetrics);
router.put('/update-campaign-metrics/:campaignId', auth, campaignMetricsController.updateCampaignMetrics);

module.exports = router;