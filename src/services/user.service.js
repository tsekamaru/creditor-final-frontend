import axios from '../utils/axios'
import { roles } from '../constants/roles'

/**
 * Get current user profile by combining data from multiple endpoints based on role
 * @returns {Promise<Object>} The combined user profile data
 */
export const getCurrentUser = async () => {
  try {
    // Get the user data from local storage
    const userJson = localStorage.getItem('user')
    if (!userJson) {
      throw new Error('No user found in local storage')
    }
    
    const userData = JSON.parse(userJson)
    const userId = userData.id
    if (!userId) {
      throw new Error('User ID not found')
    }
    
    // Use userData directly from localStorage without an additional API call
    const userRole = userData.role
    
    // Initialize the combined profile data with the user data from localStorage
    let profileData = { ...userData }
    
    // Based on role, fetch additional data
    if (userRole === roles.employee) {
      // Get employee-specific data
      const employeeResponse = await axios.get(`/api/employees/${userId}`)
      if (employeeResponse.data) {
        // Merge employee data with user data
        profileData = { 
          ...profileData, 
          ...employeeResponse.data,
          role: userRole
        }
      }
    } else if (userRole === roles.customer) {
      // Get customer-specific data
      const customerResponse = await axios.get(`/api/customers/${userId}`)
      if (customerResponse.data) {
        // Merge customer data with user data
        profileData = { 
          ...profileData,
          ...customerResponse.data,
          role: userRole
        }
      }
    }
    
    return profileData
  } catch (error) {
    console.error('Error fetching profile data:', error)
    throw error
  }
}

/**
 * Get all users (admin only)
 * @returns {Promise} - List of users
 */
export const getAllUsers = async () => {
  const response = await axios.get('/api/users')
  return response.data
}

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object>} The user data
 */
export const getUserById = async (id) => {
  try {
    const response = await axios.get(`/api/users/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    throw error
  }
}

/**
 * Create a new user (Admin only)
 * @param {object} userData - User data including role, phone_number, email, password
 * @returns {Promise} - New user data
 */
export const createUser = async (userData) => {
  const response = await axios.post('/api/users', userData)
  return response.data
}

/**
 * Update user by ID (Admin only)
 * @param {number} id - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} The updated user data
 */
export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(`/api/users/${id}`, userData)
    return response.data
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

/**
 * Update user profile information based on role
 * @param {Object} profileData - The profile data to update
 * @returns {Promise<Object>} The updated user data
 */
export const updateProfile = async (profileData) => {
  try {
    // Get the user data from local storage
    const userJson = localStorage.getItem('user')
    if (!userJson) {
      throw new Error('No user found in local storage')
    }
    
    const userData = JSON.parse(userJson)
    const userId = userData.id
    if (!userId) {
      throw new Error('User ID not found')
    }
    
    const userRole = userData.role
    let updatedData = { ...userData }
    
    // Common user data to update
    const userUpdateData = {
      name: profileData.name,
      email: profileData.email,
      phone_number: profileData.phone_number
    }
    
    // Update user data
    const userUpdateResponse = await axios.put(`/api/users/${userId}`, userUpdateData)
    
    // Merge the response with our base data
    if (userUpdateResponse.data) {
      updatedData = { ...updatedData, ...userUpdateResponse.data }
    }
    
    // Based on role, update additional data
    if (userRole === roles.employee) {
      // Update employee-specific data
      const employeeData = {
        position: profileData.position,
        // Add other employee-specific fields here
      }
      
      const employeeUpdateResponse = await axios.put(`/api/employees/${userId}`, employeeData)
      if (employeeUpdateResponse.data) {
        updatedData = { ...updatedData, ...employeeUpdateResponse.data }
      }
    } else if (userRole === roles.customer) {
      // Update customer-specific data
      const customerData = {
        address: profileData.address,
        // Add other customer-specific fields here
      }
      
      const customerUpdateResponse = await axios.put(`/api/customers/${userId}`, customerData)
      if (customerUpdateResponse.data) {
        updatedData = { ...updatedData, ...customerUpdateResponse.data }
      }
    }
    
    // Update localStorage with the new data
    localStorage.setItem('user', JSON.stringify(updatedData))
    
    return updatedData
  } catch (error) {
    console.error('Error updating profile:', error)
    throw error
  }
}

/**
 * Change user password
 * @param {Object} passwordData - Object containing current and new password
 * @returns {Promise<Object>} Success message
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await axios.post('/auth/change-password', passwordData)
    
    if (response.data.success) {
      return response.data
    } else {
      throw new Error(response.data.message || 'Failed to change password')
    }
  } catch (error) {
    console.error('Error changing password:', error)
    throw error
  }
}

/**
 * Delete user account (admin only)
 * @param {number} id - User ID
 * @returns {Promise<Object>} Success message
 */
export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`/api/users/${id}`)
    return response.data
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
} 