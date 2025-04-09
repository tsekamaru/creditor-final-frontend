import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createLoan } from '../../services/loan.service';
import { getCustomerById } from '../../services/customer.service';
import { useAuth } from '../../hooks/useAuth';

const LoanForm = ({ onClose, onSuccess, isCustomerApplication = false }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    customer_id: '',
    loan_amount: '',
    purpose: '',
    loan_period: 30 // Default loan period in days
  });
  const [loading, setLoading] = useState(false);
  const [fetchingCustomer, setFetchingCustomer] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);

  // Function to fetch customer details when an ID is entered
  const fetchCustomerDetails = async (customerId) => {
    if (!customerId) {
      setCustomerDetails(null);
      return;
    }
    
    try {
      setFetchingCustomer(true);
      const customerData = await getCustomerById(customerId);
      if (customerData) {
        setCustomerDetails(customerData);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast.error('Failed to find customer with that ID');
      setCustomerDetails(null);
    } finally {
      setFetchingCustomer(false);
    }
  };

  // For customer applications, pre-populate the customer_id
  useEffect(() => {
    if (isCustomerApplication && currentUser) {
      setFormData(prev => ({
        ...prev,
        customer_id: currentUser.id
      }));
      
      // For customer applications, fetch the customer's own details
      if (currentUser.id) {
        fetchCustomerDetails(currentUser.id);
      }
    }
  }, [isCustomerApplication, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'loan_amount') {
      // Only allow numbers and decimal point
      const numericValue = value.replace(/[^\d.]/g, '');
      
      // Prevent multiple decimal points
      const parts = numericValue.split('.');
      const cleanValue = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
      
      setFormData({
        ...formData,
        [name]: cleanValue
      });
    } else if (name === 'customer_id') {
      // Only allow numeric values for customer ID
      const numericValue = value.replace(/\D/g, '');
      
      setFormData({
        ...formData,
        [name]: numericValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate loan amount
    if (!formData.loan_amount || isNaN(parseFloat(formData.loan_amount)) || parseFloat(formData.loan_amount) <= 0) {
      toast.error('Please enter a valid loan amount');
      return;
    }
    
    // Different validation for customer application vs admin creation
    if (isCustomerApplication) {
      // Purpose is required for customer applications
      if (!formData.purpose) {
        toast.error('Please specify the purpose of the loan');
        return;
      }
    } else {
      if (!formData.customer_id) {
        toast.error('Please enter a customer ID');
        return;
      }
      
      // Fetch and validate customer ID at submission time
      try {
        setLoading(true);
        const response = await getCustomerById(formData.customer_id);
        if (!response || !response.success || !response.customer) {
          toast.error('Invalid customer ID. Customer not found.');
          setLoading(false);
          return;
        }
        // Update customer details for the form
        setCustomerDetails(response.customer);
      } catch (error) {
        console.error('Error validating customer:', error);
        toast.error('Invalid customer ID. Please check and try again.');
        setLoading(false);
        return;
      }
    }

    // Format loan amount to ensure it's a number
    const formattedData = {
      ...formData,
      loan_amount: parseFloat(parseFloat(formData.loan_amount).toFixed(2))
    };

    try {
      // We're already loading from the customer validation step for admin
      if (!loading) setLoading(true);
      
      const result = await createLoan(formattedData);
      
      if (isCustomerApplication) {
        toast.success('Loan application submitted successfully');
      } else {
        toast.success('Loan created successfully');
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Close the form
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating loan:', error);
      toast.error(error.response?.data?.message || 'Failed to process loan request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary-800">
            {isCustomerApplication ? 'Apply for a Loan' : 'Create New Loan'}
          </h2>
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
          {/* Customer Selection - Only shown for admin/employee */}
          {!isCustomerApplication && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customer_id">
                Customer ID *
              </label>
              <input
                id="customer_id"
                name="customer_id"
                type="text"
                value={formData.customer_id}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter customer ID"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter customer ID. Customer details will be verified when you submit.
              </p>
            </div>
          )}
          
          {/* Loan Amount */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="loan_amount">
              Loan Amount (₮) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₮</span>
              <input
                id="loan_amount"
                name="loan_amount"
                type="text"
                value={formData.loan_amount}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 pl-8 pr-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter the principal amount of the loan. Interest will be calculated automatically based on the loan period.
            </p>
          </div>
          
          {/* Loan Period - only visible for customer applications */}
          {isCustomerApplication && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="loan_period">
                Loan Period (days)
              </label>
              <select
                id="loan_period"
                name="loan_period"
                value={formData.loan_period}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          )}
          
          {/* Loan Purpose - only visible for customer applications */}
          {isCustomerApplication && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="purpose">
                Loan Purpose *
              </label>
              <textarea
                id="purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Briefly describe the purpose of this loan"
                rows="3"
                required
              />
            </div>
          )}
          
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
              className={`${isCustomerApplication ? 'bg-accent-warm hover:bg-accent-warm/90' : 'bg-primary-600 hover:bg-primary-700'} text-white font-medium py-2 px-4 rounded transition-colors flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
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
                isCustomerApplication ? 'Submit Application' : 'Create Loan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanForm; 