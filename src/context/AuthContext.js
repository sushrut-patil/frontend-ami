import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BaseUrl } from './Context';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          // Set default Authorization header for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user profile
          const response = await axios.get(`${BaseUrl}/api/auth/profile/`);
          setUser(response.data);
        } catch (error) {
          // Token might be expired
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };
    
    checkLoggedIn();
  }, []);

  // Register a new user
  const register = async (username, email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/register/', {
        username,
        email,
        password
      });
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      setUser({ username, email });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  // Login user
  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/token/', {
        username,
        password
      });
      
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      // Fetch user profile
      const profileResponse = await axios.get('http://localhost:8000/api/auth/profile/');
      setUser(profileResponse.data);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Invalid credentials' 
      };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};