import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiPackage, FiFileText, FiClock } from 'react-icons/fi';
import { ordersAPI, medicinesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import '../admin/Dashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [featuredMedicines, setFeaturedMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, medicinesRes] = await Promise.all([
        ordersAPI.getAll({ limit: 5 }),
        medicinesAPI.getAll({ limit: 8, inStock: true })
      ]);

      const orders = ordersRes.data.data.orders;
      setRecentOrders(orders);
      setFeaturedMedicines(medicinesRes.data.data.medicines);
      
      setStats({
        totalOrders: ordersRes.data.data.pagination?.total || orders.length,
        pendingOrders: orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length,
        completedOrders: orders.filter(o => o.status === 'delivered').length
      });
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
          <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Browse medicines and track your orders</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue"><FiShoppingCart /></div>
            <div className="stat-details">
              <div className="stat-value">{stats.totalOrders}</div>
              <div className="stat-label">Total Orders</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange"><FiClock /></div>
            <div className="stat-details">
              <div className="stat-value">{stats.pendingOrders}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green"><FiPackage /></div>
            <div className="stat-details">
              <div className="stat-value">{stats.completedOrders}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red"><FiFileText /></div>
            <div className="stat-details">
              <div className="stat-value">0</div>
              <div className="stat-label">Prescriptions</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="quick-actions">
              <Link to="/user/catalog" className="btn btn-primary">
                <FiPackage /> Browse Medicines
              </Link>
              <Link to="/user/orders" className="btn btn-secondary">
                <FiShoppingCart /> My Orders
              </Link>
              <Link to="/user/prescriptions" className="btn btn-secondary">
                <FiFileText /> Upload Prescription
              </Link>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="dashboard-grid">
          {/* Recent Orders */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Orders</h3>
              <Link to="/user/orders" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            <div className="card-body">
              {recentOrders.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Items</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>{order.orderNumber}</td>
                          <td>{order.items?.length || 0} items</td>
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
                <div className="text-center">
                  <p className="text-secondary mb-4">No orders yet</p>
                  <Link to="/user/catalog" className="btn btn-primary">Start Shopping</Link>
                </div>
              )}
            </div>
          </div>

          {/* Featured Medicines */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Popular Medicines</h3>
              <Link to="/user/catalog" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            <div className="card-body">
              <div className="medicine-grid">
                {featuredMedicines.slice(0, 4).map((medicine) => (
                  <div key={medicine._id} className="medicine-mini-card">
                    <div className="medicine-info">
                      <span className="medicine-name">{medicine.name}</span>
                      <span className="medicine-category">{medicine.category?.name}</span>
                    </div>
                    <div className="medicine-price">₹{medicine.price}</div>
                  </div>
                ))}
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

export default UserDashboard;
