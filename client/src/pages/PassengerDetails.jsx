import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';

const PassengerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { train, selectedSeats, totalFare } = location.state || {};

  if (!train || !selectedSeats) {
    return <Navigate to="/" replace />;
  }

  const [passengers, setPassengers] = useState(
    selectedSeats.map(() => ({ name: '', age: '', gender: 'Male', cnic: '' }))
  );
  
  const [errors, setErrors] = useState({});

  const validatePassengers = () => {
    const newErrors = {};

    passengers.forEach((p, i) => {
      if (!p.name || p.name.trim().length < 3)
        newErrors[`name_${i}`] = 'Name must be at least 3 characters';

      if (!p.age || isNaN(p.age) || p.age < 1 || p.age > 120)
        newErrors[`age_${i}`] = 'Please enter a valid age (1–120)';

      if (!p.gender)
        newErrors[`gender_${i}`] = 'Please select a gender';

      if (!p.cnic || !/^\d{13}$/.test(p.cnic))
        newErrors[`cnic_${i}`] = 'CNIC must be exactly 13 digits (no dashes)';
    });

    return newErrors;
  };

  const handleInputChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
    
    // Clear the specific error
    if (errors[`${field}_${index}`]) {
      setErrors({ ...errors, [`${field}_${index}`]: null });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validatePassengers();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    navigate('/payment', {
      state: {
        train,
        selectedSeats,
        passengers,
        totalFare
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-display font-bold mb-8">Passenger Details</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {selectedSeats.map((seat, index) => (
              <div key={seat} className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 text-primary">Seat {seat}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={passengers[index].name}
                      onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                      className={`w-full p-2 border rounded focus:ring-secondary focus:border-secondary ${errors[`name_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors[`name_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`name_${index}`]}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input
                      type="number"
                      value={passengers[index].age}
                      onChange={(e) => handleInputChange(index, 'age', e.target.value)}
                      className={`w-full p-2 border rounded focus:ring-secondary focus:border-secondary ${errors[`age_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors[`age_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`age_${index}`]}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      value={passengers[index].gender}
                      onChange={(e) => handleInputChange(index, 'gender', e.target.value)}
                      className={`w-full p-2 border rounded focus:ring-secondary focus:border-secondary ${errors[`gender_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors[`gender_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`gender_${index}`]}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CNIC (13 digits)</label>
                    <input
                      type="text"
                      maxLength="13"
                      placeholder="1234512345671"
                      value={passengers[index].cnic}
                      onChange={(e) => handleInputChange(index, 'cnic', e.target.value)}
                      className={`w-full p-2 border rounded focus:ring-secondary focus:border-secondary ${errors[`cnic_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors[`cnic_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`cnic_${index}`]}</p>}
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors"
            >
              Proceed to Payment
            </button>
          </form>
        </div>

        <div>
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-lg font-display font-bold mb-4 border-b pb-2">Booking Summary</h3>
            <p className="font-bold text-primary mb-2">{train.trainName}</p>
            <p className="text-sm text-textSecondary mb-4">{train.from} to {train.to}</p>
            
            <div className="flex justify-between mb-2">
              <span className="text-textSecondary">Seats:</span>
              <span className="font-bold">{selectedSeats.join(', ')}</span>
            </div>
            
            <div className="flex justify-between mt-4 pt-4 border-t text-lg">
              <span className="font-bold">Total Fare:</span>
              <span className="font-bold text-primary">Rs {totalFare}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetails;
