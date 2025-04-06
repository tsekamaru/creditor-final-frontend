import axios from '../utils/axios'

/**
 * Get all transactions (Admin and Employee only)
 * @returns {Promise} - List of transactions
 */
export const getAllTransactions = async () => {
  try {
    const response = await axios.get('/api/transactions')
    return response.data
  } catch (error) {
    console.error('Error fetching all transactions:', error)
    throw error
  }
}

/**
 * Get transactions for the logged-in customer
 * @param {number} customerId - Customer ID
 * @returns {Promise} - List of customer's transactions
 */
export const getCustomerTransactions = async (customerId) => {
  try {
    const response = await axios.get(`/api/transactions/customer/${customerId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching customer transactions:', error)
    throw error
  }
}

/**
 * Get transactions for a specific loan
 * @param {number} loanId - Loan ID
 * @returns {Promise} - List of loan transactions
 */
export const getLoanTransactions = async (loanId) => {
  try {
    const response = await axios.get(`/api/transactions/loan/${loanId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching loan transactions:', error)
    throw error
  }
}

/**
 * Get transaction by ID
 * @param {number} transactionId - Transaction ID
 * @returns {Promise} - Transaction data
 */
export const getTransactionById = async (transactionId) => {
  try {
    const response = await axios.get(`/api/transactions/${transactionId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching transaction:', error)
    throw error
  }
}

/**
 * Create a new transaction (Admin and Employee only)
 * @param {object} transactionData - Transaction data
 * @returns {Promise} - New transaction data
 */
export const createTransaction = async (transactionData) => {
  try {
    const response = await axios.post('/api/transactions', transactionData)
    return response.data
  } catch (error) {
    console.error('Error creating transaction:', error)
    throw error
  }
}

/**
 * Update an existing transaction (Admin and Employee only)
 * @param {number} transactionId - Transaction ID
 * @param {object} transactionData - Transaction data to update
 * @returns {Promise} - Updated transaction data
 */
export const updateTransaction = async (transactionId, transactionData) => {
  try {
    const response = await axios.put(`/api/transactions/${transactionId}`, transactionData)
    return response.data
  } catch (error) {
    console.error('Error updating transaction:', error)
    throw error
  }
}

/**
 * Delete a transaction (Admin only)
 * @param {number} transactionId - Transaction ID
 * @returns {Promise} - Deletion confirmation
 */
export const deleteTransaction = async (transactionId) => {
  try {
    const response = await axios.delete(`/api/transactions/${transactionId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting transaction:', error)
    throw error
  }
}

export default {
  getAllTransactions,
  getCustomerTransactions,
  getLoanTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
} 