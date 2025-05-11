const mongoose = require('mongoose');

const foodDonationSchema = new mongoose.Schema({
    name:{type:String,required:false},
    imageUrl:{type:String,required:false},
    ngoId:{type:mongoose.Schema.Types.ObjectId,ref: 'User',required:false},
    foods:[{type:mongoose.Schema.Types.ObjectId, ref: 'FoodItem'}],
    createdAt:{type:Date,default:Date.now},
    endingDate:{type:Date,required:false}, 
    description:{type:String,required:false},
    volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    impactScore: {
        type: Number,
        default: 0
    }
}); 

// Make sure all donation queries include impactScore
foodDonationSchema.pre(/^find/, function(next) {
  // This ensures the impactScore is always computed if not available
  this.populate('foods');
  next();
});

// Add a hook to update impact score whenever a food item is added to foods array
foodDonationSchema.pre('save', async function(next) {
  // Only run this logic if the foods array was modified
  if (!this.isModified('foods')) {
    return next();
  }
  
  try {
    // Calculate a basic impact score based on the number of food items
    const itemCount = this.foods.length;
    
    // Simple calculation to ensure we have at least some score
    // Proper calculation will happen in forceUpdateMetrics
    this.impactScore = Math.min(100, itemCount * 5);
    
    console.log(`Basic impact score updated to ${this.impactScore} for donation ${this._id}`);
  } catch (error) {
    console.error("Error updating impact score in pre-save hook:", error);
  }
  
  next();
});

const FoodDonation = mongoose.model('FoodDonation', foodDonationSchema);
module.exports = FoodDonation;