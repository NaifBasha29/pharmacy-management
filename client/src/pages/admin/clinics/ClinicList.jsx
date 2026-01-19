import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiMapPin,
    FiPhone, FiMail, FiCheck, FiX, FiMoreVertical
} from 'react-icons/fi';
import Sidebar from '../../../components/common/Sidebar';
import './Clinics.css';

// Mock data for clinics (replace with API calls later)
const mockClinics = [
    {
        _id: '1',
        name: 'PharmaCare Plus - Main Branch',
        code: 'PCP-001',
        address: '100 Health Plaza, Sector 5, Mumbai',
        phone: '+91 22 12345678',
        email: 'main@pharmacareplus.com',
        status: 'active',
        licenseNumber: 'MH-PH-2024-001',
        adminName: 'Admin User',
        totalStaff: 5,
        createdAt: '2024-01-15'
    },
    {
        _id: '2',
        name: 'PharmaCare Plus - Delhi',
        code: 'PCP-002',
        address: '45 Medical Center, Connaught Place, Delhi',
        phone: '+91 11 87654321',
        email: 'delhi@pharmacareplus.com',
        status: 'active',
        licenseNumber: 'DL-PH-2024-002',
        adminName: 'Delhi Admin',
        totalStaff: 3,
        createdAt: '2024-03-20'
    },
    {
        _id: '3',
        name: 'PharmaCare Plus - Bangalore',
        code: 'PCP-003',
        address: '78 Tech Park, Whitefield, Bangalore',
        phone: '+91 80 11223344',
        email: 'bangalore@pharmacareplus.com',
        status: 'pending',
        licenseNumber: 'KA-PH-2024-003',
        adminName: 'Pending',
        totalStaff: 0,
        createdAt: '2024-06-10'
    }
];

const ClinicList = () => {
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setClinics(mockClinics);
            setLoading(false);
        }, 500);
    }, []);

    const filteredClinics = clinics.filter(clinic => {
        const matchesSearch = clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clinic.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || clinic.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleStatusChange = (clinicId, newStatus) => {
        setClinics(clinics.map(clinic =>
            clinic._id === clinicId ? { ...clinic, status: newStatus } : clinic
        ));
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <main className="dashboard-main">
                    <div className="loading-overlay">
                        <div className="spinner" />
                        <p>Loading clinics...</p>
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
                        <h1>Clinic Management</h1>
                        <p>Manage all registered clinics on the platform</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <FiPlus /> Add Clinic
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="clinic-stats">
                    <div className="stat-box">
                        <span className="stat-number">{clinics.length}</span>
                        <span className="stat-text">Total Clinics</span>
                    </div>
                    <div className="stat-box active">
                        <span className="stat-number">{clinics.filter(c => c.status === 'active').length}</span>
                        <span className="stat-text">Active</span>
                    </div>
                    <div className="stat-box pending">
                        <span className="stat-number">{clinics.filter(c => c.status === 'pending').length}</span>
                        <span className="stat-text">Pending</span>
                    </div>
                    <div className="stat-box suspended">
                        <span className="stat-number">{clinics.filter(c => c.status === 'suspended').length}</span>
                        <span className="stat-text">Suspended</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search clinics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>

                {/* Clinics Table */}
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Clinic</th>
                                    <th>Contact</th>
                                    <th>License</th>
                                    <th>Admin</th>
                                    <th>Staff</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClinics.map((clinic) => (
                                    <tr key={clinic._id}>
                                        <td>
                                            <div className="clinic-info">
                                                <span className="clinic-name">{clinic.name}</span>
                                                <span className="clinic-code">{clinic.code}</span>
                                                <span className="clinic-address">
                                                    <FiMapPin size={12} /> {clinic.address}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="contact-info">
                                                <span><FiPhone size={12} /> {clinic.phone}</span>
                                                <span><FiMail size={12} /> {clinic.email}</span>
                                            </div>
                                        </td>
                                        <td className="license-cell">{clinic.licenseNumber}</td>
                                        <td>{clinic.adminName}</td>
                                        <td className="staff-count">{clinic.totalStaff}</td>
                                        <td>
                                            <span className={`status-badge ${clinic.status}`}>
                                                {clinic.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="action-btn view" title="View Details">
                                                    <FiEye />
                                                </button>
                                                <button className="action-btn edit" title="Edit">
                                                    <FiEdit2 />
                                                </button>
                                                {clinic.status === 'active' ? (
                                                    <button
                                                        className="action-btn suspend"
                                                        title="Suspend"
                                                        onClick={() => handleStatusChange(clinic._id, 'suspended')}
                                                    >
                                                        <FiX />
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="action-btn activate"
                                                        title="Activate"
                                                        onClick={() => handleStatusChange(clinic._id, 'active')}
                                                    >
                                                        <FiCheck />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredClinics.length === 0 && (
                        <div className="empty-state">
                            <p>No clinics found matching your criteria</p>
                        </div>
                    )}
                </div>

                {/* Add Clinic Modal */}
                {showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Add New Clinic</h2>
                                <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                    <FiX />
                                </button>
                            </div>
                            <div className="modal-body">
                                <form className="clinic-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Clinic Name *</label>
                                            <input type="text" placeholder="Enter clinic name" required />
                                        </div>
                                        <div className="form-group">
                                            <label>Clinic Code *</label>
                                            <input type="text" placeholder="e.g., PCP-004" required />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Address *</label>
                                        <textarea placeholder="Full address" rows={2} required></textarea>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Phone *</label>
                                            <input type="tel" placeholder="+91 XX XXXXXXXX" required />
                                        </div>
                                        <div className="form-group">
                                            <label>Email *</label>
                                            <input type="email" placeholder="clinic@example.com" required />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>License Number *</label>
                                            <input type="text" placeholder="License number" required />
                                        </div>
                                        <div className="form-group">
                                            <label>Status</label>
                                            <select defaultValue="pending">
                                                <option value="pending">Pending</option>
                                                <option value="active">Active</option>
                                            </select>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary">
                                    Create Clinic
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ClinicList;
