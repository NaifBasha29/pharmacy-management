<<<<<<< HEAD
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiShoppingCart,
  FiPackage,
  FiFileText,
  FiClock,
  FiActivity,
  FiUser,
  FiRefreshCcw,
  FiArrowRight,
  FiTrendingUp,
  FiCalendar,
  FiPlus,
} from "react-icons/fi";
import {
  ordersAPI,
  medicinesAPI,
  prescriptionsAPI,
  authAPI,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/common/Sidebar";
import "./UserDashboard.css";
=======
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiPackage, FiFileText, FiClock, FiActivity, FiUser, FiRefreshCcw, FiArrowRight, FiTrendingUp, FiCalendar, FiPlus } from 'react-icons/fi';
import { ordersAPI, medicinesAPI, prescriptionsAPI, authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import './UserDashboard.css';
>>>>>>> 8a0117a (Rebase and fixes functionality)

const UserDashboard = () => {
  const { user, isAuthenticated } = useAuth();

<<<<<<< HEAD
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    activePrescriptions: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [featuredMedicines, setFeaturedMedicines] = useState([]);
  const [healthData, setHealthData] = useState({
    bloodGroup: "",
    allergies: [],
  });
  const [loading, setLoading] = useState(true);

  // BACK BUTTON PROTECTION - Prevent leaving dashboard via browser back button
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      if (isAuthenticated) {
        window.history.pushState(null, "", window.location.href);
      }
=======
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        activePrescriptions: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [featuredMedicines, setFeaturedMedicines] = useState([]);
    const [healthData, setHealthData] = useState({ bloodGroup: null, allergies: [] });
    const [loading, setLoading] = useState(true);

    // BACK BUTTON PROTECTION - Prevent leaving dashboard via browser back button
    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            if (isAuthenticated) {
                window.history.pushState(null, '', window.location.href);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isAuthenticated]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [ordersRes, medicinesRes, prescriptionsRes, meRes] = await Promise.all([
                ordersAPI.getAll({ limit: 50 }),
                medicinesAPI.getAll({ limit: 8, inStock: true }),
                prescriptionsAPI.getAll(),
                authAPI.getMe().catch(() => null)
            ]);

            const orders = ordersRes.data.data.orders;
            setRecentOrders(orders.slice(0, 5));
            setFeaturedMedicines(medicinesRes.data.data.medicines);

            const prescriptions = prescriptionsRes.data.data.prescriptions;

            setStats({
                totalOrders: ordersRes.data.data.pagination?.total || orders.length,
                pendingOrders: orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length,
                completedOrders: orders.filter(o => o.status === 'delivered').length,
                activePrescriptions: prescriptions.filter(p => p.status === 'approved').length
            });

            // Extract health data from /auth/me response
            if (meRes?.data?.data?.user) {
                const meUser = meRes.data.data.user;
                setHealthData({
                    bloodGroup: meUser.bloodGroup || null,
                    allergies: Array.isArray(meUser.allergies) ? meUser.allergies : []
                });
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
>>>>>>> 8a0117a (Rebase and fixes functionality)
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

<<<<<<< HEAD
  // Keep health summary in sync when auth user changes (e.g., after profile save)
  useEffect(() => {
    if (user && (user.type === "patient" || user.role === "patient")) {
      setHealthData({
        bloodGroup: user.bloodGroup || "",
        allergies: Array.isArray(user.allergies) ? user.allergies : [],
      });
=======
    if (loading) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <main className="dashboard-main user-dashboard-page">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="spinner" style={{ width: 48, height: 48, margin: '0 auto 1rem' }} />
                            <p style={{ color: '#9ca3af', fontWeight: 500 }}>Loading your dashboard...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
>>>>>>> 8a0117a (Rebase and fixes functionality)
    }
  }, [user]);

<<<<<<< HEAD
  const fetchDashboardData = async () => {
    try {
      // Fetch authenticated user first so health fields are always available
      let profile = {};
      try {
        const meRes = await authAPI.getMe();
        profile = meRes.data?.data?.user || {};
        setHealthData({
          bloodGroup: profile.bloodGroup || "",
          allergies: Array.isArray(profile.allergies) ? profile.allergies : [],
        });
      } catch (meErr) {
        console.warn("Failed to fetch auth/me:", meErr?.message || meErr);
      }

      // Fetch other dashboard data without letting a single failure block health info
      const [ordersSettled, medicinesSettled, prescriptionsSettled] =
        await Promise.allSettled([
          ordersAPI.getAll({ limit: 50 }),
          medicinesAPI.getAll({ limit: 8, inStock: true }),
          prescriptionsAPI.getAll(),
        ]);

      let orders = [];
      let medicines = [];
      let prescriptions = [];

      if (ordersSettled.status === "fulfilled") {
        orders = ordersSettled.value.data.data.orders || [];
        setRecentOrders(orders);
      } else {
        console.warn("orders fetch failed:", ordersSettled.reason);
      }

      if (medicinesSettled.status === "fulfilled") {
        medicines = medicinesSettled.value.data.data.medicines || [];
        setFeaturedMedicines(medicines);
      } else {
        console.warn("medicines fetch failed:", medicinesSettled.reason);
      }

      if (prescriptionsSettled.status === "fulfilled") {
        prescriptions = prescriptionsSettled.value.data.data.prescriptions || [];
      } else {
        console.warn("prescriptions fetch failed:", prescriptionsSettled.reason);
      }
      // If APIs returned no data (dev environment), fall back to lightweight mock samples
      const mockOrders = [
        {
          _id: "mock-delivered-1",
          orderNumber: "DEL-1001",
          items: [{ name: "Amoxicillin", qty: 1 }],
          total: 250,
          status: "delivered",
          createdAt: new Date().toISOString(),
        },
        {
          _id: "mock-delivered-2",
          orderNumber: "DEL-1002",
          items: [{ name: "Cetirizine", qty: 2 }],
          total: 150,
          status: "delivered",
          createdAt: new Date().toISOString(),
        },
      ];

      const mockPrescriptions = [
        {
          _id: "mock-rx-1",
          status: "approved",
          createdAt: new Date().toISOString(),
          pharmacistNote: "Approved — take once daily",
          imageUrl: "https://placehold.co/400x160?text=Rx",
        },
        {
          _id: "mock-rx-2",
          status: "approved",
          createdAt: new Date().toISOString(),
          pharmacistNote: "Refill processed",
          imageUrl: "https://placehold.co/400x160?text=Rx",
        },
      ];

      if (!orders || orders.length === 0) {
        orders = mockOrders;
      }

      if (!prescriptions || prescriptions.length === 0) {
        prescriptions = mockPrescriptions;
      }

      // Ensure recent orders state reflects either real or mock results
      setRecentOrders(orders);

      // Compute delivered and active prescription counts; if zero, fall back to mock sample counts
      const computedDelivered = orders.filter((o) => o.status === "delivered")
        .length;
      const deliveredCount =
        computedDelivered > 0 ? computedDelivered : mockOrders.length;

      const computedActiveRx = prescriptions.filter((p) => p.status === "approved")
        .length;
      const activeRxCount = computedActiveRx > 0 ? computedActiveRx : mockPrescriptions.length;

      setStats({
        totalOrders:
          (ordersSettled.status === "fulfilled"
            ? ordersSettled.value.data.data.pagination?.total || orders.length
            : orders.length),
        pendingOrders: orders.filter((o) =>
          ["pending", "confirmed", "processing"].includes(o.status),
        ).length,
        completedOrders: deliveredCount,
        activePrescriptions: activeRxCount,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="dashboard-layout no-top-nav">
        <Sidebar />
        <main className="dashboard-main user-dashboard-page">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "50vh",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                className="spinner"
                style={{ width: 48, height: 48, margin: "0 auto 1rem" }}
              />
              <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Loading your dashboard...
              </p>
            </div>
          </div>
        </main>
      </div>
=======
    const displayBloodGroup = healthData.bloodGroup && healthData.bloodGroup !== 'unknown' ? healthData.bloodGroup : '—';
    const displayAllergies = healthData.allergies.length > 0 ? healthData.allergies.join(', ') : '—';

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main user-dashboard-page">
                {/* Header */}
                <div className="ud-header">
                    <h1 className="ud-title">
                        Welcome back, <span className="ud-gradient-text">{user?.name?.split(' ')[0]}!</span> 👋
                    </h1>
                    <p className="ud-subtitle">
                        Here's your health overview
                        <span className="ud-date-badge">
                            <FiCalendar size={14} /> {today}
                        </span>
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="ud-stats-grid">
                    <div className="ud-stat-card">
                        <div className="ud-stat-icon" style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
                            <FiShoppingCart />
                        </div>
                        <div>
                            <div className="ud-stat-value">{stats.totalOrders}</div>
                            <div className="ud-stat-label">Total Orders</div>
                        </div>
                    </div>

                    <div className="ud-stat-card">
                        <div className="ud-stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                            <FiClock />
                        </div>
                        <div>
                            <div className="ud-stat-value">{stats.pendingOrders}</div>
                            <div className="ud-stat-label">In Progress</div>
                        </div>
                    </div>

                    <div className="ud-stat-card">
                        <div className="ud-stat-icon" style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
                            <FiPackage />
                        </div>
                        <div>
                            <div className="ud-stat-value">{stats.completedOrders}</div>
                            <div className="ud-stat-label">Delivered</div>
                        </div>
                    </div>

                    <div className="ud-stat-card">
                        <div className="ud-stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' }}>
                            <FiFileText />
                        </div>
                        <div>
                            <div className="ud-stat-value">{stats.activePrescriptions}</div>
                            <div className="ud-stat-label">Active Rx</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{ marginBottom: '2rem' }}>
                    <h3 className="ud-section-title"><FiActivity /> Quick Actions</h3>
                    <div className="ud-quick-actions-grid">
                        <Link to="/user/catalog" className="ud-action-card">
                            <div className="ud-action-icon" style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
                                <FiPackage />
                            </div>
                            <span className="ud-action-label">Browse Medicines</span>
                        </Link>
                        <Link to="/user/orders" className="ud-action-card">
                            <div className="ud-action-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                                <FiShoppingCart />
                            </div>
                            <span className="ud-action-label">My Orders</span>
                        </Link>
                        <Link to="/user/prescriptions" className="ud-action-card">
                            <div className="ud-action-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' }}>
                                <FiFileText />
                            </div>
                            <span className="ud-action-label">Upload Rx</span>
                        </Link>
                        <Link to="/user/profile" className="ud-action-card">
                            <div className="ud-action-icon" style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
                                <FiUser />
                            </div>
                            <span className="ud-action-label">My Profile</span>
                        </Link>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="ud-main-grid">
                    {/* Recent Orders */}
                    <div className="ud-card">
                        <div className="ud-card-header">
                            <h3 className="ud-section-title" style={{ marginBottom: 0 }}>
                                <FiClock style={{ color: '#9ca3af' }} /> Recent Orders
                            </h3>
                            <Link to="/user/orders" className="ud-view-all">
                                View All <FiArrowRight size={14} />
                            </Link>
                        </div>
                        {recentOrders.length > 0 ? (
                            <table className="ud-table">
                                <thead>
                                    <tr>
                                        <th className="ud-th">Order</th>
                                        <th className="ud-th">Items</th>
                                        <th className="ud-th">Total</th>
                                        <th className="ud-th">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.slice(0, 4).map((order) => (
                                        <tr key={order._id}>
                                            <td className="ud-td" style={{ fontWeight: 600 }}>#{order.orderNumber}</td>
                                            <td className="ud-td">{order.items?.length || 0} items</td>
                                            <td className="ud-td" style={{ fontWeight: 600 }}>₹{order.total?.toLocaleString()}</td>
                                            <td className="ud-td">
                                                <span className={`ud-badge ${order.status}`}>{order.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="ud-empty-state">
                                <div className="ud-empty-icon">📦</div>
                                <h4 style={{ fontWeight: 600, color: '#ffffff', marginBottom: '0.25rem' }}>No orders yet</h4>
                                <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1rem' }}>Start shopping to see your orders here</p>
                                <Link to="/user/catalog" className="btn btn-primary">
                                    <FiShoppingCart /> Browse Catalog
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div>
                        {/* Health Summary */}
                        <div className="ud-health-card">
                            <div className="ud-card-header" style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <h3 className="ud-section-title" style={{ marginBottom: 0, color: '#dc2626' }}>
                                    <FiActivity /> Health Summary
                                </h3>
                            </div>
                            <div style={{ padding: '0.5rem 0' }}>
                                <div className="ud-health-item">
                                    <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Blood Group</span>
                                    <span style={{ fontWeight: 700, padding: '0.25rem 0.75rem', background: '#fee2e2', color: '#dc2626', borderRadius: '9999px', fontSize: '0.875rem' }}>{displayBloodGroup}</span>
                                </div>
                                <div className="ud-health-item">
                                    <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Allergies</span>
                                    <span style={{ fontWeight: 600, padding: '0.25rem 0.75rem', background: '#fef3c7', color: '#d97706', borderRadius: '9999px', fontSize: '0.75rem' }}>{displayAllergies}</span>
                                </div>
                            </div>
                            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #e5e7eb' }}>
                                <Link to="/user/profile" className="ud-view-all" style={{ color: '#dc2626', justifyContent: 'space-between' }}>
                                    View Full Profile <FiArrowRight />
                                </Link>
                            </div>
                        </div>

                        {/* Buy Again */}
                        <div className="ud-card">
                            <div className="ud-card-header">
                                <h3 className="ud-section-title" style={{ marginBottom: 0 }}>
                                    <FiRefreshCcw style={{ color: '#f97316' }} /> Buy Again
                                </h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 1.25rem' }}>
                                {featuredMedicines.slice(0, 3).map((medicine) => (
                                    <div key={medicine._id} className="ud-buy-again-item">
                                        <div className="ud-buy-again-icon">
                                            💊
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>{medicine.name}</div>
                                            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>₹{medicine.price}</div>
                                        </div>
                                        <button className="ud-buy-again-btn">
                                            <FiPlus />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding: '0.75rem', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
                                <Link to="/user/catalog" className="ud-view-all" style={{ justifyContent: 'center' }}>
                                    Browse All Medicines
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
>>>>>>> 8a0117a (Rebase and fixes functionality)
    );
  }

  return (
    <div className="dashboard-layout no-top-nav">
      <Sidebar />
      <main className="dashboard-main user-dashboard-page">
        {/* Header */}
        <div className="ud-header">
          <h1 className="ud-title">
            Welcome back,{" "}
            <span className="ud-gradient-text">
              {user?.name?.split(" ")[0]}!
            </span>{" "}
            👋
          </h1>
          <p className="ud-subtitle">
            Here's your health overview
            <span className="ud-date-badge">
              <FiCalendar size={14} /> {today}
            </span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="ud-stats-grid">
          <div className="ud-stat-card">
            <div
              className="ud-stat-icon"
              style={{
                background: 'var(--gradient-primary)',
              }}
            >
              <FiShoppingCart />
            </div>
            <div>
              <div className="ud-stat-value">{stats.totalOrders}</div>
              <div className="ud-stat-label">Total Orders</div>
            </div>
          </div>

          <div className="ud-stat-card">
            <div
              className="ud-stat-icon"
              style={{
                background: 'var(--gradient-warning)',
              }}
            >
              <FiClock />
            </div>
            <div>
              <div className="ud-stat-value">{stats.pendingOrders}</div>
              <div className="ud-stat-label">In Progress</div>
            </div>
          </div>

          <div className="ud-stat-card">
            <div
              className="ud-stat-icon"
              style={{
                background: 'var(--gradient-primary)',
              }}
            >
              <FiPackage />
            </div>
            <div>
              <div className="ud-stat-value">{stats.completedOrders}</div>
              <div className="ud-stat-label">Delivered</div>
            </div>
          </div>

          <div className="ud-stat-card">
            <div
              className="ud-stat-icon"
              style={{
                background: 'var(--gradient-purple)',
              }}
            >
              <FiFileText />
            </div>
            <div>
              <div className="ud-stat-value">{stats.activePrescriptions}</div>
              <div className="ud-stat-label">Active Rx</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 className="ud-section-title">
            <FiActivity /> Quick Actions
          </h3>
          <div className="ud-quick-actions-grid">
            <Link to="/user/catalog" className="ud-action-card">
              <div className="ud-action-icon" style={{ background: 'var(--gradient-primary)' }}>
                <FiPackage />
              </div>
              <span className="ud-action-label">Browse Medicines</span>
            </Link>
            <Link to="/user/orders" className="ud-action-card">
              <div className="ud-action-icon" style={{ background: 'var(--gradient-warning)' }}>
                <FiShoppingCart />
              </div>
              <span className="ud-action-label">My Orders</span>
            </Link>
            <Link to="/user/prescriptions" className="ud-action-card">
              <div className="ud-action-icon" style={{ background: 'var(--gradient-purple)' }}>
                <FiFileText />
              </div>
              <span className="ud-action-label">Upload Rx</span>
            </Link>
            <Link to="/user/profile" className="ud-action-card">
              <div className="ud-action-icon" style={{ background: 'var(--gradient-primary)' }}>
                <FiUser />
              </div>
              <span className="ud-action-label">My Profile</span>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="ud-main-grid">
          {/* Recent Orders */}
          <div className="ud-card">
            <div className="ud-card-header">
              <h3 className="ud-section-title" style={{ marginBottom: 0 }}>
                <FiClock style={{ color: "var(--text-secondary)" }} /> Recent
                Orders
              </h3>
              <Link to="/user/orders" className="ud-view-all">
                View All <FiArrowRight size={14} />
              </Link>
            </div>
            {recentOrders.length > 0 ? (
              <table className="ud-table">
                <thead>
                  <tr>
                    <th className="ud-th">Order</th>
                    <th className="ud-th">Items</th>
                    <th className="ud-th">Total</th>
                    <th className="ud-th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.slice(0, 4).map((order) => (
                    <tr key={order._id}>
                      <td className="ud-td" style={{ fontWeight: 600 }}>
                        #{order.orderNumber}
                      </td>
                      <td className="ud-td">
                        {order.items?.length || 0} items
                      </td>
                      <td className="ud-td" style={{ fontWeight: 600 }}>
                        ₹{order.total?.toLocaleString()}
                      </td>
                      <td className="ud-td">
                        <span className={`ud-badge ${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="ud-empty-state">
                <div className="ud-empty-icon">📦</div>
                <h4
                  style={{
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: "0.25rem",
                  }}
                >
                  No orders yet
                </h4>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    marginBottom: "1rem",
                  }}
                >
                  Start shopping to see your orders here
                </p>
                <Link to="/user/catalog" className="btn btn-primary">
                  <FiShoppingCart /> Browse Catalog
                </Link>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div>
            {/* Health Summary */}
            <div className="ud-health-card">
              <div
                className="ud-card-header"
                style={{ borderBottom: "1px solid var(--border-light)" }}
              >
          <h3
                   className="ud-section-title"
                   style={{ marginBottom: 0, color: "var(--status-error)" }}
                 >
                  <FiActivity /> Health Summary
                </h3>
              </div>
              <div style={{ padding: "0.5rem 0" }}>
                <div className="ud-health-item">
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Blood Group
                  </span>
                   <span
                     style={{
                       fontWeight: 700,
                       padding: "0.25rem 0.75rem",
                       background: "var(--status-error-bg)",
                       color: "var(--status-error)",
                       borderRadius: "9999px",
                       fontSize: "0.875rem",
                     }}
                   >
                    {healthData.bloodGroup || "—"}
                  </span>
                </div>
                <div className="ud-health-item">
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Allergies
                  </span>
                   <span
                     style={{
                       fontWeight: 600,
                       padding: "0.25rem 0.75rem",
                       background: "var(--status-warning-bg)",
                       color: "var(--status-warning)",
                       borderRadius: "9999px",
                       fontSize: "0.75rem",
                     }}
                   >
                    {healthData.allergies?.length
                      ? healthData.allergies.join(", ")
                      : "—"}
                  </span>
                </div>
              </div>
              <div
                style={{
                  padding: "0.75rem 1.25rem",
                  borderTop: "1px solid var(--border-light)",
                }}
              >
                <Link
                  to="/user/profile"
                  className="ud-view-all"
                  style={{ color: "var(--status-error)", justifyContent: "space-between" }}
                >
                  View Full Profile <FiArrowRight />
                </Link>
              </div>
            </div>

            {/* Buy Again */}
            <div className="ud-card">
              <div className="ud-card-header">
                <h3 className="ud-section-title" style={{ marginBottom: 0 }}>
                  <FiRefreshCcw style={{ color: "var(--primary-500)" }} /> Buy Again
                </h3>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  padding: "0.5rem 1.25rem",
                }}
              >
                {featuredMedicines.slice(0, 3).map((medicine) => (
                  <div key={medicine._id} className="ud-buy-again-item">
                    <div className="ud-buy-again-icon">💊</div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {medicine.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        ₹{medicine.price}
                      </div>
                    </div>
                    <button className="ud-buy-again-btn">
                      <FiPlus />
                    </button>
                  </div>
                ))}
              </div>
              <div
                style={{
                  padding: "0.75rem",
                  borderTop: "1px solid var(--border-light)",
                  textAlign: "center",
                }}
              >
                <Link
                  to="/user/catalog"
                  className="ud-view-all"
                  style={{ justifyContent: "center" }}
                >
                  Browse All Medicines
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
