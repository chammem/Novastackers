const express = require('express');
const cors = require('cors');
const app = express();

// ...existing code...

// Update your CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',               // Local Vite dev server
    'http://localhost:4173',               // Local Vite preview
    'https://sustainafood-frontend-1-0-116.onrender.com', // Your deployed frontend
    /\.onrender\.com$/                     // Allow all Render subdomains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ...existing code...

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});