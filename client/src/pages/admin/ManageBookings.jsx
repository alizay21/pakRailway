import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Search, XCircle } from 'lucide-react';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, statusFilter, dateFilter]);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get('/api/admin/bookings');
      setBookings(data.bookings || []);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = bookings;
    
    if (statusFilter !== 'All') {
      result = result.filter(b => b.bookingStatus === statusFilter);
    }
    
    if (dateFilter) {
      const filterDate = new Date(dateFilter).setHours(0,0,0,0);
      result = result.filter(b => {
        const bDate = new Date(b.createdAt).setHours(0,0,0,0);
        return bDate === filterDate;
      });
    }
    
    setFilteredBookings(result);
  };

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      try {
        await axios.put(`/api/bookings/${bookingId}/cancel`);
        fetchBookings();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-secondary" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-display font-bold text-primary mb-8">Manage Bookings</h2>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      <div className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded focus:ring-primary focus:border-primary"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Booking Date</label>
          <input 
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <button 
            onClick={() => { setStatusFilter('All'); setDateFilter(''); }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PNR</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passenger</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Train & Route</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status & Fare</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <tr key={booking._id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{booking.pnrNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.userId?.name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{booking.userId?.email || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.trainId?.trainName || 'Deleted Train'}</div>
                  <div className="text-sm text-gray-500">
                    {booking.trainId ? `${booking.trainId.from} \u2192 ${booking.trainId.to}` : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-400">{booking.seatNumbers?.length || 0} seats</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="mb-1">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.bookingStatus === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                      booking.bookingStatus === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.bookingStatus}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">Rs {booking.totalFare}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {booking.bookingStatus === 'Confirmed' && booking.trainId && new Date(booking.trainId.date) > new Date() && (
                    <button 
                      onClick={() => handleCancel(booking._id)}
                      className="text-red-600 hover:text-red-900 flex items-center justify-end w-full"
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No bookings found matching filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageBookings;
