import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { roles } from '../constants/roles'
import { getAllLoans } from '../services/loan.service'
import { getCustomerLoans } from '../services/customer.service'

const Dashboard = () => {
  const { currentUser } = useAuth()
  const [loans, setLoans] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch appropriate loans based on user role
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      
      try {
        // Choose which loans to fetch based on user role
        let loansData = []
        
        if (currentUser?.role === roles.customer) {
          // Customers only see their own loans
          const response = await getCustomerLoans(currentUser?.id)
          loansData = extractLoansData(response)
        } else {
          // Admins and employees see all loans
          const response = await getAllLoans()
          loansData = extractLoansData(response)
        }
        
        setLoans(loansData)
      } catch (error) {
        console.error('Failed to fetch loans data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Helper function to extract loans data from different response formats
    const extractLoansData = (response) => {
      if (!response) return []
      if (Array.isArray(response)) return response
      if (response.data && Array.isArray(response.data)) return response.data
      if (response.loans && Array.isArray(response.loans)) return response.loans
      return []
    }

    fetchData()
  }, [currentUser])

  // Calculate metrics
  const calculateMetrics = () => {
    if (!Array.isArray(loans) || loans.length === 0) {
      return {
        totalLoans: 0,
        totalPrinciple: 0,
        totalInterestPaid: 0,
        totalPrinciplePaid: 0
      }
    }

    return {
      totalLoans: loans.length,
      totalPrinciple: loans.reduce((sum, loan) => sum + (Number(loan.loan_amount) || 0), 0),
      totalInterestPaid: loans.reduce((sum, loan) => sum + (Number(loan.paid_interest) || 0), 0),
      totalPrinciplePaid: loans.reduce((sum, loan) => sum + (Number(loan.paid_amount) || 0), 0)
    }
  }

  // Format number as currency with ₮ symbol
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '₮0'
    return '₮' + amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  const metrics = calculateMetrics()

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Welcome, {currentUser?.name || 'User'}</h2>
        
        {/* Simple Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Loans */}
          <div className="bg-indigo-50 p-4 rounded-lg shadow border border-indigo-100">
            <h3 className="text-sm font-medium text-indigo-500 mb-1">Total Loans</h3>
            <div className="text-2xl font-bold text-indigo-700">{metrics.totalLoans}</div>
          </div>
          
          {/* Total Principle Amount */}
          <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-100">
            <h3 className="text-sm font-medium text-blue-500 mb-1">Total Principle</h3>
            <div className="text-2xl font-bold text-blue-700">{formatCurrency(metrics.totalPrinciple)}</div>
          </div>
          
          {/* Total Interest Paid */}
          <div className="bg-green-50 p-4 rounded-lg shadow border border-green-100">
            <h3 className="text-sm font-medium text-green-500 mb-1">Interest Paid</h3>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(metrics.totalInterestPaid)}</div>
          </div>
          
          {/* Total Principle Paid */}
          <div className="bg-purple-50 p-4 rounded-lg shadow border border-purple-100">
            <h3 className="text-sm font-medium text-purple-500 mb-1">Principle Paid</h3>
            <div className="text-2xl font-bold text-purple-700">{formatCurrency(metrics.totalPrinciplePaid)}</div>
          </div>
        </div>
        
        {/* Role-specific description */}
        <div className="mt-6 text-gray-600 text-sm">
          {currentUser?.role === roles.customer ? (
            <p>This dashboard shows all your loans and payment information. Contact us if you have any questions about your loans.</p>
          ) : (
            <p>This dashboard shows the system-wide loan and payment data. For detailed reports, please visit the Reports section.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard 