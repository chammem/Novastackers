// Dans votre fichier de configuration CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8082', 
  'https://sustainafood-frontend.onrender.com',
  'https://sustainafood-backend-fzme.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (comme Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) { // Fixed missing closing parenthesis here
      callback(null, true);
    } else {
      // Vérifier les sous-domaines Render
      if (origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
  exposedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
  maxAge: 86400
};

module.exports = corsOptions;
