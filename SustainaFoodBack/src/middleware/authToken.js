const jwt = require('jsonwebtoken')
async function authToken(req,res,next) {
   try {
        const token = req.cookies?.token;
        if (!token) {
          return res.status(401).json({ message: "User not logged in", error: true });
        }
    
        const decodedToken = await jwt.verify(token, process.env.TOKEN_SECRET_KEY);
        req.userId = decodedToken._id; // Attach user ID to the request object
        next();
      } catch (err) {
        res.status(401).json({
          message: err.message || "Invalid token",
          error: true,
          success: false,
        });
      }
    }
module.exports = authToken;
    
