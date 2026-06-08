import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Clock, Calendar, Users, Ticket } from 'lucide-react';

const TrackPNR = () => {
  const { t } = useTranslation();
  const [pnr, setPnr] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pnr.trim()) return;

    setLoading(true);
    setError('');
    setBooking(null);

    try {
      const { data } = await axios.get(`/api/bookings/track/${pnr}`);
      setBooking(data.booking);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[70vh]">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-display font-bold text-primary mb-2">Track Your Journey</h2>
        <p className="text-textSecondary">Enter your PNR number to check your booking status</p>
      </div>

      <div className="bg-surface p-6 rounded-xl shadow-md border border-gray-100 mb-8 max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            required
            placeholder="Enter PNR Number (e.g. PKR-2026-12345)"
            value={pnr}
            onChange={(e) => setPnr(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-secondary focus:border-secondary uppercase"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-secondary text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-600 transition-colors flex items-center"
          >
            {loading ? <span className="animate-pulse">Searching...</span> : <><Search className="w-5 h-5 mr-2" /> Search</>}
          </button>
        </form>
        {error && <p className="text-error mt-4 text-center text-sm">{error}</p>}
      </div>

      {booking && (
        <div className="bg-surface rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
          <div className="bg-primary text-white p-6 flex justify-between items-center">
            <div>
              <p className="text-sm opacity-80 uppercase tracking-wider mb-1">PNR Number</p>
              <h3 className="text-2xl font-bold tracking-widest">{booking.pnrNumber}</h3>
            </div>
            <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                booking.bookingStatus === 'Confirmed' ? 'bg-green-500 text-white' : 
                booking.bookingStatus === 'Cancelled' ? 'bg-red-500 text-white' : 
                'bg-yellow-500 text-white'
              }`}>
                {booking.bookingStatus}
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div>
                <h4 className="text-lg font-bold text-primary mb-4 flex items-center">
                  <Ticket className="w-5 h-5 mr-2" /> Journey Details
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-textPrimary">{booking.trainId?.from} to {booking.trainId?.to}</p>
                      <p className="text-sm text-textSecondary">{booking.trainId?.trainName} ({booking.trainId?.trainNumber})</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-textPrimary">{new Date(booking.trainId?.date).toLocaleDateString()}</p>
                      <p className="text-sm text-textSecondary">Date of Journey</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-textPrimary">{booking.trainId?.departureTime} - {booking.trainId?.arrivalTime}</p>
                      <p className="text-sm text-textSecondary">Time ({booking.trainId?.duration})</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-primary mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" /> Passenger Details
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="mb-2"><span className="text-textSecondary">Seats:</span> <span className="font-bold">{booking.seatNumbers.join(', ')}</span></p>
                  <p className="mb-2"><span className="text-textSecondary">Class:</span> <span className="font-bold">{booking.trainId?.class}</span></p>
                  <p className="mt-4"><span className="text-textSecondary">Total Fare:</span> <span className="font-bold text-xl text-primary">Rs {booking.totalFare}</span></p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackPNR;
