import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import TrainCard from '../components/TrainCard';
import { Loader2 } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrains = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/trains/search?${searchParams.toString()}`);
        setTrains(data.trains);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching trains');
      } finally {
        setLoading(false);
      }
    };

    fetchTrains();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-display font-bold mb-8">
        Search Results {searchParams.get('from') && `for ${searchParams.get('from')} to ${searchParams.get('to')}`}
      </h2>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {trains.length === 0 ? (
        <div className="bg-surface p-12 text-center rounded-xl border border-gray-200">
          <p className="text-xl text-textSecondary">No trains found for this route and date.</p>
        </div>
      ) : (
        <div className="flex flex-col space-y-6">
          {trains.map((train) => (
            <TrainCard key={train._id} train={train} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
