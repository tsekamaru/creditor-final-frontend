import { useState, useEffect } from 'react';
import { getEmployeeById } from '../../services/employee.service';
import { toast } from 'react-toastify';

const EmployeeView = ({ employeeId, onClose }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        // Fetch employee details
        const employeeData = await getEmployeeById(employeeId);
        setEmployee(employeeData.employee || employeeData);
      } catch (error) {
        console.error('Error fetching employee details:', error);
        toast.error('Failed to load employee details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeDetails();
  }, [employeeId]);
  
  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!employee) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary-800">Employee Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-8 text-center">
            <p className="text-gray-700">Employee not found or has been deleted.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary-800">
            Employee #{employee.user_id} Details
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-primary-700">Personal Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 font-medium">Full Name:</span>
                <span className="ml-2 text-gray-800">{employee.first_name} {employee.last_name}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Position:</span>
                <span className="ml-2 text-gray-800">{employee.position}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Date of Birth:</span>
                <span className="ml-2 text-gray-800">
                  {employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Age:</span>
                <span className="ml-2 text-gray-800">{calculateAge(employee.date_of_birth)} years</span>
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-primary-700">Contact Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 font-medium">Phone Number:</span>
                <span className="ml-2 text-gray-800">{employee.phone_number || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Email:</span>
                <span className="ml-2 text-gray-800">{employee.email || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          {/* System Information */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-primary-700">System Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 font-medium">Employee ID:</span>
                <span className="ml-2 text-gray-800">#{employee.user_id}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Created:</span>
                <span className="ml-2 text-gray-800">
                  {employee.created_at ? new Date(employee.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Last Updated:</span>
                <span className="ml-2 text-gray-800">
                  {employee.updated_at ? new Date(employee.updated_at).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeView; 