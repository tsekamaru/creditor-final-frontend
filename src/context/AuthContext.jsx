import { createContext, useState, useEffect } from 'react'
import axios from '../utils/axios'
import { toast } from 'react-toastify'

// Create context
const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token') || null)

  // Check if user is already logged in (on app load)
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        setIsLoading(false)
        return
      }

      try {
        // Set the token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
        
        // Try to get user from localStorage first
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setCurrentUser(parsedUser)
          setIsAuthenticated(true)
          setToken(storedToken)
        }
        
        // Verify token with backend anyway to ensure it's still valid
        const response = await axios.get('/auth/validate-token')
        
        if (response.data.success) {
          // Update user data in case it changed on the server
          setCurrentUser(response.data.user)
          localStorage.setItem('user', JSON.stringify(response.data.user))
          setIsAuthenticated(true)
          setToken(storedToken)
        } else {
          // Invalid token
          handleLogout()
        }
      } catch (error) {
        console.error('Token validation error:', error)
        handleLogout()
      } finally {
        setIsLoading(false)
      }
    }

    validateToken()
  }, [])

  // Set token in axios headers when it changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Login function
  const login = async (phone_number, password) => {
    try {
      setIsLoading(true)
      const response = await axios.post('/auth/login', { phone_number, password })
      
      if (response.data.success) {
        const { token, user } = response.data
        
        // Save token and user to localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Update state
        setToken(token)
        setCurrentUser(user)
        setIsAuthenticated(true)
        
        toast.success('Login successful!')
        return { success: true }
      } else {
        toast.error(response.data.message || 'Login failed')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred during login'
      toast.error(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      // Don't use global loading state here as it causes UI issues
      // Let the component handle its own loading state
      const response = await axios.post('/auth/request-otp', userData)
      
      if (response.data.success) {
        toast.success('Verification code sent!')
        return { success: true, data: response.data }
      } else {
        toast.error(response.data.message || 'Registration failed')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred during registration'
      toast.error(errorMessage)
      return { success: false, message: errorMessage }
    }
  }

  // Verify OTP function
  const verifyOTP = async (phone_number, otp) => {
    try {
      // Don't use global loading state here as it causes UI issues
      // Let the component handle its own loading state
      
      // Use fixed OTP for development
      if (otp === "123456") {
        // Simulate successful response
        toast.success('Phone verified successfully!')
        return { 
          success: true, 
          data: {
            success: true,
            message: 'OTP verified successfully',
            phone_number
          } 
        }
      }
      
      // If not using the fixed OTP, try the API (this will likely fail until implemented)
      try {
        const response = await axios.post('/auth/verify-otp', { phone_number, otp })
        
        if (response.data.success) {
          toast.success('Phone verified successfully!')
          return { success: true, data: response.data }
        } else {
          toast.error(response.data.message || 'Verification failed')
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        // If API call fails but OTP is 123456, still treat as success
        if (otp === "123456") {
          toast.success('Phone verified successfully!')
          return { 
            success: true, 
            data: {
              success: true,
              message: 'OTP verified successfully',
              phone_number
            } 
          }
        }
        
        // Otherwise show error
        throw error;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.'
      toast.error(errorMessage)
      return { success: false, message: errorMessage }
    }
  }

  // Create password function
  const createPassword = async (phone_number, password) => {
    try {
      setIsLoading(true)
      const response = await axios.post('/auth/create-password', { 
        phone_number, 
        password,
        confirmPassword: password 
      })
      
      if (response.data.success) {
        const { token, user } = response.data
        
        // Save token and user to localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Update state
        setToken(token)
        setCurrentUser(user)
        setIsAuthenticated(true)
        
        toast.success('Account created successfully!')
        return { success: true }
      } else {
        toast.error(response.data.message || 'Failed to create password')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred during account creation'
      toast.error(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const handleLogout = () => {
    // Remove token and user from localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Reset state
    setToken(null)
    setCurrentUser(null)
    setIsAuthenticated(false)
    
    // Redirect will be handled by the component
  }

  // Function to update the current user data
  const updateCurrentUser = (userData) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      
      const updatedUser = {
        ...prev,
        ...userData
      };
      
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    });
  }

  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    verifyOTP,
    createPassword,
    logout: handleLogout,
    updateCurrentUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext 