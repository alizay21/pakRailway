const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainId: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  seatNumbers: [{ type: String, required: true }],
  passengerDetails: [{
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    cnic: { type: String, required: true }
  }],
  totalFare: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Refunded'], default: 'Pending' },
  bookingStatus: { type: String, enum: ['Confirmed', 'Cancelled', 'Pending'], default: 'Pending' },
  bookingDate: { type: Date, default: Date.now },
  pnrNumber: { type: String, required: true, unique: true }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
