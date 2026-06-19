import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Ticket, XCircle } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings/my-bookings');
      setBookings(data.bookings);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      try {
        await axios.put(`/api/bookings/${bookingId}/cancel`);
        fetchBookings(); // Refresh list
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-display font-bold mb-8">My Bookings</h2>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {bookings.length === 0 ? (
        <div className="bg-surface p-12 text-center rounded-xl border border-gray-200">
          <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-textSecondary">You have no bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-surface rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-lg">{booking.pnrNumber}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    booking.bookingStatus === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                    booking.bookingStatus === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {booking.bookingStatus}
                  </span>
                </div>
                
                {booking.trainId && (
                  <p className="text-textSecondary mb-2">
                    {booking.trainId.trainName} • {booking.trainId.from} to {booking.trainId.to}
                  </p>
                )}
                
                <p className="text-sm font-medium">Seats: {booking.seatNumbers.join(', ')}</p>
                <p className="text-sm text-textSecondary mt-1">Booked on: {new Date(booking.bookingDate).toLocaleDateString()}</p>
              </div>

              <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end justify-between">
                <p className="font-bold text-xl text-primary mb-4">Rs {booking.totalFare}</p>
                
                {booking.bookingStatus === 'Confirmed' && booking.trainId && new Date(booking.trainId.date) > new Date() && (
                  <button 
                    onClick={() => handleCancel(booking._id)}
                    className="flex items-center text-error hover:text-red-700 font-medium transition-colors"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
