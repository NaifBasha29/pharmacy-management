import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers, FiPackage, FiShoppingCart, FiDollarSign, FiTrendingUp,
  FiAlertCircle, FiActivity, FiCheckCircle, FiClock, FiArrowRight,
  FiHeart, FiClipboard, FiShield, FiDatabase
} from 'react-icons/fi';
import { analyticsAPI, medicinesAPI, ordersAPI, usersAPI } from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, lowStockRes, usersRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        ordersAPI.getAll({ limit: 5 }),
        medicinesAPI.getLowStock(),
        usersAPI.getAll({ limit: 5, sort: '-createdAt' })
      ]);

      setStats(statsRes.data.data);
      setRecentOrders(ordersRes.data.data.orders || []);
      setLowStockItems(lowStockRes.data.data.medicines || []);
      setRecentUsers(usersRes.data.data.users || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="full-page-loading">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Super Admin Dashboard</h1>
            <p>Platform overview and system health monitoring</p>
          </div>
          <div className="header-actions">
            <span className="system-status online">
              <FiCheckCircle /> System Online
            </span>
          </div>
        </div>

        {/* Primary Stats Grid */}
        <div className="stats-grid primary">
          <div className="stat-card revenue">
            <div className="stat-icon"><FiDollarSign /></div>
            <div className="stat-details">
              <div className="stat-value">₹{stats?.revenue?.today?.toLocaleString() || 0}</div>
              <div className="stat-label">Today's Revenue</div>
              {stats?.revenue?.growth && (
                <div className={`stat-change ${stats.revenue.growth > 0 ? 'positive' : 'negative'}`}>
                  <FiTrendingUp /> {stats.revenue.growth}% vs last month
                </div>
              )}
            </div>
          </div>

          <div className="stat-card orders">
            <div className="stat-icon"><FiShoppingCart /></div>
            <div className="stat-details">
              <div className="stat-value">{stats?.orders?.today || 0}</div>
              <div className="stat-label">Today's Orders</div>
              <div className="stat-change">{stats?.orders?.pending || 0} pending</div>
            </div>
          </div>

          <div className="stat-card inventory">
            <div className="stat-icon"><FiPackage /></div>
            <div className="stat-details">
              <div className="stat-value">{stats?.inventory?.total || 0}</div>
              <div className="stat-label">Total Medicines</div>
              <div className="stat-change warning">{stats?.inventory?.lowStock || 0} low stock</div>
            </div>
          </div>

          <div className="stat-card users">
            <div className="stat-icon"><FiUsers /></div>
            <div className="stat-details">
              <div className="stat-value">{stats?.users?.total || 0}</div>
              <div className="stat-label">Total Users</div>
              <div className="stat-change positive">+{stats?.users?.newThisMonth || 0} this month</div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="stats-grid secondary">
          <div className="mini-stat">
            <FiHeart className="mini-icon clinics" />
            <div className="mini-content">
              <span className="mini-value">1</span>
              <span className="mini-label">Active Clinics</span>
            </div>
          </div>
          <div className="mini-stat">
            <FiClipboard className="mini-icon prescriptions" />
            <div className="mini-content">
              <span className="mini-value">{stats?.prescriptions?.total || 0}</span>
              <span className="mini-label">Prescriptions</span>
            </div>
          </div>
          <div className="mini-stat">
            <FiShield className="mini-icon compliance" />
            <div className="mini-content">
              <span className="mini-value">98%</span>
              <span className="mini-label">Compliance Score</span>
            </div>
          </div>
          <div className="mini-stat">
            <FiDatabase className="mini-icon system" />
            <div className="mini-content">
              <span className="mini-value">99.9%</span>
              <span className="mini-label">Uptime</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-cards">
            <Link to="/admin/clinics" className="action-card">
              <FiHeart className="action-icon" />
              <span>Manage Clinics</span>
              <FiArrowRight className="arrow" />
            </Link>
            <Link to="/admin/users" className="action-card">
              <FiUsers className="action-icon" />
              <span>User Management</span>
              <FiArrowRight className="arrow" />
            </Link>
            <Link to="/admin/inventory" className="action-card">
              <FiPackage className="action-icon" />
              <span>Inventory Overview</span>
              <FiArrowRight className="arrow" />
            </Link>
            <Link to="/admin/reports" className="action-card">
              <FiActivity className="action-icon" />
              <span>View Reports</span>
              <FiArrowRight className="arrow" />
            </Link>
          </div>
        </div>

        {/* Content Grid */}
        <div className="dashboard-grid">
          {/* Recent Orders */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <FiShoppingCart /> Recent Orders
              </h3>
              <Link to="/admin/orders" className="card-link">View All</Link>
            </div>
            <div className="card-body">
              {recentOrders.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="order-id">{order.orderNumber}</td>
                          <td>{order.user?.name || 'N/A'}</td>
                          <td className="amount">₹{order.total?.toLocaleString()}</td>
                          <td>
                            <span className={`badge badge-${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="empty-state">No recent orders</p>
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <FiAlertCircle className="text-warning" /> Low Stock Alerts
              </h3>
              <Link to="/admin/inventory" className="card-link">Manage Stock</Link>
            </div>
            <div className="card-body">
              {lowStockItems.length > 0 ? (
                <div className="alert-list">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <div key={item._id} className="alert-item">
                      <div className="alert-info">
                        <span className="alert-name">{item.name}</span>
                        <span className="alert-category">{item.category?.name}</span>
                      </div>
                      <div className="alert-stock">
                        <span className={`stock-badge ${item.stock === 0 ? 'out' : 'low'}`}>
                          {item.stock} left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state success">
                  <FiCheckCircle /> All stock levels are healthy!
                </p>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <FiUsers /> Recent Users
              </h3>
              <Link to="/admin/users" className="card-link">View All</Link>
            </div>
            <div className="card-body">
              {recentUsers.length > 0 ? (
                <div className="user-list">
                  {recentUsers.map((user) => (
                    <div key={user._id} className="user-item">
                      <div className="user-avatar">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                      <span className={`role-badge ${user.role}`}>{user.role}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No users found</p>
              )}
            </div>
          </div>

          {/* System Health */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <FiActivity /> System Health
              </h3>
            </div>
            <div className="card-body">
              <div className="health-metrics">
                <div className="health-item">
                  <span className="health-label">Database</span>
                  <div className="health-bar">
                    <div className="health-fill" style={{ width: '95%' }}></div>
                  </div>
                  <span className="health-value">Connected</span>
                </div>
                <div className="health-item">
                  <span className="health-label">API Response</span>
                  <div className="health-bar">
                    <div className="health-fill" style={{ width: '98%' }}></div>
                  </div>
                  <span className="health-value">45ms</span>
                </div>
                <div className="health-item">
                  <span className="health-label">Server Load</span>
                  <div className="health-bar">
                    <div className="health-fill warning" style={{ width: '65%' }}></div>
                  </div>
                  <span className="health-value">65%</span>
                </div>
                <div className="health-item">
                  <span className="health-label">Storage</span>
                  <div className="health-bar">
                    <div className="health-fill" style={{ width: '42%' }}></div>
                  </div>
                  <span className="health-value">42%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'delivered': return 'success';
    case 'pending': return 'warning';
    case 'cancelled': return 'error';
    case 'processing':
    case 'dispatched': return 'info';
    default: return 'neutral';
  }
};

export default AdminDashboard;
