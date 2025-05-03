import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
          
          <div className="mt-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-lg mb-2">
                <span className="font-semibold">Username:</span> {user?.username}
              </p>
              <p className="text-lg">
                <span className="font-semibold">Email:</span> {user?.email}
              </p>
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Welcome to your dashboard!</h3>
              <p className="text-gray-600">
                This is a protected route that only authenticated users can access. 
                You've successfully logged in with JWT authentication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;