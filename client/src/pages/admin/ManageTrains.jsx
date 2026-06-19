import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ManageTrains = () => {
  const { t } = useTranslation();
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTrain, setEditingTrain] = useState(null);

  const [formData, setFormData] = useState({
    trainNumber: '',
    trainName: '',
    from: '',
    to: '',
    departureTime: '',
    arrivalTime: '',
    duration: '',
    date: '',
    totalSeats: 70,
    fare: '',
    class: 'Economy',
    status: 'Active'
  });

  useEffect(() => {
    fetchTrains();
  }, []);

  const fetchTrains = async () => {
    try {
      const { data } = await axios.get('/api/trains'); // Public route to get all trains
      setTrains(data.trains || data.data || []);
    } catch (err) {
      setError('Failed to load trains');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTrain) {
        await axios.put(`/api/admin/trains/${editingTrain._id}`, formData);
      } else {
        await axios.post('/api/admin/trains', formData);
      }
      setShowModal(false);
      fetchTrains();
      setEditingTrain(null);
      setFormData({
        trainNumber: '', trainName: '', from: '', to: '', departureTime: '', arrivalTime: '', duration: '', date: '', totalSeats: 70, fare: '', class: 'Economy', status: 'Active'
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving train');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this train?')) {
      try {
        await axios.delete(`/api/admin/trains/${id}`);
        fetchTrains();
      } catch (err) {
        alert('Failed to delete train');
      }
    }
  };

  const openEditModal = (train) => {
    setEditingTrain(train);
    setFormData({
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      from: train.from,
      to: train.to,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
      duration: train.duration,
      date: new Date(train.date).toISOString().split('T')[0],
      totalSeats: train.totalSeats,
      fare: train.fare,
      class: train.class,
      status: train.status || 'Active'
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-secondary" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-display font-bold text-primary">Manage Trains</h2>
        <button 
          onClick={() => {
            setEditingTrain(null);
            setFormData({ trainNumber: '', trainName: '', from: '', to: '', departureTime: '', arrivalTime: '', duration: '', date: '', totalSeats: 70, fare: '', class: 'Economy', status: 'Active' });
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center"
        >
          <Plus className="w-5 h-5 mr-1" /> Add Train
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      <div className="bg-surface rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Train</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seats (Avail/Total)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fare</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trains.map((train) => (
              <tr key={train._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{train.trainName}</div>
                  <div className="text-sm text-gray-500">{train.trainNumber} - {train.class}</div>
                  <div className="text-xs mt-1">
                    <span className={`px-2 py-0.5 rounded-full ${train.status === 'Cancelled' ? 'bg-red-100 text-red-800' : train.status === 'Delayed' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {train.status || 'Active'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{train.from} &rarr; {train.to}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{new Date(train.date).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-500">{train.departureTime} - {train.arrivalTime}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {train.availableSeats} / {train.totalSeats}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rs {train.fare}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openEditModal(train)} className="text-blue-600 hover:text-blue-900 mr-4">
                    <Edit className="w-5 h-5 inline" />
                  </button>
                  <button onClick={() => handleDelete(train._id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-4">{editingTrain ? 'Edit Train' : 'Add New Train'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Train Number</label>
                <input required type="text" name="trainNumber" value={formData.trainNumber} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Train Name</label>
                <input required type="text" name="trainName" value={formData.trainName} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">From</label>
                <input required type="text" name="from" value={formData.from} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">To</label>
                <input required type="text" name="to" value={formData.to} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Departure Time</label>
                <input required type="time" name="departureTime" value={formData.departureTime} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Arrival Time</label>
                <input required type="time" name="arrivalTime" value={formData.arrivalTime} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration</label>
                <input required type="text" name="duration" value={formData.duration} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input required type="date" name="date" value={formData.date} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Seats</label>
                <input required type="number" name="totalSeats" value={formData.totalSeats} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fare</label>
                <input required type="number" name="fare" value={formData.fare} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Class</label>
                <select required name="class" value={formData.class} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 p-2 rounded">
                  <option value="Economy">Economy</option>
                  <option value="Business">Business</option>
                  <option value="First Class">First Class</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select required name="status" value={formData.status} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 p-2 rounded">
                  <option value="Active">Active</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-secondary text-white rounded hover:bg-opacity-90">{editingTrain ? 'Update' : 'Add'} Train</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTrains;
