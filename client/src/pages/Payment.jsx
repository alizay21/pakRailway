import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, CreditCard, Lock, Banknote } from 'lucide-react';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { train, selectedSeats, passengers, totalFare } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'cash'
  
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState({});

  if (!train || !selectedSeats || !passengers) {
    return <Navigate to="/" replace />;
  }

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const validatePayment = () => {
    const newErrors = {};

    if (paymentMethod === 'card') {
      // Card Number
      const cleanCard = cardDetails.cardNumber.replace(/\s/g, '');
      if (!cleanCard) newErrors.cardNumber = 'Card number is required';
      else if (!/^\d{16}$/.test(cleanCard)) newErrors.cardNumber = 'Card number must be 16 digits';

      // Cardholder Name
      if (!cardDetails.cardHolderName.trim()) newErrors.cardHolderName = 'Cardholder name is required';
      else if (cardDetails.cardHolderName.trim().length < 3) newErrors.cardHolderName = 'Please enter a valid name';

      // Expiry
      if (!cardDetails.expiryDate) newErrors.expiryDate = 'Expiry date is required';
      else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) newErrors.expiryDate = 'Use MM/YY format';
      else {
        const [month, year] = cardDetails.expiryDate.split('/');
        const expiryDate = new Date(`20${year}`, month - 1);
        const currentDate = new Date();
        currentDate.setDate(1);
        currentDate.setHours(0,0,0,0);
        if (expiryDate < currentDate) newErrors.expiryDate = 'Your card has expired';
      }

      // CVV
      if (!cardDetails.cvv) newErrors.cvv = 'CVV is required';
      else if (!/^\d{3}$/.test(cardDetails.cvv)) newErrors.cvv = 'CVV must be 3 digits';
    }

    return newErrors;
  };

  const handleInputChange = (field, value) => {
    setCardDetails({ ...cardDetails, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setApiError('');
    
    const validationErrors = validatePayment();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      // 1. Create Booking (which locks the seats)
      const bookingRes = await axios.post('/api/bookings', {
        trainId: train._id,
        seatNumbers: selectedSeats,
        passengerDetails: passengers,
        totalFare
      });

      const bookingId = bookingRes.data.data._id;

      // 2. Verify Payment if Card
      if (paymentMethod === 'card') {
        await axios.post('/api/payments/verify', {
          bookingId,
          cardNumber: cardDetails.cardNumber,
          cardHolder: cardDetails.cardHolderName,
          expiry: cardDetails.expiryDate,
          cvv: cardDetails.cvv
        });
      }

      // 3. Success -> Redirect. Note: If cash, status remains Pending.
      // Fetch latest booking if payment verified
      let finalBooking = bookingRes.data.data;
      if (paymentMethod === 'card') {
        // Just setting it to Confirmed manually here for UI passing, backend is updated
        finalBooking.bookingStatus = 'Confirmed';
        finalBooking.paymentStatus = 'Paid';
      }

      navigate('/booking-confirmation', { 
        state: { booking: finalBooking, train, passengers }
      });

    } catch (err) {
      setApiError(err.response?.data?.message || 'Payment or Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-display font-bold mb-8 text-center">Secure Payment</h2>

      {apiError && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center font-medium">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Payment Form */}
        <div className="bg-surface p-6 rounded-xl shadow-md border border-gray-100">
          
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 flex items-center justify-center p-3 rounded-lg border-2 font-medium transition-colors ${
                paymentMethod === 'card' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-5 h-5 mr-2" /> Card
            </button>
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`flex-1 flex items-center justify-center p-3 rounded-lg border-2 font-medium transition-colors ${
                paymentMethod === 'cash' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <Banknote className="w-5 h-5 mr-2" /> Cash / At Counter
            </button>
          </div>

          <form onSubmit={handlePayment} className="space-y-4">
            {paymentMethod === 'card' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    maxLength="19"
                    placeholder="XXXX XXXX XXXX XXXX"
                    value={cardDetails.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                    className={`w-full p-3 border rounded focus:ring-secondary focus:border-secondary ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardDetails.cardHolderName}
                    onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                    className={`w-full p-3 border rounded focus:ring-secondary focus:border-secondary ${errors.cardHolderName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.cardHolderName && <p className="text-red-500 text-sm mt-1">{errors.cardHolderName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      maxLength="5"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      className={`w-full p-3 border rounded focus:ring-secondary focus:border-secondary ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength="3"
                      placeholder="***"
                      value={cardDetails.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value)}
                      className={`w-full p-3 border rounded focus:ring-secondary focus:border-secondary ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                  </div>
                </div>
              </>
            )}

            {paymentMethod === 'cash' && (
              <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200">
                <p className="font-medium mb-2">Pay at the Railway Station Counter</p>
                <p className="text-sm">Please bring your PNR number to the station. Payment must be completed at least 2 hours before departure to confirm your seats.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-white py-3 rounded-lg font-bold hover:bg-emerald-600 transition-colors flex justify-center items-center mt-6 disabled:bg-gray-400"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {loading ? 'Processing...' : paymentMethod === 'card' ? `Pay Rs ${totalFare}` : `Book Seats (Rs ${totalFare})`}
            </button>
            <div className="flex items-center justify-center text-xs text-gray-500 mt-4">
              <Lock className="w-3 h-3 mr-1" />
              {paymentMethod === 'card' ? 'Payments are secure and encrypted' : 'Your seats will be reserved temporarily'}
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-primary text-white p-6 rounded-xl shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-6 border-b border-blue-800 pb-2">Order Summary</h3>
            
            <div className="mb-4">
              <p className="text-sm opacity-80">Train</p>
              <p className="font-bold text-lg">{train.trainName} ({train.trainNumber})</p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm opacity-80">Route</p>
              <p className="font-bold">{train.from} to {train.to}</p>
              <p className="text-sm">{new Date(train.date).toLocaleDateString()} • {train.departureTime}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm opacity-80">Seats ({selectedSeats.length})</p>
              <p className="font-bold">{selectedSeats.join(', ')}</p>
            </div>
          </div>

          <div className="border-t border-blue-800 pt-4 mt-8 flex justify-between items-center">
            <span className="text-lg">Total Amount</span>
            <span className="text-2xl font-bold text-accent">Rs {totalFare}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Payment;
