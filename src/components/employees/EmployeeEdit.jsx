import { useState, useEffect } from 'react';
import { getEmployeeById, updateEmployee, deleteEmployee } from '../../services/employee.service';
import { toast } from 'react-toastify';

const EmployeeEdit = ({ employeeId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    position: '',
    date_of_birth: ''
  });
  const [originalEmployee, setOriginalEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        
        // Fetch employee details
        const employeeData = await getEmployeeById(employeeId);
        const employee = employeeData.employee || employeeData;
        setOriginalEmployee(employee);
        
        // Set form data with employee details
        setFormData({
          first_name: employee.first_name || '',
          last_name: employee.last_name || '',
          position: employee.position || '',
          date_of_birth: formatDateForInput(employee.date_of_birth)
        });
      } catch (error) {
        console.error('Error fetching employee data:', error);
        toast.error('Failed to load employee data');
      } finally {
        setFetchingData(false);
      }
    };
    
    fetchData();
  }, [employeeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.first_name || !formData.last_name || !formData.position) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const result = await updateEmployee(employeeId, formData);
      toast.success('Employee updated successfully');
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Close the form
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error(error.response?.data?.message || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteEmployee(employeeId);
      toast.success('Employee deleted successfully');
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Close the form
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error(error.response?.data?.message || 'Failed to delete employee');
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Get styled badge for position
  const getPositionBadge = (position) => {
    switch (position?.toLowerCase()) {
      case 'teller':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{position}</span>;
      case 'manager':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">{position}</span>;
      case 'director':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{position}</span>;
      default:
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{position || 'Unknown'}</span>;
    }
  };

  if (fetchingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary-800">Edit Employee #{employeeId}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
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
            <div>
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
          </div>
          
          {/* Position */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="position">
              Position *
            </label>
            <div className="relative">
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select a position</option>
                <option value="teller">Teller</option>
                <option value="manager">Manager</option>
                <option value="director">Director</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {formData.position && (
              <div className="mt-2">
                Current Position: {getPositionBadge(formData.position)}
              </div>
            )}
          </div>
          
          {/* Date of Birth */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date_of_birth">
              Date of Birth *
            </label>
            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          {/* Contact Information - Read Only */}
          <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Information (Read Only)</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={originalEmployee?.phone_number || 'Not provided'}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight bg-gray-100 cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="text"
                  value={originalEmployee?.email || 'Not provided'}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight bg-gray-100 cursor-not-allowed"
                  disabled
                />
              </div>
              <p className="text-xs text-yellow-600 mt-2 italic bg-yellow-50 p-2 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Phone number and email can only be updated in the User section as they are part of the user account.
              </p>
            </div>
          </div>
          
          {/* System Information */}
          {originalEmployee && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">System Information</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium">Employee ID: </span>
                  <span>#{originalEmployee.user_id}</span>
                </div>
                <div>
                  <span className="font-medium">Created: </span>
                  <span>{originalEmployee.created_at ? new Date(originalEmployee.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium">Last Updated: </span>
                  <span>{originalEmployee.updated_at ? new Date(originalEmployee.updated_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button 
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            <div className="flex items-center">
              <button
                type="button"
                onClick={onClose}
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
          </div>
        </form>
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete employee <span className="font-medium">{formData.first_name} {formData.last_name}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className={`bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors flex items-center ${deleteLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeEdit; 