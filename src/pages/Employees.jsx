import { useState, useEffect } from 'react';
import { getAllEmployees } from '../services/employee.service';
import EmployeeView from '../components/employees/EmployeeView';
import EmployeeEdit from '../components/employees/EmployeeEdit';
import EmployeeForm from '../components/employees/EmployeeForm';
import { toast } from 'react-toastify';
import '../styles/table.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'updated_at', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getAllEmployees();
      setEmployees(data.employees || data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    if (!a[sortConfig.key] || !b[sortConfig.key]) return 0;
    
    // For dates
    if (['created_at', 'updated_at', 'date_of_birth'].includes(sortConfig.key)) {
      const dateA = new Date(a[sortConfig.key]);
      const dateB = new Date(b[sortConfig.key]);
      return sortConfig.direction === 'asc' 
        ? dateA - dateB 
        : dateB - dateA;
    }
    
    // For strings
    const valueA = String(a[sortConfig.key]).toLowerCase();
    const valueB = String(b[sortConfig.key]).toLowerCase();
    
    if (valueA < valueB) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Get unique positions for filter buttons
  const positions = ['all', ...new Set(employees.map(e => e.position).filter(Boolean))];

  const filteredEmployees = sortedEmployees.filter((employee) => {
    // First apply position filter
    if (positionFilter !== 'all' && employee.position !== positionFilter) {
      return false;
    }
    
    // Then apply search term filter
    const searchValue = searchTerm.toLowerCase();
    return (
      employee.first_name?.toLowerCase().includes(searchValue) ||
      employee.last_name?.toLowerCase().includes(searchValue) ||
      employee.position?.toLowerCase().includes(searchValue) ||
      employee.email?.toLowerCase().includes(searchValue) ||
      String(employee.user_id).includes(searchValue)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setIsAddModalOpen(true);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortConfig.direction === 'asc' ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Combined header row with title, search, and actions */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 flex-wrap">
          {/* Title */}
          <h1 className="text-2xl font-bold text-primary-800 whitespace-nowrap mr-4">Employees</h1>
          
          {/* Position filter buttons */}
          <div className="flex flex-wrap gap-2">
            {positions.map(position => (
              <button 
                key={position}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  positionFilter === position 
                    ? position === 'all' 
                      ? 'bg-primary-500 text-white' 
                      : position.toLowerCase() === 'teller'
                        ? 'bg-blue-600 text-white'
                        : position.toLowerCase() === 'manager' 
                          ? 'bg-purple-600 text-white'
                          : position.toLowerCase() === 'director'
                            ? 'bg-green-600 text-white'
                            : 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setPositionFilter(position)}
              >
                {position === 'all' ? 'All Positions' : position}
              </button>
            ))}
          </div>
          
          {/* Search bar */}
          <div className="flex-grow max-w-md mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Add employee button */}
          <button
            onClick={handleAdd}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors flex-shrink-0"
          >
            Add New Employee
          </button>
        </div>
      </div>
      
      {/* Employee Table */}
      {loading ? (
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
            <div className="w-12 h-12 rounded-full border-4 border-t-primary-500 animate-spin absolute top-0 left-0"></div>
          </div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No employees found</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? `No employees matching "${searchTerm}"` 
              : positionFilter !== 'all' 
                ? `No employees with position "${positionFilter}"` 
                : 'There are no employees to display.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Sticky scroll container using external CSS */}
          <div className="sticky-table-container">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky-header">
                <tr>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky-left">
                    Actions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('user_id')}>
                    ID {getSortIcon('user_id')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('position')}>
                    Position {getSortIcon('position')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('first_name')}>
                    First Name {getSortIcon('first_name')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('last_name')}>
                    Last Name {getSortIcon('last_name')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('date_of_birth')}>
                    Date of Birth {getSortIcon('date_of_birth')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('created_at')}>
                    Created {getSortIcon('created_at')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('updated_at')}>
                    Updated {getSortIcon('updated_at')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium sticky-left">
                      <div className="actions-container">
                        <button
                          onClick={() => handleView(employee)}
                          className="action-icon text-primary-600 hover:text-primary-800"
                          title="View"
                        >
                          <span className="action-icon-tooltip">View Employee</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                            <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(employee)}
                          className="action-icon text-secondary-700 hover:text-secondary-500"
                          title="Edit"
                        >
                          <span className="action-icon-tooltip">Edit Employee</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{employee.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getPositionBadge(employee.position)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.first_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(employee.date_of_birth)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(employee.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(employee.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* View Modal */}
      {isViewModalOpen && selectedEmployee && (
        <EmployeeView 
          employeeId={selectedEmployee.user_id} 
          onClose={() => setIsViewModalOpen(false)} 
        />
      )}
      
      {/* Edit Modal */}
      {isEditModalOpen && selectedEmployee && (
        <EmployeeEdit 
          employeeId={selectedEmployee.user_id}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            fetchEmployees();
            setIsEditModalOpen(false);
          }}
        />
      )}
      
      {/* Add Modal */}
      {isAddModalOpen && (
        <EmployeeForm 
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            fetchEmployees();
            setIsAddModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Employees; 