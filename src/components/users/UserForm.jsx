import { useState } from 'react';
import { toast } from 'react-toastify';
import { createUser } from '../../services/user.service';

const UserForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    countryCode: '+31',
    phoneNumber: '',
    email: '',
    role: 'customer',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for countryCode to ensure it starts with +
    if (name === 'countryCode') {
      let formattedValue = value;
      if (!value.startsWith('+')) {
        formattedValue = '+' + value.replace(/[^0-9]/g, '');
      } else {
        formattedValue = '+' + value.slice(1).replace(/[^0-9]/g, '');
      }
      setFormData({
        ...formData,
        [name]: formattedValue
      });
    }
    // Special handling for phoneNumber to only allow digits
    else if (name === 'phoneNumber') {
      setFormData({
        ...formData,
        [name]: value.replace(/[^0-9]/g, '')
      });
    }
    // Default handling for other fields
    else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateAndFormatPhone = () => {
    const { countryCode, phoneNumber } = formData;
    
    // Validate country code format
    if (!countryCode.startsWith('+')) {
      toast.error('Country code must start with +');
      return false;
    }

    // Validate phone number length
    if (phoneNumber.length < 8) {
      toast.error('Phone number must be at least 8 digits');
      return false;
    }

    return `${countryCode} ${phoneNumber}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const phone_number = validateAndFormatPhone();
    if (!phone_number) return;
    
    if (!formData.password) {
      toast.error('Password is required');
      return;
    }

    try {
      setLoading(true);
      const result = await createUser({
        phone_number,
        email: formData.email,
        role: formData.role,
        password: formData.password
      });
      toast.success('User created successfully');
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Close the form
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary-800">Create New User</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Phone Number (split into country code and number) */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Phone Number *
            </label>
            <div className="flex space-x-2">
              {/* Country Code */}
              <div className="w-24">
                <input
                  id="countryCode"
                  name="countryCode"
                  type="text"
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="+31"
                  value={formData.countryCode}
                  onChange={handleChange}
                  maxLength={4}
                />
              </div>
              {/* Phone Number */}
              <div className="flex-1">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="615957803"
                  pattern="[0-9]{8,}"
                  title="Phone number must be at least 8 digits"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Enter phone number (minimum 8 digits)</p>
          </div>
          
          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email (Optional)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter email address"
            />
          </div>
          
          {/* Role Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="customer">Customer</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          {/* Password */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter password"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters long.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded mr-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm; 