require("dotenv").config(); // Charger les variables d'environnement au début du fichier
const router = require("./src/routes/index");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { sendResetPasswordEmail } = require("./src/utils/sendMail");

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Routes
app.use("/api", router);

// Connexion à la base de données
const PORT = process.env.PORT || 8082;
mongoose
  .connect(process.env.MONGODB_URI, {
 
  })
  .then(() => {
    console.log("✅ Connecté à la base de données MongoDB");
    app.listen(PORT, () => {
      console.log(`✅ Serveur en cours d'exécution sur http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Erreur de connexion à la base de données :", error);
  });