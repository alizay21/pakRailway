const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Train = require('../models/Train');
const Seat = require('../models/Seat');

exports.createBooking = async (req, res) => {
  try {
    const { trainId, seatNumbers, passengerDetails } = req.body

    // 1. Check all required fields
    if (!trainId || !seatNumbers || !passengerDetails) {
      return res.status(400).json({ success: false, message: 'Train, seats, and passenger details are required' })
    }

    // 2. Seat numbers must be an array and not empty
    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one seat' })
    }

    // 3. Passenger details count must match seat count
    if (passengerDetails.length !== seatNumbers.length) {
      return res.status(400).json({ success: false, message: 'Passenger details must match number of seats selected' })
    }

    // 4. Validate each passenger's details
    for (let i = 0; i < passengerDetails.length; i++) {
      const p = passengerDetails[i]

      if (!p.name || p.name.trim().length < 3) {
        return res.status(400).json({ success: false, message: `Passenger ${i + 1}: Name must be at least 3 characters` })
      }

      if (!p.age || p.age < 1 || p.age > 120) {
        return res.status(400).json({ success: false, message: `Passenger ${i + 1}: Please enter a valid age` })
      }

      if (!p.gender || !['Male', 'Female', 'Other'].includes(p.gender)) {
        return res.status(400).json({ success: false, message: `Passenger ${i + 1}: Please select a valid gender` })
      }

      if (!p.cnic || !/^\d{13}$/.test(p.cnic)) {
        return res.status(400).json({ success: false, message: `Passenger ${i + 1}: CNIC must be exactly 13 digits` })
      }
    }

    // 5. Check train exists
    const train = await Train.findById(trainId)
    if (!train) {
      return res.status(404).json({ success: false, message: 'Train not found' })
    }

    // 6. Check train is not cancelled
    if (train.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'This train has been cancelled' })
    }

    // 7. Check train date is not in the past
    const trainDate = new Date(train.date);
    const [hours, minutes] = train.departureTime.split(':');
    trainDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    if (trainDate < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot book tickets for a past train' })
    }

    // 8. ATOMIC seat availability check (prevents double booking)
    const seats = await Seat.find({
      trainId,
      seatNumber: { $in: seatNumbers },
    })

    if (seats.length !== seatNumbers.length) {
      return res.status(400).json({ success: false, message: 'One or more selected seats do not exist' })
    }

    const alreadyBooked = seats.filter(s => s.isBooked)
    if (alreadyBooked.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats already booked: ${alreadyBooked.map(s => s.seatNumber).join(', ')}. Please re-select.`,
      })
    }

    // 9. Calculate total fare
    const totalFare = train.fare * seatNumbers.length

    // 10. Generate unique PNR
    const pnrNumber = `PKR-2026-${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 100)}`

    // 11. Create booking
    const booking = await Booking.create([{
      userId: req.user.id,
      trainId,
      seatNumbers,
      passengerDetails,
      totalFare,
      pnrNumber,
      paymentStatus: 'Pending',
      bookingStatus: 'Pending',
      bookingDate: new Date(),
    }])

    // 12. Mark seats as booked
    await Seat.updateMany(
      { trainId, seatNumber: { $in: seatNumbers } },
      { isBooked: true, bookedBy: req.user.id, bookingId: booking[0]._id }
    )

    // 13. Decrement available seats on train
    await Train.findByIdAndUpdate(
      trainId,
      { $inc: { availableSeats: -seatNumbers.length } }
    )

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking[0],
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate('trainId').sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check booking belongs to this user
    if (booking.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }
    // Check not already cancelled
    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' })
    }
    // Check journey not in the past
    const trainToCancel = await Train.findById(booking.trainId);
    if (!trainToCancel) {
        throw new Error('Train associated with this booking not found');
    }
    
    const trainToCancelDate = new Date(trainToCancel.date);
    const [cancelHours, cancelMinutes] = trainToCancel.departureTime.split(':');
    trainToCancelDate.setHours(parseInt(cancelHours, 10), parseInt(cancelMinutes, 10), 0, 0);

    if (trainToCancelDate < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot cancel a booking for a past journey' })
    }

    // 1. Release seats
    await Seat.updateMany(
      { trainId: booking.trainId, seatNumber: { $in: booking.seatNumbers } },
      { $set: { isBooked: false, bookedBy: null, bookingId: null } }
    );

    // 2. Increment train available seats
    trainToCancel.availableSeats += booking.seatNumbers.length;
    await trainToCancel.save();

    // 3. Update booking status
    booking.bookingStatus = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully', booking });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.trackPNR = async (req, res) => {
  try {
    const booking = await Booking.findOne({ pnrNumber: req.params.pnrNumber }).populate('trainId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
