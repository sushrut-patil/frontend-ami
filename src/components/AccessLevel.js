import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Pencil, Trash2 } from 'lucide-react';

const AccessLevel = () => {
  const [accessLevels, setAccessLevels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    access_name: '',
    description: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = 'http://localhost:8000/api/access/access-levels/';

  const fetchAccessLevels = async () => {
    try {
      setIsLoading(true);
      setError('');
      console.log("Fetching access levels from:", API_URL);
      
      const response = await axios.get(API_URL, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log("API Response:", response);
      
      // Handle different response formats
      let levels = [];
      if (Array.isArray(response.data)) {
        // Direct array response
        levels = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        // Paginated response
        levels = response.data.results;
      } else if (response.data && typeof response.data === 'object') {
        // Single object or custom format
        if (Object.keys(response.data).length > 0) {
          // If it's an object with values, convert to array
          if (Array.isArray(Object.values(response.data)[0])) {
            levels = Object.values(response.data)[0];
          } else {
            levels = Object.values(response.data);
          }
        }
      }
      
      console.log("Processed levels:", levels);
      setAccessLevels(levels);
    } catch (err) {
      console.error('Failed to fetch access levels:', err);
      
      // Log detailed error information
      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Headers:", err.response.headers);
        console.log("Data:", err.response.data);
      }
      
      let errorMessage = 'Unable to load access level data. ';
      if (err.response?.data?.detail) {
        errorMessage += err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Unknown error';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessLevels();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ access_name: '', description: '' });
    setEditingId(null);
  };

  const showNotification = (message, type) => {
    // You can implement a proper notification system here
    // For now, we'll use alert for simplicity
    if (type === 'error') {
      alert(`Error: ${message}`);
    } else {
      alert(message);
    }
  };

  const createAccessLevel = async (accessData) => {
    try {
      // Ensure access_id is included in creation as required by the backend
      // Find max dept_id in the current departments list
      const maxId = accessLevels.reduce((max, access) => Math.max(max, access.access_id || 0), 0);
      const newAccesstWithId = { ...accessData, access_id: maxId + 1 };
      console.log("Creating access level with data:", maxId);
      const response = await axios.post(API_URL, newAccesstWithId, {
        withCredentials: true,
      });
      
      console.log("Create response:", response);
      showNotification('Access level added successfully!', 'success');
      return response.data;
    } catch (err) {
      console.error('Error creating access level:', err);
      console.log("Error details:", err.response?.data);
      
      // More detailed error information for debugging
      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Headers:", err.response.headers);
        console.log("Data:", err.response.data);
      }
      
      showNotification(`Failed to create access level: ${err.response?.data?.detail || err.response?.data?.message || err.message}`, 'error');
      throw err;
    }
  };

  const updateAccessLevel = async (access_id, accessData) => {
    try {
      // Make sure we're sending the expected format to the API
      const dataToSend = {
        ...accessData,
        // Include the access_id in the request body as required by the backend
        access_id: access_id
      };
      
      console.log(`Updating access level ${access_id} with data:`, dataToSend);
      
      // Two common API endpoint formats - try the first, then the second if needed
      let response;
      try {
        response = await axios.put(`${API_URL}${access_id}/`, dataToSend, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
      } catch (initialErr) {
        // If the first endpoint format fails, try without trailing slash
        if (initialErr.response && initialErr.response.status === 404) {
          response = await axios.put(`${API_URL}${access_id}`, dataToSend, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });
        } else {
          throw initialErr;
        }
      }
      
      console.log("Update response:", response);
      showNotification('Access level updated successfully!', 'success');
      return response.data;
    } catch (err) {
      console.error('Error updating access level:', err);
      console.log("Error details:", err.response?.data);
      
      // More detailed error information for debugging
      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Headers:", err.response.headers);
        console.log("Data:", err.response.data);
      }
      
      showNotification(`Failed to update access level: ${err.response?.data?.detail || err.response?.data?.message || err.message}`, 'error');
      throw err;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.access_name || !formData.description) {
      setError('Access name and description are required.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Check if your API expects any additional fields
      const submissionData = {
        ...formData,
        // If the backend expects specific fields that aren't in your form,
        // add them here. For example, if it expects 'is_active':
        // is_active: true,
      };
      
      console.log("Submission data:", submissionData);
      console.log("Editing ID:", editingId);
      
      if (editingId) {
        await updateAccessLevel(editingId, submissionData);
      } else {
        // For creation, if your API expects an ID to be set by the client:
        // If you remove this, make sure your backend generates IDs
        if (accessLevels.length > 0) {
          const lastId = Math.max(...accessLevels.map(l => l.access_id || 0));
          submissionData.access_id = lastId + 1;
        } else {
          submissionData.access_id = 1;
        }
        
        await createAccessLevel(submissionData);
      }
      
      await fetchAccessLevels();
      resetForm();
    } catch (err) {
      console.error('Error in form submission:', err);
      
      // Provide more detailed error information
      let errorMessage = `Failed to ${editingId ? 'update' : 'create'} access level. `;
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += `Server responded with status ${err.response.status}. `;
        
        if (err.response.data) {
          if (typeof err.response.data === 'string') {
            errorMessage += err.response.data;
          } else if (err.response.data.detail) {
            errorMessage += err.response.data.detail;
          } else if (err.response.data.message) {
            errorMessage += err.response.data.message;
          } else {
            // Try to format the error data object into a readable string
            try {
              errorMessage += JSON.stringify(err.response.data);
            } catch (e) {
              errorMessage += "See console for details.";
            }
          }
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage += "No response received from server. Check your network connection or server status.";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = (level) => {
    setFormData({
      access_name: level.access_name || '',
      description: level.description || '',
    });
    setEditingId(level.access_id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this access level?')) {
      try {
        setIsLoading(true);
        console.log(`Deleting access level with ID: ${id}`);
        
        // Try with trailing slash first
        try {
          await axios.delete(`${API_URL}${id}/`, {
            withCredentials: true,
            headers: {
              'Accept': 'application/json',
            },
          });
        } catch (initialErr) {
          // If 404, try without trailing slash
          if (initialErr.response && initialErr.response.status === 404) {
            await axios.delete(`${API_URL}${id}`, {
              withCredentials: true,
              headers: {
                'Accept': 'application/json',
              },
            });
          } else {
            throw initialErr;
          }
        }
        
        showNotification('Access level deleted successfully!', 'success');
        
        // If we're editing the item that was just deleted, reset the form
        if (editingId === id) {
          resetForm();
        }
        
        // Refresh the list
        await fetchAccessLevels();
      } catch (err) {
        console.error('Error deleting access level:', err);
        
        // Log detailed error information
        if (err.response) {
          console.log("Status:", err.response.status);
          console.log("Headers:", err.response.headers);
          console.log("Data:", err.response.data);
        }
        
        let errorMessage = 'Failed to delete access level: ';
        if (err.response?.data?.detail) {
          errorMessage += err.response.data.detail;
        } else if (err.response?.data?.message) {
          errorMessage += err.response.data.message;
        } else if (err.message) {
          errorMessage += err.message;
        } else {
          errorMessage += 'Unknown error';
        }
        
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const filteredAccessLevels = accessLevels.filter(level =>
    (level?.access_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (level?.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Access Levels</h1>

      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">{error}</div>}

      <input
        type="text"
        placeholder="Search by name or description..."
        className="w-full px-4 py-2 border rounded shadow-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded shadow space-y-4">
        <h2 className="text-lg font-medium">{editingId ? 'Edit Access Level' : 'Add New Access Level'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="access_name" className="block text-sm font-medium text-gray-700 mb-1">
              Access Level Name
            </label>
            <input
              type="text"
              id="access_name"
              name="access_name"
              placeholder="Access Level Name"
              value={formData.access_name}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                {editingId ? 'Updating...' : 'Adding...'}
              </span>
            ) : (
              editingId ? 'Update Access Level' : 'Add Access Level'
            )}
          </button>
          {editingId && (
            <button 
              type="button" 
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      {isLoading && !filteredAccessLevels.length ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      ) : (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccessLevels.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    No access levels found.
                  </td>
                </tr>
              ) : (
                filteredAccessLevels.map((level) => (
                  <tr key={level.access_id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{level.access_id}</td>
                    <td className="px-4 py-3">{level.access_name}</td>
                    <td className="px-4 py-3">{level.description}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleEdit(level)} 
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(level.access_id)} 
                          className="text-red-600 hover:text-red-800 flex items-center"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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

export default AccessLevel;