const Order = require('../models/sales/Order');
const User = require('../models/userModel');
const Notification = require('../models/notification');
const driverAssignmentService = require('./driverAssignmentService');

// Timeout duration in milliseconds (2 minutes = 120000ms)
const ASSIGNMENT_TIMEOUT = 120000;

// Map to store timers for each order assignment
const assignmentTimers = new Map();

/**
 * Start a timeout for driver assignment
 * @param {string} orderId - Order ID that was assigned
 * @param {string} driverId - Driver ID that received the assignment
 * @param {object} io - Socket.io instance for notifications
 */
const startAssignmentTimeout = (orderId, driverId, io) => {
  // Cancel any existing timer for this order
  if (assignmentTimers.has(orderId)) {
    clearTimeout(assignmentTimers.get(orderId));
  }
  
  console.log(`Starting ${ASSIGNMENT_TIMEOUT/1000} second timer for order ${orderId} assigned to driver ${driverId}`);
  
  // Create new timer
  const timerId = setTimeout(async () => {
    try {
      // Check if the order is still assigned to this driver and in pending state
      const order = await Order.findById(orderId);
      
      if (!order) {
        console.log(`Order ${orderId} not found, can't process timeout`);
        return;
      }
      
      if (!order.assignedDriver || 
          order.assignedDriver.toString() !== driverId ||
          order.deliveryStatus !== 'driver_assigned') {
        console.log(`Order ${orderId} is no longer assigned to driver ${driverId} or status changed`);
        return;
      }
      
      console.log(`Assignment timeout for order ${orderId}. Driver ${driverId} did not respond in time`);
      
      // Reset order status
      order.deliveryStatus = 'waiting_for_driver';
      order.assignedDriver = null;
      order.statusHistory.push({
        status: 'driver_timeout',
        updatedBy: 'system',
        timestamp: new Date()
      });
      await order.save();
      
      // Update driver status
      await User.findByIdAndUpdate(driverId, { 
        status: 'available',
        $inc: { activeDeliveries: -1 } 
      });
      
      // Notify driver about timeout
      const driverNotification = await Notification.create({
        user_id: driverId,
        message: `You missed a delivery assignment because you didn't respond in time.`,
        type: 'assignment_timeout',
        read: false
      });
      
      if (io) {
        io.to(driverId.toString()).emit('new-notification', driverNotification);
      }
      
      // Try to reassign the order
      console.log(`Attempting to reassign order ${orderId} after timeout`);
      const assignResult = await driverAssignmentService.assignDriverToOrder(
        orderId,
        order.deliveryAddress,
        'small'
      );
      
      console.log(`Reassignment result:`, assignResult);
      
    } catch (error) {
      console.error(`Error handling assignment timeout for order ${orderId}:`, error);
    } finally {
      // Clear the timer from the map
      assignmentTimers.delete(orderId);
    }
  }, ASSIGNMENT_TIMEOUT);
  
  // Store timer ID
  assignmentTimers.set(orderId, timerId);
};

/**
 * Cancel timeout for an order assignment
 * @param {string} orderId - Order ID to cancel timeout for
 */
const cancelAssignmentTimeout = (orderId) => {
  if (assignmentTimers.has(orderId)) {
    console.log(`Cancelling timeout for order ${orderId}`);
    clearTimeout(assignmentTimers.get(orderId));
    assignmentTimers.delete(orderId);
  }
};

module.exports = {
  startAssignmentTimeout,
  cancelAssignmentTimeout
};