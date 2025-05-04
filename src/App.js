import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Department from './components/Department';
import EmployeeAccess from './components/Employee';
import AccessLevel from './components/AccessLevel';
import Logging from './components/Logging';
import ThreatDetection from './components/ThreatDetection';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import AccessManagement from './components/AccessManagement';
import ThreatPathAnalysis from './components/ThreatPathAnalysis';


// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
  path="/access-management"
  element={
    <ProtectedRoute>
      <AccessManagement />
    </ProtectedRoute>
  }
/>

          <Route
            path="/access-management/department"
            element={
              <ProtectedRoute>
                <Department />
              </ProtectedRoute>
            }
          />
          <Route
            path="/access-management/employee-access"
            element={
              <ProtectedRoute>
                <EmployeeAccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/access-management/access-level"
            element={
              <ProtectedRoute>
                <AccessLevel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logging"
            element={
              <ProtectedRoute>
                <Logging />
              </ProtectedRoute>
            }
          />
          <Route path="/access-management" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          <Route
            path="/ThreatDetection"
            element={
              <ProtectedRoute>
                <ThreatDetection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ThreatPathAnalysis"
            element={
              <ProtectedRoute>
                <ThreatPathAnalysis/>
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
