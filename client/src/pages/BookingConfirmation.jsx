import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight, Copy, Clock } from 'lucide-react';
import { useState } from 'react';

const BookingConfirmation = () => {
  const location = useLocation();
  const { booking, train, passengers } = location.state || {};
  const [copied, setCopied] = useState(false);

  if (!booking) {
    return <Navigate to="/" replace />;
  }

  const handleCopyPNR = () => {
    navigator.clipboard.writeText(booking.pnrNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="flex justify-center mb-6">
        {booking.bookingStatus === 'Pending' ? (
           <Clock className="w-24 h-24 text-yellow-500" />
        ) : (
           <CheckCircle className="w-24 h-24 text-success" />
        )}
      </div>
      
      <h1 className="text-4xl font-display font-bold text-primary mb-2">
        {booking.bookingStatus === 'Pending' ? 'Booking Reserved!' : 'Booking Confirmed!'}
      </h1>
      <p className="text-textSecondary mb-8">
        {booking.bookingStatus === 'Pending' 
          ? 'Your seats are reserved. Please pay at the counter to confirm.' 
          : 'Your payment was successful and your seats are confirmed.'}
      </p>

      <div className="bg-surface rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8 text-left print-container">
        <div className="bg-primary p-6 text-white text-center relative">
          <p className="text-sm opacity-80 uppercase tracking-wider mb-1">PNR Number</p>
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-3xl font-bold tracking-widest">{booking.pnrNumber}</h2>
            <button 
              onClick={handleCopyPNR} 
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="Copy PNR"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          {copied && <span className="absolute top-4 right-4 text-xs bg-white text-primary px-2 py-1 rounded">Copied!</span>}
        </div>
        
        <div className="p-8">
          {train && (
            <div className="mb-6 border-b pb-6">
              <h3 className="text-xl font-bold mb-2">{train.trainName} ({train.trainNumber})</h3>
              <p className="text-textSecondary">{train.from} &rarr; {train.to}</p>
              <p className="text-sm text-textSecondary">{new Date(train.date).toLocaleDateString()} • {train.departureTime}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-xs text-textSecondary uppercase tracking-wide">Status</p>
              <p className={`font-bold ${booking.bookingStatus === 'Pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                {booking.bookingStatus}
              </p>
            </div>
            <div>
              <p className="text-xs text-textSecondary uppercase tracking-wide">Total Fare</p>
              <p className="font-bold text-primary">Rs {booking.totalFare}</p>
            </div>
            
            <div className="col-span-2">
              <p className="text-xs text-textSecondary uppercase tracking-wide mb-1">Passengers & Seats ({booking.seatNumbers.length})</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                {passengers && passengers.length > 0 ? (
                  <ul className="space-y-2">
                    {passengers.map((p, idx) => (
                      <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                        <span className="font-medium">{p.name} ({p.age} yrs, {p.gender})</span>
                        <span className="bg-white border px-2 py-1 rounded text-xs font-bold">Seat: {booking.seatNumbers[idx]}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-bold">{booking.seatNumbers.join(', ')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 no-print">
        <button 
          onClick={handlePrint}
          className="flex items-center justify-center px-6 py-3 border border-primary text-primary font-bold rounded-lg hover:bg-blue-50 transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Print Ticket
        </button>
        <Link 
          to="/my-bookings" 
          className="flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Go to My Bookings
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
            border: none;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingConfirmation;
