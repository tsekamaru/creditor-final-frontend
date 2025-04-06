import axios from '../utils/axios'

/**
 * Get all employees (Admin only)
 * @returns {Promise} - List of employees
 */
export const getAllEmployees = async () => {
  const response = await axios.get('/api/employees')
  return response.data
}

/**
 * Get employee by ID
 * @param {number} id - Employee ID
 * @returns {Promise} - Employee data
 */
export const getEmployeeById = async (id) => {
  const response = await axios.get(`/api/employees/${id}`)
  return response.data
}

/**
 * Create a new employee (Admin only)
 * @param {object} employeeData - Employee data including first_name, last_name, etc.
 * @returns {Promise} - New employee data
 */
export const createEmployee = async (employeeData) => {
  const response = await axios.post('/api/employees', employeeData)
  return response.data
}

/**
 * Update an existing employee (Admin only or self)
 * @param {number} id - Employee ID
 * @param {object} employeeData - Employee data to update
 * @returns {Promise} - Updated employee data
 */
export const updateEmployee = async (id, employeeData) => {
  const response = await axios.put(`/api/employees/${id}`, employeeData)
  return response.data
}

/**
 * Delete an employee (Admin only)
 * @param {number} id - Employee ID
 * @returns {Promise} - Deletion confirmation
 */
export const deleteEmployee = async (id) => {
  const response = await axios.delete(`/api/employees/${id}`)
  return response.data
} 