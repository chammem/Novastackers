const MysteryPack = require('../models/MysteryPack');

const createMysteryPack = async (req, res) => {
  try {
    const { name, description, originalPrice, discountedPrice, pickupTime, location, category, availableQuantity, restaurant } = req.body;
    
    // Vérifier que tous les champs sont remplis
    if (!name || !description || !originalPrice || !discountedPrice || !availableQuantity || !restaurant) {
      return res.status(400).json({ message: 'Tous les champs requis doivent être remplis.' });
    }

    const newPack = new MysteryPack({
      name,
      description,
      originalPrice,
      discountedPrice,
      pickupTime,
      location,
      category,
      availableQuantity,
      restaurant,
      imageUrl: req.file ? req.file.path : null, // Si une image est téléchargée, l'ajouter
    });

    await newPack.save();
    res.status(201).json(newPack);
  } catch (error) {
    console.error('Erreur lors de la création du mystery pack:', error);
    res.status(500).json({ message: 'Erreur lors de la création du mystery pack' });
  }
};

const getAllMysteryPacks = async (req, res) => {
  try {
    const packs = await MysteryPack.find();
    res.status(200).json(packs);
  } catch (error) {
    console.error('Erreur lors de la récupération des packs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des packs' });
  }
};

const updateMysteryPack = async (req, res) => {
  // Logique pour mettre à jour un MysteryPack (similaire à la création, mais avec un ID existant)
};

const reserveMysteryPack = async (req, res) => {
  // Logique pour réserver un MysteryPack
};

module.exports = {
  createMysteryPack,
  getAllMysteryPacks,
  updateMysteryPack,
  reserveMysteryPack,
};
