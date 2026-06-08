import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import { Loader2 } from 'lucide-react';

const SeatSelection = () => {
  const { trainId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [train, setTrain] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/select-seats/${trainId}` } });
      return;
    }

    const fetchTrainAndSeats = async () => {
      try {
        const [trainRes, seatsRes] = await Promise.all([
          axios.get(`/api/trains/${trainId}`),
          axios.get(`/api/trains/${trainId}/seats`)
        ]);
        
        setTrain(trainRes.data.train);
        setSeats(seatsRes.data.seats);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load seats');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainAndSeats();
  }, [trainId, user, navigate]);

  const handleSeatClick = (seatNumber) => {
    setValidationError('');
    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(s => s !== seatNumber);
      } else {
        if (prev.length >= 6) {
          setValidationError('Maximum 6 seats allowed per booking');
          return prev;
        }
        return [...prev, seatNumber];
      }
    });
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      setValidationError('Please select at least one seat to continue');
      return;
    }
    
    navigate('/passenger-details', { 
      state: { 
        train, 
        selectedSeats,
        totalFare: train.fare * selectedSeats.length 
      } 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-secondary" />
      </div>
    );
  }

  if (error || !train) {
    return <div className="text-center py-12 text-error">{error || 'Train not found'}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-primary text-white p-6 rounded-xl shadow-md mb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h2 className="text-2xl font-display font-bold mb-2">{train.trainName} ({train.trainNumber})</h2>
            <p className="opacity-80">{train.from} to {train.to} • {train.departureTime}</p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-sm opacity-80">{train.class} Class</p>
            <p className="text-xl font-bold">Rs {train.fare} / seat</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {validationError && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm font-medium">
              {validationError}
            </div>
          )}
          <SeatMap 
            seats={seats} 
            selectedSeats={selectedSeats} 
            onSeatClick={handleSeatClick} 
            trainClass={train.class}
          />
        </div>
        
        <div>
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-lg font-display font-bold mb-4 border-b pb-2">Booking Summary</h3>
            
            <div className="flex justify-between mb-2">
              <span className="text-textSecondary">Selected Seats:</span>
              <span className="font-bold">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="text-textSecondary">Total Passengers:</span>
              <span className="font-bold">{selectedSeats.length}</span>
            </div>
            
            <div className="flex justify-between mt-4 pt-4 border-t text-lg">
              <span className="font-bold">Total Fare:</span>
              <span className="font-bold text-primary">Rs {train.fare * selectedSeats.length}</span>
            </div>
            
            <button
              onClick={handleContinue}
              className={`w-full mt-6 py-3 rounded-lg font-bold transition-colors ${
                selectedSeats.length > 0
                  ? 'bg-secondary text-white hover:bg-emerald-600'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue to Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
