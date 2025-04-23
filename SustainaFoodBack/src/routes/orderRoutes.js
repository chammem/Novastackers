const express = require('express');
const router = express.Router();
const orderController = require('../controllers/sales/orderController');

// USER ROUTES
// Create a new order
router.post('/create', orderController.createOrder);

// Get all orders for a user
router.get('/user/:userId', orderController.getUserOrders);

// Get specific order details
router.get('/:orderId', orderController.getOrderDetails);

// Cancel an order
router.put('/:orderId/cancel', orderController.cancelOrder);

// Update payment status
router.put('/:orderId/payment', orderController.updatePaymentStatus);

// RESTAURANT ROUTES
// Get all orders for a restaurant
router.get('/restaurant/:restaurantId', orderController.getRestaurantOrders);

// Update order status
router.put('/:orderId/status', orderController.updateOrderStatus);

module.exports = router;