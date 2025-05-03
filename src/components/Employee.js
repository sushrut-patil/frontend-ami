  import React, { useState, useEffect } from 'react';
  import axios from 'axios';
  import { Loader2, Pencil, Trash2 } from 'lucide-react';

  const Employee = () => {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
      full_name: '',
      email: '',
      role: '',
      department: '',
    });
    const [editingId, setEditingId] = useState(null);

    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/api/access/employees/', {
          withCredentials: true,
        });
        setEmployees(response.data.results || []);
      } catch (err) {
        console.error(err);
        setError('Unable to load employee data.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/access/departments/', {
          withCredentials: true,
        });
        setDepartments(response.data.results || []);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };

    useEffect(() => {
      fetchEmployees();
      fetchDepartments();
    }, []);

    const handleInputChange = e => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async e => {
      e.preventDefault();
      try {
        if (editingId) {
          // Update existing employee
          await axios.put(`http://localhost:8000/api/access/employees/${editingId}/`, formData, {
            withCredentials: true,
          });
        } else {
          // Add new employee with ID+1 logic
          const maxId = employees.reduce((max, emp) => (emp.employee_id > max ? emp.employee_id : max), 0);
          const newEmployee = { ...formData, employee_id: maxId + 1 };

          await axios.post(`http://localhost:8000/api/access/employees/`, newEmployee, {
            withCredentials: true,
          });
        }

        setFormData({ full_name: '', email: '', role: '', department: '' });
        setEditingId(null);
        fetchEmployees();
      } catch (err) {
        console.error('Error saving employee:', err);
        setError('Failed to save employee.');
      }
    };

    const handleEdit = emp => {
      setFormData({
        full_name: emp.full_name,
        email: emp.email,
        role: emp.role,
        department: emp.department?.dept_id || '',
      });
      setEditingId(emp.employee_id);
    };

    const handleDelete = async id => {
      if (window.confirm('Are you sure you want to delete this employee?')) {
        try {
          await axios.delete(`http://localhost:8000/api/access/employees/${id}/`, {
            withCredentials: true,
          });
          // await fetchEmployees();
          const updatedEmployees = employees.filter(emp => emp.employee_id !== id);
          setEmployees(updatedEmployees);
        } catch (err) {
          console.error('Error deleting employee:', err);
        }
      }
    };

    const filteredEmployees = employees.filter(emp =>
      [emp.full_name, emp.email, emp.department?.dept_name]
        .some(field => (field || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Employee Management</h1>

        <input
          type="text"
          placeholder="Search by name, email, or department..."
          className="w-full px-4 py-2 border rounded-lg shadow-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg shadow">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="border px-3 py-2 rounded"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="border px-3 py-2 rounded"
              required
            />
            <input
              type="text"
              name="role"
              placeholder="Role"
              value={formData.role}
              onChange={handleInputChange}
              className="border px-3 py-2 rounded"
              required
            />
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="border px-3 py-2 rounded"
              required
            >
              <option value="">Select Department</option>
              {departments.map(dep => (
                <option key={dep.dept_id} value={dep.dept_id}>
                  {dep.dept_name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {editingId ? 'Update' : 'Add'} Employee
          </button>
        </form>

        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin h-6 w-6 text-gray-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Risk Score</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map(emp => (
                    <tr key={emp.employee_id} className="border-t">
                      <td className="px-4 py-2">{emp.employee_id}</td>
                      <td className="px-4 py-2">{emp.full_name}</td>
                      <td className="px-4 py-2">{emp.email}</td>
                      <td className="px-4 py-2">{emp.department?.dept_name || 'N/A'}</td>
                      <td className="px-4 py-2">{emp.risk_score ?? 'N/A'}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button onClick={() => handleEdit(emp)} className="text-blue-600 hover:underline">
                          <Pencil size={16} />
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
  };

  export default Employee;
