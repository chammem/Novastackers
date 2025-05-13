const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://sustainafood-frontend-1-0-116.onrender.com',
    'https://sustainafood-frontend.onrender.com',
    /\.onrender\.com$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

module.exports = corsOptions;
