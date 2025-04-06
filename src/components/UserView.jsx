import { useState, useEffect } from 'react';
import { getUserById } from '../services/user.service';
import { toast } from 'react-toastify';

const UserView = ({ userId, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const userData = await getUserById(userId);
        setUser(userData.user || userData);
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast.error('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [userId]);
  
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'employee':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary-800">User Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-8 text-center">
            <p className="text-gray-700">User not found or has been deleted.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary-800">
            User #{user.id} Details
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
        
        <div className="mt-6 space-y-6">
          {/* User basic info */}
          <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-primary-700">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">User ID</p>
                <p className="font-medium">#{user.id}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Role</p>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
          
          {/* Contact info */}
          <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-primary-700">Contact Information</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                <p className="font-medium">{user.phone_number || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium">{user.email || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          {/* Date info */}
          <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-primary-700">Date Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Created At</p>
                <p className="font-medium">
                  {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Updated At</p>
                <p className="font-medium">
                  {user.updated_at ? new Date(user.updated_at).toLocaleString() : 'N/A'}
                </p>
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

export default UserView; 