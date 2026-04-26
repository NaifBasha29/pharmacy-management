<<<<<<< HEAD
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
=======
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiPackage, FiFileText, FiAlertCircle, FiCheckCircle, FiArrowRight, FiClock, FiActivity, FiCalendar } from 'react-icons/fi';
import { ordersAPI, prescriptionsAPI } from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import '../admin/Dashboard.css';

const PharmacistDashboard = () => {
  const [stats, setStats] = useState({ pendingOrders: 0, toDispense: 0, pendingRx: 0, dispensedToday: 0 });
>>>>>>> 8a0117a (Rebase and fixes functionality)
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
<<<<<<< HEAD
      const [ordersRes, prescriptionsRes, lowStockRes] = await Promise.all([
        ordersAPI.getAll({ limit: 100 }),
        prescriptionsAPI.getAll({ limit: 100 }),
        medicinesAPI.getLowStock(),
=======
      const [allOrdersRes, rxRes] = await Promise.all([
        ordersAPI.getAll({ limit: 50 }),
        prescriptionsAPI.getAll({ limit: 50 })
>>>>>>> 8a0117a (Rebase and fixes functionality)
      ]);
      const orders = allOrdersRes.data.data.orders || [];
      const rxList = rxRes.data.data.prescriptions || [];
      const today = new Date().toDateString();
      const dispensedToday = orders.filter(o => o.status === 'dispatched' && new Date(o.updatedAt).toDateString() === today).length;

<<<<<<< HEAD
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
=======
      setStats({
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        toDispense: orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length,
        pendingRx: rxList.filter(p => p.status === 'pending').length,
        dispensedToday
      });
      setRecentOrders([...orders].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5));
    } catch (err) { console.error('Dashboard fetch error:', err); }
    finally { setLoading(false); }
>>>>>>> 8a0117a (Rebase and fixes functionality)
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
<<<<<<< HEAD
            <div className="stat-icon orange">
              <FiShoppingCart />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.pendingOrders}</div>
              <div className="stat-label">Pending Orders</div>
            </div>
=======
            <div className="stat-icon orange"><FiShoppingCart /></div>
            <div className="stat-details"><div className="stat-value">{stats.pendingOrders}</div><div className="stat-label">Pending Orders</div></div>
>>>>>>> 8a0117a (Rebase and fixes functionality)
          </div>
          <div className="stat-card">
<<<<<<< HEAD
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
=======
            <div className="stat-icon blue"><FiPackage /></div>
            <div className="stat-details"><div className="stat-value">{stats.toDispense}</div><div className="stat-label">Orders to Dispense</div></div>
>>>>>>> 8a0117a (Rebase and fixes functionality)
          </div>
          <div className="stat-card">
<<<<<<< HEAD
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
=======
            <div className="stat-icon red"><FiFileText /></div>
            <div className="stat-details"><div className="stat-value">{stats.pendingRx}</div><div className="stat-label">Pending Prescriptions</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><FiCheckCircle /></div>
            <div className="stat-details"><div className="stat-value">{stats.dispensedToday}</div><div className="stat-label">Dispensed Today</div></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <Link to="/pharmacist/orders" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: '#0a0a0a', borderRadius: '0.75rem', textDecoration: 'none', border: '1px solid #374151', transition: 'all 0.2s' }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#f97316,#ea580c)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><FiShoppingCart /></div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600, color: '#ffffff' }}>View Orders</div><div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Process & dispense</div></div>
            <FiArrowRight style={{ color: '#9ca3af' }} />
          </Link>
          <Link to="/pharmacist/prescriptions" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: '#0a0a0a', borderRadius: '0.75rem', textDecoration: 'none', border: '1px solid #374151', transition: 'all 0.2s' }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><FiFileText /></div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600, color: '#ffffff' }}>Review Prescriptions</div><div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Verify & approve</div></div>
            <FiArrowRight style={{ color: '#9ca3af' }} />
          </Link>
          <Link to="/pharmacist/patients" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: '#0a0a0a', borderRadius: '0.75rem', textDecoration: 'none', border: '1px solid #374151', transition: 'all 0.2s' }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#10b981,#059669)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><FiActivity /></div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600, color: '#ffffff' }}>View Patients</div><div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Manage records</div></div>
            <FiArrowRight style={{ color: '#9ca3af' }} />
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title"><FiClock style={{ marginRight: '0.5rem' }} />Recent Activity</h3>
            <Link to="/pharmacist/orders" style={{ fontSize: '0.875rem', color: '#f97316', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>View All <FiArrowRight size={14} /></Link>
          </div>
          <div className="card-body">
            {recentOrders.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Updated</th></tr></thead>
                  <tbody>
                    {recentOrders.map(o => (
                      <tr key={o._id}>
                        <td style={{ fontWeight: 600 }}>#{o.orderNumber}</td>
                        <td>{o.user?.name || 'N/A'}</td>
                        <td>{o.items?.length || 0} items</td>
                        <td style={{ fontWeight: 600 }}>₹{o.total?.toLocaleString()}</td>
                        <td><span className="status-badge" style={{ background: `${getStatusColor(o.status)}20`, color: getStatusColor(o.status) }}>{o.status}</span></td>
                        <td style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{new Date(o.updatedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-secondary text-center">No recent activity</p>}
>>>>>>> 8a0117a (Rebase and fixes functionality)
          </div>
        </div>
      </main>
    </div>
  );
};

export default PharmacistDashboard;
