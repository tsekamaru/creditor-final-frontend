import { useState, useEffect } from 'react';
import { getTransactionById } from '../../services/transaction.service';
import { toast } from 'react-toastify';

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₮0.00';
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format with thousand separators
  return '₮' + numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const TransactionView = ({ transactionId, onClose }) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setLoading(true);
        const transactionData = await getTransactionById(transactionId);
        setTransaction(transactionData.transaction || transactionData);
      } catch (error) {
        console.error('Error fetching transaction details:', error);
        toast.error('Failed to load transaction details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactionDetails();
  }, [transactionId]);
  
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
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!transaction) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary-800">Transaction Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-8 text-center">
            <p className="text-gray-700">Transaction not found or has been deleted.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary-800">
            Transaction #{transaction.id} Details
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Transaction Information */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-primary-700">Transaction Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 font-medium">Transaction ID:</span>
                <span className="ml-2 text-gray-800">#{transaction.id}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Purpose:</span>
                <span className="ml-2">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionPurposeLabel(transaction.transaction_purpose).classes}`}>
                    {getTransactionPurposeLabel(transaction.transaction_purpose).label}
                  </span>
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Direction:</span>
                <span className="ml-2">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionDirectionLabel(transaction.transaction_direction).classes}`}>
                    {getTransactionDirectionLabel(transaction.transaction_direction).label}
                  </span>
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Amount:</span>
                <span className="ml-2 text-gray-800 font-semibold">{formatCurrency(transaction.transaction_amount)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Principle Amount:</span>
                <span className="ml-2 text-gray-800">{formatCurrency(transaction.principle_amount)}</span>
              </div>
            </div>
          </div>
          
          {/* Related Entities */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-primary-700">Related Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 font-medium">Loan ID:</span>
                <span className="ml-2 text-gray-800">#{transaction.loan_id}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Customer ID:</span>
                <span className="ml-2 text-gray-800">#{transaction.customer_id}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Customer Name:</span>
                <span className="ml-2 text-gray-800">
                  {transaction.customer_first_name} {transaction.customer_last_name}
                </span>
              </div>
              {transaction.employee_id && (
                <div>
                  <span className="text-gray-600 font-medium">Employee ID:</span>
                  <span className="ml-2 text-gray-800">#{transaction.employee_id}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Dates and Timestamps */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm md:col-span-2">
            <h3 className="text-lg font-semibold mb-3 text-primary-700">Timestamps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600 font-medium">Created At:</span>
                <span className="ml-2 text-gray-800">
                  {transaction.created_at ? new Date(transaction.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Updated At:</span>
                <span className="ml-2 text-gray-800">
                  {transaction.updated_at ? new Date(transaction.updated_at).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionView; 