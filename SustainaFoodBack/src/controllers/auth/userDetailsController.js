const User = require('../../models/userModel');

const getUserDetails = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming auth middleware sets req.user
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { getUserDetails };
