const express = require('express');
const router = express.Router();
const { getDashboardStats, addTrain, editTrain, deleteTrain, getAllBookings } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', protect, admin, getDashboardStats);
router.post('/trains', protect, admin, addTrain);
router.put('/trains/:trainId', protect, admin, editTrain);
router.delete('/trains/:trainId', protect, admin, deleteTrain);
router.get('/bookings', protect, admin, getAllBookings);

module.exports = router;
