import { useState, useEffect } from 'react';
import { AlertCircle, Shield, Plus, Trash2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import ThreatCard from './ThreatCard'
// API endpoint for threats
const API_URL = 'http://localhost:8000/api/logs/threat/';

const ThreatDetection = () => {
  const [threats, setThreats] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newThreat, setNewThreat] = useState({
    title: '',
    description: '',
    severity: 'medium',
    status: 'active'
  });
  const [filter, setFilter] = useState('all');
  
  // Fetch threats from API
  const fetchThreats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      console.log(response.data.results);
      
      setThreats(response.data.results);
      setError(null);
    } catch (err) {
      console.error('Error fetching threats:', err);
      setError('Failed to load threats. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch threats on component mount
  useEffect(() => {
    fetchThreats();
  }, []);

  // Handle input changes for the new threat form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewThreat(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create a new threat
  const handleCreateThreat = async () => {
    try {
      setLoading(true);
      // Add timestamp if your API doesn't automatically add it
      const threatToAdd = {
        ...newThreat,
        timestamp: new Date().toISOString()
      };
      
      const response = await axios.post(API_URL, threatToAdd);
      
      // Refresh the threats list to include the new threat
      fetchThreats();
      
      // Reset form
      setNewThreat({
        title: '',
        description: '',
        severity: 'medium',
        status: 'active'
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating threat:', err);
      setError('Failed to create threat. Please try again.');
      setLoading(false);
    }
  };

  // Delete a threat
  const handleDeleteThreat = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}${id}/`);
      // Refresh the threats list after deletion
      fetchThreats();
    } catch (err) {
      console.error('Error deleting threat:', err);
      setError('Failed to delete threat. Please try again.');
      setLoading(false);
    }
  };
  
  // Update threat status (additional functionality)
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setLoading(true);
      const threatToUpdate = threats.find(threat => threat.id === id);
      if (!threatToUpdate) return;
      
      const updatedThreat = {
        ...threatToUpdate,
        status: newStatus
      };
      
      await axios.put(`${API_URL}${id}/`, updatedThreat);
      // Refresh the threats list after update
      fetchThreats();
    } catch (err) {
      console.error('Error updating threat:', err);
      setError('Failed to update threat status. Please try again.');
      setLoading(false);
    }
  };

  // Get severity style based on threat level
  const getSeverityStyle = (severity) => {
    switch(severity) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Filter threats
  const filteredThreats = filter === 'all' 
    ? threats 
    : threats.filter(threat => threat.status === filter);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Threat Detection</h1>
            <p className="text-gray-400">Monitor and manage security threats in real-time</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchThreats}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
              title="Refresh threats"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors disabled:bg-blue-800 disabled:opacity-50"
            >
              {showCreateForm ? 'Cancel' : <><Plus size={18} /> Create Threat</>}
            </button>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-900 text-red-100 p-4 rounded-md mb-6 flex justify-between items-center">
            <div className="flex items-center">
              <AlertCircle size={20} className="mr-2" />
              <span>{error}</span>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="text-red-300 hover:text-white"
            >
              &times;
            </button>
          </div>
        )}

        {/* Create Threat Form */}
        {showCreateForm && (
          <div className="bg-gray-800 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Threat</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newThreat.title}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Threat title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Severity</label>
                <select
                  name="severity"
                  value={newThreat.severity}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={newThreat.description}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  placeholder="Detailed threat description"
                ></textarea>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleCreateThreat}
                disabled={!newThreat.title || !newThreat.description}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors disabled:bg-green-800 disabled:opacity-50"
              >
                Create Threat
              </button>
            </div>
          </div>
        )}

        {/* Threats Filter */}
        <div className="flex mb-6 bg-gray-800 p-2 rounded-lg">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md transition-colors ${filter === 'all' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
          >
            All Threats
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-md transition-colors ${filter === 'active' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-md transition-colors ${filter === 'resolved' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
          >
            Resolved
          </button>
        </div>

        {/* Threats List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-medium">Loading threats...</h3>
            </div>
          ) : filteredThreats.length === 0 ? (
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-medium">No threats found</h3>
              <p className="text-gray-400 mt-2">There are no {filter !== 'all' ? filter : ''} threats to display</p>
            </div>
          ) : (
            filteredThreats.map(threat => (
              <ThreatCard
                key={threat.id}
                threat={threat}
                handleUpdateStatus={handleUpdateStatus}
                loading={loading}
              />
            ))
          )}
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg flex items-center">
            <div className="bg-blue-900 p-3 rounded-lg mr-4">
              <Shield size={24} className="text-blue-300" />
            </div>
            <div>
              <div className="text-2xl font-bold">{threats.length}</div>
              <div className="text-gray-400 text-sm">Total Threats</div>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg flex items-center">
            <div className="bg-red-900 p-3 rounded-lg mr-4">
              <AlertCircle size={24} className="text-red-300" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {threats.filter(t => t.status === 'active').length}
              </div>
              <div className="text-gray-400 text-sm">Active Threats</div>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg flex items-center">
            <div className="bg-yellow-900 p-3 rounded-lg mr-4">
              <AlertTriangle size={24} className="text-yellow-300" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {threats.filter(t => t.severity === 'high').length}
              </div>
              <div className="text-gray-400 text-sm">High Severity</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatDetection;