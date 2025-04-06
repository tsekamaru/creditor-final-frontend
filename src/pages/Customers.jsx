import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { roles } from '../constants/roles'
import { Navigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import '../styles/table.css'
import { getAllCustomers } from '../services/customer.service'
import CustomerForm from '../components/CustomerForm'
import CustomerView from '../components/CustomerView'
import CustomerEdit from '../components/CustomerEdit'

const Customers = () => {
  const { currentUser } = useAuth()
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, active, inactive
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [viewingCustomer, setViewingCustomer] = useState(null)
  const [editingCustomer, setEditingCustomer] = useState(null)

  useEffect(() => {
    fetchCustomers();
  }, [])

  // Handle customer creation success
  const handleCustomerCreated = () => {
    fetchCustomers();
  }
  
  // Handle customer update success
  const handleCustomerUpdated = () => {
    fetchCustomers();
  }
  
  // Handle opening customer view
  const handleViewCustomer = (customerId) => {
    setViewingCustomer(customerId);
  }
  
  // Handle opening customer edit
  const handleEditCustomer = (customerId) => {
    setEditingCustomer(customerId);
  }

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      const response = await getAllCustomers()
      setCustomers(response.customers || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Failed to load customers data')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter customers based on search and status
  const filteredCustomers = customers.filter(customer => {
    // First apply the status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      if (customer.is_active !== isActive) {
        return false;
      }
    }
    
    // Then apply search if there's a search term
    if (search) {
      const searchLower = search.toLowerCase();
      
      return (
        (customer.user_id?.toString().includes(searchLower)) ||
        (customer.social_security_number?.toLowerCase().includes(searchLower)) ||
        (customer.first_name?.toLowerCase().includes(searchLower)) ||
        (customer.last_name?.toLowerCase().includes(searchLower)) ||
        (customer.address?.toLowerCase().includes(searchLower)) ||
        (customer.email?.toLowerCase().includes(searchLower)) ||
        (customer.phone_number?.includes(searchLower)) ||
        (new Date(customer.date_of_birth).toLocaleDateString().includes(searchLower)) ||
        (new Date(customer.created_at).toLocaleDateString().includes(searchLower))
      )
    }
    
    return true;
  });

  // Only admin and employees should access this page
  if (currentUser?.role !== roles.admin && currentUser?.role !== roles.employee) {
    return <Navigate to="/dashboard" />
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Combined header row with title, search, and actions */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 flex-wrap">
          {/* Title */}
          <h1 className="text-2xl font-bold text-primary-800 whitespace-nowrap mr-4">Customers</h1>
          
          {/* Status filter buttons */}
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium ${statusFilter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setStatusFilter('all')}
            >
              All Customers
            </button>
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium ${statusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setStatusFilter('active')}
            >
              Active
            </button>
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium ${statusFilter === 'inactive' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setStatusFilter('inactive')}
            >
              Inactive
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
                placeholder="Search by name, ID, SSN, address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          {/* Add customer button */}
          <button 
            onClick={() => setShowCustomerForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors flex-shrink-0"
          >
            Add New Customer
          </button>
        </div>
      </div>
      
      {/* Customer creation form modal */}
      {showCustomerForm && (
        <CustomerForm 
          onClose={() => setShowCustomerForm(false)} 
          onSuccess={handleCustomerCreated}
        />
      )}
      
      {/* Customer view modal */}
      {viewingCustomer && (
        <CustomerView 
          customerId={viewingCustomer}
          onClose={() => setViewingCustomer(null)}
        />
      )}
      
      {/* Customer edit modal */}
      {editingCustomer && (
        <CustomerEdit 
          customerId={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSuccess={handleCustomerUpdated}
        />
      )}
      
      {/* Customers list */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No customers found</h3>
          <p className="text-gray-500">
            {search 
              ? `No customers matching "${search}"` 
              : statusFilter !== 'all' 
                ? `No ${statusFilter} customers to display.` 
                : 'There are no customers to display.'}
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
                    First Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SSN
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Birth
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky-left">
                      <div className="actions-container">
                        <button 
                          onClick={() => handleViewCustomer(customer.user_id)}
                          className="action-icon text-primary-600 hover:text-primary-800"
                        >
                          <span className="action-icon-tooltip">View Customer</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                            <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        <button 
                          onClick={() => handleEditCustomer(customer.user_id)}
                          className="action-icon text-secondary-700 hover:text-secondary-500"
                        >
                          <span className="action-icon-tooltip">Edit Customer</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{customer.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.first_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.social_security_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.date_of_birth ? new Date(customer.date_of_birth).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.age}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {customer.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${customer.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {customer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.created_at ? new Date(customer.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.updated_at ? new Date(customer.updated_at).toLocaleString() : 'N/A'}
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

export default Customers 