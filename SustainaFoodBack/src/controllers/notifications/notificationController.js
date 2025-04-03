const FoodDonation = require("../../models/foodDonation");
const FoodItem = require("../../models/foodItem");
const UserModel = require("../../models/userModel");
const Notification = require("../../models/notification");


exports.getNotifications = async(req,res)=> {
    const {userId} = req.query;

    try {
        const notifications = await Notification.find({user_id : userId}).sort({createdAt: -1});
        res.status(200).json({
            message: "Notifications fetched successfully",
            data: notifications,
            success: true,
            error: false
          });
              
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({
            message: "Error fetching notifications",
            error: error.message || error,
        });
    }
}

exports.deleteNotification = async (req, res) => {
    try {
      await Notification.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Notification deleted" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete notification", error: err.message });
    }
  };
  
  // DELETE /notification/clear-all/:userId
  exports.clearAllNotifications = async (req, res) => {
    try {
      await Notification.deleteMany({ user_id: req.params.userId });
      res.status(200).json({ message: "All notifications cleared" });
    } catch (err) {
      res.status(500).json({ message: "Failed to clear notifications", error: err.message });
    }
  };