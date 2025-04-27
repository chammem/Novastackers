const express = require('express');
const router = express.Router();
const foodSaleController = require('../controllers/sales/foodSaleController');
const upload = require('../middleware/upload');

// Existing routes
router.get('/', foodSaleController.getAllFoodSales);
router.post('/', upload.single('image'), foodSaleController.createFoodSale);

// New routes for restaurant details
router.get('/restaurant/:restaurantId', foodSaleController.getRestaurantDetails);
router.get('/restaurant/:restaurantId/items', foodSaleController.getRestaurantFoodSales);

// Route to get food sales by role (restaurant or supermarket)
router.get('/role/:role', foodSaleController.getFoodSalesByRole);

// Make sure you have this route defined:
router.get('/:id', foodSaleController.getFoodSaleById);

// Route to upload an image for food sales
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }
    console.log('Uploaded file:', req.file); // Log the uploaded file for debugging

    // Return the file path
    return res.status(200).json({
      success: true,
      filePath: `/uploads/${req.file.filename}`,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while uploading file',
      error: error.message,
    });
  }
});

module.exports = router;