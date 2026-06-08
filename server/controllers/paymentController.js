const Booking = require('../models/Booking');

const verifyPayment = async (req, res) => {
  try {
    const { bookingId, cardNumber, cardHolderName, expiryDate, cvv } = req.body;

    // Simulate payment validation logic
    if (!cardNumber || !cardHolderName || !expiryDate || !cvv) {
      return res.status(400).json({ success: false, message: 'All payment fields are required' });
    }

    if (cardNumber.length !== 19) { // format XXXX-XXXX-XXXX-XXXX
        return res.status(400).json({ success: false, message: 'Invalid card format' });
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Find the booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'Booking is already paid' });
    }

    // Update booking status
    booking.paymentStatus = 'Paid';
    booking.bookingStatus = 'Confirmed';
    await booking.save();

    res.json({ success: true, message: 'Payment verified successfully', booking });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { verifyPayment };
