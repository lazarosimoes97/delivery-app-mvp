const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes are protected
router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.updatePassword);
router.get('/favorites', userController.getFavorites);
router.post('/favorites/:restaurantId', userController.toggleFavorite);

module.exports = router;
