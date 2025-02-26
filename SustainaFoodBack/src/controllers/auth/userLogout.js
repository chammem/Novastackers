const userLogout = (req, res) => {
    res.clearCookie("token").json({ message: "Logged out successfully" });
  };
  
  module.exports = userLogout;