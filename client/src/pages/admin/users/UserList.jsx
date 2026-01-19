import { useState, useEffect } from 'react';
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiUserCheck,
    FiUserX, FiFilter, FiDownload, FiRefreshCw
} from 'react-icons/fi';
import { usersAPI } from '../../../services/api';
import Sidebar from '../../../components/common/Sidebar';
import './Users.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        phone: '',
        status: 'active'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await usersAPI.getAll();
            setUsers(response.data.data.users || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            // Fallback mock data
            setUsers([
                { _id: '1', name: 'Admin User', email: 'admin@pharmacy.com', role: 'admin', status: 'active', phone: '+91 9876543210' },
                { _id: '2', name: 'Dr. Priya Sharma', email: 'pharmacist1@pharmacy.com', role: 'pharmacist', status: 'active', phone: '+91 9876543211' },
                { _id: '3', name: 'Rahul Kumar', email: 'pharmacist2@pharmacy.com', role: 'pharmacist', status: 'active', phone: '+91 9876543212' },
                { _id: '4', name: 'Amit Singh', email: 'user1@example.com', role: 'user', status: 'active', phone: '+91 9876543213' },
                { _id: '5', name: 'Sneha Patel', email: 'user2@example.com', role: 'user', status: 'active', phone: '+91 9876543214' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const handleStatusToggle = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        setUsers(users.map(user =>
            user._id === userId ? { ...user, status: newStatus } : user
        ));
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Handle create/update user
        console.log('Form data:', formData);
        setShowAddModal(false);
        setFormData({ name: '', email: '', password: '', role: 'user', phone: '', status: 'active' });
    };

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        pharmacists: users.filter(u => u.role === 'pharmacist').length,
        customers: users.filter(u => u.role === 'user').length,
        active: users.filter(u => u.status === 'active').length,
        suspended: users.filter(u => u.status === 'suspended').length
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <main className="dashboard-main">
                    <div className="loading-overlay">
                        <div className="spinner" />
                        <p>Loading users...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <div className="page-header">
                    <div className="header-content">
                        <h1>User Management</h1>
                        <p>Manage all platform users including admins, pharmacists, and customers</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-outline" onClick={fetchUsers}>
                            <FiRefreshCw /> Refresh
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                            <FiPlus /> Add User
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="user-stats">
                    <div className="stat-box total">
                        <span className="stat-number">{stats.total}</span>
                        <span className="stat-text">Total Users</span>
                    </div>
                    <div className="stat-box admin">
                        <span className="stat-number">{stats.admins}</span>
                        <span className="stat-text">Admins</span>
                    </div>
                    <div className="stat-box pharmacist">
                        <span className="stat-number">{stats.pharmacists}</span>
                        <span className="stat-text">Pharmacists</span>
                    </div>
                    <div className="stat-box customer">
                        <span className="stat-number">{stats.customers}</span>
                        <span className="stat-text">Customers</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="pharmacist">Pharmacist</option>
                            <option value="user">Customer</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="card">
                    <div className="table-container">
                        <table className="table users-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="user-name">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="email-cell">{user.email}</td>
                                        <td className="phone-cell">{user.phone || '-'}</td>
                                        <td>
                                            <span className={`role-badge ${user.role}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.status || 'active'}`}>
                                                {user.status || 'active'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="action-btn view" title="View Details">
                                                    <FiEye />
                                                </button>
                                                <button className="action-btn edit" title="Edit" onClick={() => {
                                                    setSelectedUser(user);
                                                    setFormData({
                                                        name: user.name,
                                                        email: user.email,
                                                        password: '',
                                                        role: user.role,
                                                        phone: user.phone || '',
                                                        status: user.status || 'active'
                                                    });
                                                    setShowAddModal(true);
                                                }}>
                                                    <FiEdit2 />
                                                </button>
                                                {user.status === 'active' || !user.status ? (
                                                    <button
                                                        className="action-btn suspend"
                                                        title="Suspend User"
                                                        onClick={() => handleStatusToggle(user._id, 'active')}
                                                    >
                                                        <FiUserX />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="action-btn activate"
                                                        title="Activate User"
                                                        onClick={() => handleStatusToggle(user._id, 'suspended')}
                                                    >
                                                        <FiUserCheck />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="empty-state">
                            <p>No users found matching your criteria</p>
                        </div>
                    )}
                </div>

                {/* Add/Edit User Modal */}
                {showAddModal && (
                    <div className="modal-overlay" onClick={() => { setShowAddModal(false); setSelectedUser(null); }}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{selectedUser ? 'Edit User' : 'Add New User'}</h2>
                                <button className="modal-close" onClick={() => { setShowAddModal(false); setSelectedUser(null); }}>×</button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Full Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleFormChange}
                                                placeholder="Enter full name"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleFormChange}
                                                placeholder="user@example.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>{selectedUser ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleFormChange}
                                                placeholder="••••••••"
                                                required={!selectedUser}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleFormChange}
                                                placeholder="+91 XXXXXXXXXX"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Role *</label>
                                            <select name="role" value={formData.role} onChange={handleFormChange}>
                                                <option value="user">Customer</option>
                                                <option value="pharmacist">Pharmacist</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Status</label>
                                            <select name="status" value={formData.status} onChange={handleFormChange}>
                                                <option value="active">Active</option>
                                                <option value="suspended">Suspended</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => { setShowAddModal(false); setSelectedUser(null); }}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {selectedUser ? 'Update User' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default UserList;
