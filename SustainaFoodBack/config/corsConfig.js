// Enhanced CORS configuration with better header handling

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000',
    'https://sustainafood-frontend-1-0-116.onrender.com',
    'https://sustainafood-frontend.onrender.com',
    // Allow any Render.com domain in development
    /\.onrender\.com$/
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content",
    "Accept",
    "Content-Type",
    "Authorization",
    "Cache-Control",
    "X-Auth-Token"
  ],
  exposedHeaders: [
    "Authorization",
    "Content-Type"
  ],
  // Increase preflight request cache time
  maxAge: 86400, // 24 hours
  // Add special handler for auth-related endpoints
  preflightContinue: false,
  optionsSuccessStatus: 204
};

module.exports = corsOptions;
