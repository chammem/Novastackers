const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment/paymentController');

// Regular routes use normal routing
router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.get('/status/:paymentIntentId', paymentController.getPaymentStatus);
router.post('/cancel-payment-intent/:paymentIntentId', paymentController.cancelPaymentIntent);

module.exports = router;