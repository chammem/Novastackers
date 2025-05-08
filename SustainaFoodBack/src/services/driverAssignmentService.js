const User = require("../models/userModel");
const Order = require("../models/sales/Order");
const Notification = require("../models/notification");
const geolib = require("geolib"); // Make sure this is installed: npm install geolib
const routeOptimizer = require("../utils/routeOptimizer");
const driverTimeoutService = require("./driverTimeoutService");
const { getRoute, isSameDirection } = require("../utils/routeOptimizer");

let ioInstance = null;

/**
 * Initialize the service with socket.io instance
 * @param {Object} io - Socket.io instance
 */
const initialize = (io) => {
  ioInstance = io;
  console.log("[DRIVER ASSIGN] Service initialized with socket.io");
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {Object} point1 - First point with lat and lng properties
 * @param {Object} point2 - Second point with lat and lng properties
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (point1, point2) => {
  return (
    geolib.getDistance(
      { latitude: point1.lat, longitude: point1.lng },
      { latitude: point2.lat, longitude: point2.lng }
    ) / 1000
  ); // Convert to kilometers
};

/**
 * Validate coordinates
 * @param {Object} point - Point with lat and lng properties
 * @returns {boolean} True if valid coordinates, false otherwise
 */
const validateCoordinates = (point) => {
  return (
    point && typeof point.lat === "number" && typeof point.lng === "number"
  );
};

/**
 * Find the best driver for a delivery order
 * @param {Object} deliveryAddress - Delivery address with lat and lng properties
 * @param {string} size - Order size (small, medium, large)
 * @param {string|null} orderId - Order ID to exclude declined drivers
 * @param {Object} businessLocation - Business location with lat and lng properties
 * @returns {Promise<Array>} Array of ranked drivers or empty array if none found
 */
const findBestDriver = async (
  deliveryAddress,
  size = "small",
  orderId = null,
  businessLocation = null
) => {
  console.log(
    `[DEBUG] findBestDriver called with:`,
    JSON.stringify({ deliveryAddress, size, orderId, businessLocation })
  );

  try {
    // Get the order to check declined drivers
    let declinedDriverIds = [];
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.declinedBy && order.declinedBy.length > 0) {
        declinedDriverIds = order.declinedBy.map((id) => id.toString());
        console.log(
          `Excluding ${declinedDriverIds.length} drivers who previously declined this order`
        );
      }
    }

    // Find available drivers who haven't declined this order
    console.log(
      `[DEBUG] Querying for drivers with role='driver' and excluding declined drivers`
    );

    const availableDrivers = await User.find({
      role: "driver",
      //   status: 'available',
      _id: { $nin: declinedDriverIds }, // Exclude drivers who declined this order
    }).select(
      "_id fullName email phone lat lng vehicleType transportCapacity activeDeliveries"
    );

    console.log(`[DEBUG] Found ${availableDrivers?.length || 0} total drivers`);

    if (!availableDrivers || availableDrivers.length === 0) {
      console.log("[DEBUG] No available drivers found");
      return [];
    }

    // Log first 3 drivers to check their data structure
    console.log(
      `[DEBUG] Sample of available drivers:`,
      JSON.stringify(
        availableDrivers.slice(0, 3).map((d) => ({
          id: d._id,
          name: d.fullName,
          hasLocation: Boolean(d.lat && d.lng),
          coordinates: d.lat && d.lng ? { lat: d.lat, lng: d.lng } : null,
          vehicleType: d.vehicleType,
          capacity: d.transportCapacity,
        }))
      )
    );

    // Filter drivers by vehicle capacity if size is provided
    const transportRanking = {
      small: 1,
      medium: 2,
      large: 3,
    };

    const requiredCapacity = size || "small";
    console.log(`[DEBUG] Required capacity: ${requiredCapacity}`);

    const capableDrivers = availableDrivers.filter((driver) => {
      const driverCapacity = driver.transportCapacity || "small";
      return (
        transportRanking[driverCapacity] >= transportRanking[requiredCapacity]
      );
    });

    console.log(
      `[DEBUG] ${capableDrivers.length} drivers have sufficient capacity`
    );

    if (capableDrivers.length === 0) {
      console.log("[DEBUG] No drivers with sufficient capacity found");
      return [];
    }

    // Only consider drivers with location data
    const driversWithLocation = capableDrivers.filter(
      (driver) => driver.lat && driver.lng
    );
    console.log(
      `[DEBUG] ${driversWithLocation.length} drivers have location data`
    );

    if (driversWithLocation.length === 0) {
      console.log("[DEBUG] No drivers with location data found");
      return [];
    }

    // Calculate distance for each driver and sort by closest
    console.log(
      `[DEBUG] Calculating distances from drivers to restaurant for ${driversWithLocation.length} drivers`
    );
    const driversWithDistance = driversWithLocation.map((driver) => {
      const distance = calculateDistance(
        { lat: driver.lat, lng: driver.lng },
        businessLocation // Changed from deliveryAddress to businessLocation
      );

      return {
        driver,
        distance,
        activeDeliveries: driver.activeDeliveries || 0,
      };
    });

    // Sort by distance
    driversWithDistance.sort((a, b) => {
      const distanceDiff = a.distance - b.distance;
      if (Math.abs(distanceDiff) < 1) {
        return a.activeDeliveries - b.activeDeliveries;
      }
      return distanceDiff;
    });

    // Log ranked drivers
    console.log(
      `[DEBUG] Top 3 drivers by distance to restaurant:`,
      JSON.stringify(
        driversWithDistance.slice(0, 3).map((d) => ({
          id: d.driver._id,
          name: d.driver.fullName,
          distanceToRestaurant: d.distance.toFixed(2) + " km",
          activeDeliveries: d.activeDeliveries,
        }))
      )
    );

    if (driversWithDistance.length === 0) {
      console.log("[DEBUG] No drivers available after distance calculation");
      return [];
    }

    // Return array of ranked drivers (top 3) instead of just the best one
    const topDrivers = driversWithDistance.slice(0, 3).map((d) => d.driver);
    console.log(`[DEBUG] Returning ${topDrivers.length} ranked drivers`);

    return topDrivers;
  } catch (error) {
    console.error("[DEBUG] ERROR in findBestDriver:", error);
    return [];
  }
};

