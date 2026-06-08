const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
  trainNumber: { type: String, required: true, unique: true },
  trainName: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  duration: { type: String, required: true },
  date: { type: Date, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  fare: { type: Number, required: true },
  class: { type: String, enum: ['Economy', 'Business', 'First Class'], required: true },
  status: { type: String, enum: ['Active', 'Cancelled', 'Delayed'], default: 'Active' }
}, { timestamps: true });

const Train = mongoose.model('Train', trainSchema);
module.exports = Train;
