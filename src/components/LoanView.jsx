import { useState, useEffect } from 'react';
import { getLoanById } from '../services/loan.service';
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

const LoanView = ({ loanId, onClose }) => {
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        setLoading(true);
        const loanData = await getLoanById(loanId);
        setLoan(loanData);
      } catch (error) {
        console.error('Error fetching loan details:', error);
        toast.error('Failed to load loan details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoanDetails();
  }, [loanId]);
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
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
  
  if (!loan) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary-800">Loan Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-8 text-center">
            <p className="text-gray-700">Loan not found or has been deleted.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary-800">
            Loan #{loan.id} Details
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
          {/* Customer Information */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-primary-700">Customer Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 font-medium">Customer ID:</span>
                <span className="ml-2 text-gray-800">{loan.customer_id}</span>
              </div>
              {loan.customer_name && (
                <div>
                  <span className="text-gray-600 font-medium">Customer Name:</span>
                  <span className="ml-2 text-gray-800">{loan.customer_name}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Loan Status */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-primary-700">Loan Status</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 font-medium">Current Status:</span>
                <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${loan.current_status === 'active' ? 'bg-accent-light text-primary-800' : 
                   loan.current_status === 'paid' ? 'bg-secondary-500 text-white' : 
                   loan.current_status === 'defaulted' ? 'bg-accent-warm text-white' : 
                   'bg-gray-100 text-gray-800'}`}>
                  {loan.current_status || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Created:</span>
                <span className="ml-2 text-gray-800">
                  {loan.created_at ? new Date(loan.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Last Updated:</span>
                <span className="ml-2 text-gray-800">
                  {loan.updated_at ? new Date(loan.updated_at).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Loan Amounts */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-primary-700">Loan Amounts</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 font-medium">Original Amount:</span>
                <span className="ml-2 text-gray-800">{formatCurrency(loan.loan_amount)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Paid Amount:</span>
                <span className="ml-2 text-gray-800">{formatCurrency(loan.paid_amount)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Paid Interest:</span>
                <span className="ml-2 text-gray-800">{formatCurrency(loan.paid_interest)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Principle Left:</span>
                <span className="ml-2 text-gray-800">{formatCurrency(loan.principle_amount)}</span>
              </div>
            </div>
          </div>
          
          {/* Interest and Rates */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-primary-700">Interest & Rates</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 font-medium">Interest Rate:</span>
                <span className="ml-2 text-gray-800">{loan.interest_rate}%</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Overdue Rate:</span>
                <span className="ml-2 text-gray-800">{loan.overdue_rate}%</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Interest Amount:</span>
                <span className="ml-2 text-gray-800">{formatCurrency(loan.interest_amount)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Overdue Amount:</span>
                <span className="ml-2 text-gray-800">{formatCurrency(loan.overdue_amount)}</span>
              </div>
              <div className="font-semibold">
                <span className="text-gray-600 font-medium">Total Due:</span>
                <span className="ml-2 text-primary-800">{formatCurrency(loan.total_amount)}</span>
              </div>
            </div>
          </div>
          
          {/* Dates */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-primary-700">Important Dates</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 font-medium">Start Date:</span>
                <span className="ml-2 text-gray-800">
                  {loan.start_date ? new Date(loan.start_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">End Date:</span>
                <span className="ml-2 text-gray-800">
                  {loan.end_date ? new Date(loan.end_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Default Date:</span>
                <span className="ml-2 text-gray-800">
                  {loan.default_date ? new Date(loan.default_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Days and Periods */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-primary-700">Loan Period Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 font-medium">Loan Period:</span>
                <span className="ml-2 text-gray-800">{loan.loan_period} days</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Waiting Days:</span>
                <span className="ml-2 text-gray-800">{loan.waiting_days} days</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Remaining Days:</span>
                <span className="ml-2 text-gray-800">{loan.remaining_days} days</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Interest Days:</span>
                <span className="ml-2 text-gray-800">{loan.interest_days} days</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Overdue Days:</span>
                <span className="ml-2 text-gray-800">{loan.overdue_days} days</span>
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

export default LoanView; 