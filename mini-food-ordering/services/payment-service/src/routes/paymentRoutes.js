// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/payments', paymentController.processPayment);
router.get('/payments', paymentController.getAllPayments);
router.get('/notifications', paymentController.getAllNotifications);

module.exports = router;
