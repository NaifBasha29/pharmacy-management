import { useState, useEffect } from 'react';
import {
    FiSearch, FiFilter, FiEye, FiCheck, FiX, FiRefreshCw,
    FiChevronLeft, FiChevronRight, FiPackage, FiClock, FiTruck
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ordersAPI } from '../../../services/api';
import TopNav from '../../../components/common/TopNav';
import './Orders.css';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 0 });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchOrders();
    }, [debouncedSearch, statusFilter, pagination.page]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                search: debouncedSearch || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                page: pagination.page,
                limit: pagination.limit
            };
            const response = await ordersAPI.getAll(params);
            if (response.data.success) {
                setOrders(response.data.data.orders || response.data.data || []);
                if (response.data.data.pagination) {
                    setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdating(true);
        try {
            await ordersAPI.updateStatus(orderId, { status: newStatus });
            toast.success('Order status updated');
            fetchOrders();
            if (selectedOrder?._id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update order');
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
            processing: '#f97316',
            shipped: '#8b5cf6',
            delivered: '#f97316',
            cancelled: '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        delivered: orders.filter(o => o.status === 'delivered').length
    };

    if (loading && orders.length === 0) {
        return (
            <div className="full-page-loading">
                <div className="spinner" />
                <p>Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <TopNav />
            <main className="dashboard-main">
                <div className="page-header">
                    <div className="header-content">
                        <h1>Orders Management</h1>
                        <p>Track and manage all orders</p>
                    </div>
                    <button className="btn btn-outline" onClick={fetchOrders}>
                        <FiRefreshCw /> Refresh
                    </button>
                </div>

                {/* Stats */}
                <div className="order-stats">
                    <div className={`stat-box ${statusFilter === 'all' ? 'selected' : ''}`} onClick={() => setStatusFilter('all')}>
                        <FiPackage className="stat-icon" />
                        <span className="stat-number">{stats.total}</span>
                        <span className="stat-text">Total Orders</span>
                    </div>
                    <div className={`stat-box pending ${statusFilter === 'pending' ? 'selected' : ''}`} onClick={() => setStatusFilter('pending')}>
                        <FiClock className="stat-icon" />
                        <span className="stat-number">{stats.pending}</span>
                        <span className="stat-text">Pending</span>
                    </div>
                    <div className={`stat-box processing ${statusFilter === 'processing' ? 'selected' : ''}`} onClick={() => setStatusFilter('processing')}>
                        <FiPackage className="stat-icon" />
                        <span className="stat-number">{stats.processing}</span>
                        <span className="stat-text">Processing</span>
                    </div>
                    <div className={`stat-box delivered ${statusFilter === 'delivered' ? 'selected' : ''}`} onClick={() => setStatusFilter('delivered')}>
                        <FiTruck className="stat-icon" />
                        <span className="stat-number">{stats.delivered}</span>
                        <span className="stat-text">Delivered</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by order ID or customer..."
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
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Orders Table */}
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id}>
                                        <td className="order-id">#{order.orderNumber || order._id.slice(-8)}</td>
                                        <td>
                                            <div className="customer-info">
                                                <span className="customer-name">{order.user?.name || order.customer?.name || 'Guest'}</span>
                                                <span className="customer-email">{order.user?.email || order.customer?.email}</span>
                                            </div>
                                        </td>
                                        <td>{order.items?.length || 0} items</td>
                                        <td className="order-total">₹{order.total?.toFixed(2) || '0.00'}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span
                                                className="status-badge"
                                                style={{
                                                    background: `${getStatusColor(order.status)}20`,
                                                    color: getStatusColor(order.status)
                                                }}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="action-btn view"
                                                    onClick={() => { setSelectedOrder(order); setShowDetails(true); }}
                                                    title="View Details"
                                                >
                                                    <FiEye />
                                                </button>
                                                {order.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="action-btn approve"
                                                            onClick={() => handleStatusUpdate(order._id, 'processing')}
                                                            title="Approve"
                                                            disabled={updating}
                                                        >
                                                            <FiCheck />
                                                        </button>
                                                        <button
                                                            className="action-btn reject"
                                                            onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                                            title="Cancel"
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

                    {orders.length === 0 && !loading && (
                        <div className="empty-state">
                            <FiPackage size={48} />
                            <p>No orders found</p>
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

                {/* Order Details Modal */}
                {showDetails && selectedOrder && (
                    <div className="modal-overlay" onClick={() => setShowDetails(false)}>
                        <div className="modal large" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Order #{selectedOrder.orderNumber || selectedOrder._id.slice(-8)}</h2>
                                <button className="modal-close" onClick={() => setShowDetails(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="order-detail-section">
                                    <h4>Customer Details</h4>
                                    <p><strong>Name:</strong> {selectedOrder.user?.name || selectedOrder.customer?.name}</p>
                                    <p><strong>Email:</strong> {selectedOrder.user?.email || selectedOrder.customer?.email}</p>
                                    <p><strong>Phone:</strong> {selectedOrder.user?.phone || selectedOrder.customer?.phone || 'N/A'}</p>
                                </div>
                                <div className="order-detail-section">
                                    <h4>Order Items</h4>
                                    <table className="order-items-table">
                                        <thead>
                                            <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items?.map((item, i) => (
                                                <tr key={i}>
                                                    <td>{item.medicine?.name || item.name}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>₹{item.price?.toFixed(2)}</td>
                                                    <td>₹{(item.quantity * item.price)?.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="order-detail-section">
                                    <h4>Order Summary</h4>
                                    <p><strong>Subtotal:</strong> ₹{selectedOrder.subtotal?.toFixed(2) || selectedOrder.total?.toFixed(2)}</p>
                                    <p><strong>Total:</strong> ₹{selectedOrder.total?.toFixed(2)}</p>
                                    <p><strong>Status:</strong>
                                        <span className="status-badge" style={{
                                            background: `${getStatusColor(selectedOrder.status)}20`,
                                            color: getStatusColor(selectedOrder.status),
                                            marginLeft: '8px'
                                        }}>
                                            {selectedOrder.status}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="modal-footer">
                                {selectedOrder.status === 'pending' && (
                                    <>
                                        <button className="btn btn-danger" onClick={() => handleStatusUpdate(selectedOrder._id, 'cancelled')} disabled={updating}>
                                            Cancel Order
                                        </button>
                                        <button className="btn btn-primary" onClick={() => handleStatusUpdate(selectedOrder._id, 'processing')} disabled={updating}>
                                            Approve Order
                                        </button>
                                    </>
                                )}
                                {selectedOrder.status === 'processing' && (
                                    <button className="btn btn-primary" onClick={() => handleStatusUpdate(selectedOrder._id, 'shipped')} disabled={updating}>
                                        Mark as Shipped
                                    </button>
                                )}
                                {selectedOrder.status === 'shipped' && (
                                    <button className="btn btn-primary" onClick={() => handleStatusUpdate(selectedOrder._id, 'delivered')} disabled={updating}>
                                        Mark as Delivered
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminOrders;




