import { useState, useEffect } from 'react';
import {
    FiSearch, FiRefreshCw, FiChevronLeft, FiChevronRight,
    FiMessageCircle, FiClock, FiCheckCircle, FiAlertCircle, FiUser
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { supportAPI } from '../../../services/api';
import TopNav from '../../../components/common/TopNav';
import './AdminSupport.css';

const AdminSupport = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 0 });
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);

    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchTickets();
    }, [debouncedSearch, statusFilter, pagination.page]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params = {
                search: debouncedSearch || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                page: pagination.page,
                limit: pagination.limit
            };
            const response = await supportAPI.getAll(params);
            if (response.data.success) {
                setTickets(response.data.data.tickets || response.data.data || []);
                if (response.data.data.pagination) {
                    setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (ticketId, newStatus) => {
        try {
            await supportAPI.updateStatus(ticketId, { status: newStatus });
            toast.success('Ticket status updated');
            fetchTickets();
            if (selectedTicket?._id === ticketId) {
                setSelectedTicket(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleReply = async () => {
        if (!replyText.trim() || !selectedTicket) return;

        setReplying(true);
        try {
            await supportAPI.reply(selectedTicket._id, { message: replyText });
            toast.success('Reply sent');
            setReplyText('');
            fetchTickets();
        } catch (error) {
            toast.error('Failed to send reply');
        } finally {
            setReplying(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'open': return <FiAlertCircle color="#f59e0b" />;
            case 'in_progress': return <FiClock color="#f97316" />;
            case 'resolved': return <FiCheckCircle color="#f97316" />;
            default: return <FiMessageCircle color="var(--text-secondary)" />;
        }
    };

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        inProgress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length
    };

    if (loading && tickets.length === 0) {
        return (
            <div className="full-page-loading">
                <div className="spinner" />
                <p>Loading support tickets...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <TopNav />
            <main className="dashboard-main">
                <div className="page-header">
                    <div className="header-content">
                        <h1>Support Tickets</h1>
                        <p>Manage customer support requests</p>
                    </div>
                    <button className="btn btn-outline" onClick={fetchTickets}>
                        <FiRefreshCw /> Refresh
                    </button>
                </div>

                {/* Stats */}
                <div className="support-stats">
                    <div className={`stat-box ${statusFilter === 'all' ? 'selected' : ''}`} onClick={() => setStatusFilter('all')}>
                        <FiMessageCircle className="stat-icon" />
                        <span className="stat-number">{stats.total}</span>
                        <span className="stat-text">Total Tickets</span>
                    </div>
                    <div className={`stat-box open ${statusFilter === 'open' ? 'selected' : ''}`} onClick={() => setStatusFilter('open')}>
                        <FiAlertCircle className="stat-icon" />
                        <span className="stat-number">{stats.open}</span>
                        <span className="stat-text">Open</span>
                    </div>
                    <div className={`stat-box in-progress ${statusFilter === 'in_progress' ? 'selected' : ''}`} onClick={() => setStatusFilter('in_progress')}>
                        <FiClock className="stat-icon" />
                        <span className="stat-number">{stats.inProgress}</span>
                        <span className="stat-text">In Progress</span>
                    </div>
                    <div className={`stat-box resolved ${statusFilter === 'resolved' ? 'selected' : ''}`} onClick={() => setStatusFilter('resolved')}>
                        <FiCheckCircle className="stat-icon" />
                        <span className="stat-number">{stats.resolved}</span>
                        <span className="stat-text">Resolved</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
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
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                {/* Tickets Table */}
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Ticket</th>
                                    <th>Subject</th>
                                    <th>User</th>
                                    <th>Created</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr key={ticket._id}>
                                        <td className="ticket-id">#{ticket._id.slice(-6)}</td>
                                        <td className="ticket-subject">{ticket.subject}</td>
                                        <td>
                                            <div className="user-cell">
                                                <FiUser size={12} />
                                                {ticket.user?.name || ticket.email || 'Guest'}
                                            </div>
                                        </td>
                                        <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-badge ${ticket.status}`}>
                                                {getStatusIcon(ticket.status)}
                                                {ticket.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline"
                                                onClick={() => { setSelectedTicket(ticket); setShowDetails(true); }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {tickets.length === 0 && !loading && (
                        <div className="empty-state">
                            <FiMessageCircle size={48} />
                            <p>No support tickets found</p>
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

                {/* Ticket Details Modal */}
                {showDetails && selectedTicket && (
                    <div className="modal-overlay" onClick={() => setShowDetails(false)}>
                        <div className="modal large" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Ticket #{selectedTicket._id.slice(-6)}</h2>
                                <button className="modal-close" onClick={() => setShowDetails(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="ticket-info">
                                    <h4>{selectedTicket.subject}</h4>
                                    <p><strong>From:</strong> {selectedTicket.user?.name || selectedTicket.email}</p>
                                    <p><strong>Created:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="ticket-message">
                                    <p>{selectedTicket.message || selectedTicket.description}</p>
                                </div>
                                <div className="reply-section">
                                    <h5>Reply</h5>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Type your reply..."
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                {selectedTicket.status === 'open' && (
                                    <button className="btn btn-secondary" onClick={() => handleStatusUpdate(selectedTicket._id, 'in_progress')}>
                                        Mark In Progress
                                    </button>
                                )}
                                {selectedTicket.status !== 'resolved' && (
                                    <button className="btn btn-success" onClick={() => handleStatusUpdate(selectedTicket._id, 'resolved')}>
                                        Mark Resolved
                                    </button>
                                )}
                                <button className="btn btn-primary" onClick={handleReply} disabled={!replyText.trim() || replying}>
                                    {replying ? 'Sending...' : 'Send Reply'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminSupport;




