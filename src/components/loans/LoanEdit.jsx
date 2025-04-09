import { useState, useEffect } from 'react';
import { getLoanById, updateLoan, deleteLoan } from '../../services/loan.service';
import { getCustomerById } from '../../services/customer.service';
import { toast } from 'react-toastify';

const LoanEdit = ({ loanId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    start_date: '',
    extension_date: '',
    loan_amount: ''
  });
  const [originalLoan, setOriginalLoan] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [fetchingCustomer, setFetchingCustomer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '';
    
    // Convert to number if it's a string
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Format with thousand separators
    return numAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Parse currency input
  const parseCurrency = (value) => {
    if (!value) return '';
    // Remove all non-numeric characters except decimal point
    return parseFloat(value.replace(/[^\d.]/g, ''));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        
        // Fetch loan details
        const loanData = await getLoanById(loanId);
        setOriginalLoan(loanData.loan);
        
        // Set form data with loan details
        setFormData({
          customer_id: loanData.loan.customer_id,
          start_date: formatDateForInput(loanData.loan.start_date),
          extension_date: formatDateForInput(loanData.loan.extension_date),
          loan_amount: loanData.loan.loan_amount
        });
        
        // Fetch customer details if there's a customer ID
        if (loanData.loan.customer_id) {
          try {
            setFetchingCustomer(true);
            const customerData = await getCustomerById(loanData.loan.customer_id);
            if (customerData && customerData.customer) {
              setCustomerDetails(customerData.customer);
            }
          } catch (error) {
            console.error('Error fetching customer details:', error);
            setCustomerDetails(null);
          } finally {
            setFetchingCustomer(false);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load loan data');
      } finally {
        setFetchingData(false);
      }
    };
    
    fetchData();
  }, [loanId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'loan_amount') {
      setFormData({
        ...formData,
        [name]: parseCurrency(value)
      });
    } else if (name === 'customer_id') {
      // Update the customer ID in the form
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Fetch customer details if a valid ID is entered
      if (value && !isNaN(value)) {
        // Directly fetch customer data using the service
        setFetchingCustomer(true);
        getCustomerById(value)
          .then(customerData => {
            if (customerData && customerData.customer) {
              setCustomerDetails(customerData.customer);
            }
          })
          .catch(error => {
            console.error('Error fetching customer details:', error);
            setCustomerDetails(null);
          })
          .finally(() => {
            setFetchingCustomer(false);
          });
      } else {
        setCustomerDetails(null);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customer_id || !formData.loan_amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Validate that a customer exists with this ID
    if (!customerDetails) {
      toast.error('Please enter a valid customer ID');
      return;
    }

    try {
      setLoading(true);
      const result = await updateLoan(loanId, formData);
      toast.success('Loan updated successfully');
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Close the form
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error updating loan:', error);
      toast.error(error.response?.data?.message || 'Failed to update loan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteLoan(loanId);
      toast.success('Loan deleted successfully');
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Close the form
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error deleting loan:', error);
      toast.error(error.response?.data?.message || 'Failed to delete loan');
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary-800">Edit Loan #{loanId}</h2>
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
          {/* Customer Selection - Enhanced */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customer_id">
              Customer *
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
            
            {/* Preview selected customer details if available */}
            {formData.customer_id && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                {fetchingCustomer ? (
                  <div className="text-center py-2">
                    <span className="text-sm text-gray-500">Loading customer details...</span>
                  </div>
                ) : customerDetails ? (
                  <>
                    <div className="font-medium text-gray-700">Customer Details:</div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {(customerDetails.first_name || customerDetails.last_name) && (
                        <div>
                          <span className="font-medium">Name:</span> 
                          {`${customerDetails.first_name || ''} ${customerDetails.last_name || ''}`}
                        </div>
                      )}
                      {customerDetails.phone_number && (
                        <div>
                          <span className="font-medium">Phone:</span> {customerDetails.phone_number}
                        </div>
                      )}
                      {customerDetails.email && (
                        <div>
                          <span className="font-medium">Email:</span> {customerDetails.email}
                        </div>
                      )}
                      {customerDetails.address && (
                        <div className="col-span-2">
                          <span className="font-medium">Address:</span> {customerDetails.address}
                        </div>
                      )}
                      {customerDetails.is_active !== undefined && (
                        <div>
                          <span className="font-medium">Status:</span>
                          <span className={`ml-1 px-1 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full
                            ${customerDetails.is_active ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                            {customerDetails.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <span className="text-sm text-gray-500">No customer found with ID {formData.customer_id}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
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
                value={formatCurrency(formData.loan_amount)}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 pl-8 pr-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          {/* Start Date */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="start_date">
              Start Date
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {/* Extension Date */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="extension_date">
              Extension Date
            </label>
            <input
              id="extension_date"
              name="extension_date"
              type="date"
              value={formData.extension_date}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will adjust the loan end date and default date accordingly.
            </p>
          </div>
          
          {/* Current Loan Status Info */}
          {originalLoan && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Loan Status</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium">Status: </span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium 
                    ${originalLoan.current_status === 'active' ? 'bg-accent-light text-primary-800' : 
                    originalLoan.current_status === 'paid' ? 'bg-secondary-500 text-white' : 
                    originalLoan.current_status === 'defaulted' ? 'bg-accent-warm text-white' : 
                    'bg-gray-100 text-gray-800'}`}>
                    {originalLoan.current_status}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Principle Left: </span>
                  <span>₮{formatCurrency(originalLoan.principle_amount)}</span>
                </div>
                <div>
                  <span className="font-medium">End Date: </span>
                  <span>{originalLoan.end_date ? new Date(originalLoan.end_date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium">Default Date: </span>
                  <span>{originalLoan.default_date ? new Date(originalLoan.default_date).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button 
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            <div className="flex items-center">
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
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </form>
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this loan? This action cannot be undone and may affect associated transactions.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className={`bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors flex items-center ${deleteLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanEdit; 