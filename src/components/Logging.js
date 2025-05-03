import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Logging = () => {
  const [activeTab, setActiveTab] = useState('access'); // default
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLogs = async (type) => {
    setIsLoading(true);
    setError('');
    try {
      let url = '';
      if (type === 'access') url = 'http://localhost:8000/api/logs/access/';
      if (type === 'activity') url = 'http://localhost:8000/api/logs/activity/';
      if (type === 'error') url = 'http://localhost:8000/api/logs/error/';

      const res = await axios.get(url, { withCredentials: true });
    console.log(res.data.results);
    
      setLogs(res.data.results || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(activeTab);
  }, [activeTab]);

  const renderTableHeaders = () => {
    if (activeTab === 'access') return <tr><th>User</th><th>IP</th><th>Timestamp</th></tr>;
    if (activeTab === 'activity') return <tr><th>User</th><th>Action</th><th>Timestamp</th></tr>;
    if (activeTab === 'error') return <tr><th>Message</th><th>Stack Trace</th><th>Timestamp</th></tr>;
  };

  const renderTableRows = () => {
    return logs.map((log, index) => {
      return (
        <tr key={index}>
          {activeTab === 'access' && (
            <>
              <td>{log.username}</td>
              <td>{log.ip_address}</td>
              <td>{log.timestamp}</td>
            </>
          )}
        
          {activeTab === 'activity' && (
            <>
              <td>{log.username}</td>
              <td>{log.action}</td>
              <td>{log.timestamp}</td>
            </>
          )}
  
          {activeTab === 'error' && (
            <>
              <td>{log.message}</td>
              <td>{log.stack_trace}</td>
              <td>{log.timestamp}</td>
            </>
          )}
        </tr>
      );
    });
  };
  

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Logging</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
  {['access', 'activity', 'error'].map(type => (
    <button
      key={type}
      onClick={() => setActiveTab(type)}
      className={`px-4 py-2 rounded ${
        activeTab === type ? 'bg-blue-600 text-white' : 'bg-gray-200'
      }`}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)} Log
    </button>
  ))}
</div>


      {/* Table */}
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead className="bg-gray-100">{renderTableHeaders()}</thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Logging;
