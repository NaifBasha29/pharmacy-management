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
};

export default PharmacistPrescriptions;
