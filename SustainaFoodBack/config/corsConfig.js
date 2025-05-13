// Enhanced CORS configuration with improved header handling
module.exports = {
  origin: [
    'http://localhost:5173',
    'http://localhost:4173', 
    'https://sustainafood-frontend-1-0-116.onrender.com',
    /\.onrender\.com$/  // Allow all Render subdomains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours cache for preflight requests
  preflightContinue: false, // Properly handle preflight requests
  optionsSuccessStatus: 204 // Return 204 for OPTIONS requests
};
