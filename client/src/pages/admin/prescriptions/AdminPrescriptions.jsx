import { useState, useEffect } from 'react';
import {
    FiSearch, FiEye, FiCheck, FiX, FiRefreshCw,
    FiChevronLeft, FiChevronRight, FiFileText, FiClock
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { prescriptionsAPI } from '../../../services/api';
import TopNav from '../../../components/common/TopNav';
import './Prescriptions.css';

const AdminPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 0 });
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [updating, setUpdating] = useState(false);

    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchPrescriptions();
    }, [debouncedSearch, statusFilter, pagination.page]);

    const fetchPrescriptions = async () => {
        setLoading(true);
        try {
            const params = {
                search: debouncedSearch || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                page: pagination.page,
                limit: pagination.limit
            };
            const response = await prescriptionsAPI.getAll(params);
            if (response.data.success) {
                setPrescriptions(response.data.data.prescriptions || response.data.data || []);
                if (response.data.data.pagination) {
                    setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch prescriptions:', error);
            toast.error('Failed to load prescriptions');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id, isValid, notes = '') => {
        setUpdating(true);
        try {
            await prescriptionsAPI.verify(id, { isValid, notes });
            toast.success(`Prescription ${isValid ? 'verified' : 'rejected'}`);
            fetchPrescriptions();
            setShowDetails(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to verify prescription');
        } finally {
            setUpdating(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#f59e0b',
            verified: '#f97316',
            rejected: '#ef4444',
            fulfilled: '#f97316'
        };
        return colors[status] || 'var(--text-secondary)';
    };

    const stats = {
        total: prescriptions.length,
        pending: prescriptions.filter(p => p.status === 'pending').length,
        verified: prescriptions.filter(p => p.status === 'verified').length,
        fulfilled: prescriptions.filter(p => p.status === 'fulfilled').length
    };

    if (loading && prescriptions.length === 0) {
        return (
            <div className="full-page-loading">
                <div className="spinner" />
                <p>Loading prescriptions...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <TopNav />
            <main className="dashboard-main">
                <div className="page-header">
                    <div className="header-content">
                        <h1>Prescriptions</h1>
                        <p>Review and verify uploaded prescriptions</p>
                    </div>
                    <button className="btn btn-outline" onClick={fetchPrescriptions}>
                        <FiRefreshCw /> Refresh
                    </button>
                </div>

                {/* Stats */}
                <div className="prescription-stats">
                    <div className={`stat-box ${statusFilter === 'all' ? 'selected' : ''}`} onClick={() => setStatusFilter('all')}>
                        <FiFileText className="stat-icon" />
                        <span className="stat-number">{stats.total}</span>
                        <span className="stat-text">Total</span>
                    </div>
                    <div className={`stat-box pending ${statusFilter === 'pending' ? 'selected' : ''}`} onClick={() => setStatusFilter('pending')}>
                        <FiClock className="stat-icon" />
                        <span className="stat-number">{stats.pending}</span>
                        <span className="stat-text">Pending</span>
                    </div>
                    <div className={`stat-box verified ${statusFilter === 'verified' ? 'selected' : ''}`} onClick={() => setStatusFilter('verified')}>
                        <FiCheck className="stat-icon" />
                        <span className="stat-number">{stats.verified}</span>
                        <span className="stat-text">Verified</span>
                    </div>
                    <div className={`stat-box fulfilled ${statusFilter === 'fulfilled' ? 'selected' : ''}`} onClick={() => setStatusFilter('fulfilled')}>
                        <FiFileText className="stat-icon" />
                        <span className="stat-number">{stats.fulfilled}</span>
                        <span className="stat-text">Fulfilled</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search prescriptions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                        <option value="fulfilled">Fulfilled</option>
                    </select>
                </div>

                {/* Prescriptions Table */}
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Uploaded</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prescriptions.map((rx) => (
                                    <tr key={rx._id}>
                                        <td className="prescription-id">#{rx._id.slice(-6)}</td>
                                        <td>{rx.patient?.name || rx.user?.name || 'Unknown'}</td>
                                        <td>{rx.doctor?.name || rx.doctorName || 'N/A'}</td>
                                        <td>{new Date(rx.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span
                                                className="status-badge"
                                                style={{
                                                    background: `${getStatusColor(rx.status)}20`,
                                                    color: getStatusColor(rx.status)
                                                }}
                                            >
                                                {rx.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="action-btn view"
                                                    onClick={() => { setSelectedPrescription(rx); setShowDetails(true); }}
                                                    title="View Details"
                                                >
                                                    <FiEye />
                                                </button>
                                                {rx.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="action-btn approve"
                                                            onClick={() => handleVerify(rx._id, true)}
                                                            title="Verify"
                                                            disabled={updating}
                                                        >
                                                            <FiCheck />
                                                        </button>
                                                        <button
                                                            className="action-btn reject"
                                                            onClick={() => handleVerify(rx._id, false)}
                                                            title="Reject"
                                                            disabled={updating}
                                                        >
                                                            <FiX />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {prescriptions.length === 0 && !loading && (
                        <div className="empty-state">
                            <FiFileText size={48} />
                            <p>No prescriptions found</p>
                        </div>
                    )}

                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1}>
                                <FiChevronLeft />
                            </button>
                            <span>Page {pagination.page} of {pagination.pages}</span>
                            <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages}>
                                <FiChevronRight />
                            </button>
                        </div>
                    )}
                </div>

                {/* Prescription Details Modal */}
                {showDetails && selectedPrescription && (
                    <div className="modal-overlay" onClick={() => setShowDetails(false)}>
                        <div className="modal large" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Prescription #{selectedPrescription._id.slice(-6)}</h2>
                                <button className="modal-close" onClick={() => setShowDetails(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="prescription-detail-grid">
                                    <div>
                                        <label>Patient</label>
                                        <p>{selectedPrescription.patient?.name || selectedPrescription.user?.name || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <label>Doctor</label>
                                        <p>{selectedPrescription.doctor?.name || selectedPrescription.doctorName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label>Upload Date</label>
                                        <p>{new Date(selectedPrescription.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label>Status</label>
                                        <span
                                            className="status-badge"
                                            style={{
                                                background: `${getStatusColor(selectedPrescription.status)}20`,
                                                color: getStatusColor(selectedPrescription.status)
                                            }}
                                        >
                                            {selectedPrescription.status}
                                        </span>
                                    </div>
                                </div>
                                {selectedPrescription.imageUrl && (
                                    <div className="prescription-image">
                                        <label>Prescription Image</label>
                                        <img src={selectedPrescription.imageUrl} alt="Prescription" />
                                    </div>
                                )}
                                {selectedPrescription.notes && (
                                    <div className="prescription-notes">
                                        <label>Notes</label>
                                        <p>{selectedPrescription.notes}</p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                {selectedPrescription.status === 'pending' && (
                                    <>
                                        <button className="btn btn-danger" onClick={() => handleVerify(selectedPrescription._id, false)} disabled={updating}>
                                            Reject
                                        </button>
                                        <button className="btn btn-primary" onClick={() => handleVerify(selectedPrescription._id, true)} disabled={updating}>
                                            Verify & Approve
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPrescriptions;