/**
 * Assign a driver to an order and check for additional deliveries
 * @param {string} orderId - Order ID to assign driver to
 * @param {Object} deliveryAddress - Delivery address coordinates
 * @param {string} size - Order size (small, medium, large)
 * @param {Object} socketIo - Socket.io instance for real-time notifications
 * @returns {Promise<Object>} Updated order with driver assignment
 */
const assignDriverToOrder = async (
  orderId,
  deliveryAddress,
  size = "small",
  socketIo = null
) => {
  console.log(`[DEBUG] assignDriverToOrder called for order ${orderId}`);

  try {
    // Fetch the order and populate the business details
    const order = await Order.findById(orderId).populate({
      path: "foodSale",
      populate: {
        path: "foodItem",
        populate: {
          path: "buisiness_id",
          select: "lat lng fullName",
        },
      },
    });

    if (
      !order ||
      !order.foodSale ||
      !order.foodSale.foodItem ||
      !order.foodSale.foodItem.buisiness_id
    ) {
      console.error("[DEBUG] Business location not found in order.");
      return { success: false, message: "Business location not found" };
    }

    // Extract the business location
    const business = order.foodSale.foodItem.buisiness_id;
    const businessLocation = {
      lat: business.lat,
      lng: business.lng,
    };

    if (!businessLocation.lat || !businessLocation.lng) {
      console.error("[DEBUG] Business location coordinates are missing.");
      return {
        success: false,
        message: "Business location coordinates missing",
      };
    }

    console.log("[DEBUG] Business location:", businessLocation);

    // Get ranked drivers list
    const rankedDrivers = await findBestDriver(
      deliveryAddress,
      size,
      orderId,
      businessLocation
    );

    if (!rankedDrivers || rankedDrivers.length === 0) {
      console.log(`[DEBUG] No suitable drivers found for order ${orderId}`);
      return { success: false, message: "No suitable drivers found" };
    }

    // Try each driver in order until one meets criteria
    for (const driver of rankedDrivers) {
      console.log(`[DEBUG] Trying driver: ${driver.fullName} (${driver._id})`);

      // Check if the driver already has an active delivery
      const activeDeliveries = await Order.find({
        assignedDriver: driver._id,
        deliveryStatus: {
          $in: ["driver_assigned", "pickup_ready", "picked_up", "delivering"],
        },
      });

      if (activeDeliveries.length > 0) {
        console.log(
          `[DEBUG] Driver ${driver._id} already has active deliveries, checking compatibility...`
        );

        // Check if the new delivery meets the criteria for additional deliveries
        const isAdditionalDeliveryValid = await checkIfDeliveryFitsCriteria(
          driver,
          activeDeliveries[0],
          deliveryAddress
        );

        if (!isAdditionalDeliveryValid) {
          console.log(
            `[DEBUG] New delivery does not meet criteria for driver ${driver._id}, trying next driver`
          );
          continue; // Try the next driver
        }
      }

      // If we reach here, this driver is suitable
      console.log(
        `[DEBUG] Driver ${driver._id} meets all criteria, assigning order`
      );

      // Update the order with the assigned driver
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          assignedDriver: driver._id,
          deliveryStatus: "driver_assigned",
          $push: {
            statusHistory: {
              status: "driver_assigned",
              updatedBy: "system",
              timestamp: new Date(),
            },
          },
        },
        { new: true }
      );

      if (!updatedOrder) {
        return { success: false, message: "Order not found" };
      }

      // Update driver status
      await User.findByIdAndUpdate(driver._id, {
        status: "assigned",
      });

      // Notify the driver about the assignment
      const notification = await Notification.create({
        user_id: driver._id,
        message: `New delivery request: ${updatedOrder.quantity} items to ${updatedOrder.deliveryAddress.street}, ${updatedOrder.deliveryAddress.city}`,
        type: "assignment-request",
        read: false,
        data: {
          orderId: orderId,
        },
      });

      if (socketIo) {
        socketIo
          .to(driver._id.toString())
          .emit("new-notification", notification);
      }

      return {
        success: true,
        order: updatedOrder,
        driver: {
          _id: driver._id,
          fullName: driver.fullName,
          phone: driver.phone,
        },
      };
    }

    // If we get here, no driver met the criteria
    console.log(
      `[DEBUG] None of the drivers met the criteria for order ${orderId}`
    );
    return {
      success: false,
      message: "No driver met the criteria for this delivery",
    };
  } catch (error) {
    console.error(`[DEBUG] ERROR in assignDriverToOrder:`, error);
    return { success: false, message: error.message };
  }
};

