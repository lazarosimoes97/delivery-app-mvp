const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Create payment preference
router.post('/create', authMiddleware, paymentController.createPayment);

// Webhook for payment notifications
router.post('/webhook', paymentController.webhook);

// Get payment status
router.get('/:orderId/status', authMiddleware, paymentController.getPaymentStatus);

module.exports = router;
