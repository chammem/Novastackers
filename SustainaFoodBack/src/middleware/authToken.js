const jwt = require('jsonwebtoken');

async function authToken(req, res, next) {
  try {
    // First check for token in Authorization header
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      // Get token from Bearer header
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      // If not in header, try cookie
      token = req.cookies.token;
    }
    
    // If no token found in either place
    if (!token) {
      return res.status(401).json({
        message: "User not logged in", 
        error: true,
        code: "NO_TOKEN"
      });
    }

    // Verify token
    const decodedToken = await jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    req.userId = decodedToken._id; // Attach user ID to the request object
    next();
  } catch (err) {
    // More detailed error handling
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: "Your session has expired, please log in again",
        error: true,
        code: "TOKEN_EXPIRED"
      });
    }
    
    // Other token validation errors
    res.status(401).json({
      message: "Invalid authentication token",
      error: true,
      code: "INVALID_TOKEN"
    });
  }
}

module.exports = authToken;

