import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import reactLogo from '../../assets/react.svg'
import { useAuth } from '../../hooks/useAuth'
import { roles } from '../../constants/roles'
import ChangePasswordModal from '../auth/ChangePasswordModal'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const profileDropdownRef = useRef(null)
  const usersDropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const menuButtonRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
    setIsProfileOpen(false)
    setIsMenuOpen(false)
  }

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Toggle users dropdown
  const toggleUsersDropdown = () => {
    setIsUsersDropdownOpen(!isUsersDropdownOpen)
  }

  // Close users dropdown when clicking a link
  const handleUsersLinkClick = () => {
    setIsUsersDropdownOpen(false)
    setIsMenuOpen(false)
  }

  // Check if a route is active (exact match or starts with for nested routes)
  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path
    }
    // For other routes, check if the pathname starts with the path
    return location.pathname.startsWith(path)
  }

  // Get the appropriate CSS classes for a nav link based on active state
  const getNavLinkClasses = (path) => {
    // Desktop nav link classes
    return isActive(path)
      ? "inline-flex items-center px-1 pt-1 border-b-2 border-primary-500 text-sm font-medium leading-5 text-primary-700 focus:outline-none focus:border-primary-600 transition duration-150 ease-in-out"
      : "inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-primary-600 hover:border-primary-300 focus:outline-none focus:text-primary-600 focus:border-primary-300 transition duration-150 ease-in-out"
  }

  // Get users dropdown button classes
  const getUsersDropdownClasses = () => {
    // Highlight if any users-related page is active
    const isAnyUsersActive = isActive('/users') || isActive('/customers') || isActive('/employees')
    
    return isAnyUsersActive
      ? "inline-flex items-center px-1 pt-1 border-b-2 border-primary-500 text-sm font-medium leading-5 text-primary-700 focus:outline-none focus:border-primary-600 transition duration-150 ease-in-out"
      : "inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-primary-600 hover:border-primary-300 focus:outline-none focus:text-primary-600 focus:border-primary-300 transition duration-150 ease-in-out"
  }

  // Get the appropriate CSS classes for a mobile nav link based on active state
  const getMobileNavLinkClasses = (path) => {
    return isActive(path)
      ? "block pl-3 pr-4 py-2 border-l-4 border-primary-500 text-base font-medium text-primary-700 bg-primary-50 focus:outline-none focus:text-primary-800 focus:bg-primary-100 focus:border-primary-600 transition duration-150 ease-in-out"
      : "block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-primary-700 hover:bg-primary-50 hover:border-primary-300 focus:outline-none focus:text-primary-700 focus:bg-primary-50 focus:border-primary-300 transition duration-150 ease-in-out"
  }

  // Close mobile menu when a link is clicked
  const handleNavLinkClick = () => {
    setIsMenuOpen(false)
  }

  // Handle clicking outside of the dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      // Close profile dropdown if clicked outside
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
      
      // Close users dropdown if clicked outside
      if (usersDropdownRef.current && !usersDropdownRef.current.contains(event.target)) {
        setIsUsersDropdownOpen(false)
      }
      
      // Close mobile menu if clicked outside
      if (mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target) && 
          menuButtonRef.current && 
          !menuButtonRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    // Add event listener when any dropdown is open
    if (isProfileOpen || isMenuOpen || isUsersDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileOpen, isMenuOpen, isUsersDropdownOpen])

  return (
    <nav className="bg-white shadow-md w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img src={reactLogo} className="h-8 w-auto" alt="React Logo" />
                <span className="ml-2 text-xl font-bold text-primary-600">Creditor</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={getNavLinkClasses('/dashboard')}
              >
                Dashboard
              </Link>
              <Link
                to="/loans"
                className={getNavLinkClasses('/loans')}
              >
                Loans
              </Link>
              <Link
                to="/transactions"
                className={getNavLinkClasses('/transactions')}
              >
                Transactions
              </Link>
              
              {/* Users dropdown - Only visible to Admins */}
              {currentUser?.role === roles.admin && (
                <div className="relative" ref={usersDropdownRef}>
                  <button
                    onClick={toggleUsersDropdown}
                    className={`${getUsersDropdownClasses()} flex items-center`}
                  >
                    <span>Users</span>
                    <svg 
                      className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${isUsersDropdownOpen ? 'rotate-180' : ''}`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Users Dropdown Menu */}
                  <div
                    className={`${
                      isUsersDropdownOpen ? 'block' : 'hidden'
                    } origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-primary-200 z-10`}
                  >
                    <Link
                      to="/users"
                      className={`block px-4 py-2 text-sm ${isActive('/users') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'}`}
                      onClick={handleUsersLinkClick}
                    >
                      All Users
                    </Link>
                    <Link
                      to="/customers"
                      className={`block px-4 py-2 text-sm ${isActive('/customers') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'}`}
                      onClick={handleUsersLinkClick}
                    >
                      Customers
                    </Link>
                    <Link
                      to="/employees"
                      className={`block px-4 py-2 text-sm ${isActive('/employees') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'}`}
                      onClick={handleUsersLinkClick}
                    >
                      Employees
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Profile dropdown */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative ml-3" ref={profileDropdownRef}>
              <div>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out"
                  id="user-menu"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium shadow-md">
                    <span>{currentUser?.name?.charAt(0) || 'U'}</span>
                  </div>
                </button>
              </div>

              {/* Profile dropdown menu */}
              <div
                className={`${
                  isProfileOpen ? 'block' : 'hidden'
                } origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-primary-200 focus:outline-none z-10`}
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu"
              >
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                  role="menuitem"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setShowPasswordModal(true);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                  role="menuitem"
                >
                  Change Password
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                  role="menuitem"
                >
                  Logout
                </button>
              </div>

              {/* Password Change Modal */}
              {showPasswordModal && (
                <ChangePasswordModal
                  onClose={() => setShowPasswordModal(false)}
                  onSuccess={() => setShowPasswordModal(false)}
                />
              )}

            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden">
            <button
              ref={menuButtonRef}
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary-400 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">
                {isMenuOpen ? 'Close main menu' : 'Open main menu'}
              </span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}
        ref={mobileMenuRef}
      >
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/dashboard"
            className={getMobileNavLinkClasses('/dashboard')}
            onClick={handleNavLinkClick}
          >
            Dashboard
          </Link>
          <Link
            to="/loans"
            className={getMobileNavLinkClasses('/loans')}
            onClick={handleNavLinkClick}
          >
            Loans
          </Link>
          <Link
            to="/transactions"
            className={getMobileNavLinkClasses('/transactions')}
            onClick={handleNavLinkClick}
          >
            Transactions
          </Link>
          
          {/* Mobile Users section - Only visible to Admins */}
          {currentUser?.role === roles.admin && (
            <>
              <div className="border-t border-gray-200 pt-1"></div>
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                User Management
              </div>
              <Link
                to="/users"
                className={getMobileNavLinkClasses('/users')}
                onClick={handleNavLinkClick}
              >
                All Users
              </Link>
              <Link
                to="/customers"
                className={getMobileNavLinkClasses('/customers')}
                onClick={handleNavLinkClick}
              >
                Customers
              </Link>
              <Link
                to="/employees"
                className={getMobileNavLinkClasses('/employees')}
                onClick={handleNavLinkClick}
              >
                Employees
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile version of profile menu */}
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium shadow-md">
                <span>{currentUser?.name?.charAt(0) || 'U'}</span>
              </div>
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-gray-800">{currentUser?.name || 'User Name'}</div>
              <div className="text-sm font-medium text-primary-600">{currentUser?.email || 'user@example.com'}</div>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <Link
              to="/profile"
              className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-primary-700 hover:bg-primary-50"
              onClick={handleNavLinkClick}
            >
              Profile
            </Link>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setShowPasswordModal(true);
              }}
              className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-primary-700 hover:bg-primary-50"
            >
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-primary-700 hover:bg-primary-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 