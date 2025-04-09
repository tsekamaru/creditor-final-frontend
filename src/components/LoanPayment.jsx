import { useState, useEffect } from 'react';
import { getLoanById, makePayment } from '../services/loan.service';
import { toast } from 'react-toastify';

const LoanPayment = ({ loanId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    principle_payment: 0,
    interest_payment: 0
  });
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [payFullPrinciple, setPayFullPrinciple] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        
        // Fetch loan details
        const loanData = await getLoanById(loanId);
        
        if (!loanData || !loanData.loan) {
          throw new Error('Loan data not found');
        }
        
        setLoan(loanData.loan);
        
        // Set the initial form data - always paying full interest
        setFormData({
          principle_payment: loanData.loan.principle_amount || 0,
          interest_payment: loanData.loan.interest_amount || 0
        });
      } catch (error) {
        console.error('Error fetching loan data:', error);
        toast.error('Failed to load loan data');
      } finally {
        setFetchingData(false);
      }
    };
    
    fetchData();
  }, [loanId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'principle_payment') {
      // Only allow numbers and decimal point
      const numericValue = value.replace(/[^\d.]/g, '');
      
      // Prevent multiple decimal points
      const parts = numericValue.split('.');
      const cleanValue = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
      
      setFormData({
        ...formData,
        [name]: cleanValue
      });
      
      // Update the checkbox if user manually changes the amount to match the full principle
      setPayFullPrinciple(parseFloat(cleanValue) === loan?.principle_amount);
    }
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    
    if (name === 'payFullPrinciple') {
      setPayFullPrinciple(checked);
      setFormData({
        ...formData,
        principle_payment: checked ? (loan?.principle_amount || 0) : 0
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get the values from the form
    let principlePayment = parseFloat(formData.principle_payment);
    const interestPayment = parseFloat(loan.interest_amount);
    
    // Validate principle payment is a number
    if (isNaN(principlePayment)) {
      principlePayment = 0;
    }
    
    // Ensure interest is always paid in full and include customer_id
    const paymentData = {
      principle_payment: Number(principlePayment.toFixed(2)),
      interest_payment: Number(interestPayment.toFixed(2)),
      customer_id: loan.customer_id
    };
    
    // Validation
    if (paymentData.principle_payment === 0 && paymentData.interest_payment === 0) {
      toast.error('Please enter a payment amount');
      return;
    }
    
    // Ensure principle payment is not more than what's owed
    if (paymentData.principle_payment > Number(parseFloat(loan.principle_amount).toFixed(2))) {
      toast.error('Principle payment cannot exceed the principle amount');
      return;
    }

    try {
      setLoading(true);
      const result = await makePayment(loanId, paymentData);
      toast.success('Payment successful');
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Close the form
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error making payment:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setLoading(false);
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary-800">Make Payment for Loan #{loanId}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {loan && (
          <form onSubmit={handleSubmit}>
            {/* Current Loan Status Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Loan Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium">Status: </span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium 
                    ${loan.current_status === 'active' ? 'bg-accent-light text-primary-800' : 
                     loan.current_status === 'paid' ? 'bg-secondary-500 text-white' : 
                     loan.current_status === 'defaulted' ? 'bg-accent-warm text-white' : 
                     'bg-gray-100 text-gray-800'}`}>
                    {loan.current_status}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Original Amount: </span>
                  <span>₮{formatCurrency(loan.loan_amount)}</span>
                </div>
                <div>
                  <span className="font-medium">Principle Left: </span>
                  <span>₮{formatCurrency(loan.principle_amount)}</span>
                </div>
                <div>
                  <span className="font-medium">Interest Due: </span>
                  <span>₮{formatCurrency(loan.interest_amount)}</span>
                </div>
                <div>
                  <span className="font-medium">End Date: </span>
                  <span>{loan.end_date ? new Date(loan.end_date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium">Total Due: </span>
                  <span className="font-bold text-accent-warm">₮{formatCurrency(loan.total_amount)}</span>
                </div>
              </div>
            </div>
            
            {/* Interest Payment */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <label className="block text-gray-700 text-sm font-bold" htmlFor="interest_payment">
                  Interest Payment (₮)
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₮</span>
                <input
                  id="interest_payment"
                  name="interest_payment"
                  type="text"
                  value={formatCurrency(loan?.interest_amount || 0)}
                  disabled
                  className="shadow appearance-none border rounded w-full py-2 pl-8 pr-3 bg-gray-100 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Full interest payment is required for any loan payment.
              </p>
            </div>
            
            {/* Principle Payment */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <label className="block text-gray-700 text-sm font-bold" htmlFor="principle_payment">
                  Principle Payment (₮)
                </label>
                <div className="ml-auto">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="payFullPrinciple"
                      checked={payFullPrinciple}
                      onChange={handleCheckboxChange}
                      className="form-checkbox h-4 w-4 text-primary-600 transition duration-150 ease-in-out"
                    />
                    <span className="ml-2 text-sm text-gray-600">Pay Full Principle</span>
                  </label>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₮</span>
                <input
                  id="principle_payment"
                  name="principle_payment"
                  type="text"
                  value={formData.principle_payment}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 pl-8 pr-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                You can make partial payments towards your principle.
              </p>
            </div>
            
            {/* Total Payment */}
            <div className="mb-6 p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium text-gray-700">Total Payment:</h3>
                <span className="text-lg font-bold text-primary-800">
                  ₮{formatCurrency(parseFloat(formData.principle_payment || 0) + parseFloat(loan?.interest_amount || 0))}
                </span>
              </div>
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
                className={`bg-accent-warm hover:bg-accent-warm/90 text-white font-medium py-2 px-4 rounded transition-colors flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
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
                  'Make Payment'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoanPayment; 