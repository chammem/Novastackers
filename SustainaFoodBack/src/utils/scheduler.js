const cron = require('node-cron');
const mongoose = require('mongoose');
const Batch = require('../models/batch');
const FoodItem = require('../models/foodItem');
const Notification = require('../models/notification');

// Function to check and reset expired batch assignments
const checkExpiredBatchAssignments = async () => {
  try {
    console.log('Checking for expired batch assignments...');
    
    // Calculate the cutoff time (15 minutes ago)
    const cutoffTime = new Date(Date.now() - 15 * 60 * 1000);
    
    // Find batches that were requested more than 15 minutes ago and still pending
    const expiredBatches = await Batch.find({
      status: 'requested',
      assignmentStatus: 'pending',
      assignmentRequestedAt: { $lt: cutoffTime }
    });
    
    console.log(`Found ${expiredBatches.length} expired batch assignments`);
    
    // Reset each expired batch
    for (const batch of expiredBatches) {
      // Store volunteer ID for notification before resetting
      const volunteerId = batch.assignedVolunteer;
      
      // Reset batch
      batch.status = 'suggested';
      batch.assignmentStatus = null;
      batch.assignedVolunteer = null;
      batch.assignmentRequestedAt = null;
      await batch.save();
      
      // Reset food items
      await FoodItem.updateMany(
        { _id: { $in: batch.items } },
        {
          status: 'pending',
          assignmentStatus: null,
          assignedVolunteer: null
        }
      );
      
      // Notify the volunteer if we had one assigned
      if (volunteerId) {
        await Notification.create({
          user_id: volunteerId,
          message: `Your batch assignment has expired because you didn't respond within 15 minutes.`,
          type: 'status_update',
          read: false
        });
      }
      
      console.log(`Reset expired batch ${batch._id}`);
    }
  } catch (error) {
    console.error('Error checking expired batch assignments:', error);
  }
};

let scheduledTask;

const initScheduler = () => {
  scheduledTask = cron.schedule('*/15 * * * * *', checkExpiredBatchAssignments);
};

module.exports = {
  initScheduler,
  checkExpiredBatchAssignments,
  scheduledTask, // Export the task for testing
};