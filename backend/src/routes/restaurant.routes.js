const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant.controller');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);

// Protected routes (Restaurant Owner)
router.post('/', authMiddleware, restaurantController.createRestaurant);
router.post('/products', authMiddleware, productController.createProduct);
router.put('/products/:id', authMiddleware, productController.updateProduct);
router.delete('/products/:id', authMiddleware, productController.deleteProduct);

module.exports = router;
