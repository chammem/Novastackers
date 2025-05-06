const express = require('express');
const router = express.Router();
const locationController = require('../controllers/route/routeController');

router.get('/geocode', locationController.geocodeAddress);
router.get('/reverse-geocode', locationController.reverseGeocode);

module.exports = router;