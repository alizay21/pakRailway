const Train = require('../models/Train');
const Seat = require('../models/Seat');

const searchTrains = async (req, res) => {
  try {
    const { from, to, date } = req.query;
    
    let query = { status: 'Active' };
    if (from) query.from = from;
    if (to) query.to = to;
    if (date) {
      const searchDate = new Date(date);
      // Search for trains on that specific date
      query.date = {
        $gte: new Date(searchDate.setHours(0,0,0,0)),
        $lt: new Date(searchDate.setHours(23,59,59,999))
      };
    }

    const trains = await Train.find(query).sort({ departureTime: 1 });

    const currentTime = new Date();
    const validTrains = trains.filter(train => {
      const trainDate = new Date(train.date);
      const [hours, minutes] = train.departureTime.split(':');
      trainDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return trainDate >= currentTime;
    });

    res.json({ success: true, trains: validTrains });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTrainById = async (req, res) => {
  try {
    const train = await Train.findById(req.params.trainId);
    if (train) {
      res.json({ success: true, train });
    } else {
      res.status(404).json({ success: false, message: 'Train not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTrainSeats = async (req, res) => {
  try {
    const seats = await Seat.find({ trainId: req.params.trainId }).sort({ seatNumber: 1 });
    res.json({ success: true, seats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { searchTrains, getTrainById, getTrainSeats };
