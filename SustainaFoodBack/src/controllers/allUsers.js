const mongoose = require('mongoose');
const userModel = require("../models/userModel");

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
        const { fullName, phoneNumber, address, email, role,facebook } = req.body;
        let updateData = { fullName, phoneNumber, address, email, role ,facebook};

        const updatedUser = await userModel.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating user');
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
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting user');
    }
}

async function disableUser(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID invalide' });
        }

        const updatedUser = await userModel.findByIdAndUpdate(id, { isDisabled: true }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.clearCookie("token").status(200).json({
            message: 'Utilisateur désactivé avec succès. Déconnexion forcée.',
            user: updatedUser
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}



module.exports = {allUsers,updateUser,getUser,deleteUser,disableUser};