/**
 * Check if a new delivery fits the criteria for additional deliveries
 * @param {Object} driver - The driver object
 * @param {Object} currentOrder - The driver's current active delivery
 * @param {Object|string} newOrderOrAddress - The new delivery's order ID or address
 * @returns {Promise<boolean>} True if the new delivery fits the criteria, false otherwise
 */
const checkIfDeliveryFitsCriteria = async (
  driver,
  currentOrder,
  newOrderOrAddress
) => {
  console.log(
    `[DEBUG] Checking if new delivery fits criteria for driver ${driver._id}`
  );

  try {
    // Populate the current order to get business location
    const currentOrderPopulated = await Order.findById(
      currentOrder._id
    ).populate({
      path: "foodSale",
      populate: {
        path: "foodItem",
        populate: {
          path: "buisiness_id",
          select: "lat lng fullName",
        },
      },
    });

    if (
      !currentOrderPopulated ||
      !currentOrderPopulated.foodSale ||
      !currentOrderPopulated.foodSale.foodItem ||
      !currentOrderPopulated.foodSale.foodItem.buisiness_id
    ) {
      console.error("[DEBUG] Business location not found for current order.");
      return false;
    }

    const currentBusinessLocation = {
      lat: currentOrderPopulated.foodSale.foodItem.buisiness_id.lat,
      lng: currentOrderPopulated.foodSale.foodItem.buisiness_id.lng,
    };

    const currentDeliveryLocation = {
      lat: currentOrderPopulated.deliveryAddress.lat,
      lng: currentOrderPopulated.deliveryAddress.lng,
    };

    console.log("[DEBUG] Current business location:", currentBusinessLocation);
    console.log("[DEBUG] Current delivery location:", currentDeliveryLocation);

    // Determine if we received an order ID or just an address
    let newOrderId = null;
    let newBusinessLocation = null;
    let newDeliveryLocation = null;

    if (
      typeof newOrderOrAddress === "object" &&
      newOrderOrAddress.lat &&
      newOrderOrAddress.lng
    ) {
      // We received a delivery address object
      console.log(
        "[DEBUG] Received delivery address only. Fetching order details..."
      );

      newDeliveryLocation = {
        lat: newOrderOrAddress.lat,
        lng: newOrderOrAddress.lng,
      };

      // Look up the order with this delivery address
      const newOrder = await Order.findOne({
        deliveryStatus: "waiting_for_driver",
        "deliveryAddress.lat": newOrderOrAddress.lat,
        "deliveryAddress.lng": newOrderOrAddress.lng,
      }).populate({
        path: "foodSale",
        populate: {
          path: "foodItem",
          populate: {
            path: "buisiness_id",
            select: "lat lng fullName",
          },
        },
      });

      if (newOrder) {
        newOrderId = newOrder._id;
        newBusinessLocation = {
          lat: newOrder.foodSale.foodItem.buisiness_id.lat,
          lng: newOrder.foodSale.foodItem.buisiness_id.lng,
        };
      } else {
        console.error(
          "[DEBUG] Could not find order with the provided delivery address."
        );
        return false;
      }
    } else if (typeof newOrderOrAddress === "string") {
      // We received an order ID
      newOrderId = newOrderOrAddress;

      // Fetch and populate the new order
      const newOrder = await Order.findById(newOrderId).populate({
        path: "foodSale",
        populate: {
          path: "foodItem",
          populate: {
            path: "buisiness_id",
            select: "lat lng fullName",
          },
        },
      });

      if (
        !newOrder ||
        !newOrder.foodSale ||
        !newOrder.foodSale.foodItem ||
        !newOrder.foodSale.foodItem.buisiness_id
      ) {
        console.error("[DEBUG] Business location not found for new order.");
        return false;
      }

      newBusinessLocation = {
        lat: newOrder.foodSale.foodItem.buisiness_id.lat,
        lng: newOrder.foodSale.foodItem.buisiness_id.lng,
      };

      newDeliveryLocation = {
        lat: newOrder.deliveryAddress.lat,
        lng: newOrder.deliveryAddress.lng,
      };
    } else {
      console.error("[DEBUG] Invalid new order parameter type.");
      return false;
    }

    console.log("[DEBUG] New business location:", newBusinessLocation);
    console.log("[DEBUG] New delivery location:", newDeliveryLocation);

    // Check 1: Calculate distance between business locations
    const businessDistance = calculateDistance(
      currentBusinessLocation,
      newBusinessLocation
    );

    console.log(
      `[DEBUG] Distance between businesses: ${businessDistance.toFixed(2)} km`
    );

    // Check 2: Calculate distance between delivery addresses
    const deliveryDistance = calculateDistance(
      currentDeliveryLocation,
      newDeliveryLocation
    );

    console.log(
      `[DEBUG] Distance between delivery addresses: ${deliveryDistance.toFixed(
        2
      )} km`
    );

    // Verify both conditions are met
    const isBusinessesClose = businessDistance <= 2.0; // 500 meters threshold
    const isDeliveriesClose = deliveryDistance <= 2.0; // 2 km threshold for deliveries

    if (isBusinessesClose && isDeliveriesClose) {
      console.log(
        `[DEBUG] Both businesses and delivery addresses are close. Allowing delivery.`
      );
      return true;
    } else {
      if (!isBusinessesClose) {
        console.log(
          `[DEBUG] Businesses are too far apart (> 0.5 km). Rejecting delivery.`
        );
      }
      if (!isDeliveriesClose) {
        console.log(
          `[DEBUG] Delivery addresses are too far apart (> 2 km). Rejecting delivery.`
        );
      }
      return false;
    }
  } catch (error) {
    console.error("[DEBUG] Error checking delivery criteria:", error.message);
    return false; // Gracefully handle errors by rejecting the new delivery
  }
};

