import axios from 'axios';

// Base API URL
const API_BASE_URL = 'http://localhost:8000/api/security/';

// Get auth token from localStorage
const token = localStorage.getItem('access_token');

// Axios instance with token
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Helper to handle errors
const handleError = (error) => {
    if (error.response) {
        console.error("Response error:", error.response.data);
        throw new Error(error.response.data.message || `Error: ${error.response.status}`);
    } else if (error.request) {
        console.error("Request error:", error.request);
        throw new Error('No response received from server');
    } else {
        console.error("Error:", error.message);
        throw error;
    }
};

// GET all compliance records
export const getAllCompliances = async (filters = {}) => {
    const token = localStorage.getItem('access_token');
    console.log(token);
        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('http://localhost:8000/api/security/compliance/', {
            withCredentials: true, // Ensure credentials are sent
          });
          setDepartments(response.data.results)
          console.log(response.data.results);
        } catch (error) {
          console.error('Failed to fetch departments:', error);
        }
};

// GET compliance by ID
export const getComplianceById = async (id) => {
    try {
        const res = await axiosInstance.get(`/compliance/${id}/`);
        return res.data;
    } catch (error) {
        handleError(error);
    }
};

// POST create new compliance
export const createCompliance = async (data) => {
    try {
        const res = await axiosInstance.post('/compliance/', data);
        return res.data;
    } catch (error) {
        handleError(error);
    }
};

// PUT update compliance
export const updateCompliance = async (id, data) => {
    try {
        const res = await axiosInstance.put(`/compliance/${id}/`, data);
        return res.data;
    } catch (error) {
        handleError(error);
    }
};

// PATCH partial update compliance
export const partialUpdateCompliance = async (id, data) => {
    try {
        const res = await axiosInstance.patch(`/compliance/${id}/`, data);
        return res.data;
    } catch (error) {
        handleError(error);
    }
};

// DELETE compliance
export const deleteCompliance = async (id) => {
    try {
        await axiosInstance.delete(`/compliance/${id}/`);
        return true;
    } catch (error) {
        handleError(error);
    }
};

// POST change status
export const changeComplianceStatus = async (id, newStatus) => {
    try {
        const res = await axiosInstance.post(`/compliance/${id}/change_status/`, { status: newStatus });
        return res.data;
    } catch (error) {
        handleError(error);
    }
};

// GET by category
export const getCompliancesByCategory = async (category) => {
    try {
        const res = await axiosInstance.get('/compliance/by_category/', { params: { category } });
        return res.data;
    } catch (error) {
        handleError(error);
    }
};

// GET by status
export const getCompliancesByStatus = async (status) => {
    try {
        const res = await axiosInstance.get('/compliance/by_status/', { params: { status } });
        return res.data;
    } catch (error) {
        handleError(error);
    }
};

// POST chatbot query
export const chatWithComplianceBot = async (query) => {
    try {
        const res = await axiosInstance.post('chatbot/', { query });
        return res.data;
    } catch (error) {
        handleError(error);
    }
};

// GET explanation
export const getComplianceExplanation = async (category) => {
    try {
        const res = await axiosInstance.get('/explain-compliance/', { params: { category } });
        return res.data;
    } catch (error) {
        handleError(error);
    }
};
