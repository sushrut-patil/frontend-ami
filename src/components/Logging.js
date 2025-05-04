import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import axios from 'axios';
const Logging = () => {
  const [activeTab, setActiveTab] = useState('access'); // default
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

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
    setExpandedRow(null); // Reset expanded row when changing tabs
  }, [activeTab]);

  const toggleRowExpansion = (index) => {
    if (expandedRow === index) {
      setExpandedRow(null);
    } else {
      setExpandedRow(index);
    }
  };

  const renderTableHeaders = () => {
    if (activeTab === 'access') return (
      <tr>
        <th className="px-4 py-2">User</th>
        <th className="px-4 py-2">IP</th>
        <th className="px-4 py-2">Timestamp</th>
        <th className="px-4 py-2">Details</th>
      </tr>
    );
    if (activeTab === 'activity') return (
      <tr>
        <th className="px-4 py-2">User</th>
        <th className="px-4 py-2">Action</th>
        <th className="px-4 py-2">Timestamp</th>
        <th className="px-4 py-2">Details</th>
      </tr>
    );
    if (activeTab === 'error') return (
      <tr>
        <th className="px-4 py-2">Message</th>
        <th className="px-4 py-2">Stack Trace</th>
        <th className="px-4 py-2">Timestamp</th>
        <th className="px-4 py-2">Details</th>
      </tr>
    );
  };

  const renderTableRows = () => {
    return logs.map((log, index) => {
      return (
        <React.Fragment key={index}>
          <tr className={expandedRow === index ? "bg-blue-50" : "hover:bg-gray-50"}>
            {activeTab === 'access' && (
              <>
                <td className="border px-4 py-2">{log.username}</td>
                <td className="border px-4 py-2">{log.ip_address}</td>
                <td className="border px-4 py-2">{log.timestamp}</td>
              </>
            )}
          
            {activeTab === 'activity' && (
              <>
                <td className="border px-4 py-2">{log.username}</td>
                <td className="border px-4 py-2">{log.action}</td>
                <td className="border px-4 py-2">{log.timestamp}</td>
              </>
            )}
    
            {activeTab === 'error' && (
              <>
                <td className="border px-4 py-2">{log.message}</td>
                <td className="border px-4 py-2">{log.stack_trace}</td>
                <td className="border px-4 py-2">{log.timestamp}</td>
              </>
            )}
            
            {/* Details button column */}
            <td className="border px-4 py-2">
              <button 
                className="flex items-center justify-center p-1 rounded bg-gray-100 hover:bg-gray-200"
                onClick={() => toggleRowExpansion(index)}
                aria-label={expandedRow === index ? "Hide details" : "Show details"}
              >
                {expandedRow === index ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </td>
          </tr>
          
          {/* Expanded row with all details */}
          {expandedRow === index && (
            <tr>
              <td colSpan="4" className="border bg-gray-50 p-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(log).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="font-medium text-gray-700">{key.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className="text-gray-600">{value || '-'}</span>
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          )}
        </React.Fragment>
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
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 border rounded bg-red-50 text-red-500">
          <div className="flex items-center gap-2">
            <Info size={20} />
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded shadow border">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">{renderTableHeaders()}</thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Logging;