import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiMapPin,
    FiPhone, FiMail, FiCheck, FiX, FiMoreVertical
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Sidebar from '../../../components/common/Sidebar';
import { clinicsAPI } from '../../../services/api';
import './Clinics.css';

const ClinicList = () => {
    const navigate = useNavigate();
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, inactive: 0 });

    useEffect(() => {
        fetchClinics();
        fetchStats();
    }, [statusFilter]);

    const fetchClinics = async () => {
        try {
            setLoading(true);
            const response = await clinicsAPI.getAll({
                status: statusFilter !== 'all' ? statusFilter : undefined,
                search: searchTerm || undefined
            });
            if (response.data.success) {
                setClinics(response.data.data.clinics);
            }
        } catch (error) {
            console.error('Failed to fetch clinics:', error);
            toast.error('Failed to load clinics');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await clinicsAPI.getStats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleSearch = () => {
        fetchClinics();
    };

    const filteredClinics = clinics.filter(clinic => {
        const matchesSearch = clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clinic.code?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleStatusChange = async (clinicId, newStatus) => {
        try {
            await clinicsAPI.updateStatus(clinicId, { clinicStatus: newStatus });
            toast.success('Status updated successfully');
            fetchClinics();
            fetchStats();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="full-page-loading">
                <div className="spinner" />
                <p>Loading clinics...</p>
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
                    <button className="btn btn-primary" onClick={() => navigate('/admin/clinics/enroll')}>
                        <FiPlus /> Add Clinic
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="clinic-stats">
                    <div className="stat-box">
                        <span className="stat-number">{stats.total}</span>
                        <span className="stat-text">Total Clinics</span>
                    </div>
                    <div className="stat-box active">
                        <span className="stat-number">{stats.active}</span>
                        <span className="stat-text">Active</span>
                    </div>
                    <div className="stat-box pending">
                        <span className="stat-number">{stats.pending}</span>
                        <span className="stat-text">Pending</span>
                    </div>
                    <div className="stat-box suspended">
                        <span className="stat-number">{stats.inactive}</span>
                        <span className="stat-text">Inactive</span>
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
                                                    <FiMapPin size={12} /> {clinic.address?.line1}, {clinic.address?.city}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="contact-info">
                                                <span><FiPhone size={12} /> {clinic.contact?.phone}</span>
                                                <span><FiMail size={12} /> {clinic.contact?.email}</span>
                                            </div>
                                        </td>
                                        <td className="license-cell">{clinic.regulatory?.licenseNumber}</td>
                                        <td>{clinic.adminAccount?.fullName || 'N/A'}</td>
                                        <td className="staff-count">{clinic.subscription?.maxUsers || 0}</td>
                                        <td>
                                            <span className={`status-badge ${clinic.verification?.clinicStatus?.replace('_', '-')}`}>
                                                {clinic.verification?.clinicStatus?.replace('_', ' ') || 'pending'}
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
                                                {clinic.verification?.clinicStatus === 'active' ? (
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
                            <p>No clinics found. <button className="btn-link" onClick={() => navigate('/admin/clinics/enroll')}>Add a new clinic</button></p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ClinicList;
