import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { roles } from '../constants/roles'
import { toast } from 'react-toastify'
import '../styles/table.css'
import { getAllTransactions, getCustomerTransactions } from '../services/transaction.service'
import TransactionForm from '../components/TransactionForm'
import TransactionView from '../components/TransactionView'
import TransactionEdit from '../components/TransactionEdit'

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

const Transactions = () => {
  const { currentUser } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, in, out
  const [search, setSearch] = useState('')
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [viewingTransaction, setViewingTransaction] = useState(null)
  const [editingTransaction, setEditingTransaction] = useState(null)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        let response;
        
        if (currentUser?.role === roles.customer) {
          response = await getCustomerTransactions(currentUser.id)
        } else {
          response = await getAllTransactions()
        }
        
        setTransactions(response.transactions || [])
      } catch (error) {
        console.error('Error fetching transactions:', error)
        toast.error('Failed to load transaction data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [currentUser?.role, currentUser?.id])

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter(transaction => {
    // First apply the direction filter
    if (filter === 'in' && transaction.transaction_direction !== 'in') {
      return false
    }
    if (filter === 'out' && transaction.transaction_direction !== 'out') {
      return false
    }
    
    // Then apply search if there's a search term
    if (search) {
      const searchLower = search.toLowerCase()
      
      return (
        // ID searches
        (transaction.id?.toString().includes(searchLower)) ||
        (transaction.loan_id?.toString().includes(searchLower)) ||
        (transaction.employee_id?.toString().includes(searchLower)) ||
        (transaction.customer_id?.toString().includes(searchLower)) ||
        
        // Amount searches
        (transaction.transaction_amount?.toString().includes(searchLower)) ||
        (transaction.principle_amount?.toString().includes(searchLower)) ||
        
        // Text field searches
        (transaction.transaction_purpose?.toLowerCase().includes(searchLower)) ||
        (transaction.transaction_direction?.toLowerCase().includes(searchLower)) ||
        
        // Customer name searches
        (transaction.customer_first_name?.toLowerCase().includes(searchLower)) ||
        (transaction.customer_last_name?.toLowerCase().includes(searchLower)) ||
        
        // Date searches - format to include various date formats
        (new Date(transaction.created_at).toLocaleDateString().includes(searchLower)) ||
        (new Date(transaction.updated_at).toLocaleDateString().includes(searchLower))
      )
    }
    
    return true
  })

  // Handle transaction creation success
  const handleTransactionCreated = () => {
    fetchTransactions();
  }
  
  // Handle transaction update success
  const handleTransactionUpdated = () => {
    fetchTransactions();
  }
  
  // Handle opening transaction view
  const handleViewTransaction = (transactionId) => {
    setViewingTransaction(transactionId);
  }
  
  // Handle opening transaction edit
  const handleEditTransaction = (transactionId) => {
    setEditingTransaction(transactionId);
  }
  
  // Fetch transactions after actions
  const fetchTransactions = async () => {
    try {
      let response;
      
      if (currentUser?.role === roles.customer) {
        response = await getCustomerTransactions(currentUser.id)
      } else {
        response = await getAllTransactions()
      }
      
      setTransactions(response.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to refresh transaction data')
    }
  }

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

  // Function to determine transaction purpose label and styles
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

  // Function to determine transaction direction label and styles
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Combined header row with title, search, and actions */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 flex-wrap">
          {/* Title */}
          <h1 className="text-2xl font-bold text-primary-800 whitespace-nowrap mr-4">Transactions</h1>
          
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setFilter('all')}
            >
              All Transactions
            </button>
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'in' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setFilter('in')}
            >
              In
            </button>
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'out' ? 'bg-accent-warm text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setFilter('out')}
            >
              Out
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
                placeholder="Search transactions by any field..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-shrink-0">
            {/* Admin and Employee can create transactions */}
            {currentUser?.role !== roles.customer && (
              <button 
                onClick={() => setShowTransactionForm(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors flex-shrink-0"
              >
                Record Transaction
              </button>
            )}
            
            {/* Customer can make a payment */}
            {currentUser?.role === roles.customer && (
              <button 
                onClick={() => setShowTransactionForm(true)}
                className="bg-accent-warm hover:bg-accent-warm/90 text-white font-medium py-2 px-4 rounded transition-colors flex-shrink-0"
              >
                Make Payment
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Transaction form modal */}
      {showTransactionForm && (
        <TransactionForm 
          onClose={() => setShowTransactionForm(false)} 
          onSuccess={handleTransactionCreated}
        />
      )}
      
      {/* Transaction view modal */}
      {viewingTransaction && (
        <TransactionView 
          transactionId={viewingTransaction}
          onClose={() => setViewingTransaction(null)}
        />
      )}
      
      {/* Transaction edit modal */}
      {editingTransaction && (
        <TransactionEdit 
          transactionId={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSuccess={handleTransactionUpdated}
        />
      )}
      
      {/* Transactions list */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No transactions found</h3>
          <p className="text-gray-500">
            {search 
              ? `No transactions matching "${search}"` 
              : filter !== 'all' 
                ? `No ${filter} transactions to display.` 
                : 'There are no transactions to display.'}
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan ID
                  </th>
                  
                  {/* Customer info - only visible to admin/employee */}
                  {currentUser?.role !== roles.customer && (
                    <>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer Name
                      </th>
                    </>
                  )}
                  
                  {/* Employee ID - only visible to admin */}
                  {currentUser?.role === roles.admin && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee ID
                    </th>
                  )}
                  
                  {/* Transaction details */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Direction
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Principle Amount
                  </th>
                  
                  {/* Dates */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky-left">
                      <div className="actions-container">
                        <button 
                          onClick={() => handleViewTransaction(transaction.id)}
                          className="action-icon text-primary-600 hover:text-primary-800"
                        >
                          <span className="action-icon-tooltip">View Transaction</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                            <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Admin and Employee can edit */}
                        {currentUser?.role !== roles.customer && (
                          <button 
                            onClick={() => handleEditTransaction(transaction.id)}
                            className="action-icon text-secondary-700 hover:text-secondary-500"
                          >
                            <span className="action-icon-tooltip">Edit Transaction</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{transaction.loan_id}
                    </td>
                    
                    {/* Customer info - only visible to admin/employee */}
                    {currentUser?.role !== roles.customer && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          #{transaction.customer_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.customer_first_name} {transaction.customer_last_name}
                        </td>
                      </>
                    )}
                    
                    {/* Employee ID - only visible to admin */}
                    {currentUser?.role === roles.admin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.employee_id ? `#${transaction.employee_id}` : 'N/A'}
                      </td>
                    )}
                    
                    {/* Transaction details */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(transaction.transaction_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionPurposeLabel(transaction.transaction_purpose).classes}`}>
                        {getTransactionPurposeLabel(transaction.transaction_purpose).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionDirectionLabel(transaction.transaction_direction).classes}`}>
                        {getTransactionDirectionLabel(transaction.transaction_direction).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(transaction.principle_amount)}
                    </td>
                    
                    {/* Dates */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.created_at ? new Date(transaction.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.updated_at ? new Date(transaction.updated_at).toLocaleString() : 'N/A'}
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

export default Transactions 