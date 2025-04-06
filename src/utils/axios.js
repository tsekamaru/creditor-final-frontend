import axios from 'axios'
import { toast } from 'react-toastify'

// Set baseURL with fallback
const API_URL = import.meta.env.VITE_API_URL

const instance = axios.create({
  baseURL: API_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    // Get auth token from localStorage
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor
instance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response

      // Handle specific HTTP status codes
      switch (status) {
        case 401: // Unauthorized
          // Clear token and redirect to login if not already on login page
          if (window.location.pathname !== '/auth/login') {
            localStorage.removeItem('token')
            toast.error('Your session has expired. Please log in again.')
            window.location.href = '/auth/login'
          }
          break
        case 403: // Forbidden
          toast.error('You do not have permission to perform this action')
          break
        case 404: // Not Found
          toast.error('The requested resource was not found')
          break
        case 500: // Server Error
          toast.error('Server error. Please try again later.')
          break
        default:
          // Handle other errors
          if (data && data.message) {
            toast.error(data.message)
          } else {
            toast.error('An error occurred. Please try again.')
          }
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('No response from server. Please check your internet connection.')
    } else {
      // Something happened in setting up the request
      toast.error('An error occurred. Please try again.')
    }

    return Promise.reject(error)
  }
)

export default instance 