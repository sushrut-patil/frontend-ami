import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ComplianceManager() {
    const [compliances, setCompliances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCompliance, setSelectedCompliance] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        category: 'GDPR',
        description: '',
        requirements: '',
        status: 'NEEDS_REVIEW',
        due_date: '',
        notes: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [chatQuery, setChatQuery] = useState('');
    const [chatResponse, setChatResponse] = useState('');
    const [complianceExplanation, setComplianceExplanation] = useState('');

    // Base API URL
    const API_BASE_URL = 'http://localhost:8000/api/security';

    // Categories and statuses from the model
    const categories = [
        { value: 'GDPR', label: 'General Data Protection Regulation' },
        { value: 'HIPAA', label: 'Health Insurance Portability and Accountability Act' },
        { value: 'PCI-DSS', label: 'Payment Card Industry Data Security Standard' },
        { value: 'SOX', label: 'Sarbanes-Oxley Act' },
        { value: 'ISO27001', label: 'ISO 27001' },
        { value: 'NIST', label: 'National Institute of Standards and Technology' },
        { value: 'CCPA', label: 'California Consumer Privacy Act' },
        { value: 'OTHER', label: 'Other' }
    ];

    const statuses = [
        { value: 'COMPLIANT', label: 'Compliant' },
        { value: 'NON_COMPLIANT', label: 'Non-Compliant' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'NOT_APPLICABLE', label: 'Not Applicable' },
        { value: 'NEEDS_REVIEW', label: 'Needs Review' }
    ];

    // Function to get the Auth token
    const getAuthToken = () => localStorage.getItem('access_token');

    // Create axios instance with default headers
    const axiosInstance = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });

    // Fetch compliances
    const fetchCompliances = async () => {
        setLoading(true);
        try {
            // Build query params for filtering
            const params = {};
            if (filterCategory) params.category = filterCategory;
            if (filterStatus) params.status = filterStatus;

            const response = await axiosInstance.get('/compliance/', { params });
            setCompliances(response.data.results || response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch compliances');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle compliance selection
    const handleSelectCompliance = (compliance) => {
        setSelectedCompliance(compliance);
        setFormData({ ...compliance });
        setIsEditing(false);
    };

    // Function to enable editing mode
    const handleEdit = () => {
        setIsEditing(true);
    };

    // Function to handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Function to create a new compliance
    const handleCreateCompliance = async () => {
        try {
            const response = await axiosInstance.post('/compliance/', formData);
            setCompliances([response.data, ...compliances]);
            setFormData({
                title: '',
                category: 'GDPR',
                description: '',
                requirements: '',
                status: 'NEEDS_REVIEW',
                due_date: '',
                notes: ''
            });
            setError(null);
            alert('Compliance record created successfully!');
        } catch (err) {
            setError('Failed to create compliance record');
            console.error(err);
        }
    };

    // Function to update an existing compliance
    const handleUpdateCompliance = async () => {
        try {
            const response = await axiosInstance.put(`/compliance/${selectedCompliance.id}/`, formData);
            setCompliances(compliances.map(item =>
                item.id === response.data.id ? response.data : item
            ));
            setSelectedCompliance(response.data);
            setIsEditing(false);
            setError(null);
            alert('Compliance record updated successfully!');
        } catch (err) {
            setError('Failed to update compliance record');
            console.error(err);
        }
    };

    // Function to delete a compliance
    const handleDeleteCompliance = async () => {
        if (!window.confirm('Are you sure you want to delete this compliance record?')) {
            return;
        }

        try {
            await axiosInstance.delete(`/compliance/${selectedCompliance.id}/`);
            setCompliances(compliances.filter(item => item.id !== selectedCompliance.id));
            setSelectedCompliance(null);
            setFormData({
                title: '',
                category: 'GDPR',
                description: '',
                requirements: '',
                status: 'NEEDS_REVIEW',
                due_date: '',
                notes: ''
            });
            setError(null);
            alert('Compliance record deleted successfully!');
        } catch (err) {
            setError('Failed to delete compliance record');
            console.error(err);
        }
    };

    // Function to change status
    const handleChangeStatus = async (newStatus) => {
        try {
            const response = await axiosInstance.post(
                `/compliance/${selectedCompliance.id}/change_status/`, 
                { status: newStatus }
            );
            
            setCompliances(compliances.map(item =>
                item.id === response.data.id ? response.data : item
            ));
            setSelectedCompliance(response.data);
            setFormData({
                ...formData,
                status: response.data.status
            });
            setError(null);
            alert(`Status changed to ${newStatus} successfully!`);
        } catch (err) {
            setError('Failed to change status');
            console.error(err);
        }
    };

    // Function to handle chatbot interactions
    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatQuery.trim()) return;

        try {
            const response = await axiosInstance.post('/chatbot/', { query: chatQuery });
            setChatResponse(response.data.response);
        } catch (err) {
            setError('Failed to get chatbot response');
            console.error(err);
        }
    };

    // Function to get compliance explanation
    const handleGetExplanation = async (category) => {
        try {
            const response = await axiosInstance.get(`/explain-compliance/`, {
                params: { category }
            });
            setComplianceExplanation(response.data.explanation);
        } catch (err) {
            setError('Failed to get compliance explanation');
            console.error(err);
        }
    };

    // Fetch compliances when filters change
    useEffect(() => {
        fetchCompliances();
    }, [filterCategory, filterStatus]);

    // Render the component
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Compliance Manager</h1>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left column - List of compliances */}
                <div className="md:col-span-1 bg-white p-4 rounded shadow">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-2">Filters</h2>
                        <div className="mb-2">
                            <label className="block text-gray-700 text-sm font-bold mb-1">Category</label>
                            <select
                                className="shadow border rounded w-full py-2 px-3 text-gray-700"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-2">
                            <label className="block text-gray-700 text-sm font-bold mb-1">Status</label>
                            <select
                                className="shadow border rounded w-full py-2 px-3 text-gray-700"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                {statuses.map(stat => (
                                    <option key={stat.value} value={stat.value}>{stat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <h2 className="text-lg font-semibold mb-2">Compliance Records</h2>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {compliances.length === 0 ? (
                                <p>No compliance records found.</p>
                            ) : (
                                compliances.map(compliance => (
                                    <li
                                        key={compliance.id}
                                        className={`py-2 px-1 cursor-pointer hover:bg-gray-100 ${selectedCompliance?.id === compliance.id ? 'bg-blue-100' : ''}`}
                                        onClick={() => handleSelectCompliance(compliance)}
                                    >
                                        <div className="font-medium">{compliance.title}</div>
                                        <div className="text-sm text-gray-500">
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full
                        ${compliance.status === 'COMPLIANT' ? 'bg-green-100 text-green-800' :
                                                    compliance.status === 'NON_COMPLIANT' ? 'bg-red-100 text-red-800' :
                                                        compliance.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                            compliance.status === 'NOT_APPLICABLE' ? 'bg-gray-100 text-gray-800' :
                                                                'bg-yellow-100 text-yellow-800'}`}>
                                                {statuses.find(s => s.value === compliance.status)?.label || compliance.status}
                                            </span>
                                            <span className="ml-2 inline-block px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                                {categories.find(c => c.value === compliance.category)?.label || compliance.category}
                                            </span>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    )}

                    <button
                        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => {
                            setSelectedCompliance(null);
                            setFormData({
                                title: '',
                                category: 'GDPR',
                                description: '',
                                requirements: '',
                                status: 'NEEDS_REVIEW',
                                due_date: '',
                                notes: ''
                            });
                            setIsEditing(true);
                        }}
                    >
                        + New Compliance
                    </button>
                </div>

                {/* Middle column - Detail view / Form */}
                <div className="md:col-span-1 bg-white p-4 rounded shadow">
                    {selectedCompliance && !isEditing ? (
                        <div>
                            <h2 className="text-xl font-semibold mb-2">{selectedCompliance.title}</h2>
                            <div className="mb-2">
                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full
                  ${selectedCompliance.status === 'COMPLIANT' ? 'bg-green-100 text-green-800' :
                                        selectedCompliance.status === 'NON_COMPLIANT' ? 'bg-red-100 text-red-800' :
                                            selectedCompliance.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                selectedCompliance.status === 'NOT_APPLICABLE' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                    {statuses.find(s => s.value === selectedCompliance.status)?.label || selectedCompliance.status}
                                </span>
                                <span className="ml-2 inline-block px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                    {categories.find(c => c.value === selectedCompliance.category)?.label || selectedCompliance.category}
                                </span>
                                <button
                                    className="ml-2 text-blue-500 hover:text-blue-700"
                                    onClick={() => handleGetExplanation(selectedCompliance.category)}
                                >
                                    Learn more
                                </button>
                            </div>

                            <h3 className="font-semibold mt-3">Description</h3>
                            <p className="mb-2">{selectedCompliance.description}</p>

                            <h3 className="font-semibold mt-3">Requirements</h3>
                            <p className="mb-2">{selectedCompliance.requirements}</p>

                            <h3 className="font-semibold mt-3">Due Date</h3>
                            <p className="mb-2">{selectedCompliance.due_date || 'Not specified'}</p>

                            <h3 className="font-semibold mt-3">Notes</h3>
                            <p className="mb-4">{selectedCompliance.notes || 'No notes available'}</p>

                            <div className="mt-4 flex space-x-2">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={handleEdit}
                                >
                                    Edit
                                </button>
                                <button
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={handleDeleteCompliance}
                                >
                                    Delete
                                </button>
                            </div>

                            <div className="mt-4">
                                <h3 className="font-semibold mb-2">Change Status</h3>
                                <div className="flex flex-wrap gap-2">
                                    {statuses.map(stat => (
                                        <button
                                            key={stat.value}
                                            className={`px-3 py-1 text-sm rounded
                        ${selectedCompliance.status === stat.value ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                            onClick={() => handleChangeStatus(stat.value)}
                                            disabled={selectedCompliance.status === stat.value}
                                        >
                                            {stat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : isEditing ? (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">
                                {selectedCompliance ? 'Edit Compliance' : 'New Compliance'}
                            </h2>

                            <form>
                                <div className="mb-3">
                                    <label className="block text-gray-700 text-sm font-bold mb-1">Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="block text-gray-700 text-sm font-bold mb-1">Category *</label>
                                    <select
                                        name="category"
                                        className="shadow border rounded w-full py-2 px-3 text-gray-700"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="block text-gray-700 text-sm font-bold mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                        rows="3"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <label className="block text-gray-700 text-sm font-bold mb-1">Requirements</label>
                                    <textarea
                                        name="requirements"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                        rows="3"
                                        value={formData.requirements}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <label className="block text-gray-700 text-sm font-bold mb-1">Status *</label>
                                    <select
                                        name="status"
                                        className="shadow border rounded w-full py-2 px-3 text-gray-700"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {statuses.map(stat => (
                                            <option key={stat.value} value={stat.value}>{stat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="block text-gray-700 text-sm font-bold mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        name="due_date"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                        value={formData.due_date || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="block text-gray-700 text-sm font-bold mb-1">Notes</label>
                                    <textarea
                                        name="notes"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                        rows="3"
                                        value={formData.notes || ''}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={selectedCompliance ? handleUpdateCompliance : handleCreateCompliance}
                                    >
                                        {selectedCompliance ? 'Update' : 'Create'}
                                    </button>
                                    <button
                                        type="button"
                                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                        onClick={() => {
                                            if (selectedCompliance) {
                                                setIsEditing(false);
                                                setFormData({ ...selectedCompliance });
                                            } else {
                                                setIsEditing(false);
                                            }
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <p className="text-gray-500">Select a compliance record or create a new one.</p>
                    )}
                </div>

                {/* Right column - Chatbot and explanations */}
                <div className="md:col-span-1 bg-white p-4 rounded shadow">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-2">Security Chatbot</h2>
                        <form onSubmit={handleChatSubmit} className="mb-2">
                            <div className="flex">
                                <input
                                    type="text"
                                    className="flex-grow shadow appearance-none border rounded-l py-2 px-3 text-gray-700"
                                    placeholder="Ask a security question..."
                                    value={chatQuery}
                                    onChange={(e) => setChatQuery(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                        {chatResponse && (
                            <div className="bg-gray-100 p-3 rounded-lg">
                                <p className="text-sm">{chatResponse}</p>
                            </div>
                        )}
                    </div>

                    {complianceExplanation && (
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Compliance Explanation</h2>
                            <div className="bg-gray-100 p-3 rounded-lg max-h-96 overflow-y-auto">
                                <p className="text-sm whitespace-pre-line">{complianceExplanation}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}