/**
 * Check for additional deliveries that fit the current driver's route
 * @param {Object} driver - The assigned driver
 * @param {Object} currentOrder - The current order assigned to the driver
 * @param {Object} socketIo - Socket.io instance for real-time notifications
 */
const checkForAdditionalDeliveries = async (driver, currentOrder, socketIo) => {
  console.log(
    `[DEBUG] Checking for additional deliveries for driver ${driver._id}`
  );

  // Fetch the business location of the current order
  const currentOrderPopulated = await Order.findById(currentOrder._id).populate(
    {
      path: "foodSale",
      populate: {
        path: "foodItem",
        populate: {
          path: "buisiness_id", // Reference to the User model
          select: "lat lng fullName", // Fetch only the necessary fields
        },
      },
    }
  );

  if (
    !currentOrderPopulated ||
    !currentOrderPopulated.foodSale ||
    !currentOrderPopulated.foodSale.foodItem ||
    !currentOrderPopulated.foodSale.foodItem.buisiness_id
  ) {
    console.error("[DEBUG] Business location not found for current order.");
    return;
  }

  const currentBusinessLocation = {
    lat: currentOrderPopulated.foodSale.foodItem.buisiness_id.lat,
    lng: currentOrderPopulated.foodSale.foodItem.buisiness_id.lng,
  };

  console.log("[DEBUG] Current business location:", currentBusinessLocation);

  // Find nearby orders
  const nearbyOrders = await Order.find({
    deliveryStatus: "waiting_for_driver",
    "deliveryAddress.lat": { $exists: true },
    "deliveryAddress.lng": { $exists: true },
  });

  for (const order of nearbyOrders) {
    // Fetch the business location of the new order
    const newOrderPopulated = await Order.findById(order._id).populate({
      path: "foodSale",
      populate: {
        path: "foodItem",
        populate: {
          path: "buisiness_id", // Reference to the User model
          select: "lat lng fullName", // Fetch only the necessary fields
        },
      },
    });

    if (
      !newOrderPopulated ||
      !newOrderPopulated.foodSale ||
      !newOrderPopulated.foodSale.foodItem ||
      !newOrderPopulated.foodSale.foodItem.buisiness_id
    ) {
      console.error(
        `[DEBUG] Business location not found for new order ${order._id}.`
      );
      continue;
    }

    const newBusinessLocation = {
      lat: newOrderPopulated.foodSale.foodItem.buisiness_id.lat,
      lng: newOrderPopulated.foodSale.foodItem.buisiness_id.lng,
    };

    console.log("[DEBUG] New business location:", newBusinessLocation);

    // Check if the businesses are close to each other
    const businessDistance = calculateDistance(
      currentBusinessLocation,
      newBusinessLocation
    );

    console.log(
      `[DEBUG] Distance between businesses: ${businessDistance.toFixed(2)} km`
    );

    if (businessDistance <= 0.5) {
      console.log(`[DEBUG] Businesses are close to each other (<= 0.5 km).`);
    } else {
      console.log(`[DEBUG] Businesses are too far apart (> 0.5 km).`);
    }
  }
};

module.exports = {
  findBestDriver,
  assignDriverToOrder,
  calculateDistance,
  initialize,
  checkForAdditionalDeliveries,
  checkIfDeliveryFitsCriteria,
  validateCoordinates,
};
