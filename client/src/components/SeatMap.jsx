import { useTranslation } from 'react-i18next';

const SeatMap = ({ seats, selectedSeats, onSeatClick, trainClass }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h3 className="font-display font-semibold text-lg">{t('seat.select_title', 'Select Your Seats')}</h3>
          {trainClass && (
            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider">
              {trainClass}
            </span>
          )}
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-secondary rounded"></div>
            <span>{t('seat.available')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span>{t('seat.selected')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-error rounded opacity-50 cursor-not-allowed"></div>
            <span>{t('seat.booked')}</span>
          </div>
        </div>
      </div>

      <div className="seat-grid">
        {seats.map((seat) => {
          const isSelected = selectedSeats.includes(seat.seatNumber);
          const isBooked = seat.isBooked;

          let btnClass = "py-2 px-1 text-xs font-medium rounded transition-colors text-center border ";
          
          if (isBooked) {
            btnClass += "bg-error border-error text-white opacity-50 cursor-not-allowed";
          } else if (isSelected) {
            btnClass += "bg-primary border-primary text-white";
          } else {
            btnClass += "bg-white border-secondary text-secondary hover:bg-secondary hover:text-white cursor-pointer";
          }

          return (
            <button
              key={seat._id}
              disabled={isBooked}
              onClick={() => onSeatClick(seat.seatNumber)}
              className={btnClass}
              title={isBooked ? t('seat.already_booked', 'Already Booked') : seat.seatNumber}
            >
              {seat.seatNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SeatMap;
