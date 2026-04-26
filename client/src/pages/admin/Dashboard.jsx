import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronRight, FiGrid, FiAlertTriangle, FiPackage, FiUsers, FiShoppingCart, FiActivity, FiRefreshCw } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import TopNav from '../../components/common/TopNav';
import Sidebar from '../../components/common/Sidebar';
import { useBackButtonProtection, useNoCacheHeaders, useSessionTimeout } from '../../hooks/useSecurityHooks';
import './Dashboard.css';

const AdminDashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Security hooks
  useBackButtonProtection();
  useNoCacheHeaders();
  useSessionTimeout(30 * 60 * 1000); // 30 minute timeout

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await adminAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching stats:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      // Handle session expiry
      if (err.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Prevent back navigation after logout
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const h = () => { if (isAuthenticated) window.history.pushState(null, '', window.location.href); };
    window.addEventListener('popstate', h);
    return () => window.removeEventListener('popstate', h);
  }, [isAuthenticated]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="loader-wrap">
        <div className="loader"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <TopNav />
          <div className="error-state" style={{ padding: '2rem', textAlign: 'center' }}>
            <FiAlertTriangle size={48} />
            <h2>Failed to Load Dashboard</h2>
            <p>{error}</p>
            <button onClick={handleRefresh} className="retry-btn">
              <FiRefreshCw /> Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Stat cards configuration
  const statCards = [
    {
      value: stats?.clinics?.total || 0,
      label: 'Clinics',
      icon: <FiActivity />,
      color: '#f97316',
      link: '/admin/clinics'
    },
    {
      value: stats?.users?.total || 0,
      label: 'Users',
      icon: <FiUsers />,
      color: '#f97316',
      link: '/admin/users'
    },
    {
      value: stats?.medicines?.total || 0,
      label: 'Medicines',
      icon: <FiPackage />,
      color: '#8b5cf6',
      link: '/admin/inventory'
    },
    {
      value: stats?.orders?.total || 0,
      label: 'Orders',
      icon: <FiShoppingCart />,
      color: '#f59e0b',
      link: '/admin/orders'
    },
    {
      value: stats?.orders?.pending || 0,
      label: 'Pending',
      icon: <FiAlertTriangle />,
      color: '#ef4444',
      link: '/admin/orders?status=pending'
    },
    {
      value: `₹${(stats?.orders?.totalRevenue || 0).toLocaleString()}`,
      label: 'Revenue',
      icon: <FiActivity />,
      color: '#06b6d4',
      link: '/admin/reports'
    }
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <TopNav />
        <div className="dash-header">
          <h1 className="welcome">Welcome, {user?.name || 'Super Admin'}!</h1>
          <button onClick={handleRefresh} className={`refresh-btn ${refreshing ? 'spinning' : ''}`}>
            <FiRefreshCw /> Refresh
          </button>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          {statCards.map((s, i) => (
            <Link to={s.link} key={i} className="stat-box" style={{ '--accent-color': s.color }}>
              <div className="stat-icon" style={{ background: s.color }}>
                {s.icon}
              </div>
              <div className="stat-content">
                <span className="stat-val">{s.value.toLocaleString?.() || s.value}</span>
                <span className="stat-lbl">{s.label}</span>
              </div>
              <FiChevronRight className="stat-arrow" />
            </Link>
          ))}
        </div>

        {/* Dashboard Grid */}
        <div className="dash-grid">
          {/* Left Column */}
          <div className="col-l">
            {/* Low Stock Medicines */}
            <div className="box">
              <div className="box-head">
                <span className="box-title">
                  <FiAlertTriangle className="title-icon warning" /> Low Stock Medicines
                </span>
                <Link to="/admin/inventory?filter=low-stock" className="manage-btn">View All →</Link>
              </div>
              <div className="box-body">
                {stats?.lowStockMedicines?.length > 0 ? (
                  <div className="alert-list">
                    {stats.lowStockMedicines.map((m, i) => (
                      <div key={i} className="alert-item">
                        <div className="alert-dot" style={{ background: m.percentage < 30 ? '#ef4444' : '#f59e0b' }}></div>
                        <div className="alert-info">
                          <span className="alert-name">{m.name}</span>
                          <span className="alert-meta">{m.stock} / {m.minStock} units</span>
                        </div>
                        <div className="alert-badge" style={{
                          background: m.percentage < 30 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          color: m.percentage < 30 ? '#ef4444' : '#f59e0b'
                        }}>
                          {m.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FiPackage size={32} />
                    <p>All medicines are well stocked</p>
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="box">
              <div className="box-head">
                <span className="box-title">Revenue Overview (Last 7 Days)</span>
                <Link to="/admin/reports" className="manage-btn">Full Report →</Link>
              </div>
              <div className="box-body chart-area">
                {stats?.revenueChart?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={stats.revenueChart}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                      <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-light)',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#f97316"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state">
                    <FiActivity size={32} />
                    <p>No revenue data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-r">
            {/* Expiring Medicines */}
            <div className="box">
              <div className="box-head">
                <span className="box-title">
                  <FiAlertTriangle className="title-icon danger" /> Expiring Soon
                </span>
                <Link to="/admin/inventory?filter=expiring" className="manage-btn">View All →</Link>
              </div>
              <div className="box-body">
                {stats?.expiringMedicines?.length > 0 ? (
                  <div className="expiry-list">
                    {stats.expiringMedicines.map((m, i) => (
                      <div key={i} className="expiry-item">
                        <div className="expiry-dot" style={{
                          background: m.daysUntilExpiry <= 7 ? '#ef4444' :
                            m.daysUntilExpiry <= 14 ? '#f59e0b' : '#f97316'
                        }}></div>
                        <div className="expiry-info">
                          <span className="expiry-name">{m.name}</span>
                          <span className="expiry-stock">{m.stock} units</span>
                        </div>
                        <div className="expiry-days" style={{
                          color: m.daysUntilExpiry <= 7 ? '#ef4444' :
                            m.daysUntilExpiry <= 14 ? '#f59e0b' : '#f97316'
                        }}>
                          {m.daysUntilExpiry} days
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FiPackage size={32} />
                    <p>No medicines expiring soon</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="box">
              <div className="box-head">
                <span className="box-title">System Overview</span>
              </div>
              <div className="box-body">
                <div className="quick-stats">
                  <div className="quick-stat">
                    <span className="qs-label">Active Clinics</span>
                    <span className="qs-value" style={{ color: '#f97316' }}>{stats?.clinics?.active || 0}</span>
                  </div>
                  <div className="quick-stat">
                    <span className="qs-label">Pending Clinics</span>
                    <span className="qs-value" style={{ color: '#f59e0b' }}>{stats?.clinics?.pending || 0}</span>
                  </div>
                  <div className="quick-stat">
                    <span className="qs-label">Pharmacists</span>
                    <span className="qs-value" style={{ color: '#f97316' }}>{stats?.users?.pharmacists || 0}</span>
                  </div>
                  <div className="quick-stat">
                    <span className="qs-label">Patients</span>
                    <span className="qs-value" style={{ color: '#8b5cf6' }}>{stats?.users?.patients || 0}</span>
                  </div>
                  <div className="quick-stat">
                    <span className="qs-label">Low Stock Items</span>
                    <span className="qs-value" style={{ color: '#ef4444' }}>{stats?.medicines?.lowStock || 0}</span>
                  </div>
                  <div className="quick-stat">
                    <span className="qs-label">Today's Orders</span>
                    <span className="qs-value" style={{ color: '#06b6d4' }}>{stats?.orders?.today || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;




