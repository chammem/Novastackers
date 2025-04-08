const mongoose = require('mongoose');

const foodDonationSchema = new mongoose.Schema({
    name:{type:String,required:false},
    imageUrl:{type:String,required:false},
    ngoId:{type:mongoose.Schema.Types.ObjectId,ref: 'User',required:false},
    foods:[{type:mongoose.Schema.Types.ObjectId, ref: 'FoodItem'}],
    location:{type:String,required:false},
    createdAt:{type:Date,default:Date.now},
    endingDate:{type:Date,required:false}, 
    description:{type:String,required:false},
    volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

}); 
const FoodDonation = mongoose.model('FoodDonation', foodDonationSchema);
module.exports = FoodDonation;