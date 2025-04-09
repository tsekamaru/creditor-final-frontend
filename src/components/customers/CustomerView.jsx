import { useState, useEffect } from 'react';
import { getCustomerById, getCustomerLoans } from '../../services/customer.service';
import { toast } from 'react-toastify';

const CustomerView = ({ customerId, onClose }) => {
  const [customer, setCustomer] = useState(null);
  const [customerLoans, setCustomerLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        // Fetch customer details
        const customerData = await getCustomerById(customerId);
        setCustomer(customerData.customer || customerData);
        
        // Fetch customer loans
        try {
          const loansData = await getCustomerLoans(customerId);
          setCustomerLoans(loansData.loans || []);
        } catch (error) {
          console.error('Error fetching customer loans:', error);
          // Non-critical error, so we don't show a toast
          setCustomerLoans([]);
        }
      } catch (error) {
        console.error('Error fetching customer details:', error);
        toast.error('Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomerDetails();
  }, [customerId]);
  
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
  
  if (!customer) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary-800">Customer Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-8 text-center">
            <p className="text-gray-700">Customer not found or has been deleted.</p>
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
            Customer #{customer.user_id} Details
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
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-primary-700">Personal Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 font-medium">Full Name:</span>
                <span className="ml-2 text-gray-800">{customer.first_name} {customer.last_name}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Social Security Number:</span>
                <span className="ml-2 text-gray-800">{customer.social_security_number}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Date of Birth:</span>
                <span className="ml-2 text-gray-800">
                  {customer.date_of_birth ? new Date(customer.date_of_birth).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Age:</span>
                <span className="ml-2 text-gray-800">{customer.age} years</span>
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-primary-700">Contact Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 font-medium">Phone Number:</span>
                <span className="ml-2 text-gray-800">{customer.phone_number || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Email:</span>
                <span className="ml-2 text-gray-800">{customer.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Address:</span>
                <span className="ml-2 text-gray-800">{customer.address || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          {/* Status Information */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-primary-700">Status Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600 font-medium">Customer Status:</span>
                <span className="ml-2">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${customer.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {customer.is_active ? 'Active' : 'Inactive'}
                  </span>
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Created:</span>
                <span className="ml-2 text-gray-800">
                  {customer.created_at ? new Date(customer.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Last Updated:</span>
                <span className="ml-2 text-gray-800">
                  {customer.updated_at ? new Date(customer.updated_at).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Customer Loans Summary */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-primary-700">Loans Summary</h3>
            {customerLoans.length === 0 ? (
              <p className="text-gray-600">No loans found for this customer.</p>
            ) : (
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600 font-medium">Total Loans:</span>
                  <span className="ml-2 text-gray-800">{customerLoans.length}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Active Loans:</span>
                  <span className="ml-2 text-gray-800">
                    {customerLoans.filter(loan => loan.current_status === 'active').length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Paid Loans:</span>
                  <span className="ml-2 text-gray-800">
                    {customerLoans.filter(loan => loan.current_status === 'paid').length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Defaulted Loans:</span>
                  <span className="ml-2 text-gray-800">
                    {customerLoans.filter(loan => loan.current_status === 'defaulted').length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Customer Loans List */}
        {customerLoans.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-primary-700">Customer Loans</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerLoans.map((loan) => (
                    <tr key={loan.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{loan.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${loan.current_status === 'active' ? 'bg-accent-light text-primary-800' : 
                           loan.current_status === 'paid' ? 'bg-secondary-500 text-white' : 
                           loan.current_status === 'defaulted' ? 'bg-accent-warm text-white' : 
                           'bg-gray-100 text-gray-800'}`}>
                          {loan.current_status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₮{loan.loan_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₮{loan.principle_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {loan.start_date ? new Date(loan.start_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {loan.end_date ? new Date(loan.end_date).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
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

export default CustomerView; 