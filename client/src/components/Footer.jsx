import { Train } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-primary text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <Train className="h-8 w-8 mr-2" />
          <span className="font-display font-bold text-xl">PakRail</span>
        </div>
        <div className="text-sm text-gray-300">
          &copy; {new Date().getFullYear()} PakRail. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
