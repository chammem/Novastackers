// Update the CORS configuration to include your production frontend URL

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000',
    'https://sustainafood-frontend-1-0-116.onrender.com',
    'https://sustainafood-frontend.onrender.com'
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
  ],
};

module.exports = corsOptions;
