<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import { ordersAPI, aiAPI } from "../../services/api";
import { FiShoppingCart, FiRefreshCw, FiCheck, FiTruck } from "react-icons/fi";
import toast from "react-hot-toast";
import "../admin/Dashboard.css";

const statusTabs = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "dispatched",
  "delivered",
];
const statusOptions = [
  "pending",
  "confirmed",
  "processing",
  "dispatched",
  "delivered",
];

const getStatusColor = (status) => {
  const colors = {
    pending: "#f59e0b",
    confirmed: "#f97316",
    processing: "#a855f7",
    dispatched: "#0ea5e9",
    delivered: "#10b981",
    cancelled: "#ef4444",
  };
  return colors[status] || "var(--text-secondary)";
};

const PharmacistOrders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusSelection, setStatusSelection] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getAll();
      const list = res.data.data.orders || res.data.data || [];
      setOrders(list);
      const selection = {};
      list.forEach((o) => {
        selection[o._id] = o.status;
      });
      setStatusSelection(selection);
    } catch (error) {
      console.error("Failed to load orders", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const handleStatusUpdate = async (orderId) => {
    const nextStatus = statusSelection[orderId];
    if (!nextStatus) return;
    setUpdatingId(orderId);
    try {
      await ordersAPI.updateStatus(orderId, {
        status: nextStatus,
        note: "Updated by pharmacist",
      });
      toast.success("Order status updated");
      fetchOrders();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update status";
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDispense = async (orderId) => {
    setUpdatingId(orderId);
    try {
      const res = await ordersAPI.dispense(orderId);
      toast.success("Order dispensed");

      // Run AI drug-check on dispensed medicines
      try {
        const dispensedOrder = res.data?.data?.order || res.data?.order;
        const items = dispensedOrder?.items || [];
        const medNames = items
          .map((i) => i.medicine?.name || i.name)
          .filter(Boolean);
        if (medNames.length > 0) {
          const prompt = `Check drug interactions for these medicines: ${medNames.join(", ")}. List any dangerous interactions, pairwise incompatibilities, and recommended action.`;
          const aiRes = await aiAPI.chat(prompt);
          const aiData = aiRes.data?.data || aiRes.data;
          console.debug("AI Drug Check result:", aiData);
          const text = JSON.stringify(aiData).toLowerCase();
          if (
            text.includes("interaction") ||
            text.includes("warning") ||
            text.includes("contraindicat")
          ) {
            toast.error(
              "AI detected potential interactions — review prescription/order details.",
            );
          } else {
            toast.success(
              "AI drug check completed — no immediate issues found.",
            );
          }
        }
      } catch (aiErr) {
        console.error("AI check failed", aiErr);
        toast("AI check failed — please review manually");
      }

      fetchOrders();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to dispense order";
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Pharmacist Orders</h1>
            <p>Review, dispense, and update order statuses</p>
          </div>
          <button className="btn btn-outline" onClick={fetchOrders}>
            <FiRefreshCw /> Refresh
          </button>
        </div>

        <div className="order-stats">
          {statusTabs.map((tab) => (
            <div
              key={tab}
              className={`stat-box ${tab === "pending" ? "pending" : tab === "processing" ? "processing" : tab === "delivered" ? "delivered" : ""} ${statusFilter === tab ? "selected" : ""}`}
              onClick={() => setStatusFilter(tab)}
            >
              <FiShoppingCart className="stat-icon" />
              <span className="stat-number">
                {tab === "all"
                  ? orders.length
                  : orders.filter((o) => o.status === tab).length}
              </span>
              <span className="stat-text">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            </div>
          ))}
        </div>

        <div className="card">
          <div
            className="card-header"
            style={{ justifyContent: "space-between" }}
          >
            <h3 className="card-title">All Orders</h3>
            <span className="text-secondary">
              {filteredOrders.length} shown
            </span>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Patient</th>
                  <th>Items</th>
                  <th>Total (₹)</th>
                  <th>Status</th>
                  <th style={{ width: 220 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="order-id">
                        #{order.orderNumber || order._id.slice(-8)}
                      </td>
                      <td>{order.user?.name || "Unknown"}</td>
                      <td>{order.items?.length || 0}</td>
                      <td>₹{order.total?.toFixed(2) || "0.00"}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            background: `${getStatusColor(order.status)}20`,
                            color: getStatusColor(order.status),
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            alignItems: "center",
                          }}
                        >
                          {(order.status === "confirmed" ||
                            order.status === "processing") && (
                            <button
                              className="btn btn-primary"
                              onClick={() => handleDispense(order._id)}
                              disabled={updatingId === order._id}
                            >
                              <FiTruck /> Dispense
                            </button>
                          )}
                          <select
                            value={statusSelection[order._id] || order.status}
                            onChange={(e) =>
                              setStatusSelection((prev) => ({
                                ...prev,
                                [order._id]: e.target.value,
                              }))
                            }
                            className="filter-select"
                            style={{ minWidth: 130 }}
                          >
                            {statusOptions.map((st) => (
                              <option key={st} value={st}>
                                {st.charAt(0).toUpperCase() + st.slice(1)}
                              </option>
                            ))}
                          </select>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleStatusUpdate(order._id)}
                            disabled={updatingId === order._id}
                          >
                            <FiCheck /> Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
=======
import { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiCheck, FiX, FiRefreshCw, FiChevronLeft, FiChevronRight, FiPackage, FiClock, FiTruck, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ordersAPI } from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import '../admin/Dashboard.css';
import '../admin/orders/Orders.css';

const PharmacistOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 0 });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [statusNote, setStatusNote] = useState('');
    const [newStatus, setNewStatus] = useState('');

    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => { const t = setTimeout(() => setDebouncedSearch(searchTerm), 400); return () => clearTimeout(t); }, [searchTerm]);
    useEffect(() => { fetchOrders(); }, [debouncedSearch, statusFilter, pagination.page]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = { search: debouncedSearch || undefined, status: statusFilter !== 'all' ? statusFilter : undefined, page: pagination.page, limit: pagination.limit };
            const res = await ordersAPI.getAll(params);
            if (res.data.success) {
                setOrders(res.data.data.orders || []);
                if (res.data.data.pagination) setPagination(p => ({ ...p, ...res.data.data.pagination }));
            }
        } catch { toast.error('Failed to load orders'); }
        finally { setLoading(false); }
    };

    const handleStatusUpdate = async (orderId, status, note = '') => {
        setUpdating(true);
        try {
            await ordersAPI.updateStatus(orderId, { status, note });
            toast.success(`Order status updated to ${status}`);
            fetchOrders();
            if (selectedOrder?._id === orderId) setSelectedOrder(p => ({ ...p, status }));
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to update order'); }
        finally { setUpdating(false); setNewStatus(''); setStatusNote(''); }
    };

    const handleDispense = async (orderId) => {
        setUpdating(true);
        try {
            await ordersAPI.dispense(orderId);
            toast.success('Order dispensed successfully — stock reduced');
            fetchOrders();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to dispense order'); }
        finally { setUpdating(false); }
    };

    const getStatusColor = (s) => ({ pending: '#d97706', confirmed: '#1d4ed8', processing: '#4f46e5', dispatched: '#a855f7', delivered: '#16a34a', cancelled: '#dc2626' }[s] || '#6b7280');
    const statusOptions = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'];
    const tabs = ['all', 'pending', 'confirmed', 'processing', 'dispatched', 'delivered'];

    const stats = {
        total: pagination.total || orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        toDispense: orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length,
        delivered: orders.filter(o => o.status === 'delivered').length
    };

    if (loading && orders.length === 0) return <div className="full-page-loading"><div className="spinner" /><p>Loading orders...</p></div>;

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <div className="page-header">
                    <div className="header-content"><h1>Pharmacist Orders</h1><p>Process, dispense, and track all orders</p></div>
                    <button className="btn btn-outline" onClick={fetchOrders}><FiRefreshCw /> Refresh</button>
                </div>

                {/* Stats */}
                <div className="order-stats">
                    <div className={`stat-box ${statusFilter === 'all' ? 'selected' : ''}`} onClick={() => setStatusFilter('all')}>
                        <FiPackage className="stat-icon" /><span className="stat-number">{stats.total}</span><span className="stat-text">Total</span>
                    </div>
                    <div className={`stat-box pending ${statusFilter === 'pending' ? 'selected' : ''}`} onClick={() => setStatusFilter('pending')}>
                        <FiClock className="stat-icon" /><span className="stat-number">{stats.pending}</span><span className="stat-text">Pending</span>
                    </div>
                    <div className={`stat-box processing ${statusFilter === 'confirmed' || statusFilter === 'processing' ? 'selected' : ''}`} onClick={() => setStatusFilter('confirmed')}>
                        <FiPackage className="stat-icon" /><span className="stat-number">{stats.toDispense}</span><span className="stat-text">To Dispense</span>
                    </div>
                    <div className={`stat-box delivered ${statusFilter === 'delivered' ? 'selected' : ''}`} onClick={() => setStatusFilter('delivered')}>
                        <FiTruck className="stat-icon" /><span className="stat-number">{stats.delivered}</span><span className="stat-text">Delivered</span>
                    </div>
                </div>

                {/* Tabs + Search */}
                <div className="filters-bar">
                    <div style={{ display: 'flex', gap: '0.25rem', background: '#0a0a0a', borderRadius: '0.5rem', padding: '0.25rem' }}>
                        {tabs.map(t => (
                            <button key={t} onClick={() => setStatusFilter(t)} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textTransform: 'capitalize', background: statusFilter === t ? '#f97316' : 'transparent', color: statusFilter === t ? '#fff' : '#9ca3af' }}>{t}</button>
                        ))}
                    </div>
                    <div className="search-box"><FiSearch className="search-icon" /><input type="text" placeholder="Search orders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                </div>

                {/* Table */}
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead><tr><th>Order #</th><th>Patient</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id}>
                                        <td className="order-id">#{order.orderNumber || order._id.slice(-8)}</td>
                                        <td><div className="customer-info"><span className="customer-name">{order.user?.name || 'Guest'}</span><span className="customer-email">{order.user?.email}</span></div></td>
                                        <td>{order.items?.length || 0} items</td>
                                        <td className="order-total">₹{order.total?.toFixed(2)}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td><span className="status-badge" style={{ background: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status) }}>{order.status}</span></td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="action-btn view" onClick={() => { setSelectedOrder(order); setShowDetails(true); }} title="View"><FiEye /></button>
                                                {['confirmed', 'processing'].includes(order.status) && (
                                                    <button className="action-btn approve" onClick={() => handleDispense(order._id)} disabled={updating} title="Dispense"><FiCheckCircle /></button>
                                                )}
                                                {order.status === 'pending' && (
                                                    <>
                                                        <button className="action-btn approve" onClick={() => handleStatusUpdate(order._id, 'confirmed')} disabled={updating} title="Confirm"><FiCheck /></button>
                                                        <button className="action-btn reject" onClick={() => handleStatusUpdate(order._id, 'cancelled')} disabled={updating} title="Cancel"><FiX /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {orders.length === 0 && !loading && <div className="empty-state"><FiPackage size={48} /><p>No orders found</p></div>}
                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1}><FiChevronLeft /></button>
                            <span>Page {pagination.page} of {pagination.pages}</span>
                            <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.pages}><FiChevronRight /></button>
                        </div>
                    )}
                </div>

                {/* Order Detail Modal */}
                {showDetails && selectedOrder && (
                    <div className="modal-overlay" onClick={() => setShowDetails(false)}>
                        <div className="modal large" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Order #{selectedOrder.orderNumber || selectedOrder._id.slice(-8)}</h2>
                                <button className="modal-close" onClick={() => setShowDetails(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="order-detail-section">
                                    <h4>Customer</h4>
                                    <p><strong>Name:</strong> {selectedOrder.user?.name || 'Guest'}</p>
                                    <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                                    <p><strong>Phone:</strong> {selectedOrder.user?.phone || 'N/A'}</p>
                                </div>
                                <div className="order-detail-section">
                                    <h4>Items</h4>
                                    <table className="order-items-table">
                                        <thead><tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
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
                                    <h4>Summary</h4>
                                    <p><strong>Total:</strong> ₹{selectedOrder.total?.toFixed(2)}</p>
                                    <p><strong>Status:</strong> <span className="status-badge" style={{ background: `${getStatusColor(selectedOrder.status)}20`, color: getStatusColor(selectedOrder.status), marginLeft: 8 }}>{selectedOrder.status}</span></p>
                                </div>
                                {/* Status update controls */}
                                <div className="order-detail-section" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #374151' }}>
                                    <h4>Update Status</h4>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #374151', background: '#0a0a0a', color: '#ffffff' }}>
                                            <option value="">Select status...</option>
                                            {statusOptions.filter(s => s !== selectedOrder.status).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <input type="text" placeholder="Note (optional)" value={statusNote} onChange={e => setStatusNote(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #374151', background: '#0a0a0a', color: '#ffffff', flex: 1 }} />
                                        <button className="btn btn-primary" disabled={!newStatus || updating} onClick={() => handleStatusUpdate(selectedOrder._id, newStatus, statusNote)} style={{ whiteSpace: 'nowrap' }}>
                                            {updating ? 'Updating...' : 'Update'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                {['confirmed', 'processing'].includes(selectedOrder.status) && (
                                    <button className="btn btn-primary" onClick={() => handleDispense(selectedOrder._id)} disabled={updating}>
                                        <FiCheckCircle style={{ marginRight: '0.375rem' }} /> Dispense Order
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
>>>>>>> 8a0117a (Rebase and fixes functionality)
};

export default PharmacistOrders;
