import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const Signup = () => {
  const navigate = useNavigate()
  const { register, verifyOTP } = useAuth()
  
  const [formData, setFormData] = useState({
    countryCode: '+31',
    phoneNumber: '',
    otp: ''
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [requestingOtp, setRequestingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)

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
    // Special handling for phoneNumber and OTP to only allow digits
    else if (name === 'phoneNumber' || name === 'otp') {
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

  const handleRequestOTP = async (e) => {
    // Prevent form submission
    e.preventDefault()
    
    setErrorMessage('')
    
    const phone_number = validateAndFormatPhone()
    if (!phone_number) return
    
    try {
      setRequestingOtp(true)
      
      // Save phone in localStorage to persist it even if page appears to refresh
      localStorage.setItem('signupPhone', phone_number)
      
      const result = await register({ phone: phone_number })
      
      if (result.success) {
        setOtpSent(true)
        // Don't move to next step yet, user needs to enter OTP
      } else {
        setErrorMessage(result.message || 'Failed to send verification code')
      }
    } catch (error) {
      setErrorMessage('An error occurred while sending verification code')
      console.error(error)
    } finally {
      setRequestingOtp(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    
    const phone_number = validateAndFormatPhone()
    if (!phone_number) return
    
    const { otp } = formData

    if (!otp) {
      setErrorMessage('Please enter the verification code')
      return
    }
    
    try {
      setVerifyingOtp(true)
      
      // Verify OTP
      const result = await verifyOTP(phone_number, otp)
      
      if (result.success) {
        // Store phone number for password creation step
        localStorage.setItem('verifiedPhone', phone_number)
        
        // Clean up signup phone
        localStorage.removeItem('signupPhone')
        
        // Navigate to password creation
        navigate('/auth/create-password')
      } else {
        setErrorMessage(result.message || 'Verification failed')
      }
    } catch (error) {
      setErrorMessage('An error occurred during verification')
      console.error(error)
    } finally {
      setVerifyingOtp(false)
    }
  }

  // Check for stored phone number from localStorage on component mount
  useState(() => {
    const storedPhone = localStorage.getItem('signupPhone')
    if (storedPhone) {
      // Extract country code and phone number
      const parts = storedPhone.split(' ')
      if (parts.length === 2) {
        setFormData(prev => ({
          ...prev,
          countryCode: parts[0],
          phoneNumber: parts[1]
        }))
        setOtpSent(true)
      }
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-600">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Step 1: Verify your phone number
          </p>
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

            {/* OTP Verification */}
            <div className="mb-4">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Verification Code</label>
              <div className="flex space-x-2">
                <button
                  type="button" 
                  onClick={handleRequestOTP}
                  disabled={requestingOtp || !formData.phoneNumber}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                    requestingOtp || !formData.phoneNumber ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {requestingOtp ? 'Sending...' : otpSent ? 'Resend Code' : 'Send Code'}
                </button>
              </div>
              <input
                id="otp"
                name="otp"
                type="text"
                autoComplete="off"
                required
                className="mt-2 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter verification code"
                value={formData.otp}
                onChange={handleChange}
              />
              {otpSent && <p className="mt-1 text-sm text-green-500">For development, use code: 123456</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={verifyingOtp || !formData.otp}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                verifyingOtp || !formData.otp ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {verifyingOtp ? 'Verifying...' : 'Verify Phone'}
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
            Already have an account?{' '}
            <Link to="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup 