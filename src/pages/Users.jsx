import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { roles } from '../constants/roles'
import { toast } from 'react-toastify'
import { Navigate } from 'react-router-dom'
import { getAllUsers } from '../services/user.service'
import '../styles/table.css'
import UserView from '../components/users/UserView'
import UserEdit from '../components/users/UserEdit'
import UserForm from '../components/users/UserForm'

const Users = () => {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, admin, employee, customer
  const [search, setSearch] = useState('')
  const [viewingUser, setViewingUser] = useState(null) // ID of user being viewed
  const [editingUser, setEditingUser] = useState(null) // ID of user being edited
  const [showUserForm, setShowUserForm] = useState(false)
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await getAllUsers()
      setUsers(response.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Skip fetching if not admin
    if (currentUser?.role !== roles.admin) {
      return
    }
    
    fetchUsers()
  }, [currentUser?.role])

  // Only admin should access this page
  if (currentUser?.role !== roles.admin) {
    return <Navigate to="/dashboard" />
  }
  
  // Handle user update success
  const handleUserUpdated = () => {
    fetchUsers()
  }
  
  // Handle view user
  const handleViewUser = (userId) => {
    setViewingUser(userId)
  }
  
  // Handle edit user
  const handleEditUser = (userId) => {
    setEditingUser(userId)
  }

  // Handle user creation success
  const handleUserCreated = () => {
    fetchUsers()
  }

  // Filter and search users
  const filteredUsers = users.filter(user => {
    // Filter by role
    if (filter !== 'all' && user.role !== filter) {
      return false
    }
    
    // Search by ID, name, email, or phone
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        (user.id && user.id.toString().includes(searchLower)) ||
        (user.name && user.name.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.phone_number && user.phone_number.includes(search))
      )
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
          <h1 className="text-2xl font-bold text-primary-800 whitespace-nowrap mr-4">Users</h1>
          
          {/* Role filter buttons */}
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setFilter('all')}
            >
              All Users
            </button>
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'admin' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setFilter('admin')}
            >
              Admins
            </button>
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'employee' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setFilter('employee')}
            >
              Employees
            </button>
            <button 
              className={`px-3 py-2 rounded-md text-sm font-medium ${filter === 'customer' ? 'bg-secondary-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setFilter('customer')}
            >
              Customers
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
                placeholder="Search by ID, name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-shrink-0">
            <button 
              onClick={() => setShowUserForm(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors flex-shrink-0"
            >
              Add New User
            </button>
          </div>
        </div>
      </div>
      
      {/* User creation form modal */}
      {showUserForm && (
        <UserForm 
          onClose={() => setShowUserForm(false)} 
          onSuccess={handleUserCreated}
        />
      )}
      
      {/* User view and edit modals will be added here */}
      {viewingUser && (
        <UserView 
          userId={viewingUser}
          onClose={() => setViewingUser(null)}
        />
      )}
      
      {editingUser && (
        <UserEdit 
          userId={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={handleUserUpdated}
        />
      )}
      
      {/* Users list */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No users found</h3>
          <p className="text-gray-500">
            {filter !== 'all' 
              ? `There are no ${filter} users matching your search.` 
              : 'There are no users matching your search.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                    Role
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
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky-left">
                      <div className="actions-container">
                        <button 
                          onClick={() => handleViewUser(user.id)}
                          className="action-icon text-primary-600 hover:text-primary-800"
                        >
                          <span className="action-icon-tooltip">View User</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                            <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleEditUser(user.id)}
                          className="action-icon text-secondary-700 hover:text-secondary-500"
                        >
                          <span className="action-icon-tooltip">Edit User</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                         user.role === 'employee' ? 'bg-blue-100 text-blue-800' : 
                         'bg-green-100 text-green-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.updated_at ? new Date(user.updated_at).toLocaleString() : 'N/A'}
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

export default Users 