const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Create PIX payment
router.post('/pix', authMiddleware, paymentController.createPixPayment);

// Create card payment
router.post('/card', authMiddleware, paymentController.createCardPayment);

// Webhook for payment notifications
router.post('/webhook', paymentController.webhook);

// Get payment status
router.get('/:orderId/status', authMiddleware, paymentController.getPaymentStatus);

module.exports = router;
