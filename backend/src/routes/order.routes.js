const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/restaurant/:restaurantId', orderController.getRestaurantOrders);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
