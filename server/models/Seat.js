const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  trainId: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  seatNumber: { type: String, required: true }, // e.g., "A1", "B3"
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null }
}, { timestamps: true });

// Compound index to ensure seatNumber is unique per train
seatSchema.index({ trainId: 1, seatNumber: 1 }, { unique: true });

const Seat = mongoose.model('Seat', seatSchema);
module.exports = Seat;
