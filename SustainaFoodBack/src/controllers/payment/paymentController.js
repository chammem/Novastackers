const stripe = require("../../config/stripeConfig");
const FoodSale = require("../../models/sales/FoodSaleItem");
const Order = require("../../models/sales/Order");
const PaymentIntent = require("../../models/sales/PaymentIntent");
const driverAssignmentService = require("../../services/driverAssignmentService");

exports.createPaymentIntent = async (req, res) => {
  try {
    const {
      foodSaleId,
      quantity,
      userId,
      deliveryAddress,
      specialInstructions,
      orderIdentifier,
    } = req.body;

    // Validate required fields
    if (!foodSaleId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Food sale ID and quantity are required",
      });
    }

    // Find the food sale item
    const foodSale = await FoodSale.findById(foodSaleId);
    if (!foodSale) {
      return res.status(404).json({
        success: false,
        message: "Food sale item not found",
      });
    }

    // Check if enough quantity is available
    if (foodSale.quantityAvailable < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough items available",
      });
    }

    // Calculate amount
    const unitPrice = foodSale.discountedPrice || foodSale.price;
    const amount = Math.round(unitPrice * quantity * 100); // Convert to cents for Stripe

    // IMPORTANT: Check for existing payments in process
    const existingPayment = await PaymentIntent.findOne({
      orderIdentifier,
      status: { $nin: ["cancelled", "failed"] },
    });

    if (existingPayment) {
      return res.status(200).json({
        success: true,
        clientSecret: existingPayment.clientSecret,
        paymentIntentId: existingPayment.stripePaymentId,
        message: "Using existing payment intent",
      });
    }

    // Find or create order
    let order;
    const existingOrder = await Order.findOne({
      foodSale: foodSaleId,
      user: userId,
      status: "pending",
      // Only consider recent orders (last 30 minutes)
      createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) },
    });

    if (existingOrder) {
      order = existingOrder;
      console.log("Using existing order:", order._id);
    } else {
      // Create a new order
      order = new Order({
        user: userId || "000000000000000000000000", // Use placeholder ID if missing
        foodSale: foodSaleId,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        deliveryAddress,
        specialInstructions,
        status: "pending",
      });
      await order.save();
      console.log("Created new order:", order._id);
    }

    // Create metadata
    const metadata = {
      orderId: order._id.toString(),
      userId: userId ? userId.toString() : "guest",
      foodSaleId: foodSaleId.toString(),
      orderIdentifier,
    };

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata,
    });

    // Store payment intent in database (create a PaymentIntent model to track this)
    const newPaymentIntent = new PaymentIntent({
      stripePaymentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount,
      orderId: order._id,
      userId,
      status: "created",
      orderIdentifier,
    });
    await newPaymentIntent.save();

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment",
      error: error.message,
    });
  }
};

