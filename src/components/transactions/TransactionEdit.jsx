import { useState, useEffect } from 'react';
import { getTransactionById, updateTransaction, deleteTransaction } from '../../services/transaction.service';
import { toast } from 'react-toastify';

const TransactionEdit = ({ transactionId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    transaction_amount: '',
    transaction_purpose: '',
    transaction_direction: '',
    loan_id: '',
    customer_id: '',
    employee_id: '',
    principle_amount: 0
  });
  const [originalTransaction, setOriginalTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        
        // Fetch transaction details
        const transactionData = await getTransactionById(transactionId);
        const transaction = transactionData.transaction || transactionData;
        setOriginalTransaction(transaction);
        
        // Set form data with transaction details
        setFormData({
          transaction_amount: transaction.transaction_amount || '',
          transaction_purpose: transaction.transaction_purpose || '',
          transaction_direction: transaction.transaction_direction || 'in',
          loan_id: transaction.loan_id || '',
          customer_id: transaction.customer_id || '',
          employee_id: transaction.employee_id || '',
          principle_amount: transaction.principle_amount || 0
        });
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        toast.error('Failed to load transaction data');
      } finally {
        setFetchingData(false);
      }
    };
    
    fetchData();
  }, [transactionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'transaction_amount' || name === 'principle_amount') {
      // Simplified validation - just allow numbers and decimal points
      const numericValue = value.replace(/[^\d.]/g, '');
      // Prevent multiple decimal points
      const parts = numericValue.split('.');
      const cleanValue = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
      
      setFormData({
        ...formData,
        [name]: cleanValue
      });
    } else if (name === 'loan_id' || name === 'customer_id' || name === 'employee_id') {
      // Only allow numeric values for IDs
      const numericValue = value.replace(/\D/g, '');
      
      setFormData({
        ...formData,
        [name]: numericValue
      });
    } else if (name === 'transaction_purpose') {
      // Automatically set direction based on purpose
      let direction = 'in';
      if (value === 'loan_disbursement') {
        direction = 'out';
      }
      
      setFormData({
        ...formData,
        [name]: value,
        transaction_direction: direction
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
    
    // Validation
    if (!formData.transaction_amount || !formData.transaction_purpose) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate amount is a valid number
    const amount = parseFloat(formData.transaction_amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid transaction amount');
      return;
    }

    try {
      setLoading(true);
      // Include all required fields for the backend, converting strings to numbers
      const transactionData = {
        transaction_amount: parseFloat(formData.transaction_amount),
        transaction_purpose: formData.transaction_purpose,
        transaction_direction: formData.transaction_direction,
        loan_id: parseInt(formData.loan_id, 10) || null,
        customer_id: parseInt(formData.customer_id, 10) || null,
        employee_id: parseInt(formData.employee_id, 10) || null,
        principle_amount: parseFloat(formData.principle_amount) || 0
      };
      
      const result = await updateTransaction(transactionId, transactionData);
      toast.success('Transaction updated successfully');
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Close the form
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error(error.response?.data?.message || 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteTransaction(transactionId);
      toast.success('Transaction deleted successfully');
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Close the form
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error(error.response?.data?.message || 'Failed to delete transaction');
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Function to get transaction purpose label and styles
  const getTransactionPurposeLabel = (purpose) => {
    switch (purpose) {
      case 'loan_principle_payment':
        return {
          label: 'Principle Payment',
          classes: 'bg-green-100 text-green-800'
        }
      case 'loan_interest_payment':
        return {
          label: 'Interest Payment',
          classes: 'bg-blue-100 text-blue-800'
        }
      case 'loan_disbursement':
        return {
          label: 'Loan Disbursement',
          classes: 'bg-purple-100 text-purple-800'
        }
      case 'loan_extension_fee':
        return {
          label: 'Extension Fee',
          classes: 'bg-yellow-100 text-yellow-800'
        }
      case 'loan_late_fee':
        return {
          label: 'Late Fee',
          classes: 'bg-orange-100 text-orange-800'
        }
      default:
        return {
          label: purpose?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown',
          classes: 'bg-gray-100 text-gray-800'
        }
    }
  }

  // Function to get transaction direction label and styles
  const getTransactionDirectionLabel = (direction) => {
    switch (direction) {
      case 'in':
        return {
          label: 'In',
          classes: 'bg-green-100 text-green-800'
        }
      case 'out':
        return {
          label: 'Out',
          classes: 'bg-accent-warm text-white'
        }
      default:
        return {
          label: direction || 'Unknown',
          classes: 'bg-gray-100 text-gray-800'
        }
    }
  }

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
          <h2 className="text-xl font-bold text-primary-800">Edit Transaction #{transactionId}</h2>
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
                  className={`form-radio ${formData.transaction_direction === 'in' 
                    ? 'text-primary-600 border-2 border-primary-600 bg-primary-100' 
                    : 'text-gray-400'} cursor-not-allowed`}
                />
                <span className={`ml-2 ${formData.transaction_direction === 'in' ? 'text-primary-700 font-semibold' : 'text-gray-500'}`}>
                  In (Received)
                </span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="transaction_direction"
                  value="out"
                  checked={formData.transaction_direction === 'out'}
                  disabled
                  className={`form-radio ${formData.transaction_direction === 'out'
                    ? 'text-accent-warm border-2 border-accent-warm bg-accent-warm/20'
                    : 'text-gray-400'} cursor-not-allowed`}
                />
                <span className={`ml-2 ${formData.transaction_direction === 'out' ? 'text-accent-warm font-semibold' : 'text-gray-500'}`}>
                  Out (Paid)
                </span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Direction is automatically set based on transaction purpose
            </p>
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
                value={formData.transaction_amount}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 pl-8 pr-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          {/* Current Transaction Info */}
          {originalTransaction && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Transaction Information</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium">Related Loan: </span>
                  <span>#{originalTransaction.loan_id}</span>
                </div>
                <div>
                  <span className="font-medium">Customer: </span>
                  <span>#{originalTransaction.customer_id}</span>
                </div>
                <div>
                  <span className="font-medium">Purpose: </span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getTransactionPurposeLabel(originalTransaction.transaction_purpose).classes}`}>
                    {getTransactionPurposeLabel(originalTransaction.transaction_purpose).label}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Direction: </span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getTransactionDirectionLabel(originalTransaction.transaction_direction).classes}`}>
                    {getTransactionDirectionLabel(originalTransaction.transaction_direction).label}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Created At: </span>
                  <span>{originalTransaction.created_at ? new Date(originalTransaction.created_at).toLocaleDateString() : 'N/A'}</span>
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
                Are you sure you want to delete this transaction? This action cannot be undone.
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

export default TransactionEdit; 