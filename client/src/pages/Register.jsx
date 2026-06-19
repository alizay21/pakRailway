import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login: authLogin, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validate = () => {
    const newErrors = {};
    const { name, email, phone, password, confirmPassword } = formData;

    // Name
    if (!name.trim()) newErrors.name = 'Name is required';
    else if (name.trim().length < 3) newErrors.name = 'Name must be at least 3 characters';

    // Email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(email)) newErrors.email = 'Please enter a valid email address';

    // Phone
    const phoneRegex = /^03[0-9]{9}$/;
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!phoneRegex.test(phone)) newErrors.phone = 'Enter a valid Pakistani number (03XXXXXXXXX)';

    // Password
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    else if (!/[A-Z]/.test(password)) newErrors.password = 'Password must contain at least one uppercase letter';
    else if (!/[0-9]/.test(password)) newErrors.password = 'Password must contain at least one number';

    // Confirm Password
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    return newErrors;
  };

  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { label: '', color: 'bg-gray-200' };
    if (password.length < 6) return { label: 'Weak', color: 'bg-red-500' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { label: 'Strong', color: 'bg-green-500' };
    return { label: 'Medium', color: 'bg-yellow-500' };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', formData);
      if (response.data.success) {
        authLogin(response.data.user, response.data.token);
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-12">
      <div className="bg-surface p-8 rounded-xl shadow-md border border-gray-100 w-full max-w-md">
        <h2 className="text-3xl font-display font-bold text-center mb-6">Create Account</h2>
        
        {apiError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{apiError}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded focus:ring-primary focus:border-primary ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded focus:ring-primary focus:border-primary ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded focus:ring-primary focus:border-primary ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded focus:ring-primary focus:border-primary ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            />
            {formData.password && (
              <div className="mt-2 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                  <div className={`${strength.color} h-2 rounded-full`} style={{ width: strength.label === 'Strong' ? '100%' : strength.label === 'Medium' ? '66%' : '33%' }}></div>
                </div>
                <span className="text-xs font-medium text-gray-500 w-16">{strength.label}</span>
              </div>
            )}
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded focus:ring-primary focus:border-primary ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded font-bold hover:bg-opacity-90 transition-colors mt-2 flex justify-center items-center disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Register
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-textSecondary">
          Already have an account? <Link to="/login" className="text-secondary font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
