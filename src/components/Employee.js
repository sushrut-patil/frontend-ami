import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, Edit, Trash2, Plus, Search, X, Eye } from 'lucide-react';

// Employee Management Dashboard
export default function Employee() {
  // State management
  const [employees, setEmployees] = useState([]);
  const [accessOptions, setAccessOptions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMode, setFormMode] = useState('closed'); // 'closed', 'add', 'edit', 'view'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    emp_name: '',
    dept_id: '',
    access_ids: []
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Mock API endpoints (replace with your actual Django API endpoints)
  const API_URL = '/api/employees/';

  // Fetch employees and access options from backend
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, these would be actual API calls
      // const employeesResponse = await fetch(API_URL);
      // const employeesData = await employeesResponse.json();
      
      // For demo purposes, using mock data based on the images
      const mockEmployees = [
        { id: 1, emp_name: 'Ajay Chhajlani', dept_id: 1, access_ids: [1, 2, 3, 4, 9, 16] },
        { id: 2, emp_name: 'Amar Gupta', dept_id: 1, access_ids: [1, 2, 3, 4, 9, 16] },
        { id: 3, emp_name: 'Amit Bansode', dept_id: 1, access_ids: [1, 2, 3, 4, 9, 16] },
        { id: 4, emp_name: 'Aniket Khode', dept_id: 1, access_ids: [1, 2, 3, 4, 9, 16] },
        { id: 5, emp_name: 'Kajal Prajapati', dept_id: 1, access_ids: [1, 2, 3, 4, 9, 16] },
        { id: 6, emp_name: 'Karl Travasso', dept_id: 2, access_ids: [1, 2, 3, 4, 9, 15] },
        { id: 7, emp_name: 'Kunal Joshi', dept_id: 1, access_ids: [1, 2, 3, 4, 9, 16] },
        { id: 8, emp_name: 'Mahesh Chorge', dept_id: 2, access_ids: [1, 2, 3, 4, 9, 16] },
        { id: 9, emp_name: 'Rahul Thakur', dept_id: 1, access_ids: [1, 2, 3, 4, 9, 16] },
        { id: 10, emp_name: 'Sanghavi Badavate', dept_id: 1, access_ids: [1, 2, 3, 4, 9, 16] },
        { id: 11, emp_name: 'Supreetha Puthran', dept_id: 1, access_ids: [1, 2, 3, 4, 9, 16] },
        { id: 12, emp_name: 'Vallisa Delva', dept_id: 3, access_ids: [1, 2, 3, 4, 5, 6, 9, 23] },
      ];

      const mockAccessOptions = [
        { id: 1, name: 'Teams' },
        { id: 2, name: 'Outlook_Internal' },
        { id: 3, name: 'Outlook_External' },
        { id: 4, name: 'Outlook_Internal_Dev' },
        { id: 5, name: 'Gmail' },
        { id: 6, name: 'Whatsapp' },
        { id: 7, name: 'Survey_Genius' },
        { id: 8, name: 'SD_IT_Analytics' },
        { id: 9, name: 'SD_Cyberdata' },
        { id: 10, name: 'SD_Quality_Daily_R' },
        { id: 11, name: 'SD_Data_Analytics' },
        { id: 12, name: 'SD_Mahindra' },
        { id: 13, name: 'SD_Daily_Lat_long' },
        { id: 14, name: 'SD_Daily_Reports' },
        { id: 15, name: 'SD_HR_Common' },
        { id: 16, name: 'SD_Accounts_HO' },
        { id: 17, name: 'SD_Operations' },
        { id: 18, name: 'SD_Training_L&D' },
        { id: 19, name: 'SD_Quality' },
        { id: 20, name: 'SD_CRIS' },
        { id: 21, name: 'SD_Govt_Projects' },
        { id: 22, name: 'SD_CMI_Partnership' },
        { id: 23, name: 'SD_Designer' },
        { id: 24, name: 'SD_Researcher' },
        { id: 25, name: 'DTP' },
        { id: 26, name: 'Amr_Projects' },
        { id: 27, name: 'SD_Marketing' },
        { id: 28, name: 'AccessEcell' },
      ];

      const mockDepartments = [
        { id: 1, name: 'IT Security' },
        { id: 2, name: 'Human Resources' },
        { id: 3, name: 'Design' },
        { id: 4, name: 'Finance' },
        { id: 5, name: 'Engineering' },
      ];
      
      setEmployees(mockEmployees);
      setAccessOptions(mockAccessOptions);
      setDepartments(mockDepartments);
      setIsLoading(false);
    } catch (error) {
      setError('Failed to fetch data. Please try again later.');
      setIsLoading(false);
    }
  };

  // Create a new employee
  const createEmployee = async (employeeData) => {
    try {
      // In real implementation
      // const response = await fetch(API_URL, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(employeeData),
      // });
      // const newEmployee = await response.json();
      
      // For demo purposes
      const newEmployee = {
        ...employeeData,
        id: employees.length + 1
      };
      
      setEmployees([...employees, newEmployee]);
      showNotification('Employee created successfully!', 'success');
      return true;
    } catch (error) {
      showNotification('Failed to create employee.', 'error');
      return false;
    }
  };

  // Update an existing employee
  const updateEmployee = async (id, employeeData) => {
    try {
      // In real implementation
      // const response = await fetch(`${API_URL}${id}/`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(employeeData),
      // });
      // const updatedEmployee = await response.json();
      
      // For demo purposes
      const updatedEmployees = employees.map(emp => 
        emp.id === id ? { ...emp, ...employeeData } : emp
      );
      
      setEmployees(updatedEmployees);
      showNotification('Employee updated successfully!', 'success');
      return true;
    } catch (error) {
      showNotification('Failed to update employee.', 'error');
      return false;
    }
  };

  // Delete an employee
  const deleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }
    
    try {
      // In real implementation
      // await fetch(`${API_URL}${id}/`, {
      //   method: 'DELETE',
      // });
      
      // For demo purposes
      const filteredEmployees = employees.filter(emp => emp.id !== id);
      setEmployees(filteredEmployees);
      showNotification('Employee deleted successfully!', 'success');
    } catch (error) {
      showNotification('Failed to delete employee.', 'error');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    let success = false;
    if (formMode === 'add') {
      success = await createEmployee(formData);
    } else if (formMode === 'edit') {
      success = await updateEmployee(formData.id, formData);
    }
    
    if (success) {
      resetForm();
    }
  };

  // Toggle access ID selection
  const toggleAccessId = (accessId) => {
    const currentAccessIds = [...formData.access_ids];
    const index = currentAccessIds.indexOf(accessId);
    
    if (index === -1) {
      // Add the access ID
      setFormData({
        ...formData,
        access_ids: [...currentAccessIds, accessId]
      });
    } else {
      // Remove the access ID
      currentAccessIds.splice(index, 1);
      setFormData({
        ...formData,
        access_ids: currentAccessIds
      });
    }
  };

  // Reset form and close it
  const resetForm = () => {
    setFormData({
      id: null,
      emp_name: '',
      dept_id: '',
      access_ids: []
    });
    setFormMode('closed');
    setCurrentEmployee(null);
  };

  // Show notification message
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Open edit form with employee data
  const handleEdit = (employee) => {
    setFormData({
      id: employee.id,
      emp_name: employee.emp_name,
      dept_id: employee.dept_id,
      access_ids: [...employee.access_ids]
    });
    setFormMode('edit');
  };

  // View employee details
  const handleView = (employee) => {
    setCurrentEmployee(employee);
    setFormMode('view');
  };

  // Filter employees based on search query
  const filteredEmployees = employees.filter(emp =>
    emp.emp_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format access IDs for display
  const formatAccessIds = (accessIds) => {
    return accessIds.sort((a, b) => a - b).join(', ');
  };

  // Get department name by ID
  const getDepartmentName = (deptId) => {
    const department = departments.find(dept => dept.id === deptId);
    return department ? department.name : 'Unknown';
  };

  // Get access name by ID
  const getAccessName = (accessId) => {
    const access = accessOptions.find(acc => acc.id === accessId);
    return access ? access.name : `Unknown (${accessId})`;
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage employees and their system access rights
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setFormMode('add')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`mb-4 p-4 rounded-md ${notification.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading and Error States */}
      {isLoading && (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Form */}
      {formMode !== 'closed' && formMode !== 'view' && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {formMode === 'add' ? 'Add New Employee' : 'Edit Employee'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="emp_name" className="block text-sm font-medium text-gray-700">
                Employee Name
              </label>
              <input
                type="text"
                id="emp_name"
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.emp_name}
                onChange={(e) => setFormData({ ...formData, emp_name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="dept_id" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                id="dept_id"
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.dept_id}
                onChange={(e) => setFormData({ ...formData, dept_id: Number(e.target.value) })}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Rights
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
                <div className="grid grid-cols-2 gap-2">
                  {accessOptions.map(access => (
                    <div key={access.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`access_${access.id}`}
                        checked={formData.access_ids.includes(access.id)}
                        onChange={() => toggleAccessId(access.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`access_${access.id}`} className="ml-2 block text-sm text-gray-900">
                        {access.id}: {access.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {formMode === 'add' ? 'Create Employee' : 'Update Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee View */}
      {formMode === 'view' && currentEmployee && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Employee Details
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Employee Name</h3>
                <p className="mt-1 text-sm text-gray-900">{currentEmployee.emp_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Department</h3>
                <p className="mt-1 text-sm text-gray-900">{getDepartmentName(currentEmployee.dept_id)}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Access Rights</h3>
              <div className="mt-2 border border-gray-200 rounded-md p-4">
                <ul className="space-y-2">
                  {currentEmployee.access_ids.sort((a, b) => a - b).map(accessId => (
                    <li key={accessId} className="text-sm">
                      <span className="font-medium text-gray-600">{accessId}:</span> {getAccessName(accessId)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleEdit(currentEmployee);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employees Table */}
      {!isLoading && !error && (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Access IDs
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No employees found matching your search.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.emp_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{getDepartmentName(employee.dept_id)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">
                        [{formatAccessIds(employee.access_ids)}]
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleView(employee)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => deleteEmployee(employee.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}