import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Train, Menu, X, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ur' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('pakrail_lang', newLang);
    document.documentElement.dir = newLang === 'ur' ? 'rtl' : 'ltr';
  };

  return (
    <nav className="bg-surface shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-primary hover:text-secondary transition-colors" onClick={() => setIsMenuOpen(false)}>
              <Train className="h-8 w-8 mr-2" />
              <span className="font-display font-bold text-xl">PakRail</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-textPrimary hover:text-primary transition-colors">{t('nav.home')}</Link>
            <Link to="/search" className="text-textPrimary hover:text-primary transition-colors">{t('nav.trains')}</Link>
            <Link to="/track-pnr" className="text-textPrimary hover:text-primary transition-colors">{t('nav.track')}</Link>
            
            <button 
              onClick={toggleLanguage}
              className="text-textSecondary hover:text-primary transition-colors px-2 py-1 border border-gray-300 rounded"
            >
              {i18n.language === 'en' ? 'اردو' : 'EN'}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/my-bookings" className="text-textPrimary hover:text-primary transition-colors">{t('nav.myBookings')}</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-accent font-semibold hover:text-yellow-600 transition-colors">{t('nav.admin')}</Link>
                )}
                <div className="flex items-center text-textSecondary bg-gray-100 px-3 py-1 rounded-full">
                  <UserIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-error text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-primary hover:text-secondary transition-colors">{t('nav.login')}</Link>
                <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors">{t('nav.register')}</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleLanguage}
              className="text-textSecondary hover:text-primary transition-colors px-2 py-1 border border-gray-300 rounded mr-4 text-sm"
            >
              {i18n.language === 'en' ? 'اردو' : 'EN'}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-primary focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-surface border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-textPrimary hover:bg-gray-50">{t('nav.home')}</Link>
            <Link to="/search" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-textPrimary hover:bg-gray-50">{t('nav.trains')}</Link>
            <Link to="/track-pnr" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-textPrimary hover:bg-gray-50">{t('nav.track')}</Link>
            
            {user ? (
              <>
                <div className="px-3 py-2 flex items-center text-textSecondary border-t border-gray-100 mt-2 pt-2">
                  <UserIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">{user.name}</span>
                </div>
                <Link to="/my-bookings" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-textPrimary hover:bg-gray-50">{t('nav.myBookings')}</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-accent hover:bg-yellow-50">{t('nav.admin')}</Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-error hover:bg-red-50 mt-2"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <div className="border-t border-gray-100 pt-4 pb-2 flex flex-col gap-2 px-3">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center text-primary font-medium py-2 border border-primary rounded-md">{t('nav.login')}</Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full text-center bg-primary text-white font-medium py-2 rounded-md">{t('nav.register')}</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
