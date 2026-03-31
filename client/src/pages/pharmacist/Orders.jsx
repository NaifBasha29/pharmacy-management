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
};

export default PharmacistOrders;
