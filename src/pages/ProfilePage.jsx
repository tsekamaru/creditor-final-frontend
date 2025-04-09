import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getCurrentUser, updateProfile } from '../services/user.service';
import { getCustomerById, updateCustomer } from '../services/customer.service';
import { getEmployeeById, updateEmployee } from '../services/employee.service';
import { useAuth } from '../hooks/useAuth';
import ChangePasswordModal from '../components/auth/ChangePasswordModal';
import { roles } from '../constants/roles';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    phone_number: '',
    country_code: '+31',
    phone: '',
    position: '',
    address: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    social_security_number: '',
    is_active: false,
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // Phone verification states
  const [phoneChanged, setPhoneChanged] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const { currentUser, updateCurrentUser, verifyOTP } = useAuth();

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setFetchLoading(true);
        const userData = await getCurrentUser();
        
        // Store basic user data
        setProfileData(userData);
        
        // Fetch additional data based on user role
        let additionalData = {};
        
        if (userData.role === roles.customer && userData.id) {
          try {
            // Fetch customer-specific data
            const customerData = await getCustomerById(userData.id);
            // Check if we have successful response with customer data
            const customerInfo = customerData.customer || customerData;
            
            if (customerInfo) {
              additionalData = {
                address: customerInfo.address || '',
                social_security_number: customerInfo.social_security_number || '',
                date_of_birth: customerInfo.date_of_birth || '',
                is_active: customerInfo.is_active !== undefined ? customerInfo.is_active : false,
                first_name: customerInfo.first_name || '',
                last_name: customerInfo.last_name || '',
                // Merge any other customer-specific fields
                ...customerInfo
              };
              
              // Update profile data with additional customer info
              setProfileData(prev => ({ ...prev, ...additionalData }));
            }
          } catch (error) {
            console.error('Error fetching customer data:', error);
          }
        } else if (userData.role === roles.employee && userData.id) {
          try {
            // Fetch employee-specific data
            const employeeData = await getEmployeeById(userData.id);
            // Check if we have successful response with employee data
            const employeeInfo = employeeData.employee || employeeData;
            
            if (employeeInfo) {
              additionalData = {
                position: employeeInfo.position || '',
                date_of_birth: employeeInfo.date_of_birth || '',
                first_name: employeeInfo.first_name || '',
                last_name: employeeInfo.last_name || '',
                // Merge any other employee-specific fields
                ...employeeInfo
              };
              
              // Update profile data with additional employee info
              setProfileData(prev => ({ ...prev, ...additionalData }));
            }
          } catch (error) {
            console.error('Error fetching employee data:', error);
          }
        }
        
        // Split phone number into country code and number if it exists
        let countryCode = '+31';
        let phoneNumber = '';
        
        if (userData.phone_number) {
          const phoneMatch = userData.phone_number.match(/^(\+\d+)\s*(.*)$/);
          if (phoneMatch) {
            countryCode = phoneMatch[1];
            phoneNumber = phoneMatch[2];
          } else {
            phoneNumber = userData.phone_number;
          }
        }
        
        // Combine all the data
        const combinedData = {
          ...userData,
          ...additionalData
        };
        
        // Set form data with both basic and role-specific data
        setFormData({
          email: combinedData.email || '',
          phone_number: combinedData.phone_number || '',
          country_code: countryCode,
          phone: phoneNumber,
          // Include role-specific fields
          position: combinedData.position || '',
          address: combinedData.address || '',
          first_name: combinedData.first_name || userData.first_name || '',
          last_name: combinedData.last_name || userData.last_name || '',
          date_of_birth: combinedData.date_of_birth || '',
          social_security_number: combinedData.social_security_number || '',
          is_active: combinedData.is_active !== undefined ? combinedData.is_active : false,
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data. Please try again later.');
        toast.error('Failed to load profile data');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchUserData();
  }, [roles.customer, roles.employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If phone or country code changes, set phoneChanged flag
    if (name === 'phone' || name === 'country_code') {
      setPhoneChanged(true);
    }
    
    // For OTP field, only allow numbers
    if (name === 'otp') {
      setOtp(value.replace(/[^0-9]/g, ''));
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSendOtp = async () => {
    setOtpError('');

    // Validate phone number
    if (!formData.phone || formData.phone.length < 8) {
      setOtpError('Phone number must be at least 8 digits');
      return;
    }

    try {
      setVerifyingOtp(true);
      // Simulate OTP sending
      setTimeout(() => {
        setOtpSent(true);
        setVerifyingOtp(false);
        toast.success('Verification code sent! (Use 123456 for testing)');
      }, 1000);
    } catch (err) {
      console.error('Error sending OTP:', err);
      setOtpError('Failed to send verification code');
      setVerifyingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpError('Please enter the verification code');
      return false;
    }

    try {
      setVerifyingOtp(true);
      setOtpError('');

      // Combine country code and phone
      const fullPhoneNumber = `${formData.country_code}${formData.phone.startsWith(' ') ? '' : ' '}${formData.phone}`;
      
      // Verify OTP using auth context function
      const result = await verifyOTP(fullPhoneNumber, otp);
      
      if (result.success) {
        toast.success('Phone number verified successfully!');
        setPhoneChanged(false);
        setOtp('');
        setOtpSent(false);
        
        // Continue with the form submission
        handleSubmitForm();
        return true;
      } else {
        setOtpError(result.message || 'Invalid verification code');
        return false;
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setOtpError('Error verifying code. Please try again.');
      return false;
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email) {
      toast.error('Email is required');
      return;
    }
    
    // If phone number changed but no OTP sent yet, send it
    if (phoneChanged && !otpSent) {
      handleSendOtp();
      return;
    }
    
    // If phone number changed and OTP sent but not verified
    if (phoneChanged && otpSent) {
      if (!otp) {
        setOtpError('Please enter the verification code');
        return;
      }
      
      // Verify OTP first
      await handleVerifyOtp();
      return;
    }
    
    // If no phone change or OTP already verified, proceed with form submission
    handleSubmitForm();
  };

  const handleSubmitForm = async () => {
    try {
      setLoading(true);
      
      // Combine country code and phone for submission
      const fullPhoneNumber = formData.phone ? 
        `${formData.country_code}${formData.phone.startsWith(' ') ? '' : ' '}${formData.phone}` : 
        '';
      
      // Prepare common data for all roles
      const basicData = {
        email: formData.email,
        phone_number: fullPhoneNumber,
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
      };
      
      let result;
      
      // Use the appropriate service based on user role
      if (currentUser?.role === roles.customer) {
        const customerData = {
          ...basicData,
          address: formData.address,
          social_security_number: formData.social_security_number,
          // Note: is_active is typically managed by the system, not manually updated
        };
        
        // Update customer profile using customer service
        result = await updateCustomer(currentUser.id, customerData);
        toast.success('Customer profile updated successfully');
      } 
      else if (currentUser?.role === roles.employee) {
        const employeeData = {
          ...basicData,
          position: formData.position,
        };
        
        // Update employee profile using employee service
        result = await updateEmployee(currentUser.id, employeeData);
        toast.success('Employee profile updated successfully');
      } 
      else {
        // For admin or other roles, use the general update profile function
        const updateData = {
          ...basicData,
        };
        
        result = await updateProfile(updateData);
        toast.success('Profile updated successfully');
      }
      
      // Update the profile data with new values
      setProfileData(prev => ({ ...prev, ...result }));
      
      // Exit edit mode
      setEditMode(false);
      
      // Update auth context if needed
      if (updateCurrentUser) {
        updateCurrentUser(result);
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Format a date string nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Make sure date is properly formatted in the input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ''; // Invalid date
      return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Render a field in view mode
  const renderField = (label, value, isDate = false) => {
    const displayValue = isDate ? formatDate(value) : value || 'N/A';
    return (
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-base font-medium text-gray-900">{displayValue}</p>
      </div>
    );
  };

  // Render position badge
  const renderPositionBadge = (position) => {
    if (!position) return null;
    
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';
    
    if (position.toLowerCase() === 'manager') {
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
    } else if (position.toLowerCase() === 'teller') {
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
    } else if (position.toLowerCase() === 'director') {
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {position}
      </span>
    );
  };

  // Add a function to handle toggling the edit mode
  const toggleEditMode = () => {
    if (!editMode) {
      // Updating form data with the latest profile data before entering edit mode
      // Split phone number into country code and number if it exists
      let countryCode = '+31';
      let phoneNumber = '';
      
      if (profileData.phone_number) {
        const phoneMatch = profileData.phone_number.match(/^(\+\d+)\s*(.*)$/);
        if (phoneMatch) {
          countryCode = phoneMatch[1];
          phoneNumber = phoneMatch[2];
        } else {
          phoneNumber = profileData.phone_number;
        }
      }
      
      setFormData({
        email: profileData.email || '',
        phone_number: profileData.phone_number || '',
        country_code: countryCode,
        phone: phoneNumber,
        position: profileData.position || '',
        address: profileData.address || '',
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        date_of_birth: profileData.date_of_birth || '',
        social_security_number: profileData.social_security_number || '',
        is_active: profileData.is_active !== undefined ? profileData.is_active : false,
      });
    }
    setEditMode(!editMode);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary-800">
            {editMode ? 'Edit Profile' : 'Profile'}
          </h1>
          {!editMode && (
            <div>
              <button
                onClick={toggleEditMode}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors mr-2"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="bg-secondary-500 hover:bg-secondary-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Change Password
              </button>
            </div>
          )}
        </div>
        
        {fetchLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : editMode ? (
          // Edit Mode Form
          <form onSubmit={handleSubmit}>
            {/* First Name */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="first_name">
                First Name *
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            {/* Last Name */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="last_name">
                Last Name *
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            {/* Phone Number */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Phone Number
              </label>
              <div className="flex gap-2">
                <div className="w-1/4">
                  <input
                    name="country_code"
                    type="text"
                    value={formData.country_code}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="+1"
                  />
                </div>
                <div className="w-3/4">
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="234-567-8900"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter country code (e.g. +1) and phone number separately.
              </p>
              
              {/* Phone verification */}
              {phoneChanged && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-sm text-gray-700 mb-2">
                    You've changed your phone number. Verification required.
                  </p>
                  <div className="flex gap-2">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      value={otp}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter verification code"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={verifyingOtp}
                      className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded transition-colors"
                    >
                      {otpSent ? 'Resend' : 'Send'} Code
                    </button>
                  </div>
                  {otpSent && <p className="mt-1 text-xs text-gray-500">For testing, use code: 123456</p>}
                  {otpError && <p className="mt-1 text-xs text-red-500">{otpError}</p>}
                </div>
              )}
            </div>
            
            {/* Date of Birth */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date_of_birth">
                Date of Birth
              </label>
              <input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formatDateForInput(formData.date_of_birth)}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            {/* Customer-specific fields */}
            {currentUser?.role === roles.customer && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="social_security_number">
                    Social Security Number
                  </label>
                  <input
                    id="social_security_number"
                    name="social_security_number"
                    type="text"
                    value={formData.social_security_number || ''}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                {/* Display status (readonly) for customers */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Status
                  </label>
                  <div className="flex items-center p-2 bg-gray-50 rounded border border-gray-200">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${formData.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      (Status is determined by your loan activity)
                    </span>
                  </div>
                </div>
              </>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center justify-end mt-6">
              <button
                type="button"
                onClick={toggleEditMode}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded mr-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        ) : (
          // View Mode
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="md:col-span-2 mb-2 flex items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {profileData.name}
              </h2>
              {currentUser?.role === roles.employee && profileData.position && (
                <div className="ml-3">
                  {renderPositionBadge(profileData.position)}
                </div>
              )}
              <div className="ml-auto text-base font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-md">
                ID: {profileData.id}
              </div>
            </div>
            
            <div className="md:col-span-2 border-b border-gray-200 mb-4 pb-2">
              <h3 className="text-md font-medium text-primary-600">Basic Information</h3>
            </div>
            
            {renderField('Email', profileData.email)}
            {renderField('Phone', profileData.phone_number)}
            {renderField('Role', profileData.role)}
            
            {/* Employee-specific information */}
            {currentUser?.role === roles.employee && (
              <>
                <div className="md:col-span-2 border-b border-gray-200 mt-6 mb-4 pb-2">
                  <h3 className="text-md font-medium text-primary-600">Employee Information</h3>
                </div>
                
                <div className="md:col-span-2 mb-4">
                  <div className="flex items-center">
                    <div className="mr-2">
                      <p className="text-sm font-medium text-gray-500">Position</p>
                      {renderPositionBadge(profileData.position)}
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-1">
                  {renderField('First Name', profileData.first_name)}
                </div>
                <div className="md:col-span-1">
                  {renderField('Last Name', profileData.last_name)}
                </div>
                
                {renderField('Date of Birth', profileData.date_of_birth, true)}
              </>
            )}
            
            {/* Customer-specific information */}
            {currentUser?.role === roles.customer && (
              <>
                <div className="md:col-span-2 border-b border-gray-200 mt-6 mb-4 pb-2">
                  <h3 className="text-md font-medium text-primary-600">Customer Information</h3>
                </div>
                
                <div className="md:col-span-1">
                  {renderField('First Name', profileData.first_name)}
                </div>
                <div className="md:col-span-1">
                  {renderField('Last Name', profileData.last_name)}
                </div>
                
                <div className="md:col-span-2">
                  {renderField('Address', profileData.address)}
                </div>
                
                {renderField('Social Security', profileData.social_security_number)}
                {renderField('Date of Birth', profileData.date_of_birth, true)}
                
                {profileData.age && (
                  <div className="md:col-span-1">
                    {renderField('Age', profileData.age)}
                  </div>
                )}
                
                <div className="md:col-span-2 mt-4">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-500 mr-2">Status:</p>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${profileData.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {profileData.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </>
            )}
            
            <div className="md:col-span-2 border-b border-gray-200 mt-6 mb-4 pb-2">
              <h3 className="text-md font-medium text-primary-600">Account Information</h3>
            </div>
            {renderField('Last Updated', profileData.updated_at, true)}
            {renderField('Account Created', profileData.created_at, true)}
          </div>
        )}
      </div>
      
      {/* Password Change Modal */}
      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => {
            setShowPasswordModal(false);
            toast.success('Password changed successfully');
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage; 