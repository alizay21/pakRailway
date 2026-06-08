import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, ShieldCheck, Clock, CreditCard } from 'lucide-react';

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad'];

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: '',
    class: 'Economy'
  });
  const [errors, setErrors] = useState({});

  const validateSearch = () => {
    const newErrors = {};

    if (!searchParams.from) newErrors.from = 'Please select departure city';
    if (!searchParams.to) newErrors.to = 'Please select destination city';
    if (searchParams.from && searchParams.to && searchParams.from === searchParams.to) {
      newErrors.to = 'Departure and destination cannot be the same';
    }
    if (!searchParams.date) {
      newErrors.date = 'Please select a travel date';
    } else {
      const selectedDate = new Date(searchParams.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Travel date cannot be in the past';
      }
    }

    return newErrors;
  };

  const handleInputChange = (field, value) => {
    setSearchParams({ ...searchParams, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const validationErrors = validateSearch();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const query = new URLSearchParams(searchParams).toString();
    navigate(`/search?${query}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center bg-primary">
        <div className="absolute inset-0 overflow-hidden">
          {/* We use a gradient overlay over a solid background color since we don't have images */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-[#1e3a8a] opacity-90"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4">
            {t('home.tagline')}
          </h1>
          
          <div className="mt-8 bg-surface p-6 rounded-xl shadow-lg">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              <div className="flex flex-col text-left">
                <label className="text-sm font-medium text-textSecondary mb-1">{t('search.from')}</label>
                <select 
                  value={searchParams.from}
                  onChange={(e) => handleInputChange('from', e.target.value)}
                  className={`p-3 border rounded-lg focus:ring-secondary focus:border-secondary ${errors.from ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select City</option>
                  {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
                {errors.from && <p className="text-red-500 text-xs mt-1">{errors.from}</p>}
              </div>

              <div className="flex flex-col text-left">
                <label className="text-sm font-medium text-textSecondary mb-1">{t('search.to')}</label>
                <select 
                  value={searchParams.to}
                  onChange={(e) => handleInputChange('to', e.target.value)}
                  className={`p-3 border rounded-lg focus:ring-secondary focus:border-secondary ${errors.to ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select City</option>
                  {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
                {errors.to && <p className="text-red-500 text-xs mt-1">{errors.to}</p>}
              </div>

              <div className="flex flex-col text-left">
                <label className="text-sm font-medium text-textSecondary mb-1">{t('search.date')}</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={searchParams.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`p-3 border rounded-lg focus:ring-secondary focus:border-secondary ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>

              <div className="flex flex-col justify-start mt-6 md:mt-0 pt-1">
                <button 
                  type="submit"
                  className="w-full bg-secondary hover:bg-emerald-600 text-white font-bold p-3 rounded-lg flex items-center justify-center transition-colors h-12"
                >
                  <Search className="w-5 h-5 mr-2" />
                  {t('search.button')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface p-8 rounded-xl shadow-sm text-center transform hover:-translate-y-1 transition-transform border border-gray-100">
              <div className="mx-auto w-16 h-16 bg-blue-100 text-primary flex items-center justify-center rounded-full mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">Real-time Seat Availability</h3>
              <p className="text-textSecondary">Check live seat status and book instantly without any hassle.</p>
            </div>
            
            <div className="bg-surface p-8 rounded-xl shadow-sm text-center transform hover:-translate-y-1 transition-transform border border-gray-100">
              <div className="mx-auto w-16 h-16 bg-green-100 text-secondary flex items-center justify-center rounded-full mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">Secure Booking</h3>
              <p className="text-textSecondary">Your transactions and personal data are fully encrypted and secure.</p>
            </div>

            <div className="bg-surface p-8 rounded-xl shadow-sm text-center transform hover:-translate-y-1 transition-transform border border-gray-100">
              <div className="mx-auto w-16 h-16 bg-orange-100 text-accent flex items-center justify-center rounded-full mb-4">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">Easy Cancellation</h3>
              <p className="text-textSecondary">Change of plans? Cancel your booking easily and get refunded.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
