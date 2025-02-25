require("dotenv").config(); // Charger les variables d'environnement au début du fichier
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const router = require("./src/routes/index");


const app = express();

// Configuration CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL , // Assure-toi que la bonne URL est utilisée
  methods: ["GET", "POST", "PUT", "DELETE"], // Ajouter les méthodes HTTP nécessaires
  allowedHeaders: ["Content-Type", "Authorization"], // Ajouter les en-têtes autorisés
  credentials: true, // Assurer que les cookies sont envoyés avec les requêtes
};

// Middleware
app.use(cors(corsOptions)); // Utilisation de la configuration CORS
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Routes
app.use("/api", router);

// Connexion à la base de données MongoDB
const PORT = process.env.PORT || 8082;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connecté à la base de données MongoDB");
    app.listen(PORT, () => {
      console.log(`✅ Serveur en cours d'exécution sur http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Erreur de connexion à la base de données :", error);
  });
