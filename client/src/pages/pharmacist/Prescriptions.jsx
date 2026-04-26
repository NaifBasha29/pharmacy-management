<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import { prescriptionsAPI } from "../../services/api";
import api from "../../services/api";
import { FiClipboard, FiRefreshCw, FiCheck, FiX, FiEye } from "react-icons/fi";
import toast from "react-hot-toast";
import "../admin/Dashboard.css";

const statusTabs = ["all", "pending", "verified", "rejected"];

const statusStyles = {
  pending: { bg: "#f59e0b20", color: "#f59e0b" },
  verified: { bg: "#10b98120", color: "#10b981" },
  rejected: { bg: "#ef444420", color: "#ef4444" },
};

const PharmacistPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [noteById, setNoteById] = useState({});
  const [imageModal, setImageModal] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await prescriptionsAPI.getAll();
      const list = res.data.data.prescriptions || res.data.data || [];
      // Normalize image URLs
      const apiRoot = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
      const normalized = list.map((rx) => ({
        ...rx,
        imageUrl: rx.image
          ? rx.image.startsWith("http")
            ? rx.image
            : `${apiRoot}/${rx.image}`
          : undefined,
      }));
      setPrescriptions(normalized);
    } catch (error) {
      console.error("Failed to load prescriptions", error);
      toast.error("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = useMemo(() => {
    if (statusFilter === "all") return prescriptions;
    return prescriptions.filter((rx) => rx.status === statusFilter);
  }, [prescriptions, statusFilter]);

  const handleVerify = async (id, action) => {
    setUpdatingId(id);
    try {
      if (action === "verify") {
        await prescriptionsAPI.verify(id, {
          action: "verify",
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          pharmacistNote: noteById[id] || "Verified by pharmacist",
        });
        toast.success("Prescription verified");
      } else if (action === "reject") {
        await prescriptionsAPI.verify(id, {
          action: "reject",
          rejectionReason: noteById[id] || "Rejected by pharmacist",
        });
        toast.success("Prescription rejected");
      }
      setNoteById((prev) => ({ ...prev, [id]: "" }));
      fetchPrescriptions();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update prescription";
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const renderStatusBadge = (status) => {
    const style = statusStyles[status] || {
      bg: "var(--bg-tertiary)",
      color: "var(--text-secondary)",
    };
    return (
      <span
        className="status-badge"
        style={{ background: style.bg, color: style.color }}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Pharmacist Prescriptions</h1>
            <p>Review and approve patient prescriptions</p>
          </div>
          <button className="btn btn-outline" onClick={fetchPrescriptions}>
            <FiRefreshCw /> Refresh
          </button>
        </div>

        <div className="order-stats">
          {statusTabs.map((tab) => (
            <div
              key={tab}
              className={`stat-box ${tab === "pending" ? "pending" : tab === "approved" ? "delivered" : ""} ${statusFilter === tab ? "selected" : ""}`}
              onClick={() => setStatusFilter(tab)}
            >
              <FiClipboard className="stat-icon" />
              <span className="stat-number">
                {tab === "all"
                  ? prescriptions.length
                  : prescriptions.filter((r) => r.status === tab).length}
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
            <h3 className="card-title">Prescription Queue</h3>
            <span className="text-secondary">
              {filteredPrescriptions.length} shown
            </span>
          </div>
          <div
            className="prescription-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1rem",
              padding: "1rem",
            }}
          >
            {loading ? (
              <p className="text-center" style={{ gridColumn: "1 / -1" }}>
                Loading...
              </p>
            ) : filteredPrescriptions.length === 0 ? (
              <p className="text-center" style={{ gridColumn: "1 / -1" }}>
                No prescriptions found
              </p>
            ) : (
              filteredPrescriptions.map((rx) => (
                <div key={rx._id} className="card" style={{ padding: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>#{rx._id.slice(-6)}</div>
                      <div className="text-secondary">
                        {new Date(rx.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {renderStatusBadge(rx.status)}
                  </div>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <div style={{ fontWeight: 600 }}>Patient</div>
                    <div className="text-secondary">
                      {rx.patient?.name || rx.user?.name || "Unknown"}
                    </div>
                  </div>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <div style={{ fontWeight: 600 }}>Uploaded</div>
                    <div className="text-secondary">
                      {new Date(rx.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {rx.imageUrl && (
                    <div
                      style={{
                        marginBottom: "0.75rem",
                        position: "relative",
                        cursor: "pointer",
                      }}
                      onClick={() => setImageModal(rx.imageUrl)}
                    >
                      <img
                        src={rx.imageUrl}
                        alt="Prescription"
                        style={{
                          width: "100%",
                          borderRadius: "0.75rem",
                          maxHeight: 200,
                          objectFit: "cover",
                          border: "1px solid var(--border-light)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: "var(--bg-tertiary)",
                          opacity: 0.9,
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          color: "var(--text-primary)",
                          fontSize: 12,
                        }}
                      >
                        <FiEye /> View
                      </div>
                    </div>
                  )}
                  {rx.status === "pending" && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      <textarea
                        value={noteById[rx._id] || ""}
                        onChange={(e) =>
                          setNoteById((prev) => ({
                            ...prev,
                            [rx._id]: e.target.value,
                          }))
                        }
                        placeholder="Pharmacist note or rejection reason"
                        style={{
                          width: "100%",
                          minHeight: 80,
                          borderRadius: "0.75rem",
                          border: "1px solid var(--border-light)",
                          background: "var(--bg-tertiary)",
                          color: "var(--text-primary)",
                          padding: "0.75rem",
                          resize: "vertical",
                        }}
                      />
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleVerify(rx._id, "verify")}
                          disabled={updatingId === rx._id}
                        >
                          <FiCheck /> Approve
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleVerify(rx._id, "reject")}
                          disabled={updatingId === rx._id}
                          style={{
                            background: "var(--bg-tertiary)",
                            color: "#ef4444",
                            border: "1px solid var(--border-light)",
                          }}
                        >
                          <FiX /> Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {imageModal && (
          <div className="modal-overlay" onClick={() => setImageModal(null)}>
            <div
              className="modal"
              style={{ maxWidth: "720px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Prescription Image</h2>
                <button
                  className="modal-close"
                  onClick={() => setImageModal(null)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body" style={{ textAlign: "center" }}>
                <img
                  src={imageModal}
                  alt="Prescription full"
                  style={{ width: "100%", borderRadius: "0.75rem" }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
=======
import { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiCheck, FiX, FiRefreshCw, FiChevronLeft, FiChevronRight, FiFileText, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { prescriptionsAPI } from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import '../admin/Dashboard.css';
import '../admin/prescriptions/Prescriptions.css';

const PharmacistPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 0 });
    const [selected, setSelected] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [approveNote, setApproveNote] = useState('');

    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => { const t = setTimeout(() => setDebouncedSearch(searchTerm), 400); return () => clearTimeout(t); }, [searchTerm]);
    useEffect(() => { fetchRx(); }, [debouncedSearch, statusFilter, pagination.page]);

    const fetchRx = async () => {
        setLoading(true);
        try {
            const params = { search: debouncedSearch || undefined, status: statusFilter !== 'all' ? statusFilter : undefined, page: pagination.page, limit: pagination.limit };
            const res = await prescriptionsAPI.getAll(params);
            if (res.data.success) {
                setPrescriptions(res.data.data.prescriptions || []);
                if (res.data.data.pagination) setPagination(p => ({ ...p, ...res.data.data.pagination }));
            }
        } catch { toast.error('Failed to load prescriptions'); }
        finally { setLoading(false); }
    };

    const handleApprove = async (id, note = '') => {
        setUpdating(true);
        try {
            await prescriptionsAPI.verify(id, { status: 'approved', pharmacistNote: note || 'Approved by pharmacist' });
            toast.success('Prescription approved');
            fetchRx(); setShowDetails(false); setApproveNote('');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to approve'); }
        finally { setUpdating(false); }
    };

    const handleReject = async (id, reason) => {
        if (!reason.trim()) { toast.error('Please provide a rejection reason'); return; }
        setUpdating(true);
        try {
            await prescriptionsAPI.verify(id, { status: 'rejected', pharmacistNote: reason });
            toast.success('Prescription rejected');
            fetchRx(); setShowDetails(false); setRejectReason('');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to reject'); }
        finally { setUpdating(false); }
    };

    const getStatusColor = (s) => ({ pending: '#d97706', approved: '#16a34a', verified: '#1d4ed8', rejected: '#dc2626', fulfilled: '#4f46e5' }[s] || '#6b7280');
    const tabs = ['all', 'pending', 'approved', 'rejected'];

    const stats = {
        total: prescriptions.length,
        pending: prescriptions.filter(p => p.status === 'pending').length,
        approved: prescriptions.filter(p => ['approved', 'verified'].includes(p.status)).length,
        rejected: prescriptions.filter(p => p.status === 'rejected').length
    };

    if (loading && prescriptions.length === 0) return <div className="full-page-loading"><div className="spinner" /><p>Loading prescriptions...</p></div>;

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <div className="page-header">
                    <div className="header-content"><h1>Prescriptions Review</h1><p>Verify and approve patient prescriptions</p></div>
                    <button className="btn btn-outline" onClick={fetchRx}><FiRefreshCw /> Refresh</button>
                </div>

                {/* Stats */}
                <div className="prescription-stats">
                    <div className={`stat-box ${statusFilter === 'all' ? 'selected' : ''}`} onClick={() => setStatusFilter('all')}>
                        <FiFileText className="stat-icon" /><span className="stat-number">{stats.total}</span><span className="stat-text">Total</span>
                    </div>
                    <div className={`stat-box pending ${statusFilter === 'pending' ? 'selected' : ''}`} onClick={() => setStatusFilter('pending')}>
                        <FiClock className="stat-icon" /><span className="stat-number">{stats.pending}</span><span className="stat-text">Pending</span>
                    </div>
                    <div className={`stat-box verified ${statusFilter === 'approved' ? 'selected' : ''}`} onClick={() => setStatusFilter('approved')}>
                        <FiCheck className="stat-icon" /><span className="stat-number">{stats.approved}</span><span className="stat-text">Approved</span>
                    </div>
                    <div className={`stat-box ${statusFilter === 'rejected' ? 'selected' : ''}`} onClick={() => setStatusFilter('rejected')} style={{ '--stat-color': '#ef4444' }}>
                        <FiX className="stat-icon" /><span className="stat-number">{stats.rejected}</span><span className="stat-text">Rejected</span>
                    </div>
                </div>

                {/* Tabs + Search */}
                <div className="filters-bar">
                    <div style={{ display: 'flex', gap: '0.25rem', background: '#0a0a0a', borderRadius: '0.5rem', padding: '0.25rem' }}>
                        {tabs.map(t => (
                            <button key={t} onClick={() => setStatusFilter(t)} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', borderRadius: '0.375rem', cursor: 'pointer', textTransform: 'capitalize', background: statusFilter === t ? '#f97316' : 'transparent', color: statusFilter === t ? '#fff' : '#9ca3af' }}>{t}</button>
                        ))}
                    </div>
                    <div className="search-box"><FiSearch className="search-icon" /><input type="text" placeholder="Search prescriptions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                </div>

                {/* Table */}
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead><tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Uploaded</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {prescriptions.map(rx => (
                                    <tr key={rx._id}>
                                        <td className="prescription-id">#{rx._id.slice(-6)}</td>
                                        <td>{rx.patient?.name || rx.user?.name || 'Unknown'}</td>
                                        <td>{rx.doctor?.name || rx.doctorName || 'N/A'}</td>
                                        <td>{new Date(rx.createdAt).toLocaleDateString()}</td>
                                        <td><span className="status-badge" style={{ background: `${getStatusColor(rx.status)}20`, color: getStatusColor(rx.status) }}>{rx.status}</span></td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="action-btn view" onClick={() => { setSelected(rx); setShowDetails(true); }} title="View"><FiEye /></button>
                                                {rx.status === 'pending' && (
                                                    <>
                                                        <button className="action-btn approve" onClick={() => handleApprove(rx._id)} disabled={updating} title="Approve"><FiCheck /></button>
                                                        <button className="action-btn reject" onClick={() => { setSelected(rx); setShowDetails(true); }} disabled={updating} title="Reject"><FiX /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {prescriptions.length === 0 && !loading && <div className="empty-state"><FiFileText size={48} /><p>No prescriptions found</p></div>}
                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1}><FiChevronLeft /></button>
                            <span>Page {pagination.page} of {pagination.pages}</span>
                            <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.pages}><FiChevronRight /></button>
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
                {showDetails && selected && (
                    <div className="modal-overlay" onClick={() => { setShowDetails(false); setRejectReason(''); }}>
                        <div className="modal large" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Prescription #{selected._id.slice(-6)}</h2>
                                <button className="modal-close" onClick={() => { setShowDetails(false); setRejectReason(''); }}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="prescription-detail-grid">
                                    <div><label>Patient</label><p>{selected.patient?.name || selected.user?.name || 'Unknown'}</p></div>
                                    <div><label>Doctor</label><p>{selected.doctor?.name || selected.doctorName || 'N/A'}</p></div>
                                    <div><label>Uploaded</label><p>{new Date(selected.createdAt).toLocaleString()}</p></div>
                                    <div><label>Status</label><span className="status-badge" style={{ background: `${getStatusColor(selected.status)}20`, color: getStatusColor(selected.status) }}>{selected.status}</span></div>
                                </div>
                                {selected.imageUrl && (
                                    <div className="prescription-image" style={{ margin: '1rem 0' }}>
                                        <label>Prescription Image</label>
                                        <img src={selected.imageUrl} alt="Prescription" style={{ maxWidth: '100%', borderRadius: '0.5rem', marginTop: '0.5rem' }} />
                                    </div>
                                )}
                                {selected.notes && <div className="prescription-notes"><label>Notes</label><p>{selected.notes}</p></div>}
                                {selected.pharmacistNote && <div className="prescription-notes"><label>Pharmacist Note</label><p>{selected.pharmacistNote}</p></div>}

                                {selected.status === 'pending' && (
                                    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #374151' }}>
                                        <h4 style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Review Actions</h4>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem', color: '#9ca3af' }}>Note for approval (optional)</label>
                                            <input type="text" value={approveNote} onChange={e => setApproveNote(e.target.value)} placeholder="e.g. Valid prescription, 30-day supply" style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #374151', background: '#0a0a0a', color: '#ffffff' }} />
                                        </div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem', color: '#9ca3af' }}>Rejection reason (required to reject)</label>
                                            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Expired prescription, illegible writing" rows={2} style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #374151', background: '#0a0a0a', color: '#ffffff', resize: 'vertical' }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                {selected.status === 'pending' && (
                                    <>
                                        <button className="btn btn-danger" onClick={() => handleReject(selected._id, rejectReason)} disabled={updating}>
                                            {updating ? 'Rejecting...' : 'Reject'}
                                        </button>
                                        <button className="btn btn-primary" onClick={() => handleApprove(selected._id, approveNote)} disabled={updating}>
                                            {updating ? 'Approving...' : 'Approve'}
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
>>>>>>> 8a0117a (Rebase and fixes functionality)
};

export default PharmacistPrescriptions;
