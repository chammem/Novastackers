const FoodItem = require("../../models/foodItem");
const User = require("../../models/userModel");
const Notification = require("../../models/notification");

exports.addFoodItem = async (req,res) => {

    const {foodInput} = req.body;
    
    try {
        
        const newFood = new FoodItem(foodInput);
        const savedFood = await newFood.save();
        return res.status(200).json({"message":"food saved succesffully",savedFood});
    } catch (error) {
        return  res.status(404).json({"error":error})
    }

}

exports.deleteFoodItem = async (req,res) => {
    const {foodId} = req.params;

    try {
        const deletedFoodItem = await FoodItem.deleteOne({_id:foodId});

        if(deletedFoodItem === 0){
            return res.status(404).json({ message: "Food item not found" });  
        }
        return res.status(200).json({"message":"food deleted succesffully",deletedFoodItem});
    } catch (error) {
        return res.status(404).json({"error":error})
    }
}

exports.startPickup = async (req, res) => {
    const { foodId } = req.params;
    try {
      const food = await FoodItem.findById(foodId).populate('buisiness_id');
      if (!food) return res.status(404).json({ message: "Food item not found" });
  
      // Generate pickup code
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      food.pickupCode = code;
      food.pickupCodeGeneratedAt = new Date();
      await food.save();
  
      // Send notification to business
      const businessId = food.buisiness_id._id;
  
      const notification = await Notification.create({
        user_id: businessId,
        message: `Volunteer assigned to pick up food "${food.name}". Pickup code: ${code}`,
        type: 'pickup_code',
      });
  
      // Emit to business via socket
      if (req.io) {
        req.io.to(businessId.toString()).emit('new-notification', notification);
      }
  
      res.status(200).json({ message: "Pickup started and code sent" });
    } catch (error) {
      console.error("startPickup error:", error);
      res.status(500).json({ message: "Error starting pickup", error: error.message });
    }
  };
  
  exports.verifyPickupCode = async (req, res) => {
    const { foodId } = req.params;
    const { code } = req.body;
  
    try {
      const food = await FoodItem.findById(foodId).populate("buisiness_id assignedVolunteer");
      if (!food) return res.status(404).json({ message: "Food item not found" });
  
      // 1. Check code
      if (food.pickupCode !== code) {
        return res.status(400).json({ message: "Invalid pickup code" });
      }
  
      // 2. Confirm both sides at once
      food.volunteerPickedUpAt = new Date();
      food.supermarketConfirmedAt = new Date();
      food.status = "picked-up";
  
      await food.save();
  
      // 3. Create notification (optional)
      const notification = await Notification.create({
        user_id: food.buisiness_id._id,
        message: `Food item "${food.name}" was picked up by volunteer.`,
        type: "status_update",
        read: false
      });
  
      // 4. Emit notification
      req.io.to(food.buisiness_id._id.toString()).emit("new-notification", notification);
  
      res.status(200).json({ message: "Pickup confirmed successfully", food });
    } catch (error) {
      console.error("verifyPickupCode error:", error);
      res.status(500).json({ message: "Error verifying code", error: error.message });
    }
  };

  exports.startDelivery = async (req, res) => {
    const { foodId } = req.params;
    try {
      const food = await FoodItem.findById(foodId).populate('buisiness_id').populate("donationId");;
  
      if (!food) return res.status(404).json({ message: "Food item not found" });
  
      // Generate delivery code
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      food.deliveryCode = code;
      food.deliveryCodeGeneratedAt = new Date();
      await food.save();
  
      // Send code to NGO (assuming buisiness_id is an NGO or you have a separate NGO reference)
      const ngoId = food.donationId.ngoId;
      console.log(ngoId);
      console.log(food.donationId);
      const notification = await Notification.create({
        user_id: ngoId,
        message: `Volunteer is delivering food "${food.name}". Delivery code: ${code}`,
        type: 'delivery_code',
      });
  
      // Emit to NGO via socket
      if (req.io) {
        req.io.to(ngoId.toString()).emit('new-notification', notification);
      }
  
      res.status(200).json({ message: "Delivery code generated and sent to NGO" });
    } catch (error) {
      console.error("startDelivery error:", error);
      res.status(500).json({ message: "Error starting delivery", error: error.message });
    }
  };

  exports.verifyDeliveryCode = async (req, res) => {
    const { foodId } = req.params;
    const { code } = req.body;
  
    try {
      const food = await FoodItem.findById(foodId).populate("buisiness_id assignedVolunteer").populate("donationId");;
      if (!food) return res.status(404).json({ message: "Food item not found" });
  
      if (food.deliveryCode !== code) {
        return res.status(400).json({ message: "Invalid delivery code" });
      }
  
      food.deliveryConfirmedAt = new Date();
      food.status = "delivered";
      await food.save();
  
      // Notify NGO
      const notification = await Notification.create({
        user_id: food.donationId.ngoId,
        message: `Food "${food.name}" has been successfully delivered by the volunteer.`,
        type: "status_update",
        read: false
      });
  
      req.io.to(food.buisiness_id._id.toString()).emit("new-notification", notification);
  
      res.status(200).json({ message: "Delivery confirmed", food });
    } catch (error) {
      console.error("verifyDeliveryCode error:", error);
      res.status(500).json({ message: "Error confirming delivery", error: error.message });
    }
  };
  
  
  
  

