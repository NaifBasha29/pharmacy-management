import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiMapPin,
    FiPhone, FiMail, FiChevronLeft, FiChevronRight, FiRefreshCw, FiAlertTriangle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import TopNav from '../../../components/common/TopNav';
import { clinicsAPI } from '../../../services/api';
import './Clinics.css';

const ClinicList = () => {
    const navigate = useNavigate();
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, inactive: 0 });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
    const [deleteModal, setDeleteModal] = useState({ show: false, clinic: null });
    const [deleting, setDeleting] = useState(false);

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch clinics when filters change
    useEffect(() => {
        fetchClinics();
    }, [statusFilter, debouncedSearch, pagination.page]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchClinics = async () => {
        try {
            setLoading(true);
            const response = await clinicsAPI.getAll({
                status: statusFilter !== 'all' ? statusFilter : undefined,
                search: debouncedSearch || undefined,
                page: pagination.page,
                limit: pagination.limit
            });
            if (response.data.success) {
                setClinics(response.data.data.clinics);
                setPagination(prev => ({
                    ...prev,
                    ...response.data.data.pagination
                }));
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

    const handleDelete = async () => {
        if (!deleteModal.clinic) return;

        try {
            setDeleting(true);
            await clinicsAPI.delete(deleteModal.clinic._id);
            toast.success('Clinic deleted successfully');
            setDeleteModal({ show: false, clinic: null });
            fetchClinics();
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete clinic');
        } finally {
            setDeleting(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    if (loading && clinics.length === 0) {
        return (
            <div className="full-page-loading">
                <div className="spinner" />
                <p>Loading clinics...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <TopNav />
            <main className="dashboard-main">
                <div className="page-header">
                    <div className="header-content">
                        <h1>Clinic Management</h1>
                        <p>Manage all registered clinics on the platform</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={fetchClinics}>
                            <FiRefreshCw /> Refresh
                        </button>
                        <button className="btn btn-primary" onClick={() => navigate('/admin/clinics/enroll')}>
                            <FiPlus /> Add Clinic
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="clinic-stats">
                    <div className={`stat-box ${statusFilter === 'all' ? 'selected' : ''}`} onClick={() => setStatusFilter('all')}>
                        <span className="stat-number">{stats.total}</span>
                        <span className="stat-text">Total Clinics</span>
                    </div>
                    <div className={`stat-box active ${statusFilter === 'active' ? 'selected' : ''}`} onClick={() => setStatusFilter('active')}>
                        <span className="stat-number">{stats.active}</span>
                        <span className="stat-text">Active</span>
                    </div>
                    <div className={`stat-box pending ${statusFilter === 'pending' ? 'selected' : ''}`} onClick={() => setStatusFilter('pending')}>
                        <span className="stat-number">{stats.pending}</span>
                        <span className="stat-text">Pending</span>
                    </div>
                    <div className={`stat-box suspended ${statusFilter === 'suspended' ? 'selected' : ''}`} onClick={() => setStatusFilter('suspended')}>
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
                            placeholder="Search clinics by name, code, or email..."
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
                            <option value="pending_verification">Pending Verification</option>
                            <option value="suspended">Suspended</option>
                            <option value="inactive">Inactive</option>
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
                                    <th>Admin</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clinics.map((clinic) => (
                                    <tr key={clinic._id}>
                                        <td>
                                            <div className="clinic-info">
                                                <span className="clinic-name">{clinic.name}</span>
                                                <span className="clinic-code">{clinic.code}</span>
                                                {clinic.address?.city && (
                                                    <span className="clinic-address">
                                                        <FiMapPin size={12} /> {clinic.address.city}, {clinic.address.state}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="contact-info">
                                                {clinic.contact?.phone && <span><FiPhone size={12} /> {clinic.contact.phone}</span>}
                                                {clinic.contact?.email && <span><FiMail size={12} /> {clinic.contact.email}</span>}
                                            </div>
                                        </td>
                                        <td>{clinic.adminAccount?.fullName || clinic.adminAccount?.email || 'N/A'}</td>
                                        <td>
                                            <span className={`status-badge ${clinic.verification?.clinicStatus?.replace('_', '-') || 'pending'}`}>
                                                {clinic.verification?.clinicStatus?.replace(/_/g, ' ') || 'pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons-text">
                                                <button
                                                    className="action-btn-icon view"
                                                    onClick={() => navigate(`/admin/clinics/${clinic._id}`)}
                                                    title="View Details"
                                                >
                                                    <FiEye size={16} />
                                                </button>
                                                <button
                                                    className="action-btn-icon edit"
                                                    onClick={() => navigate(`/admin/clinics/enroll?id=${clinic._id}`)}
                                                    title="Edit Clinic"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    className="action-btn-icon delete"
                                                    onClick={() => setDeleteModal({ show: true, clinic })}
                                                    title="Delete Clinic"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                                <div className="segmented-toggle">
                                                    <button
                                                        className={`toggle-btn ${clinic.verification?.clinicStatus !== 'active' ? 'active' : ''}`}
                                                        onClick={() => handleStatusChange(clinic._id, 'inactive')}
                                                    >
                                                        Off
                                                    </button>
                                                    <button
                                                        className={`toggle-btn ${clinic.verification?.clinicStatus === 'active' ? 'active' : ''}`}
                                                        onClick={() => handleStatusChange(clinic._id, 'active')}
                                                    >
                                                        On
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {clinics.length === 0 && !loading && (
                        <div className="empty-state">
                            <p>No clinics found. <button className="btn-link" onClick={() => navigate('/admin/clinics/enroll')}>Add a new clinic</button></p>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                            >
                                <FiChevronLeft />
                            </button>
                            <span className="pagination-info">
                                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                            </span>
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                            >
                                <FiChevronRight />
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="modal-overlay">
                    <div className="modal-content delete-modal">
                        <div className="modal-icon">
                            <FiAlertTriangle size={48} color="#ef4444" />
                        </div>
                        <h3>Delete Clinic?</h3>
                        <p>Are you sure you want to delete <strong>{deleteModal.clinic?.name}</strong>? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setDeleteModal({ show: false, clinic: null })}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClinicList;




