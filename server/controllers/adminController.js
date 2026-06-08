const Train = require('../models/Train');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Seat = require('../models/Seat');

const getDashboardStats = async (req, res) => {
  try {
    const totalTrains = await Train.countDocuments();
    
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const totalBookingsToday = await Booking.countDocuments({ createdAt: { $gte: startOfToday } });
    
    const allBookings = await Booking.find({ paymentStatus: 'Paid' });
    const totalRevenue = allBookings.reduce((acc, curr) => acc + curr.totalFare, 0);
    
    const activeUsers = await User.countDocuments({ role: 'passenger' });

    res.json({
      success: true,
      stats: { totalTrains, totalBookingsToday, totalRevenue, activeUsers }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addTrain = async (req, res) => {
  try {
    const { trainNumber, trainName, from, to, departureTime, arrivalTime, duration, date, totalSeats, fare, class: trainClass } = req.body;

    const trainExists = await Train.findOne({ trainNumber });
    if (trainExists) {
      return res.status(400).json({ success: false, message: 'Train number already exists' });
    }

    const train = await Train.create({
      trainNumber, trainName, from, to, departureTime, arrivalTime, duration, date, totalSeats, availableSeats: totalSeats, fare, class: trainClass
    });

    // Auto-generate seats
    const seats = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    for (let i = 0; i < totalSeats; i++) {
        let row = rows[i % rows.length];
        let num = Math.floor(i / rows.length) + 1;
        seats.push({
            trainId: train._id,
            seatNumber: `${row}${num}`
        });
    }

    await Seat.insertMany(seats);

    res.status(201).json({ success: true, train });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const editTrain = async (req, res) => {
  try {
    const train = await Train.findById(req.params.trainId);
    if (!train) {
      return res.status(404).json({ success: false, message: 'Train not found' });
    }

    const { totalSeats } = req.body;
    let newAvailableSeats = train.availableSeats;

    if (totalSeats !== undefined && Number(totalSeats) !== train.totalSeats) {
      const difference = Number(totalSeats) - train.totalSeats;
      
      if (difference < 0) {
        // Decreasing seats
        const bookedSeatsCount = await Seat.countDocuments({ trainId: train._id, isBooked: true });
        if (Number(totalSeats) < bookedSeatsCount) {
          return res.status(400).json({ success: false, message: `Cannot reduce total seats below ${bookedSeatsCount} (already booked)` });
        }
        
        const unbookedSeats = await Seat.find({ trainId: train._id, isBooked: false }).sort({ _id: -1 }).limit(Math.abs(difference));
        const seatsToDelete = unbookedSeats.map(s => s._id);
        await Seat.deleteMany({ _id: { $in: seatsToDelete } });
        
        newAvailableSeats = train.availableSeats + difference;
      } else {
        // Increasing seats
        const seatsToAdd = [];
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const allSeats = await Seat.find({ trainId: train._id }).select('seatNumber');
        const existingSeatNumbers = new Set(allSeats.map(s => s.seatNumber));
        
        let addedCount = 0;
        let i = 0;
        while(addedCount < difference) {
            let row = rows[i % rows.length];
            let num = Math.floor(i / rows.length) + 1;
            let sn = `${row}${num}`;
            if(!existingSeatNumbers.has(sn)) {
                seatsToAdd.push({ trainId: train._id, seatNumber: sn });
                existingSeatNumbers.add(sn);
                addedCount++;
            }
            i++;
            if(i > 20000) break; // safety
        }

        if (seatsToAdd.length > 0) {
          await Seat.insertMany(seatsToAdd);
        }
        
        newAvailableSeats = train.availableSeats + difference;
      }
    }

    const updateData = { ...req.body };
    if (totalSeats !== undefined) {
      updateData.availableSeats = newAvailableSeats;
    }

    const updatedTrain = await Train.findByIdAndUpdate(req.params.trainId, updateData, { new: true });
    res.json({ success: true, train: updatedTrain });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTrain = async (req, res) => {
  try {
    const train = await Train.findById(req.params.trainId);
    if (!train) {
      return res.status(404).json({ success: false, message: 'Train not found' });
    }
    await Seat.deleteMany({ trainId: train._id });
    await Booking.deleteMany({ trainId: train._id });
    await Train.findByIdAndDelete(req.params.trainId);
    res.json({ success: true, message: 'Train removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('trainId userId').sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats, addTrain, editTrain, deleteTrain, getAllBookings };
