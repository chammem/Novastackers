const multer = require('multer');
const path = require('path');
const MysteryPack = require('../models/mysterypack'); // Fixed casing
const FoodSale = require('../models/sales/FoodSaleItem');

// Configuration de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers JPG, JPEG et PNG sont autorisés'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: fileFilter
}).single('image');

const createMysteryPack = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      originalPrice, 
      discountedPrice, 
      pickupTime, 
      location, 
      category, 
      availableQuantity, 
      restaurant, 
      selectedItems 
    } = req.body;

    // Validation améliorée
    if (!name?.trim() || !description?.trim() || !restaurant?.trim()) {
      return res.status(400).json({ 
        message: 'Les champs textuels ne peuvent pas être vides' 
      });
    }

    // Validation des prix
    const origPrice = parseFloat(originalPrice);
    const discPrice = parseFloat(discountedPrice);
    const quantity = parseInt(availableQuantity);

    if (isNaN(origPrice) || isNaN(discPrice) || isNaN(quantity)) {
      return res.status(400).json({ 
        message: 'Les prix et la quantité doivent être des nombres valides' 
      });
    }

    if (discPrice >= origPrice) {
      return res.status(400).json({ 
        message: 'Le prix réduit doit être inférieur au prix original' 
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({ 
        message: 'La quantité doit être supérieure à 0' 
      });
    }

    // Validation des articles sélectionnés
    let itemsArray = [];
    if (selectedItems) {
      try {
        itemsArray = JSON.parse(selectedItems);
        // Vérifier que les articles existent
        const itemIds = itemsArray.map(item => item._id);
        const existingItems = await FoodSale.find({
          _id: { $in: itemIds }
        });
        console.log('Articles existants:', existingItems);
        
        if (existingItems.length !== itemIds.length) {
          return res.status(400).json({ 
            message: 'Certains articles sélectionnés n\'existent pas' 
          });
        }
      } catch (err) {
        return res.status(400).json({ 
          message: 'Format invalide pour les articles sélectionnés' 
        });
      }
    }

    // Sauvegarde de l'image
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const newPack = new MysteryPack({
        name: name.trim(),
        description: description.trim(),
        originalPrice: origPrice,
        discountedPrice: discPrice,
        pickupTime: pickupTime?.trim(),
        location: location?.trim(),
        category: category?.trim() || 'Lunch',
        availableQuantity: quantity,
        restaurant: restaurant.trim(),
        selectedItems: itemsArray.map(item => item._id),
        imageUrl: req.file?.path || null,
      });

      const savedPack = await newPack.save();
      
      // Populate les articles sélectionnés avant de renvoyer
      const populatedPack = await MysteryPack.findById(savedPack._id)
        .populate('selectedItems');

      console.log('Mystery pack créé avec succès:', savedPack._id);
      res.status(201).json(populatedPack);
    });

  } catch (error) {
    console.error('Erreur détaillée lors de la création:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création du mystery pack',
      error: error.message 
    });
  }
};

const getAllMysteryPacks = async (req, res) => {
  try {
    const packs = await MysteryPack.find().populate('selectedItems');
    res.status(200).json(packs);
  } catch (error) {
    console.error('Erreur lors de la récupération des packs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des packs' });
  }
};

const updateMysteryPack = async (req, res) => {
  try {
    const { packId } = req.params;
    const updatedData = req.body;

    const updatedPack = await MysteryPack.findByIdAndUpdate(packId, updatedData, { new: true });
    
    if (!updatedPack) {
      return res.status(404).json({ message: 'Mystery pack non trouvé' });
    }

    res.status(200).json(updatedPack);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du pack:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du mystery pack' });
  }
};

const reserveMysteryPack = async (req, res) => {
  try {
    const { packId } = req.params;
    const pack = await MysteryPack.findById(packId);

    if (!pack) {
      return res.status(404).json({ message: 'Mystery pack non trouvé' });
    }

    if (pack.availableQuantity <= 0) {
      return res.status(400).json({ message: 'Aucune quantité disponible pour ce pack' });
    }

    // Réserver le pack (réduire la quantité)
    pack.availableQuantity -= 1;
    await pack.save();

    res.status(200).json({ message: 'Réservation réussie', pack });
  } catch (error) {
    console.error('Erreur lors de la réservation du pack:', error);
    res.status(500).json({ message: 'Erreur lors de la réservation du mystery pack' });
  }
};

const deleteMysteryPack = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPack = await MysteryPack.findByIdAndDelete(id);
    
    if (!deletedPack) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mystery pack not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mystery pack deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting mystery pack:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting mystery pack' 
    });
  }
};

module.exports = {
  createMysteryPack,
  getAllMysteryPacks,
  updateMysteryPack,
  reserveMysteryPack,
  deleteMysteryPack,
};
