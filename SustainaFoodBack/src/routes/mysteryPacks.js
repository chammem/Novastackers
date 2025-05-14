const express = require('express');
const mysteryPacksRouter = express.Router();
const MysteryPackController = require('../controllers/MysteryPackController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Get all mystery packs
mysteryPacksRouter.get('/', MysteryPackController.getAllMysteryPacks);

// Create new mystery pack
mysteryPacksRouter.post('/new', upload.single('image'), MysteryPackController.createMysteryPack);

// Update mystery pack
mysteryPacksRouter.patch('/:id', MysteryPackController.updateMysteryPack);

// Reserve mystery pack
mysteryPacksRouter.post('/:id/reserve', MysteryPackController.reserveMysteryPack);

module.exports = mysteryPacksRouter;
