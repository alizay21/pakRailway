const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, cancelBooking, trackPNR } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.put('/:bookingId/cancel', protect, cancelBooking);
router.get('/track/:pnrNumber', trackPNR); // Using /track prefix to avoid conflict with other routes

module.exports = router;
