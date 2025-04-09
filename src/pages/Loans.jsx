import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { roles } from '../constants/roles'
import { getAllLoans } from '../services/loan.service'
import { getCustomerLoans } from '../services/customer.service'
import { toast } from 'react-toastify'
import '../styles/table.css'
import LoanForm from '../components/loans/LoanForm'
import LoanView from '../components/loans/LoanView'
import LoanEdit from '../components/loans/LoanEdit'
import LoanPayment from '../components/loans/LoanPayment'

// Function to format currency with Mongolian tugrik symbol and thousand separators
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₮0';
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format with thousand separators
  return '₮' + numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const Loans = () => {
  const { currentUser } = useAuth()
  const [loans, setLoans] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, active, paid, defaulted (matching the backend enum)
  const [showLoanForm, setShowLoanForm] = useState(false)
  const [viewingLoan, setViewingLoan] = useState(null) // ID of loan being viewed
  const [editingLoan, setEditingLoan] = useState(null) // ID of loan being edited
  const [payingLoan, setPayingLoan] = useState(null) // ID of loan being paid

  const fetchLoans = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Fetch loans based on user role
      let response
      if (currentUser?.role === roles.customer) {
        response = await getCustomerLoans(currentUser.id)
      } else {
        response = await getAllLoans()
      }

      setLoans(response.loans)
    } catch (error) {
      console.error('Error fetching loans:', error)
      toast.error('Failed to load loans data')
      setLoans([]) // Set empty array on error for safety
    } finally {
      setIsLoading(false)
    }
  }, [currentUser?.role])

  useEffect(() => {
    fetchLoans()
  }, [fetchLoans])

  // Handle loan creation success
  const handleLoanCreated = () => {
    fetchLoans();
  };
  
  // Handle loan update success
  const handleLoanUpdated = () => {
    fetchLoans();
  };
  
  // Handle opening loan view
  const handleViewLoan = (loanId) => {
    setViewingLoan(loanId);
  }
  
  // Handle opening loan edit
  const handleEditLoan = (loanId) => {
    setEditingLoan(loanId);
  };
  
  // Handle opening payment modal
  const handlePaymentModal = (loanId) => {
    setPayingLoan(loanId);
  };

  // Filter and search loans
  const filteredLoans = loans.filter(loan => {
    // First apply the status filter
    if (statusFilter !== 'all' && loan.current_status !== statusFilter) {
      return false
    }
    
    // Then apply the search filter if there's search text
    if (search) {
      const searchLower = search.toLowerCase()
      
      // Search in loan data
      const loanMatch = 
        // ID and amounts
        loan.id?.toString().includes(searchLower) ||
        loan.loan_amount?.toString().includes(searchLower) ||
        loan.paid_amount?.toString().includes(searchLower) ||
        loan.principle_amount?.toString().includes(searchLower) ||
        loan.interest_amount?.toString().includes(searchLower) ||
        loan.overdue_amount?.toString().includes(searchLower) ||
        loan.total_amount?.toString().includes(searchLower) ||
        // Status
        loan.current_status?.toLowerCase().includes(searchLower) ||
        // Dates
        new Date(loan.created_at).toLocaleDateString().includes(searchLower) ||
        new Date(loan.start_date).toLocaleDateString().includes(searchLower) ||
        new Date(loan.end_date).toLocaleDateString().includes(searchLower) ||
        new Date(loan.default_date).toLocaleDateString().includes(searchLower) ||
        // Interest rates
        loan.interest_rate?.toString().includes(searchLower) ||
        loan.overdue_rate?.toString().includes(searchLower) ||
        // Days
        loan.loan_period?.toString().includes(searchLower) ||
        loan.waiting_days?.toString().includes(searchLower) ||
        loan.remaining_days?.toString().includes(searchLower) ||
        loan.interest_days?.toString().includes(searchLower) ||
        loan.overdue_days?.toString().includes(searchLower)
        
      // Search in customer data if available (for admin/employee view)
      const customerMatch = 
        (loan.customer_name?.toLowerCase().includes(searchLower)) ||
        (loan.customer_id?.toString().includes(searchLower))
        
      return loanMatch || customerMatch
    }
    
    return true
  })

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
          <div className="w-12 h-12 rounded-full border-4 border-t-primary-500 animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Combined header row with title, search, and actions */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 flex-wrap">
          {/* Title */}
          <h1 className="text-2xl font-bold text-primary-800 whitespace-nowrap mr-4">
            {currentUser?.role === roles.customer ? 'My Loans' : 'Loans'}
          </h1>
          
          {/* Status filter buttons */}
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium ${statusFilter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setStatusFilter('all')}
            >
              All Loans
            </button>
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium ${statusFilter === 'active' ? 'bg-accent-light text-primary-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setStatusFilter('active')}
            >
              Active
            </button>
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium ${statusFilter === 'paid' ? 'bg-secondary-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setStatusFilter('paid')}
            >
              Paid
            </button>
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium ${statusFilter === 'defaulted' ? 'bg-accent-warm text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setStatusFilter('defaulted')}
            >
              Defaulted
            </button>
          </div>
          
          {/* Search bar */}
          <div className="flex-grow max-w-md mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder={currentUser?.role === roles.customer 
                  ? "Search your loans by amount, status..." 
                  : "Search loans by ID, amount, customer..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-shrink-0">
            {/* Only Admin and Employee can create loans */}
            {currentUser?.role !== roles.customer && (
              <button 
                onClick={() => setShowLoanForm(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors flex-shrink-0"
              >
                Create New Loan
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Loan creation form modal */}
      {showLoanForm && (
        <LoanForm 
          onClose={() => setShowLoanForm(false)} 
          onSuccess={handleLoanCreated}
        />
      )}
      
      {/* Loan view modal */}
      {viewingLoan && (
        <LoanView 
          loanId={viewingLoan}
          onClose={() => setViewingLoan(null)}
        />
      )}
      
      {/* Loan edit modal */}
      {editingLoan && (
        <LoanEdit 
          loanId={editingLoan}
          onClose={() => setEditingLoan(null)}
          onSuccess={handleLoanUpdated}
        />
      )}
      
      {/* Loan payment modal */}
      {payingLoan && (
        <LoanPayment 
          loanId={payingLoan}
          onClose={() => setPayingLoan(null)}
          onSuccess={handleLoanUpdated}
        />
      )}
      
      {/* Loans list */}
      {filteredLoans.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No loans found</h3>
          <p className="text-gray-500">
            {search 
              ? `No loans matching "${search}"` 
              : statusFilter !== 'all' 
                ? `No loans with "${statusFilter}" status` 
                : 'There are no loans to display.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Sticky scroll container using external CSS */}
          <div className="sticky-table-container">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky-header">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky-left">
                    Actions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  {currentUser?.role !== roles.customer && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  
                  {/* Amounts */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid Interest
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Principle Left
                  </th>
                  
                  {/* Dates */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Default Date
                  </th>
                  
                  {/* Periods */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan Period
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waiting Days
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remaining Days
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interest Days
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overdue Days
                  </th>
                  
                  {/* Rates and Amounts */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interest Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overdue Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interest Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overdue Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Due
                  </th>
                  
                  {/* Meta */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky-left">
                      <div className="actions-container">
                        <button 
                          onClick={() => handleViewLoan(loan.id)}
                          className="action-icon text-primary-600 hover:text-primary-800"
                        >
                          <span className="action-icon-tooltip">View Loan</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                            <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Admin and Employee actions */}
                        {currentUser?.role !== roles.customer && (
                          <button 
                            onClick={() => handleEditLoan(loan.id)}
                            className="action-icon text-secondary-700 hover:text-secondary-500"
                          >
                            <span className="action-icon-tooltip">Edit Loan</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                            </svg>
                          </button>
                        )}
                        
                        {/* Customer actions */}
                        {currentUser?.role === roles.customer && loan.current_status === 'active' && (
                          <button 
                            onClick={() => handlePaymentModal(loan.id)}
                            className="action-icon text-accent-warm hover:text-accent-warm/80"
                          >
                            <span className="action-icon-tooltip">Make Payment</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 01-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004zM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 01-.921.42z" />
                              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 01-.921-.421l-.879-.66a.75.75 0 00-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 001.5 0v-.81a4.124 4.124 0 001.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 00-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 00.933-1.175l-.415-.33a3.836 3.836 0 00-1.719-.755V6z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{loan.id}
                    </td>
                    {currentUser?.role !== roles.customer && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {loan.customer_name || `ID: ${loan.customer_id}` || 'Unknown'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${loan.current_status === 'active' ? 'bg-accent-light text-primary-800' : 
                         loan.current_status === 'paid' ? 'bg-secondary-500 text-white' : 
                         loan.current_status === 'defaulted' ? 'bg-accent-warm text-white' : 
                         'bg-gray-100 text-gray-800'}`}>
                        {loan.current_status || 'Unknown'}
                      </span>
                    </td>
                    
                    {/* Amounts */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(loan.loan_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(loan.paid_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(loan.paid_interest)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(loan.principle_amount)}
                    </td>
                    
                    {/* Dates */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.start_date ? new Date(loan.start_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.end_date ? new Date(loan.end_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.default_date ? new Date(loan.default_date).toLocaleDateString() : 'N/A'}
                    </td>
                    
                    {/* Periods */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.loan_period ?? 'N/A'} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.waiting_days ?? 'N/A'} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.remaining_days !== undefined ? loan.remaining_days : 'N/A'} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.interest_days !== undefined ? loan.interest_days : 'N/A'} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.overdue_days !== undefined ? loan.overdue_days : 'N/A'} days
                    </td>
                    
                    {/* Rates and Amounts */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.interest_rate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.overdue_rate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(loan.interest_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(loan.overdue_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(loan.total_amount)}
                    </td>
                    
                    {/* Meta */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.created_at ? new Date(loan.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loan.updated_at ? new Date(loan.updated_at).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Loans 