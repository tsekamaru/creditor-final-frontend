import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const Logout = () => {
  const { logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  useEffect(() => {
    // If the user is already logged out (coming from navbar logout button)
    // redirect them straight to the login page
    if (!isAuthenticated) {
      navigate('/auth/login')
      return
    }

    const performLogout = async () => {
      try {
        setIsRedirecting(true)
        logout()
        
        // Wait a moment before redirecting to ensure state is cleared
        setTimeout(() => {
          navigate('/auth/login')
        }, 1500)
      } catch (error) {
        console.error('Error during logout:', error)
        setError('An error occurred during logout')
        setIsRedirecting(false)
      }
    }
    
    performLogout()
  }, [logout, navigate, isAuthenticated])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-600">
            Logging Out
          </h2>
        </div>
        {error ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                <div className="mt-4">
                  <Link 
                    to="/auth/login" 
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150"
                  >
                    Return to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex flex-col items-center">
              <div className="text-center">
                <h3 className="text-sm font-medium text-green-800">You have been successfully logged out.</h3>
                {isRedirecting && (
                  <p className="mt-2 text-sm text-gray-500">Redirecting to login page...</p>
                )}
                <div className="mt-4 flex justify-center space-x-4">
                  <Link 
                    to="/auth/login" 
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150"
                  >
                    Login Again
                  </Link>
                  <Link 
                    to="/" 
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                  >
                    Return to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Logout 