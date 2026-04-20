// src/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const c = require('../controllers/bookingController');

router.post('/bookings', c.createBooking);
router.get('/bookings', c.getAllBookings);
router.get('/bookings/:id', c.getBookingById);
router.patch('/bookings/:id/status', c.updateBookingStatus);

module.exports = router;
