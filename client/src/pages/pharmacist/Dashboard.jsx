import { useState, useEffect } from "react";
import {
  FiShoppingCart,
  FiPackage,
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
  FiActivity,
  FiUsers,
} from "react-icons/fi";
import { ordersAPI, medicinesAPI, prescriptionsAPI } from "../../services/api";
import Sidebar from "../../components/common/Sidebar";
import "../admin/Dashboard.css";

const PharmacistDashboard = () => {
  const [stats, setStats] = useState({
    pendingOrders: 0,
    toDispense: 0,
    pendingPrescriptions: 0,
    lowStockCount: 0,
    todayDispensed: 0,
  });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, prescriptionsRes, lowStockRes] = await Promise.all([
        ordersAPI.getAll({ limit: 100 }),
        prescriptionsAPI.getAll({ limit: 100 }),
        medicinesAPI.getLowStock(),
      ]);
      const orders = allOrdersRes.data.data.orders || [];
      const rxList = rxRes.data.data.prescriptions || [];
      const today = new Date().toDateString();
      const dispensedToday = orders.filter(o => o.status === 'dispatched' && new Date(o.updatedAt).toDateString() === today).length;

      const orders = ordersRes.data.data.orders || ordersRes.data.data || [];
      const prescriptions =
        prescriptionsRes.data.data.prescriptions ||
        prescriptionsRes.data.data ||
        [];

      setPendingOrders(orders.filter((o) => o.status === "pending"));
      setRecentOrders(
        [...orders]
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 5),
      );
      setLowStockItems(lowStockRes.data.data.medicines);

      setStats({
        pendingOrders: orders.filter((o) => o.status === "pending").length,
        toDispense: orders.filter((o) =>
          ["confirmed", "processing"].includes(o.status),
        ).length,
        pendingPrescriptions: prescriptions.filter(
          (p) => p.status === "pending",
        ).length,
        lowStockCount: lowStockRes.data.data.count || 0,
        todayDispensed: orders.filter(
          (o) =>
            ["dispatched", "delivered"].includes(o.status) &&
            new Date(o.updatedAt).toDateString() === new Date().toDateString(),
        ).length,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (s) => ({ pending: '#d97706', confirmed: '#1d4ed8', processing: '#4f46e5', dispatched: '#a855f7', delivered: '#16a34a', cancelled: '#dc2626' }[s] || '#6b7280');

  if (loading) return (
    <div className="dashboard-layout"><Sidebar /><main className="dashboard-main"><div className="loading-overlay"><div className="spinner" /><p>Loading dashboard...</p></div></main></div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Pharmacist Dashboard</h1>
            <p>Manage orders, prescriptions, and dispensing</p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon orange">
              <FiShoppingCart />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.pendingOrders}</div>
              <div className="stat-label">Pending Orders</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">
              <FiPackage />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.toDispense}</div>
              <div className="stat-label">Orders to Dispense</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              <FiFileText />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.pendingPrescriptions}</div>
              <div className="stat-label">Pending Prescriptions</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">
              <FiCheckCircle />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.todayDispensed}</div>
              <div className="stat-label">Dispensed Today</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div
            className="card-body"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {[
              {
                href: "/pharmacist/orders",
                icon: <FiPackage />,
                label: "View Orders",
                bg: "linear-gradient(135deg, #f97316, #fb923c)",
              },
              {
                href: "/pharmacist/prescriptions",
                icon: <FiFileText />,
                label: "Review Prescriptions",
                bg: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
              },
              {
                href: "/pharmacist/patients",
                icon: <FiUsers />,
                label: "View Patients",
                bg: "linear-gradient(135deg, #22c55e, #16a34a)",
              },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1rem",
                  border: "1px solid var(--border-light)",
                  borderRadius: "0.75rem",
                  textDecoration: "none",
                  color: "var(--text-primary)",
                  background: "var(--bg-tertiary)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "0.75rem",
                    background: action.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "1.1rem",
                  }}
                >
                  {action.icon}
                </div>
                <span style={{ fontWeight: 700 }}>{action.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="dashboard-grid">
          {/* Pending Orders */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Orders to Process</h3>
            </div>
            <div className="card-body">
              {pendingOrders.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingOrders.map((order) => (
                        <tr key={order._id}>
                          <td>{order.orderNumber}</td>
                          <td>{order.user?.name || "N/A"}</td>
                          <td>{order.items?.length || 0} items</td>
                          <td>
                            <span className="badge badge-warning">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-secondary text-center">
                  No pending orders! 🎉
                </p>
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <FiAlertCircle className="text-warning" /> Low Stock Alerts
              </h3>
            </div>
            <div className="card-body">
              {lowStockItems.length > 0 ? (
                <div className="alert-list">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <div key={item._id} className="alert-item">
                      <div className="alert-info">
                        <span className="alert-name">{item.name}</span>
                        <span className="alert-category">
                          {item.category?.name}
                        </span>
                      </div>
                      <div className="alert-stock">
                        <span
                          className={`stock-badge ${item.stock === 0 ? "out" : "low"}`}
                        >
                          {item.stock} left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary text-center">
                  All stock levels are healthy!
                </p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Activity</h3>
            </div>
            <div className="card-body">
              {recentOrders.length ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Patient</th>
                        <th>Status</th>
                        <th>Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>#{order.orderNumber || order._id.slice(-8)}</td>
                          <td>{order.user?.name || "Unknown"}</td>
                          <td>
                            <span className="badge badge-info">
                              {order.status}
                            </span>
                          </td>
                          <td>{new Date(order.updatedAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-secondary text-center">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PharmacistDashboard;
