const express = require("express");
const router = express.Router();
const driverNotificationController = require("../controllers/driver/driverNotificationController");
const deliveryStatusController = require("../controllers/driver/deliveryStatusController");

// Get pending assignment requests for a driver
router.get(
  "/assignment-requests/:driverId",
  driverNotificationController.getDriverAssignmentRequests
);

// Routes for driver delivery management
router.post(
  "/accept-delivery/:orderId",
  driverNotificationController.acceptDelivery
);
router.post(
  "/reject-delivery/:orderId",
  driverNotificationController.rejectDelivery
);
router.get(
  "/assignments/:driverId",
  driverNotificationController.getDriverAssignments
);

// Delivery status routes
router.post("/delivery/:orderId/start", deliveryStatusController.startDelivery);
router.post(
  "/delivery/:orderId/pickup",
  deliveryStatusController.confirmPickup
);
router.post(
  "/delivery/:orderId/complete/start",
  deliveryStatusController.startDeliveryCompletion
); // New endpoint
router.post(
  "/delivery/:orderId/complete",
  deliveryStatusController.confirmDelivery
);
router.get(
  "/delivery/:orderId/status",
  deliveryStatusController.getDeliveryStatus
);
router.get(
  "/delivery/:orderId/details",
  deliveryStatusController.getDeliveryDetails
);
router.post(
  "/detect-nearby-orders",
  deliveryStatusController.detectNearbyOrders
);
router.get(
  "/route-optimization/:driverId",
  deliveryStatusController.getDriverRouteOptimization
);

// New routes for active deliveries and route data

router.get(
  "/:driverId/map-deliveries",
  deliveryStatusController.getDriverDeliveriesForMap
); // Added new route

// Added new route for driver location
// Add to your orderRoutes.js file
router.get(
  "/:orderId/driver-location",
  deliveryStatusController.getDriverLocation
);

// Driver location routes
router.post(
  "/:driverId/location",
  deliveryStatusController.updateDriverLocation
);

module.exports = router;
