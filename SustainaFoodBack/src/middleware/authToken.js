const jwt = require('jsonwebtoken');

async function authToken(req, res, next) {
  try {
    // Check for token in cookies first
    let token = req.cookies?.token;
    
    // If no token in cookies, check Authorization header (Bearer token)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // If still no token, return 401
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
    // Handle specific JWT errors with clear messages
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

