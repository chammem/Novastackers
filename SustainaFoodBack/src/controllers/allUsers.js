const mongoose = require('mongoose');
const userModel = require("../models/userModel");
const bcrypt = require('bcryptjs');
const FoodItem = require("../models/foodItem");

//get User details by Id

async function getUserById(req,res){
    const {id} = req.params;
  try {
    const user = await userModel.findById(id);

    if(user){
      res.status(200).json(user);
    }
  }catch{
    res.status(400).json({
      message: err.message || err,
      error : true,
      success : false
  })
  }

}
async function getAssignedFoodForVolunteer(req,res){
  const { volunteerId } = req.params;

  try {
    const assignedFoods = await FoodItem.find({
      assignedVolunteer: volunteerId,
    }).sort({ created_at: -1 });

    res.status(200).json(assignedFoods);
  } catch (err) {
    console.error("Error fetching assigned food:", err);
    res.status(500).json({ message: "Error fetching assignments", error: err.message });
  }
};









async function getAllVolunteers(req,res){
    try {
      const { role } = req.query;

      const filter = role ? { role } : {}; // Only filter by role if provided
      const users = await userModel.find(filter).select('fullName email role'); // You can project only needed fields

      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users', error });
    }
}



async function allUsers(req,res) {
    try {
        console.log("userid",req.userId)

        const allUsers = await userModel.find()

        res.json({
            message : "All Users",
            data : allUsers,
            success : true,
            error : false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error : true,
            success : false
        })
    }
}


// Update user by ID 
async function updateUser(req, res) {
    try {
        const { fullName, phoneNumber, address, email, role } = req.body;
        let updateData = { fullName, phoneNumber, address, email };

        const updatedUser = await userModel.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error updating user' });
    }
}


async function updateLogedInUser(req, res) {
  const { userId } = req.params; 
  const updatedData = req.body; 
  
  console.log("🟢 updateLogedInUser endpoint hit");
  console.log("User ID:", userId);
  console.log("Update data:", updatedData);
  
  try {
    const updatedUser = await userModel.findByIdAndUpdate(userId, updatedData, {
      new: true, 
    });

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    // Return with consistent structure
    res.status(200).json({ 
      success: true, 
      data: updatedUser 
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update user", 
      error: error.message 
    });
  }
}

async function updateLogedInPassword(req,res){
    const {currentPassword,newPassword} = req.body;
    const {userId} = req.params;
    try {
        const user = await userModel.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
    
        const isMatch = await bcrypt.compare(currentPassword,user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
        user.password = newPassword;
        await user.save();
    
        res.status(200).json({ message: "Password changed successfully" });   
    } catch (error) {
        console.error("Error updating users Password:", error);
        res.status(500).json({ message: "Failed to update user", error: error.message }); 
    }


}

// Get a single user by ID
const getUser = async (req, res) => {
    try {
      const { id } = req.params;

  
      // Vérifier la validité de l'ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID invalide' });
      }
  
      const user = await userModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur :', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };
  
  

// Delete user by ID
async function deleteUser(req, res) {
    try {
      const deletedUser = await userModel.findByIdAndDelete(req.params.id);
      if (!deletedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Error deleting user" });
    }
  }

async function disableUser(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        // Fetch user
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Toggle isDisabled field
        user.isDisabled = !user.isDisabled;
        await user.save();

        res.status(200).json({
            message: `User ${user.isDisabled ? 'disabled' : 'enabled'} successfully.`,
            user
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

async function updateNgoProfile (req,res){
  console.log("🟢 updateNgoProfile endpoint hit");

  try {

    const userId = req.userId || req.body.userId || req.query.userId || req.params.id;
    const {mission,description,website,facebook,instagram,twitter,} = req.body;

    const updates = {mission,description,website,facebook,instagram,twitter,};

    if (req.file) {
      updates.logoUrl = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, updates, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "NGO profile updated", user: updatedUser });


  } catch (error) {
    console.error("Error updating NGO profile:", error);
    res.status(500).json({ message: "Failed to update NGO profile" });
  }


}

async function updateVolunteerAvailability (req, res){
  try {
    const userId = req.params.userId;
    const availabilityData = req.body;
    
    // Validate input
    if (!availabilityData || Object.keys(availabilityData).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No availability data provided" 
      });
    }
    
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Update availability
    user.availability = availabilityData;
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data: availabilityData
    });
  } catch (error) {
    console.error("Error updating volunteer availability:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating volunteer availability",
      error: error.message
    });
  }
};

async function getVolunteerAvailability(req, res){
  try {
    const userId = req.params.userId;
    
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Convert Map to object for API response
    const availability = user.availability ? Object.fromEntries(user.availability) : {};
    
    return res.status(200).json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error("Error fetching volunteer availability:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching volunteer availability",
      error: error.message
    });
  }
};




module.exports = {getVolunteerAvailability,updateVolunteerAvailability,updateNgoProfile,getAssignedFoodForVolunteer,getAllVolunteers,getUserById,allUsers,updateUser,getUser,deleteUser,disableUser,updateLogedInUser,updateLogedInPassword};