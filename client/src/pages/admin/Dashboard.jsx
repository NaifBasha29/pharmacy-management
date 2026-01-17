import { useState, useEffect } from 'react';
import { FiUsers, FiPackage, FiShoppingCart, FiDollarSign, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import { analyticsAPI, medicinesAPI, ordersAPI } from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, lowStockRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        ordersAPI.getAll({ limit: 5 }),
        medicinesAPI.getLowStock()
      ]);

      setStats(statsRes.data.data);
      setRecentOrders(ordersRes.data.data.orders);
      setLowStockItems(lowStockRes.data.data.medicines);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="loading-overlay">
            <div className="spinner" />
            <p>Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon green"><FiDollarSign /></div>
            <div className="stat-details">
              <div className="stat-value">₹{stats?.revenue?.today?.toLocaleString() || 0}</div>
              <div className="stat-label">Today's Revenue</div>
              {stats?.revenue?.growth && (
                <div className={`stat-change ${stats.revenue.growth > 0 ? 'positive' : 'negative'}`}>
                  <FiTrendingUp /> {stats.revenue.growth}% from last month
                </div>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue"><FiShoppingCart /></div>
            <div className="stat-details">
              <div className="stat-value">{stats?.orders?.today || 0}</div>
              <div className="stat-label">Today's Orders</div>
              <div className="stat-change">{stats?.orders?.pending || 0} pending</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange"><FiPackage /></div>
            <div className="stat-details">
              <div className="stat-value">{stats?.inventory?.total || 0}</div>
              <div className="stat-label">Total Medicines</div>
              <div className="stat-change negative">{stats?.inventory?.lowStock || 0} low stock</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red"><FiUsers /></div>
            <div className="stat-details">
              <div className="stat-value">{stats?.users?.total || 0}</div>
              <div className="stat-label">Total Customers</div>
              <div className="stat-change positive">+{stats?.users?.newThisMonth || 0} this month</div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="dashboard-grid">
          {/* Recent Orders */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Orders</h3>
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
                          <td>{order.orderNumber}</td>
                          <td>{order.user?.name || 'N/A'}</td>
                          <td>₹{order.total?.toLocaleString()}</td>
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
                <p className="text-secondary text-center">No recent orders</p>
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
                <p className="text-secondary text-center">All stock levels are healthy!</p>
              )}
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
