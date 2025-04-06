import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createTransaction } from '../services/transaction.service';
import { getAllUsers } from '../services/user.service';
import { getAllLoans } from '../services/loan.service';

const TransactionForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    transaction_amount: '',
    transaction_purpose: 'loan_principle_payment',
    loan_id: '',
    transaction_direction: 'in'
  });
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  // Fetch customers and loans for the dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        
        // Fetch customers
        const usersResponse = await getAllUsers();
        // Filter only customers
        const customersList = usersResponse.filter(user => user.role === 'customer');
        setCustomers(customersList);
        
        // Fetch all loans
        const loansResponse = await getAllLoans();
        setLoans(loansResponse.loans || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load reference data');
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, []);

  // Filter loans by selected customer
  const filteredLoans = selectedCustomerId 
    ? loans.filter(loan => loan.customer_id.toString() === selectedCustomerId.toString())
    : loans;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for numeric fields
    if (name === 'transaction_amount') {
      const numValue = parseFloat(value.replace(/,/g, ''));
      if (!isNaN(numValue)) {
        setFormData({
          ...formData,
          [name]: numValue
        });
      } else if (value === '') {
        setFormData({
          ...formData,
          [name]: ''
        });
      }
    } 
    // Special handling for customer selection
    else if (name === 'customer_id') {
      setSelectedCustomerId(value);
      setFormData({
        ...formData,
        loan_id: '' // Reset loan when customer changes
      });
    }
    // Default handling
    else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.transaction_amount || !formData.loan_id || !formData.transaction_purpose) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      // Prepare transaction data
      const transactionData = {
        ...formData,
        transaction_amount: parseFloat(formData.transaction_amount)
      };
      
      const result = await createTransaction(transactionData);
      toast.success('Transaction recorded successfully');
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Close the form
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error(error.response?.data?.message || 'Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  // Function to get label and class for transaction purpose
  const getTransactionPurposeInfo = (purpose) => {
    switch (purpose) {
      case 'loan_principle_payment':
        return { label: 'Principle Payment', directionHint: 'in' };
      case 'loan_interest_payment':
        return { label: 'Interest Payment', directionHint: 'in' };
      case 'loan_disbursement':
        return { label: 'Loan Disbursement', directionHint: 'out' };
      default:
        return { label: purpose?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown', directionHint: 'in' };
    }
  };

  // Update transaction direction based on purpose
  useEffect(() => {
    const purposeInfo = getTransactionPurposeInfo(formData.transaction_purpose);
    setFormData(prevData => ({
      ...prevData,
      transaction_direction: purposeInfo.directionHint
    }));
  }, [formData.transaction_purpose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary-800">Record Transaction</h2>
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
          {/* Transaction Purpose */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transaction_purpose">
              Transaction Purpose *
            </label>
            {fetchingData ? (
              <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
            ) : (
              <select
                id="transaction_purpose"
                name="transaction_purpose"
                value={formData.transaction_purpose}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="loan_principle_payment">Principle Payment</option>
                <option value="loan_interest_payment">Interest Payment</option>
                <option value="loan_disbursement">Loan Disbursement</option>
              </select>
            )}
          </div>
          
          {/* Transaction Direction */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transaction_direction">
              Transaction Direction
            </label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="transaction_direction"
                  value="in"
                  checked={formData.transaction_direction === 'in'}
                  disabled
                  className="form-radio text-primary-600 cursor-not-allowed opacity-60"
                />
                <span className="ml-2">In (Received)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="transaction_direction"
                  value="out"
                  checked={formData.transaction_direction === 'out'}
                  disabled
                  className="form-radio text-accent-warm cursor-not-allowed opacity-60"
                />
                <span className="ml-2">Out (Paid)</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Direction is automatically set based on transaction purpose
            </p>
          </div>
          
          {/* Customer Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="customer_id">
              Customer *
            </label>
            {fetchingData ? (
              <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
            ) : (
              <select
                id="customer_id"
                name="customer_id"
                value={selectedCustomerId}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name || customer.phone_number || `Customer #${customer.id}`}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          {/* Loan Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="loan_id">
              Loan *
            </label>
            {fetchingData ? (
              <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
            ) : (
              <select
                id="loan_id"
                name="loan_id"
                value={formData.loan_id}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
                disabled={!selectedCustomerId}
              >
                <option value="">
                  {selectedCustomerId ? 'Select a loan' : 'Select a customer first'}
                </option>
                {filteredLoans.map((loan) => (
                  <option key={loan.id} value={loan.id}>
                    Loan #{loan.id} - ₮{loan.loan_amount?.toLocaleString() || 0}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          {/* Transaction Amount */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transaction_amount">
              Amount (₮) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₮</span>
              <input
                id="transaction_amount"
                name="transaction_amount"
                type="text"
                value={formData.transaction_amount === '' ? '' : formData.transaction_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 pl-8 pr-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter the amount of the transaction.
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
                'Record Transaction'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm; 