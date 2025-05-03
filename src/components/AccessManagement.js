import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccessManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 text-white min-h-screen bg-gray-800">
      <h1 className="text-3xl font-semibold mb-6">Access Management</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <button
          onClick={() => navigate('/access-management/department')}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow"
        >
          Department
        </button>
        <button
          onClick={() => navigate('/access-management/access-level')}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow"
        >
          Access Level
        </button>
        <button
          onClick={() => navigate('/access-management/employee-access')}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow"
        >
          Employee Access
        </button>
      </div>
    </div>
  );
};

export default AccessManagement;
