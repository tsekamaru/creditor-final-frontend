import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const CreatePassword = () => {
  const navigate = useNavigate()
  const { createPassword, isLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [verifiedPhone, setVerifiedPhone] = useState('')

  // Check if user has verified phone number
  useEffect(() => {
    const storedPhone = localStorage.getItem('verifiedPhone')
    if (!storedPhone) {
      navigate('/auth/signup')
    } else {
      setVerifiedPhone(storedPhone)
    }
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    
    const { password, confirmPassword } = formData
    
    // Password validation
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long')
      return
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      return
    }
    
    if (!verifiedPhone) {
      setErrorMessage('No verified phone number found')
      return
    }
    
    try {
      const result = await createPassword(verifiedPhone, password)
      
      if (result.success) {
        // Clear verified phone from localStorage
        localStorage.removeItem('verifiedPhone')
        // Redirect to dashboard
        navigate('/dashboard')
      } else {
        setErrorMessage(result.message || 'Failed to create password')
      }
    } catch (error) {
      setErrorMessage('An error occurred during account creation')
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-600">
            Create your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Step 2: Set up your account password
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
              <p className="mt-1 text-sm text-gray-500">Password must be at least 6 characters long</p>
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
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
              {isLoading ? 'Creating Account...' : 'Create Account'}
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
      </div>
    </div>
  )
}

export default CreatePassword 