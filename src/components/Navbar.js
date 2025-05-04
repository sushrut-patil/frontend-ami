import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { logout } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();          // clear auth
    navigate('/login'); // redirect to login
  };

  return (
    <nav className="bg-blue-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">ThreatIQ</div>
        <ul className="flex space-x-6 items-center">
          <li>
            <NavLink to="/access-management" className="hover:text-green-400">
              Access Management
            </NavLink>
          </li>
          <li>
            <NavLink to="/logging" className="hover:text-green-400">
              Logging
            </NavLink>
          </li>
          <li>
            <NavLink to="/ThreatDetection" className="hover:text-green-400">
              Threat Detection
            </NavLink>
          </li>
          <li>
            <NavLink to="/ThreatPathAnalysis" className="hover:text-green-400">
              Threat Path Analysis
            </NavLink>
          </li>
          <li>
            <NavLink to="/compliance-chatbot" className="hover:text-green-400">
              Compliance & Chatbot
            </NavLink>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
