import axios from '../utils/axios'

/**
 * Get all customers (Admin and Employee only)
 * @returns {Promise} - List of customers
 */
export const getAllCustomers = async () => {
  const response = await axios.get('/api/customers')
  return response.data
}

/**
 * Get customer by ID
 * @param {number} id - Customer ID
 * @returns {Promise} - Customer data
 */
export const getCustomerById = async (id) => {
  const response = await axios.get(`/api/customers/${id}`)
  return response.data
}

/**
 * Get loans for a specific customer
 * @param {number} id - Customer ID
 * @returns {Promise} - List of customer's loans
 */
export const getCustomerLoans = async (id) => {
  const response = await axios.get(`/api/customers/${id}/loans`)
  return response.data
}

/**
 * Create a new customer (Admin and Employee only)
 * @param {object} customerData - Customer data including first_name, last_name, etc.
 * @returns {Promise} - New customer data
 */
export const createCustomer = async (customerData) => {
  const response = await axios.post('/api/customers', customerData)
  return response.data
}

/**
 * Update an existing customer (Admin and Employee only)
 * @param {number} id - Customer ID
 * @param {object} customerData - Customer data to update
 * @returns {Promise} - Updated customer data
 */
export const updateCustomer = async (id, customerData) => {
  const response = await axios.put(`/api/customers/${id}`, customerData)
  return response.data
}

/**
 * Delete a customer (Admin only)
 * @param {number} id - Customer ID
 * @returns {Promise} - Deletion confirmation
 */
export const deleteCustomer = async (id) => {
  const response = await axios.delete(`/api/customers/${id}`)
  return response.data
} 