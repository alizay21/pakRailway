const express = require('express');
const router = express.Router();
const { searchTrains, getTrainById, getTrainSeats } = require('../controllers/trainController');

router.get('/search', searchTrains);
router.get('/:trainId', getTrainById);
router.get('/:trainId/seats', getTrainSeats);

module.exports = router;
