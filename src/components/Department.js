import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, Edit, Trash2, Plus, Search, X } from 'lucide-react';
import axios from 'axios';

// Department Management Dashboard
export default function Department() {
  // State management
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMode, setFormMode] = useState('closed'); // 'closed', 'add', 'edit'
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    dept_id: null,
    dept_name: '',
    description: '',
    access_level: 'standard',
    breach_risk_score: 0,
  });
  const token = localStorage.getItem('access_token');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // API endpoint based on Django viewset
  const API_URL = 'api/access/departments';
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  // Set up axios instance with CSRF token
  const api = axios.create({
    baseURL: 'http://localhost:8000/',
  });

  // Helper function to get CSRF token from cookies
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  
  // Fetch departments from backend
  const fetchDepartments = async () => {
    // setIsLoading(true);
    // try {
    //   const response = await api.get(API_URL);
    //   console.log(response);
      
    //   setDepartments(response.data);
    //   setIsLoading(false);
    // } catch (err) {
    //   setError('Failed to fetch departments. Please try again later.');
    //   console.error('Error fetching departments:', err);
    //   setIsLoading(false);
    // }
    axios.get('http://localhost:8000/api/access/departments')
  .then(response => {
    const users = response.data;
    console.log(users)
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
  };

  // Create a new department
  const createDepartment = async (departmentData) => {
    try {
      const response = await api.post(API_URL, departmentData);
      const newDepartment = response.data;
      setDepartments([...departments, newDepartment]);
      showNotification('Department created successfully!', 'success');
      return true;
    } catch (err) {
      console.error('Error creating department:', err);
      showNotification(`Failed to create department: ${err.response?.data?.error || 'Unknown error'}`, 'error');
      return false;
    }
  };

  // Update an existing department
  const updateDepartment = async (dept_id, departmentData) => {
    try {
      const response = await api.put(`${API_URL}${dept_id}/`, departmentData);
      const updatedDepartment = response.data;
      const updatedDepartments = departments.map(dept => 
        dept.dept_id === dept_id ? updatedDepartment : dept
      );
      
      setDepartments(updatedDepartments);
      showNotification('Department updated successfully!', 'success');
      return true;
    } catch (err) {
      console.error('Error updating department:', err);
      showNotification(`Failed to update department: ${err.response?.data?.error || 'Unknown error'}`, 'error');
      return false;
    }
  };

  // Delete a department
  const deleteDepartment = async (dept_id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) {
      return;
    }
    
    try {
      await api.delete(`${API_URL}${dept_id}/`);
      const filteredDepartments = departments.filter(dept => dept.dept_id !== dept_id);
      setDepartments(filteredDepartments);
      showNotification('Department deleted successfully!', 'success');
    } catch (err) {
      console.error('Error deleting department:', err);
      showNotification(`Failed to delete department: ${err.response?.data?.error || 'Unknown error'}`, 'error');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let success = false;
    if (formMode === 'add') {
      success = await createDepartment(formData);
    } else if (formMode === 'edit') {
      success = await updateDepartment(formData.dept_id, formData);
    }
    
    if (success) {
      resetForm();
    }
  };

  // Reset form and close it
  const resetForm = () => {
    setFormData({
      dept_id: null,
      dept_name: '',
      description: '',
      access_level: 'standard',
      breach_risk_score: 0,
    });
    setFormMode('closed');
  };

  // Show notification message
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Open edit form with department data
  const handleEdit = (department) => {
    setFormData({
      dept_id: department.dept_id,
      dept_name: department.dept_name,
      description: department.description,
      access_level: department.access_level || 'standard',
      breach_risk_score: department.breach_risk_score || 0,
    });
    setFormMode('edit');
  };

  // Load employees for a department
  const loadDepartmentEmployees = async (dept_id) => {
    try {
      const response = await api.get(`${API_URL}${dept_id}/employees/`);
      return response.data.length; // Return the count of employees
    } catch (err) {
      console.error('Error loading department employees:', err);
      return 0;
    }
  };

  // Filter departments based on search query
  const filteredDepartments = departments.filter(dept =>
    dept.dept_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate risk color based on score
  const getRiskColor = (score) => {
    if (score <= 25) return 'bg-green-100 text-green-800';
    if (score <= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Load departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage departments, access levels, and evaluate data breach risks.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10"
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setFormMode('add')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Department
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
          <p className="mt-4 text-gray-600">Loading departments...</p>
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

      {/* Department Form */}
      {formMode !== 'closed' && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {formMode === 'add' ? 'Add New Department' : 'Edit Department'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="dept_name" className="block text-sm font-medium text-gray-700">
                Department Name
              </label>
              <input
                type="text"
                name="dept_name"
                id="dept_name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.dept_name}
                onChange={(e) => setFormData({ ...formData, dept_name: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="access_level" className="block text-sm font-medium text-gray-700">
                Access Level
              </label>
              <select
                id="access_level"
                name="access_level"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.access_level}
                onChange={(e) => setFormData({ ...formData, access_level: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="standard">Standard</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="breach_risk_score" className="block text-sm font-medium text-gray-700">
                Breach Risk Score (0-100)
              </label>
              <input
                type="number"
                name="breach_risk_score"
                id="breach_risk_score"
                min="0"
                max="100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.breach_risk_score}
                onChange={(e) => setFormData({ ...formData, breach_risk_score: parseInt(e.target.value) || 0 })}
              />
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
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {formMode === 'add' ? 'Create Department' : 'Update Department'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Departments Table */}
      {!isLoading && !error && (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Access Level
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Breach Risk
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No departments found matching your search.
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((department) => (
                  <tr key={department.dept_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{department.dept_name}</div>
                      <div className="text-sm text-gray-500">{department.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${department.access_level === 'high' ? 'bg-purple-100 text-purple-800' : 
                          department.access_level === 'medium' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {department.access_level ? department.access_level.charAt(0).toUpperCase() + department.access_level.slice(1) : 'Standard'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(department.breach_risk_score || 0)}`}>
                        {department.breach_risk_score || 0}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {department.employee_count || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(department)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => deleteDepartment(department.dept_id)}
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