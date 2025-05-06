const Order = require("../../models/sales/Order");
const User = require("../../models/userModel");
const Notification = require("../../models/notification");
const FoodItem = require("../../models/foodItem");
const axios = require("axios");
const routeOptimizer = require("../../utils/routeOptimizer");
const geolib = require("geolib");

const ORS_API_KEY = process.env.ORS_API_KEY; // Add your ORS API key to the environment variables

/**
 * Generate a random numeric code
 * @param {number} length - Length of code to generate
 * @returns {string} - Generated code
 */
const generateCode = (length = 6) => {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
};

/**
 * Start the delivery process by generating a pickup code
 */
exports.startDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { driverId } = req.body;

    console.log(
      `[DEBUG] Starting delivery for order ${orderId}, driver ${driverId}`
    );

    // Validate input
    if (!driverId || !orderId) {
      console.log(
        `[DEBUG] Missing required parameters: driverId=${driverId}, orderId=${orderId}`
      );
      return res.status(400).json({
        success: false,
        message: "Driver ID and Order ID are required",
      });
    }

    // Check if driver is assigned to this order
    const order = await Order.findById(orderId).populate("foodSale");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.assignedDriver || order.assignedDriver.toString() !== driverId) {
      return res.status(403).json({
        success: false,
        message: "This order is not assigned to this driver",
      });
    }

    // Update order status
    order.deliveryStatus = "pickup_ready";
    order.statusHistory.push({
      status: "pickup_ready",
      updatedBy: driverId,
      timestamp: new Date(),
    });

    // Get business ID from food sale
    let businessId = null;
    if (order.foodSale && order.foodSale.foodItem) {
      const foodItem = await FoodItem.findById(order.foodSale.foodItem);
      if (foodItem) {
        console.log(foodItem);
        businessId = foodItem.buisiness_id;
        console.log(`Business ID: ${businessId}`);
      }
    }

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: "Could not determine business for this order",
      });
    }

    // Generate pickup code
    const pickupCode = generateCode();

    order.pickupCode = {
      code: pickupCode,
      generatedAt: new Date(),
      verifiedAt: null,
      verifiedBy: null,
    };

    await order.save();

    // Send notification to business
    const notification = await Notification.create({
      user_id: businessId,
      message: `Pickup code for order #${order._id
        .toString()
        .substr(-6)}: ${pickupCode}. Show this to the driver.`,
      type: "pickup_code",
      read: false,
      data: {
        orderId: order._id,
        code: pickupCode,
      },
    });

    // Send real-time notification if possible
    if (req.io) {
      req.io.to(businessId.toString()).emit("new-notification", notification);
    }

    return res.status(200).json({
      success: true,
      message: "Delivery started, pickup code generated",
      code: pickupCode, // Only show code to driver for testing purposes
    });
  } catch (error) {
    console.error("Error in startDelivery:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Confirm food pickup using the code from the restaurant
 */
exports.confirmPickup = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { driverId, pickupCode } = req.body;

    // Validate input
    if (!driverId || !orderId || !pickupCode) {
      return res.status(400).json({
        success: false,
        message: "Driver ID, Order ID, and pickup code are required",
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order is assigned to this driver
    if (!order.assignedDriver || order.assignedDriver.toString() !== driverId) {
      return res.status(403).json({
        success: false,
        message: "This order is not assigned to this driver",
      });
    }

    // Check if pickup code exists and matches
    if (!order.pickupCode || order.pickupCode.code !== pickupCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup code",
      });
    }

    // Update pickup verification
    order.pickupCode.verifiedAt = new Date();
    order.pickupCode.verifiedBy = driverId;

    // Update status
    order.deliveryStatus = "picked_up";
    order.statusHistory.push({
      status: "picked_up",
      updatedBy: driverId,
      timestamp: new Date(),
    });

    // Update status to "delivering"
    order.deliveryStatus = "delivering";
    order.statusHistory.push({
      status: "delivering",
      updatedBy: driverId,
      timestamp: new Date(),
    });

    await order.save();

    // Notify customer that driver is on the way (without delivery code)
    const statusNotification = await Notification.create({
      user_id: order.user,
      message: `Your order is on the way! Driver has picked up your food.`,
      type: "status_update",
      read: false,
    });

    if (req.io) {
      req.io
        .to(order.user.toString())
        .emit("new-notification", statusNotification);
    }

    return res.status(200).json({
      success: true,
      message: "Pickup confirmed, now delivering",
      status: "delivering",
    });
  } catch (error) {
    console.error("Error confirming pickup:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Handle delivery completion request - generates code for customer
 */
exports.startDeliveryCompletion = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { driverId } = req.body;

    // Validate input
    if (!driverId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Driver ID and Order ID are required",
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order is assigned to this driver
    if (!order.assignedDriver || order.assignedDriver.toString() !== driverId) {
      return res.status(403).json({
        success: false,
        message: "This order is not assigned to this driver",
      });
    }

    // Generate delivery code
    const deliveryCode = generateCode();

    // Save code to order
    order.deliveryCode = {
      code: deliveryCode,
      generatedAt: new Date(),
      verifiedAt: null,
      verifiedBy: null,
    };

    await order.save();

    // Send notification to customer with delivery code
    const notification = await Notification.create({
      user_id: order.user,
      message: `Your delivery code for order #${order._id
        .toString()
        .substr(
          -6
        )}: ${deliveryCode}. Share with your driver to complete delivery.`,
      type: "delivery_code",
      read: false,
      data: {
        orderId: order._id,
        code: deliveryCode,
      },
    });

    if (req.io) {
      req.io.to(order.user.toString()).emit("new-notification", notification);
    }

    return res.status(200).json({
      success: true,
      message: "Delivery completion initiated. Code sent to customer.",
    });
  } catch (error) {
    console.error("Error starting delivery completion:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Confirm delivery completion with customer's code
 */
exports.confirmDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { driverId, deliveryCode } = req.body;

    // Validate input
    if (!driverId || !orderId || !deliveryCode) {
      return res.status(400).json({
        success: false,
        message: "Driver ID, Order ID, and delivery code are required",
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order is assigned to this driver
    if (!order.assignedDriver || order.assignedDriver.toString() !== driverId) {
      return res.status(403).json({
        success: false,
        message: "This order is not assigned to this driver",
      });
    }

    // Check if delivery code exists and matches
    if (!order.deliveryCode || order.deliveryCode.code !== deliveryCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery code",
      });
    }

    // Update delivery verification
    order.deliveryCode.verifiedAt = new Date();
    order.deliveryCode.verifiedBy = driverId;

    // Update status to "delivered" but keep order status consistent
    order.deliveryStatus = "delivered";
    order.statusHistory.push({
      status: "delivered",
      updatedBy: driverId,
      timestamp: new Date(),
    });

    // Update order status - using a valid value from your schema
    order.status = "fulfilled"; // Or 'completed' - both are valid in your schema
    order.deliveredAt = new Date();

    await order.save();

    // Update driver status
    await User.findByIdAndUpdate(driverId, {
      status: "available",
      $inc: { activeDeliveries: -1, completedDeliveries: 1 },
    });

    // Notify customer that delivery is complete
    const notification = await Notification.create({
      user_id: order.user,
      message: `Your order has been delivered! Thank you for using SustainaFood.`,
      type: "status_update",
      read: false,
    });

    if (req.io) {
      req.io.to(order.user.toString()).emit("new-notification", notification);
    }

    return res.status(200).json({
      success: true,
      message: "Delivery completed successfully",
      status: "delivered",
    });
  } catch (error) {
    console.error("Error confirming delivery:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get delivery status for an order
 */
exports.getDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .select(
        "deliveryStatus assignedDriver pickupCode.generatedAt deliveryCode.generatedAt statusHistory"
      )
      .populate("assignedDriver", "fullName phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      status: order.deliveryStatus,
      assignedDriver: order.assignedDriver,
      statusHistory: order.statusHistory,
      pickupInitiated: order.pickupCode?.generatedAt ? true : false,
      deliveryInitiated: order.deliveryCode?.generatedAt ? true : false,
    });
  } catch (error) {
    console.error("Error getting delivery status:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get detailed information about a delivery for the map view
 */
exports.getDeliveryDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`[getDeliveryDetails] Processing order ID: ${orderId}`);

    // Populate more deeply to get all the required data
    const order = await Order.findById(orderId)
      .populate("user", "fullName phone email")
      .populate({
        path: "foodSale",
        populate: {
          path: "foodItem",
          model: "FoodItem",
        },
      })
      .populate({
        path: "deliveryAddress",
        select: "street city state zipCode lat lng",
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Create a clean response object with flattened structure
    const response = {
      ...order.toObject(),
      foodSale: {
        ...order.foodSale.toObject(),
        foodItemDetails: order.foodSale.foodItem, // Rename for clarity
      },
    };

    // If we have a food item with a business ID
    if (response.foodSale.foodItemDetails?.buisiness_id) {
      // Get the business details
      const businessId = response.foodSale.foodItemDetails.buisiness_id;
      const business = await User.findById(businessId);

      if (business) {
        // Add business details directly to foodSale for easier access
        response.foodSale.businessDetails = {
          _id: business._id,
          fullName: business.fullName,
          location: {
            lat: business.lat || 0,
            lng: business.lng || 0,
          },
        };
      }
    }

    // Log the final structured response for debugging
    console.log("[getDeliveryDetails] Final data structure:", {
      hasBusinessDetails: !!response.foodSale.businessDetails,
      businessName: response.foodSale.businessDetails?.fullName,
      businessLocation: response.foodSale.businessDetails?.location,
    });

    return res.status(200).json({
      success: true,
      delivery: response,
    });
  } catch (error) {
    console.error("Error getting delivery details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Detect nearby orders based on current pickup and delivery locations
 */
exports.detectNearbyOrders = async (req, res) => {
  try {
    const { currentPickup, currentDelivery } = req.body; // { lat, lng } for both
    const radius = 2000; // 2 km radius

    // Step 1: Find nearby orders
    const nearbyOrders = await Order.find({
      "deliveryAddress.lat": { $exists: true },
      "deliveryAddress.lng": { $exists: true },
      deliveryStatus: "waiting_for_driver",
    });

    const validOrders = [];

    for (const order of nearbyOrders) {
      // Check if the pickup location is near the current pickup location
      const isPickupNearby = geolib.isPointWithinRadius(
        { latitude: order.deliveryAddress.lat, longitude: order.deliveryAddress.lng },
        { latitude: currentPickup.lat, longitude: currentPickup.lng },
        radius
      );

      if (!isPickupNearby) continue;

      // Check if the delivery location is along the same route
      const currentRoute = await routeOptimizer.getRoute(currentPickup, currentDelivery);
      const newRoute = await routeOptimizer.getRoute(currentPickup, order.deliveryAddress);

      const isSameDirection = routeOptimizer.isSameDirection(currentRoute, newRoute);

      if (isSameDirection) {
        validOrders.push(order);
      }
    }

    return res.status(200).json({ success: true, orders: validOrders });
  } catch (error) {
    console.error("Error detecting nearby orders:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * Get active delivery orders with locations for map routing
 */
exports.getDriverDeliveriesForMap = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    // Check if driver exists
    const driver = await User.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }
    
    // Get driver's current location
    if (!driver.lat || !driver.lng) {
      return res.status(400).json({
        success: false,
        message: "Driver location not available"
      });
    }
    
    // Get all active deliveries for the driver
    const deliveries = await Order.find({
      assignedDriver: driverId,
      deliveryStatus: { 
        $in: ["driver_assigned", "pickup_ready", "picked_up", "delivering"] 
      }
    }).populate({
      path: "foodSale",
      populate: {
        path: "foodItem",
        populate: {
          path: "buisiness_id", 
          select: "fullName lat lng"
        }
      }
    }).populate("user", "fullName")
    .lean();
    
    if (deliveries.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No active deliveries",
        data: []
      });
    }
    
    // Process deliveries to include business location and delivery location
    const processedDeliveries = deliveries.map(delivery => {
      const businessDetails = delivery.foodSale?.foodItem?.buisiness_id || {};
      
      return {
        _id: delivery._id,
        deliveryStatus: delivery.deliveryStatus,
        user: delivery.user,
        deliveryAddress: delivery.deliveryAddress,
        foodSale: {
          _id: delivery.foodSale?._id,
          name: delivery.foodSale?.name || "Food order",
          businessDetails: {
            _id: businessDetails._id,
            fullName: businessDetails.fullName || "Restaurant",
            location: {
              lat: businessDetails.lat || null,
              lng: businessDetails.lng || null
            }
          }
        }
      };
    });
    
    // Filter out any deliveries missing critical location data
    const validDeliveries = processedDeliveries.filter(delivery => {
      const hasBusinessLocation = delivery.foodSale?.businessDetails?.location?.lat && 
                                 delivery.foodSale?.businessDetails?.location?.lng;
      
      const hasDeliveryLocation = delivery.deliveryAddress?.lat && 
                                 delivery.deliveryAddress?.lng;
      
      // Keep if it has at least one valid location based on delivery status
      if (delivery.deliveryStatus === "driver_assigned" || delivery.deliveryStatus === "pickup_ready") {
        return hasBusinessLocation; // Need business location for pickup
      } else {
        return hasDeliveryLocation; // Need delivery location for delivery
      }
    });
    
    return res.status(200).json({
      success: true,
      data: validDeliveries,
      driverLocation: [driver.lat, driver.lng]
    });
    
  } catch (error) {
    console.error("Error fetching driver deliveries for map:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

exports.getDriverRouteOptimization = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    // Get driver's current location
    const driver = await User.findById(driverId);
    if (!driver || !driver.lat || !driver.lng) {
      return res.status(400).json({
        success: false,
        message: "Driver location not available"
      });
    }
    
    // Get all active deliveries for the driver
    const activeDeliveries = await Order.find({
      assignedDriver: driverId,
      deliveryStatus: { $in: ["driver_assigned", "pickup_ready", "picked_up", "delivering"] }
    }).populate({
      path: "foodSale",
      populate: {
        path: "foodItem",
        populate: {
          path: "buisiness_id",
          select: "lat lng fullName"
        }
      }
    });
    
    if (activeDeliveries.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No active deliveries",
        route: {
          directMode: true,
          stops: [{
            type: "driver",
            location: [driver.lng, driver.lat], // [lng, lat] format for ORS
            businessName: "Your Location",
            description: "Current location"
          }]
        }
      });
    }
    
    // Collect all stops
    const points = [];
    const stops = [];
    
    // Add driver current location as start point
    points.push([driver.lng, driver.lat]);
    stops.push({
      type: "driver",
      location: [driver.lng, driver.lat],
      businessName: "Your Location",
      description: "Current location"
    });
    
    // Separate pickups and deliveries
    const pickupStops = [];
    const deliveryStops = [];
    
    activeDeliveries.forEach(delivery => {
      // Add restaurant/business location for orders that need pickup
      if (delivery.deliveryStatus === "driver_assigned" || delivery.deliveryStatus === "pickup_ready") {
        const business = delivery.foodSale?.foodItem?.buisiness_id;
        if (business && business.lat && business.lng) {
          points.push([business.lng, business.lat]);
          pickupStops.push({
            type: "pickup",
            location: [business.lng, business.lat],
            businessName: business.fullName,
            description: "Restaurant pickup",
            orderId: delivery._id,
            items: [{
              _id: delivery._id,
              name: delivery.foodSale?.foodItem?.name || "Food item",
              status: delivery.deliveryStatus
            }]
          });
        }
      }
      
      // Add customer locations for all deliveries
      if (delivery.deliveryAddress && delivery.deliveryAddress.lat && delivery.deliveryAddress.lng) {
        points.push([delivery.deliveryAddress.lng, delivery.deliveryAddress.lat]);
        deliveryStops.push({
          type: "delivery",
          location: [delivery.deliveryAddress.lng, delivery.deliveryAddress.lat],
          businessName: delivery.user?.fullName || "Customer",
          description: `${delivery.deliveryAddress.street}, ${delivery.deliveryAddress.city}`,
          orderId: delivery._id,
          items: [{
            _id: delivery._id,
            name: delivery.foodSale?.foodItem?.name || "Food item",
            status: delivery.deliveryStatus
          }]
        });
      }
    });
    
    // Sort stops to prioritize pickups before deliveries
    stops.push(...pickupStops, ...deliveryStops);
    
    // Optimize the route if there are multiple stops
    if (points.length > 2) {
      try {
        const optimizedRoute = await routeOptimizer.optimizeRoute(points, "driving-car");
        
        return res.status(200).json({
          success: true,
          route: {
            directMode: false,
            stops: stops,
            segments: optimizedRoute.route.segments,
            totalDistance: optimizedRoute.totalDistance,
            totalDuration: optimizedRoute.route.totalDuration
          }
        });
      } catch (error) {
        console.error("Route optimization error:", error);
        
        // Fallback to direct mode if optimization fails
        return res.status(200).json({
          success: true,
          route: {
            directMode: true,
            stops: stops
          }
        });
      }
    } else {
      // Just return the stops for direct mode
      return res.status(200).json({
        success: true,
        route: {
          directMode: true,
          stops: stops
        }
      });
    }
  } catch (error) {
    console.error("Error getting driver route optimization:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};