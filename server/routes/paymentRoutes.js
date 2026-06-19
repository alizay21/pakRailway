const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const Booking = require('../models/Booking')

router.post('/verify', protect, async (req, res) => {
  try {
    const { bookingId, cardNumber, cardHolder, expiry, cvv } = req.body

    // 1. All fields required
    if (!bookingId || !cardNumber || !cardHolder || !expiry || !cvv) {
      return res.status(400).json({ success: false, message: 'All payment fields are required' })
    }

    // 2. Card number must be 16 digits
    const cleanCard = cardNumber.replace(/\s|-/g, '')
    if (!/^\d{16}$/.test(cleanCard)) {
      return res.status(400).json({ success: false, message: 'Card number must be 16 digits' })
    }

    // 3. Cardholder name must be valid
    if (cardHolder.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Please enter a valid cardholder name' })
    }

    // 4. Expiry format MM/YY
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      return res.status(400).json({ success: false, message: 'Expiry must be in MM/YY format' })
    }

    // 5. Check expiry is not in the past
    const [month, year] = expiry.split('/')
    const expiryDate = new Date(`20${year}`, month - 1)
    if (expiryDate < new Date()) {
      return res.status(400).json({ success: false, message: 'Your card has expired' })
    }

    // 6. CVV must be 3 digits
    if (!/^\d{3}$/.test(cvv)) {
      return res.status(400).json({ success: false, message: 'CVV must be 3 digits' })
    }

    // 7. Verify booking exists and belongs to this user
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized: This booking does not belong to you' })
    }
    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'This booking has already been paid' })
    }

    // 8. Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 9. Update booking status
    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      { paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
      { new: true }
    )

    res.json({ success: true, message: 'Payment successful! Your booking is confirmed.', data: updated })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
