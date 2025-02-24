const FoodItem = require("../../models/foodItem");
const userModel = require("../../models/userModel");
const UserModel = require("../../models/userModel");

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