const express = require('express');
const router = express.Router();
// Mettre à jour le chemin d'importation pour qu'il pointe vers le bon fichier
const donationController = require('../controllers/donations/donationController');

// Import multer pour le traitement des images
const multer = require('multer');
const path = require('path');

// Configuration de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Assurez-vous que cette route est correctement configurée
router.put('/update/:id', upload.fields([{ name: 'image', maxCount: 1 }]), donationController.updateDonation);

// Ajoutez cette route en plus de celle existante pour la rendre compatible avec le frontend
router.put('/updateDonation/:id', upload.fields([{ name: 'image', maxCount: 1 }]), donationController.updateDonation);

router.get('/get-all-donations', donationController.getAllDonations);
router.post('/create-donation', donationController.createDonation);
router.delete('/deleteDonation/:id', donationController.deleteDonation);

module.exports = router;