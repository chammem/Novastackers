const express = require("express");
const router = express.Router();
const orderController = require("../controllers/sales/orderController");
const driverAssignmentService = require("../services/driverAssignmentService");
const deliveryStatusController = require("../controllers/driver/deliveryStatusController"); // Added import for deliveryStatusController

// Routes without auth middleware
router.get("/user/:userId", orderController.getUserOrders);
router.get("/details/:orderId", orderController.getOrderDetails);
router.get("/:orderId", orderController.getOrderDetails);
router.get("/:orderId/tracking", orderController.getOrderTrackingData);
router.get("/:orderId/locations", orderController.getOrderLocations);
router.get(
  "/:orderId/driver-location",
  deliveryStatusController.getDriverLocation
); // Added new route

router.get("/best-driver", async (req, res) => {
  try {
    const { lat, lng, size = "small" } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const deliveryLocation = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };

    const bestDriver = await driverAssignmentService.findBestDriver(
      deliveryLocation,
      size
    );

    if (!bestDriver) {
      return res.status(200).json({
        success: false,
        message: "No suitable driver found",
      });
    }

    const distance = driverAssignmentService.calculateDistance(
      { lat: bestDriver.lat, lng: bestDriver.lng },
      deliveryLocation
    );

    return res.status(200).json({
      success: true,
      driver: {
        _id: bestDriver._id,
        fullName: bestDriver.fullName,
        phone: bestDriver.phone,
        location: {
          lat: bestDriver.lat,
          lng: bestDriver.lng,
        },
        distance: {
          km: distance.toFixed(2),
          estimated_minutes: Math.ceil(distance * 2),
        },
        vehicleType: bestDriver.vehicleType || "Not specified",
        capacity: bestDriver.transportCapacity || "small",
      },
    });
  } catch (error) {
    console.error("Error finding best driver:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

router.get("/test-driver-service/:orderId", async (req, res) => {
  const { orderId } = req.params;

  // Log to terminal - very basic
  process.stdout.write("\n\n[DIRECT TEST] Testing driver assignment\n");

  try {
    // Find order first
    const Order = require("../models/sales/Order");
    const order = await Order.findById(orderId);

    if (!order) {
      process.stdout.write("[DIRECT TEST] Order not found\n\n");
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    process.stdout.write(`[DIRECT TEST] Order found: ${orderId}\n`);
    process.stdout.write(
      `[DIRECT TEST] Has delivery address: ${Boolean(order.deliveryAddress)}\n`
    );
    process.stdout.write(
      `[DIRECT TEST] Has coordinates: ${Boolean(
        order.deliveryAddress?.lat && order.deliveryAddress?.lng
      )}\n`
    );

    if (!order.deliveryAddress?.lat || !order.deliveryAddress?.lng) {
      process.stdout.write("[DIRECT TEST] No coordinates in order\n\n");
      return res.status(400).json({
        success: false,
        message: "Order has no coordinates",
        deliveryAddress: order.deliveryAddress || null,
      });
    }

    // Directly call service
    process.stdout.write(
      "[DIRECT TEST] Calling driver assignment service...\n"
    );
    const result = await driverAssignmentService.assignDriverToOrder(
      orderId,
      order.deliveryAddress,
      "small"
    );

    process.stdout.write(
      `[DIRECT TEST] Service returned: ${JSON.stringify(result)}\n\n`
    );

    return res.status(200).json({
      success: true,
      message: "Direct test completed",
      serviceResult: result,
    });
  } catch (error) {
    process.stdout.write(`[DIRECT TEST] ERROR: ${error.message}\n\n`);
    return res.status(500).json({
      success: false,
      message: "Error during test",
      error: error.message,
    });
  }
});

module.exports = router;
