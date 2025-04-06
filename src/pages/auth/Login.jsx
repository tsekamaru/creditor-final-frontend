import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const Login = () => {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    countryCode: '+31',
    phoneNumber: '',
    password: ''
  })
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Special handling for countryCode to ensure it starts with +
    if (name === 'countryCode') {
      let formattedValue = value
      if (!value.startsWith('+')) {
        formattedValue = '+' + value.replace(/[^0-9]/g, '')
      } else {
        formattedValue = '+' + value.slice(1).replace(/[^0-9]/g, '')
      }
      setFormData({
        ...formData,
        [name]: formattedValue
      })
    } 
    // Special handling for phoneNumber to only allow digits
    else if (name === 'phoneNumber') {
      setFormData({
        ...formData,
        [name]: value.replace(/[^0-9]/g, '')
      })
    } 
    // Default handling for other fields
    else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const validateAndFormatPhone = () => {
    const { countryCode, phoneNumber } = formData
    
    // Validate country code format
    if (!countryCode.startsWith('+')) {
      setErrorMessage('Country code must start with +')
      return false
    }

    // Validate phone number length
    if (phoneNumber.length < 8) {
      setErrorMessage('Phone number must be at least 8 digits')
      return false
    }

    return `${countryCode} ${phoneNumber}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    
    const phone_number = validateAndFormatPhone()
    if (!phone_number) return
    
    const { password } = formData
    const result = await login(phone_number, password)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setErrorMessage(result.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-600">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Phone Number */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Phone number</label>
              <div className="flex space-x-2">
                {/* Country Code */}
                <div className="w-24">
                  <input
                    id="countryCode"
                    name="countryCode"
                    type="text"
                    required
                    className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="+31"
                    value={formData.countryCode}
                    onChange={handleChange}
                    maxLength={4}
                  />
                </div>
                {/* Phone Number */}
                <div className="flex-1">
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="615957803"
                    pattern="[0-9]{8,}"
                    title="Phone number must be at least 8 digits"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">Enter your phone number (minimum 8 digits)</p>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          {errorMessage && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{errorMessage}</h3>
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login 