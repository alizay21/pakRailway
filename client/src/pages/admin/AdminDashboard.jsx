import { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Loader2, Train, Ticket, DollarSign, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        axios.get('/api/admin/dashboard-stats'),
        axios.get('/api/admin/bookings')
      ]);
      
      setStats(statsRes.data.stats);
      setRecentBookings((bookingsRes.data.bookings || []).slice(0, 5));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-secondary" />
      </div>
    );
  }

  const chartData = stats ? [
    { name: 'Total Trains', value: stats.totalTrains },
    { name: 'Today Bookings', value: stats.totalBookingsToday },
    { name: 'Active Users', value: stats.activeUsers }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-display font-bold mb-8 text-primary">Admin Dashboard</h2>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Train className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-textSecondary font-medium">Total Trains</p>
              <p className="text-2xl font-bold">{stats.totalTrains}</p>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <Ticket className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-textSecondary font-medium">Bookings Today</p>
              <p className="text-2xl font-bold">{stats.totalBookingsToday}</p>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-textSecondary font-medium">Total Revenue</p>
              <p className="text-2xl font-bold">Rs {stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-textSecondary font-medium">Active Users</p>
              <p className="text-2xl font-bold">{stats.activeUsers}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-textPrimary">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-sm text-primary hover:underline font-medium">View All</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PNR</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Passenger</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.length > 0 ? recentBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 text-sm">{booking.pnrNumber}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{booking.userId?.name || 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.bookingStatus === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                        booking.bookingStatus === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500 text-sm">No recent bookings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links & Chart */}
        <div className="flex flex-col gap-8">
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-textPrimary mb-4">System Overview</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1E40AF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 flex-1">
            <h3 className="text-xl font-bold text-textPrimary mb-4">Quick Links</h3>
            <div className="flex flex-col gap-3">
              <Link to="/admin/trains" className="p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-primary hover:text-white transition-colors font-medium border border-gray-200 text-center">
                Manage Trains
              </Link>
              <Link to="/admin/bookings" className="p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-secondary hover:text-white transition-colors font-medium border border-gray-200 text-center">
                Manage Bookings
              </Link>
              <Link to="/admin/reports" className="p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-accent hover:text-white transition-colors font-medium border border-gray-200 text-center">
                Reports & Analytics
              </Link>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminDashboard;
