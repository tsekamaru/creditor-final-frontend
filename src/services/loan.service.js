import axios from '../utils/axios'

/**
 * Get all loans (Admin and Employee only)
 * @returns {Promise} - List of loans
 */
export const getAllLoans = async () => {
  const response = await axios.get('/api/loans')
  return response.data
}

/**
 * Get loan by ID
 * @param {number} id - Loan ID
 * @returns {Promise} - Loan data
 */
export const getLoanById = async (id) => {
  const response = await axios.get(`/api/loans/${id}`)
  return response.data
}

/**
 * Get customer's loans
 * For customers, this will automatically return only their loans
 * @returns {Promise} - List of customer's loans
 */
export const getCustomerLoans = async () => {
  // Using the same endpoint as getAllLoans because the backend filters based on the user role
  const response = await axios.get('/api/loans')
  return response.data
}

/**
 * Create a new loan (Admin and Employee only)
 * @param {object} loanData - Loan data including customer_id and loan_amount
 * @returns {Promise} - New loan data
 */
export const createLoan = async (loanData) => {
  const response = await axios.post('/api/loans', loanData)
  return response.data
}

/**
 * Update an existing loan (Admin and Employee only)
 * @param {number} id - Loan ID
 * @param {object} loanData - Loan data to update
 * @returns {Promise} - Updated loan data
 */
export const updateLoan = async (id, loanData) => {
  const response = await axios.put(`/api/loans/${id}`, loanData)
  return response.data
}

/**
 * Make a payment on a loan
 * @param {number} id - Loan ID
 * @param {object} paymentData - Payment data including principle_payment and interest_payment
 * @returns {Promise} - Updated loan data after payment
 */
export const makePayment = async (id, paymentData) => {
  const response = await axios.put(`/api/loans/${id}/payment`, paymentData)
  return response.data
}

/**
 * Delete a loan (Admin only)
 * @param {number} id - Loan ID
 * @returns {Promise} - Deletion confirmation
 */
export const deleteLoan = async (id) => {
  const response = await axios.delete(`/api/loans/${id}`)
  return response.data
}

/**
 * Request a loan extension
 * @param {number} loanId - Loan ID
 * @param {object} extensionData - Extension data including days
 * @returns {Promise} - Updated loan data
 */
export const requestExtension = async (loanId, extensionData) => {
  const response = await axios.post(`/api/loans/${loanId}/extension`, extensionData)
  return response.data
}

/**
 * Approve or reject a loan (admin/employee only)
 * @param {number} loanId - Loan ID
 * @param {object} approvalData - Approval data including decision and notes
 * @returns {Promise} - Updated loan data
 */
export const processLoanApplication = async (loanId, approvalData) => {
  const response = await axios.post(`/api/loans/${loanId}/process`, approvalData)
  return response.data
} 