// Helper function to process successful payments
const handleSuccessfulPayment = async (paymentIntent) => {
  process.stdout.write("\n[PAYMENT] Payment success handler called\n");

  try {
    const orderId = paymentIntent.metadata?.orderId;
    process.stdout.write(`[PAYMENT] Order ID: ${orderId}\n`);

    if (!orderId) {
      process.stdout.write("[PAYMENT] No order ID in metadata\n");
      return;
    }

    console.log(`[DEBUG] Payment successful, processing order assignment...`);
    console.log(`[DEBUG] Payment intent:`, JSON.stringify(paymentIntent));

    try {
      // Extract orderId from the payment intent metadata
      console.log(`[DEBUG] Extracted orderId: ${orderId}`);

      if (!orderId) {
        console.error(
          "[DEBUG] ERROR: No orderId found in payment intent metadata"
        );
        return;
      }

      // Find the order in the database
      console.log(`[DEBUG] Finding order with ID: ${orderId}`);
      const order = await Order.findById(orderId);

      if (!order) {
        console.error(`[DEBUG] ERROR: Order ${orderId} not found in database`);
        return;
      }

      console.log(`[DEBUG] Order found:`, JSON.stringify(order));

      // Check delivery address
      if (!order.deliveryAddress) {
        console.error(
          `[DEBUG] ERROR: Order ${orderId} has no delivery address`
        );
        return;
      }

      console.log(
        `[DEBUG] Order delivery address:`,
        JSON.stringify(order.deliveryAddress)
      );

      // Check coordinates
      if (!order.deliveryAddress.lat || !order.deliveryAddress.lng) {
        console.error(
          `[DEBUG] ERROR: Order ${orderId} is missing lat/lng coordinates in delivery address`
        );
        return;
      }

      console.log(
        `[DEBUG] Order coordinates: lat=${order.deliveryAddress.lat}, lng=${order.deliveryAddress.lng}`
      );

      // Update order status
      console.log(`[DEBUG] Updating order ${orderId} status to paid`);
      order.status = "paid";
      order.deliveryStatus = "waiting_for_driver";
      order.statusHistory.push({
        status: "paid",
        updatedBy: "payment_system",
        timestamp: new Date(),
      });

      await order.save();
      console.log(`[DEBUG] Order status updated successfully`);

      // Call driver assignment service
      process.stdout.write(
        `[PAYMENT] About to call driver assignment service\n`
      );
      console.log(
        `[DEBUG] Calling driver assignment service for order ${orderId}...`
      );

      try {
        const assignmentResult =
          await driverAssignmentService.assignDriverToOrder(
            orderId,
            order.deliveryAddress,
            "small"
          );

        console.log(
          `[DEBUG] Driver assignment result:`,
          JSON.stringify(assignmentResult)
        );

        if (assignmentResult.success) {
          console.log(
            `[DEBUG] SUCCESS: Driver ${assignmentResult.driver.fullName} assigned to order ${orderId}`
          );
        } else {
          console.log(
            `[DEBUG] WARN: No driver assigned to order ${orderId}: ${assignmentResult.message}`
          );
        }
        process.stdout.write(`[PAYMENT] Driver assignment complete\n`);
      } catch (assignmentError) {
        console.error(`[DEBUG] ERROR in driver assignment:`, assignmentError);
      }
    } catch (error) {
      console.error("[DEBUG] ERROR in handleSuccessfulPayment:", error);
    }
  } catch (error) {
    process.stdout.write(`[PAYMENT] Error: ${error.message}\n`);
  }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Important: For webhook endpoints, the raw body is needed
  let event;

  try {
    // If using express.raw middleware for this route
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Log received event
  console.log(`Webhook received: ${event.type}`);

  // Handle the event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    await handleSuccessfulPayment(paymentIntent);
  }

  // Return success response
  res.json({ received: true });
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Get order ID from metadata
    const orderId = paymentIntent.metadata.orderId;

    // If payment was successful, update the order
    if (paymentIntent.status === "succeeded") {
      const order = await Order.findById(orderId);
      if (order && order.status === "pending") {
        // Update the order status to 'paid'
        order.status = "paid";
        order.paymentId = paymentIntentId;
        order.deliveryStatus = "waiting_for_driver"; // Add this line
        order.statusHistory.push({                   // Add this block
          status: "paid",
          updatedBy: "payment_system",
          timestamp: new Date(),
        });
        await order.save();

        console.log(`Updated order ${orderId} status to paid`);

        // Update food sale quantity
        const foodSale = await FoodSale.findById(order.foodSale);
        if (foodSale) {
          foodSale.quantityAvailable -= order.quantity;
          await foodSale.save();
        }
        
        // ADD DRIVER ASSIGNMENT HERE
        console.log(`Calling driver assignment service for order ${orderId}...`);
        if (order.deliveryAddress?.lat && order.deliveryAddress?.lng) {
          try {
            const assignmentResult = await driverAssignmentService.assignDriverToOrder(
              orderId,
              order.deliveryAddress,
              "small",
              req.io  // Keep this in regular Express routes
            );
            
            console.log(`Driver assignment result:`, JSON.stringify(assignmentResult));
          } catch (assignmentError) {
            console.error(`Error assigning driver:`, assignmentError);
          }
        } else {
          console.log(`Order ${orderId} missing coordinates, cannot assign driver`);
        }
      }
    }

    return res.status(200).json({
      success: true,
      status: paymentIntent.status,
      orderId: orderId,
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking payment status",
      error: error.message,
    });
  }
};

// Add a cancel endpoint
exports.cancelPaymentIntent = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    // Cancel in Stripe
    await stripe.paymentIntents.cancel(paymentIntentId);

    // Update in database
    await PaymentIntent.findOneAndUpdate(
      { stripePaymentId: paymentIntentId },
      { status: "cancelled" }
    );

    return res.status(200).json({
      success: true,
      message: "Payment intent cancelled",
    });
  } catch (error) {
    console.error("Error cancelling payment intent:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel payment",
      error: error.message,
    });
  }
};
