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

  const API_URL = 'http://localhost:8000/api/access/access-levels/';

  const fetchAccessLevels = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL, {
        withCredentials: true,
      });
      setAccessLevels(response.data.results || []);
    } catch (err) {
      console.error('Failed to fetch access levels:', err);
      setError('Unable to load access level data.');
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
  const updateAccessLevel = async (access_id, accessData) => {
    try {
      const response = await axios.put(`http://localhost:8000/api/access/access-levels/${access_id}/`, accessData, {
        withCredentials: true,
      });
      console.log(response.data);
      
      const updatedAccess = response.data;
      const updatedList = accessLevels.map(level =>
        level.access_id === access_id ? updatedAccess : level
      );
  
      setAccessLevels(updatedList);
      return true;
    } catch (err) {
      console.log('Error updating access level:', err);
      // showNotification(`Failed to update access level: ${err.response?.data?.error || 'Unknown error'}`, 'error');
      return false;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        console.log(editingId);
        
        await updateAccessLevel(editingId, formData);
      } else {
        const lastId = accessLevels.length > 0 ? Math.max(...accessLevels.map(l => l.access_id)) : 0;
        const newAccessLevel = {
          access_id: lastId + 1,
          ...formData,
        };
        await axios.post('http://localhost:8000/api/access/access-levels/', newAccessLevel, {
          withCredentials: true,
        });
        // showNotification('Access level added successfully!', 'success');
      }
  
      await fetchAccessLevels();
      setFormData({ access_name: '', description: '' });
      setEditingId(null);
      setError('');
    } catch (err) {
      console.error('Error saving access level:', err);
      // showNotification('Failed to save access level.', 'error');
    }
  };
  

  const handleEdit = (level) => {
    setFormData({ access_name: level.access_name, description: level.description });
    setEditingId(level.access_id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this access level?')) {
      try {
        await axios.delete(`${API_URL}${id}/`, {
          withCredentials: true,
        });
        fetchAccessLevels();
      } catch (err) {
        console.error('Error deleting access level:', err);
        setError('Failed to delete access level.');
      }
    }
  };

  const filteredAccessLevels = accessLevels.filter(level =>
    (level?.access_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (level?.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Access Levels</h1>

      {error && <div className="text-red-500">{error}</div>}

      <input
        type="text"
        placeholder="Search by name or description..."
        className="w-full px-4 py-2 border rounded shadow-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded shadow space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="access_name"
            placeholder="Access Level Name"
            value={formData.access_name}
            onChange={handleInputChange}
            className="border px-3 py-2 rounded"
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            className="border px-3 py-2 rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingId ? 'Update' : 'Add'} Access Level
        </button>
      </form>

      {/* Table */}
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
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccessLevels.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No access levels found.
                  </td>
                </tr>
              ) : (
                filteredAccessLevels.map((level) => (
                  <tr key={level.access_id} className="border-t">
                    <td className="px-4 py-2">{level.access_id}</td>
                    <td className="px-4 py-2">{level.access_name}</td>
                    <td className="px-4 py-2">{level.description}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button onClick={() => handleEdit(level)} className="text-blue-600 hover:underline">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(level.access_id)} className="text-red-600 hover:underline">
                        <Trash2 size={16} />
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

export default AccessLevel;
