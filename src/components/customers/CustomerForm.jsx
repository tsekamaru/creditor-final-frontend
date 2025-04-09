import { useState } from 'react';
import { toast } from 'react-toastify';
import { createCustomer } from '../../services/customer.service';

const CustomerForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    social_security_number: '',
    date_of_birth: '',
    address: '',
    country_code: '+31',
    phone_number: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.social_security_number || 
        !formData.date_of_birth || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Password validation
    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    // Phone validation
    if (!formData.country_code || !formData.phone_number) {
      toast.error('Please enter a complete phone number with country code');
      return;
    }

    try {
      setLoading(true);
      // Combine country code and phone number
      const fullPhoneNumber = `${formData.country_code}${formData.phone_number.startsWith(' ') ? '' : ' '}${formData.phone_number}`;
      
      const customerData = {
        ...formData,
        phone_number: fullPhoneNumber
      };
      
      delete customerData.country_code; // Remove separate country_code field
      
      const result = await createCustomer(customerData);
      toast.success('Customer created successfully');
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Close the form
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error(error.response?.data?.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary-800">Add New Customer</h2>
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
          {/* Personal Information */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="first_name">
                First Name *
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="last_name">
                Last Name *
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>
          
          {/* Social Security Number */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="social_security_number">
              Social Security Number *
            </label>
            <input
              id="social_security_number"
              name="social_security_number"
              type="text"
              value={formData.social_security_number}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., 123-45-6789"
              required
            />
          </div>
          
          {/* Date of Birth */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date_of_birth">
              Date of Birth *
            </label>
            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          {/* Address */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
              Address *
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              rows="2"
              required
            ></textarea>
          </div>
          
          {/* Phone Number - Split into country code and number */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Phone Number *
            </label>
            <div className="flex gap-2">
              <div className="w-1/4">
                <input
                  name="country_code"
                  type="text"
                  value={formData.country_code}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="+1"
                  required
                />
              </div>
              <div className="w-3/4">
                <input
                  id="phone_number"
                  name="phone_number"
                  type="text"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="234-567-8900"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter country code (e.g. +1) and phone number separately
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="customer@example.com"
              required
            />
          </div>
          
          {/* Account Information */}
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
              placeholder="At least 6 characters"
              required
              minLength="6"
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 6 characters long.
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
                  Creating...
                </>
              ) : (
                'Create Customer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm; 