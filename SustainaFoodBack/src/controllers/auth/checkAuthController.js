const jwt = require('jsonwebtoken');

const checkAuth = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        isAuthenticated: false,
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    res.json({ 
      isAuthenticated: true,
      user: decoded 
    });
  } catch (error) {
    res.status(401).json({ 
      isAuthenticated: false,
      message: 'Invalid token' 
    });
  }
};

module.exports = { checkAuth };
