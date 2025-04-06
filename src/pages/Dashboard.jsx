import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { roles } from '../constants/roles'
import { getCustomerLoans, getAllLoans } from '../services/loan.service'
import { getAllCustomers } from '../services/customer.service'
import { getAllEmployees } from '../services/employee.service'
import { getAllTransactions } from '../services/transaction.service'
import { toast } from 'react-toastify'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const Dashboard = () => {
  const { currentUser } = useAuth()
  const [loans, setLoans] = useState([])
  const [customers, setCustomers] = useState([])
  const [employees, setEmployees] = useState([])
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    // Fetch relevant data
    const fetchData = async () => {
      setIsLoading(true)
      setErrors({})
      
      // Create an object to track which API calls succeeded
      const apiStatus = {
        loans: false,
        customers: false,
        employees: false,
        transactions: false
      }
      
      // Helper to safely call API endpoints
      const safeApiCall = async (apiFunction, errorKey, defaultValue = []) => {
        try {
          const response = await apiFunction()
          apiStatus[errorKey] = true
          return response
        } catch (error) {
          console.error(`Error fetching ${errorKey}:`, error)
          setErrors(prev => ({
            ...prev,
            [errorKey]: error.message || `Failed to load ${errorKey}`
          }))
          return { data: defaultValue }
        }
      }
      
      try {
        // Get loans based on user role
        let loanResponse
        if (currentUser?.role === roles.customer) {
          loanResponse = await safeApiCall(getCustomerLoans, 'loans')
        } else {
          loanResponse = await safeApiCall(getAllLoans, 'loans')
        }
        
        setLoans(loanResponse.loans || loanResponse.data || [])

        // For admin, fetch additional data
        if (currentUser?.role === roles.admin) {
          // Fetch customers
          const customerResponse = await safeApiCall(getAllCustomers, 'customers')
          setCustomers(customerResponse.customers || customerResponse.data || [])
          
          // Fetch employees
          const employeeResponse = await safeApiCall(getAllEmployees, 'employees')
          setEmployees(employeeResponse.employees || employeeResponse.data || [])
          
          // Fetch transactions
          const transactionResponse = await safeApiCall(getAllTransactions, 'transactions')
          setTransactions(transactionResponse.transactions || transactionResponse.data || [])
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast.error('Some dashboard data could not be loaded')
      } finally {
        setIsLoading(false)
        
        // Show a single toast for all API errors instead of multiple toasts
        const failedApis = Object.keys(apiStatus).filter(key => !apiStatus[key])
        if (failedApis.length > 0) {
          toast.error(`Failed to load: ${failedApis.join(', ')}`, {
            toastId: 'dashboard-api-errors' // Prevent duplicate toasts
          })
        }
      }
    }

    fetchData()
  }, [currentUser?.role])

  // Process loan data for charts
  const processLoanData = () => {
    // Group loans by status
    const activeLoans = loans.filter(loan => loan.current_status === 'active')
    const paidLoans = loans.filter(loan => loan.current_status === 'paid')
    const defaultedLoans = loans.filter(loan => loan.current_status === 'defaulted')
    const inactiveLoans = [...paidLoans, ...defaultedLoans]
    
    // Calculate loan amounts by status
    const activeLoanAmount = activeLoans.reduce((sum, loan) => sum + (parseFloat(loan.loan_amount) || 0), 0)
    const paidLoanAmount = paidLoans.reduce((sum, loan) => sum + (parseFloat(loan.loan_amount) || 0), 0)
    const defaultedLoanAmount = defaultedLoans.reduce((sum, loan) => sum + (parseFloat(loan.loan_amount) || 0), 0)
    
    return {
      loanCounts: {
        active: activeLoans.length,
        paid: paidLoans.length,
        defaulted: defaultedLoans.length
      },
      loanAmounts: {
        active: activeLoanAmount,
        paid: paidLoanAmount,
        defaulted: defaultedLoanAmount
      },
      inactiveLoans: {
        total: inactiveLoans.length,
        paidPercentage: inactiveLoans.length > 0 ? (paidLoans.length / inactiveLoans.length) * 100 : 0,
        defaultedPercentage: inactiveLoans.length > 0 ? (defaultedLoans.length / inactiveLoans.length) * 100 : 0
      }
    }
  }

  // Configure loan status pie chart
  const getLoanStatusPieChart = () => {
    const { loanCounts } = processLoanData()
    
    return {
      labels: ['Active', 'Paid', 'Defaulted'],
      datasets: [
        {
          data: [loanCounts.active, loanCounts.paid, loanCounts.defaulted],
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)', // Blue for active
            'rgba(75, 192, 192, 0.7)', // Green for paid
            'rgba(255, 99, 132, 0.7)'  // Red for defaulted
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1,
        },
      ],
    }
  }

  // Configure inactive loan breakdown pie chart
  const getInactiveLoanPieChart = () => {
    const { loanCounts } = processLoanData()
    
    return {
      labels: ['Paid', 'Defaulted'],
      datasets: [
        {
          data: [loanCounts.paid, loanCounts.defaulted],
          backgroundColor: [
            'rgba(75, 192, 192, 0.7)', // Green for paid
            'rgba(255, 99, 132, 0.7)'  // Red for defaulted
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1,
        },
      ],
    }
  }

  // Configure loan amounts bar chart
  const getLoanAmountsBarChart = () => {
    const { loanAmounts } = processLoanData()
    
    return {
      labels: ['Active', 'Paid', 'Defaulted'],
      datasets: [
        {
          label: 'Loan Amount ($)',
          data: [loanAmounts.active, loanAmounts.paid, loanAmounts.defaulted],
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)', // Blue for active
            'rgba(75, 192, 192, 0.7)', // Green for paid
            'rgba(255, 99, 132, 0.7)'  // Red for defaulted
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1,
        },
      ],
    }
  }

  // Chart options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: $${value.toLocaleString()}`;
          }
        }
      }
    },
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

  // Calculate if there's any data to display
  const hasLoanData = loans.length > 0;
  const hasTransactionData = transactions.length > 0;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {currentUser?.name || 'User'}</h2>
        <p className="text-gray-600 mb-4">
          You are logged in as: <span className="font-medium capitalize">{currentUser?.role}</span>
        </p>
        
        {/* Error alerts (if any) */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 rounded-md">
            <p className="font-medium text-yellow-700 mb-2">Some data couldn't be loaded:</p>
            <ul className="list-disc pl-5 text-sm text-yellow-600">
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}>{key}: {value}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-yellow-600">
              The dashboard will display available data.
            </p>
          </div>
        )}
        
        {/* Admin-specific content */}
        {currentUser?.role === roles.admin && (
          <div className="mt-6">
            <div className="p-4 bg-primary-50 rounded-md">
              <h3 className="text-lg font-medium text-primary-800 mb-2">Admin Panel</h3>
              <p className="text-primary-600 mb-4">
                You have full administrative access. You can manage users, view all loans, and access all 
                system features.
              </p>
              
              {/* Admin Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-white p-4 rounded shadow border border-primary-100">
                  <div className="text-2xl font-bold text-primary-600">{loans.length}</div>
                  <div className="text-sm text-gray-500">Total Loans</div>
                </div>
                <div className="bg-white p-4 rounded shadow border border-primary-100">
                  <div className="text-2xl font-bold text-primary-600">
                    ${loans.reduce((sum, loan) => sum + (parseFloat(loan.loan_amount) || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Loan Amount</div>
                </div>
                <div className="bg-white p-4 rounded shadow border border-primary-100">
                  <div className="text-2xl font-bold text-primary-600">
                    {customers.length}
                  </div>
                  <div className="text-sm text-gray-500">Customers</div>
                </div>
                <div className="bg-white p-4 rounded shadow border border-primary-100">
                  <div className="text-2xl font-bold text-primary-600">
                    {employees.length}
                  </div>
                  <div className="text-sm text-gray-500">Employees</div>
                </div>
              </div>
            </div>
            
            {/* Charts Section */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Loan Status Distribution */}
              <div className="bg-white p-4 rounded-lg shadow border border-primary-100">
                <h4 className="text-lg font-medium text-primary-800 mb-4">Loan Status Distribution</h4>
                {hasLoanData ? (
                  <div className="h-64">
                    <Pie data={getLoanStatusPieChart()} options={pieOptions} />
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500 italic">No loan data available</p>
                  </div>
                )}
              </div>
              
              {/* Loan Amounts by Status */}
              <div className="bg-white p-4 rounded-lg shadow border border-primary-100">
                <h4 className="text-lg font-medium text-primary-800 mb-4">Loan Amounts by Status</h4>
                {hasLoanData ? (
                  <div className="h-64">
                    <Bar data={getLoanAmountsBarChart()} options={barOptions} />
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500 italic">No loan data available</p>
                  </div>
                )}
              </div>
              
              {/* Inactive Loan Breakdown */}
              <div className="bg-white p-4 rounded-lg shadow border border-primary-100">
                <h4 className="text-lg font-medium text-primary-800 mb-4">Inactive Loan Breakdown</h4>
                {hasLoanData && processLoanData().inactiveLoans.total > 0 ? (
                  <>
                    <div className="h-64">
                      <Pie data={getInactiveLoanPieChart()} options={pieOptions} />
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <p>This chart shows the breakdown of inactive loans: paid vs defaulted.</p>
                      <div className="mt-2">
                        <p>Paid loans: {processLoanData().inactiveLoans.paidPercentage.toFixed(1)}%</p>
                        <p>Defaulted loans: {processLoanData().inactiveLoans.defaultedPercentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500 italic">No inactive loans available</p>
                  </div>
                )}
              </div>
              
              {/* Recent Activity Summary */}
              <div className="bg-white p-4 rounded-lg shadow border border-primary-100">
                <h4 className="text-lg font-medium text-primary-800 mb-4">Recent Activity</h4>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Recent Transactions</p>
                    <p className="text-sm text-gray-600">
                      {hasTransactionData ? 
                        `${transactions.length} total transactions, ${transactions.filter(t => new Date(t.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} in the last 7 days` :
                        'No transactions data available'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Recent Loans</p>
                    <p className="text-sm text-gray-600">
                      {hasLoanData ? 
                        `${loans.filter(l => new Date(l.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} new loans in the last 30 days` : 
                        'No loan data available'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">System Status</p>
                    <div className="flex items-center">
                      {Object.keys(errors).length > 0 ? (
                        <>
                          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                          <p className="text-sm text-gray-600">Partial system availability</p>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                          <p className="text-sm text-gray-600">All systems operational</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Employee-specific content */}
        {currentUser?.role === roles.employee && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Employee Dashboard</h3>
            <p className="text-blue-600">
              You can process loan applications, manage transactions, and view customer accounts.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white p-4 rounded shadow border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">
                  {loans.filter(loan => !loan.processed_by).length}
                </div>
                <div className="text-sm text-gray-500">Pending Applications</div>
              </div>
              <div className="bg-white p-4 rounded shadow border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">
                  {loans.filter(loan => loan.current_status === 'active').length}
                </div>
                <div className="text-sm text-gray-500">Active Loans</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Customer-specific content */}
        {currentUser?.role === roles.customer && (
          <div className="mt-6 p-4 bg-green-50 rounded-md">
            <h3 className="text-lg font-medium text-green-800 mb-2">Customer Dashboard</h3>
            <p className="text-green-600">
              View your loans, make payments, and manage your account.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white p-4 rounded shadow border border-green-100">
                <div className="text-2xl font-bold text-green-600">{loans.length}</div>
                <div className="text-sm text-gray-500">Your Loans</div>
              </div>
              <div className="bg-white p-4 rounded shadow border border-green-100">
                <div className="text-2xl font-bold text-green-600">
                  ${loans.reduce((sum, loan) => sum + (parseFloat(loan.remaining_amount) || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Remaining</div>
              </div>
            </div>
            <div className="mt-4">
              <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors">
                Apply for New Loan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard 