import { useState, useEffect } from 'react';
import {
    FiSearch, FiFilter, FiRefreshCw, FiChevronLeft, FiChevronRight,
    FiUser, FiClock, FiActivity, FiDownload
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { auditLogsAPI } from '../../../services/api';
import TopNav from '../../../components/common/TopNav';
import './AuditLogs.css';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [resourceFilter, setResourceFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchLogs();
    }, [debouncedSearch, actionFilter, resourceFilter, pagination.page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = {
                search: debouncedSearch || undefined,
                action: actionFilter !== 'all' ? actionFilter : undefined,
                resource: resourceFilter !== 'all' ? resourceFilter : undefined,
                page: pagination.page,
                limit: pagination.limit
            };
            const response = await auditLogsAPI.getAll(params);
            if (response.data.success) {
                setLogs(response.data.data.logs || response.data.data || []);
                if (response.data.data.pagination) {
                    setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        toast.success('Audit logs exported');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const getActionColor = (action) => {
        const colors = {
            CREATE: '#f97316',
            UPDATE: '#f97316',
            DELETE: '#ef4444',
            LOGIN: '#8b5cf6',
            LOGOUT: '#6b7280',
            VIEW: '#f59e0b'
        };
        return colors[action] || '#6b7280';
    };

    if (loading && logs.length === 0) {
        return (
            <div className="full-page-loading">
                <div className="spinner" />
                <p>Loading audit logs...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <TopNav />
            <main className="dashboard-main">
                <div className="page-header">
                    <div className="header-content">
                        <h1>Audit Logs</h1>
                        <p>System activity and compliance tracking</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-outline" onClick={fetchLogs}>
                            <FiRefreshCw /> Refresh
                        </button>
                        <button className="btn btn-primary" onClick={handleExport}>
                            <FiDownload /> Export
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by user, action, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Actions</option>
                            <option value="CREATE">Create</option>
                            <option value="UPDATE">Update</option>
                            <option value="DELETE">Delete</option>
                            <option value="LOGIN">Login</option>
                            <option value="LOGOUT">Logout</option>
                        </select>
                        <select
                            value={resourceFilter}
                            onChange={(e) => setResourceFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Resources</option>
                            <option value="User">User</option>
                            <option value="Clinic">Clinic</option>
                            <option value="Medicine">Medicine</option>
                            <option value="Order">Order</option>
                            <option value="Prescription">Prescription</option>
                        </select>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="card">
                    <div className="table-container">
                        <table className="table audit-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Resource</th>
                                    <th>Description</th>
                                    <th>IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log._id}>
                                        <td className="timestamp-cell">
                                            <FiClock size={12} />
                                            {new Date(log.createdAt || log.timestamp).toLocaleString()}
                                        </td>
                                        <td>
                                            <div className="user-cell">
                                                <FiUser size={12} />
                                                {log.user?.name || log.userName || 'System'}
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className="action-badge"
                                                style={{
                                                    background: `${getActionColor(log.action)}20`,
                                                    color: getActionColor(log.action)
                                                }}
                                            >
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="resource-cell">{log.resource}</td>
                                        <td className="description-cell">{log.description}</td>
                                        <td className="ip-cell">{log.ipAddress || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {logs.length === 0 && !loading && (
                        <div className="empty-state">
                            <FiActivity size={48} />
                            <p>No audit logs found</p>
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
            </main>
        </div>
    );
};

export default AuditLogs;




