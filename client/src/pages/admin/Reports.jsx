import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#10B981', '#EF4444', '#F59E0B'];

const Reports = () => {
  const [data, setData] = useState({
    bar: [],
    pie: [],
    line: [],
    summary: { total: 0, confirmed: 0, cancelled: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const { data: bData } = await axios.get('/api/admin/bookings');
      const bookings = bData.bookings || [];
      
      const confirmedRev = bookings.filter(b => b.bookingStatus === 'Confirmed').reduce((sum, b) => sum + b.totalFare, 0);
      const cancelledRev = bookings.filter(b => b.bookingStatus === 'Cancelled').reduce((sum, b) => sum + b.totalFare, 0);
      const pendingRev = bookings.filter(b => b.bookingStatus === 'Pending').reduce((sum, b) => sum + b.totalFare, 0);

      const confirmedCount = bookings.filter(b => b.bookingStatus === 'Confirmed').length;
      const cancelledCount = bookings.filter(b => b.bookingStatus === 'Cancelled').length;
      const pendingCount = bookings.filter(b => b.bookingStatus === 'Pending').length;

      // Group by date for line chart (last 7 days approx)
      const dateMap = {};
      bookings.forEach(b => {
        if(b.bookingStatus !== 'Confirmed') return;
        const d = new Date(b.createdAt).toLocaleDateString();
        dateMap[d] = (dateMap[d] || 0) + b.totalFare;
      });
      const lineData = Object.keys(dateMap).map(k => ({ date: k, revenue: dateMap[k] })).slice(0, 7);

      setData({
        bar: [
          { name: 'Confirmed', value: confirmedRev },
          { name: 'Cancelled', value: cancelledRev },
          { name: 'Pending', value: pendingRev }
        ],
        pie: [
          { name: 'Confirmed', value: confirmedCount },
          { name: 'Cancelled', value: cancelledCount },
          { name: 'Pending', value: pendingCount }
        ],
        line: lineData.reverse(),
        summary: { 
          total: confirmedRev, 
          confirmedCount, 
          cancelledCount 
        }
      });
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-secondary" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-display font-bold text-primary mb-8">Reports & Analytics</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-textSecondary font-medium">Total Confirmed Revenue</p>
            <p className="text-2xl font-bold">Rs {data.summary.total.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-textSecondary font-medium">Confirmed Bookings</p>
            <p className="text-2xl font-bold">{data.summary.confirmedCount}</p>
          </div>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-textSecondary font-medium">Cancelled Bookings</p>
            <p className="text-2xl font-bold">{data.summary.cancelledCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-textPrimary">Revenue by Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bar}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                  {data.bar.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-textPrimary">Bookings Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.pie}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {data.pie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-6 text-textPrimary">Recent Revenue Trend (Confirmed)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.line}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
