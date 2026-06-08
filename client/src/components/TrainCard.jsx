import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';

const TrainCard = ({ train }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getAvailableColor = (available) => {
    if (available > 10) return 'text-secondary';
    if (available > 0) return 'text-accent';
    return 'text-error';
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row justify-between md:items-center">
        
        <div className="mb-4 md:mb-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-display font-bold text-xl">{train.trainName}</h3>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">
              {train.trainNumber}
            </span>
            <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium">
              {train.class}
            </span>
          </div>
          
          <div className="flex items-center text-textSecondary text-sm mb-4">
            <div className="flex flex-col">
              <span className="font-bold text-textPrimary">{train.departureTime}</span>
              <span>{train.from}</span>
            </div>
            <div className="flex flex-col items-center px-4">
              <span className="text-xs">{train.duration}</span>
              <div className="w-16 border-t border-gray-300 border-dashed my-1"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-textPrimary">{train.arrivalTime}</span>
              <span>{train.to}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end">
          <div className="text-2xl font-bold text-primary mb-1">
            Rs {train.fare}
          </div>
          <div className={`flex items-center text-sm font-medium mb-4 ${getAvailableColor(train.availableSeats)}`}>
            <Users className="w-4 h-4 mr-1" />
            {train.availableSeats} {t('seat.available_seats', 'Seats Available')}
          </div>
          <button 
            onClick={() => navigate(`/select-seats/${train._id}`)}
            disabled={train.availableSeats === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-colors w-full md:w-auto ${
              train.availableSeats === 0 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-opacity-90'
            }`}
          >
            {train.availableSeats === 0 ? t('train.full', 'Full') : t('train.select_seats', 'Select Seats')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default TrainCard;
