import { useState, useEffect } from 'react';
import { FiShoppingCart, FiPackage, FiFileText, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { ordersAPI, medicinesAPI, prescriptionsAPI } from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import '../admin/Dashboard.css';

const PharmacistDashboard = () => {
  const [stats, setStats] = useState({
    pendingOrders: 0,
    pendingPrescriptions: 0,
    lowStockCount: 0,
    todayDispensed: 0
  });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, prescriptionsRes, lowStockRes] = await Promise.all([
        ordersAPI.getAll({ status: 'pending', limit: 10 }),
        prescriptionsAPI.getAll({ status: 'pending', limit: 5 }),
        medicinesAPI.getLowStock()
      ]);

      setPendingOrders(ordersRes.data.data.orders);
      setLowStockItems(lowStockRes.data.data.medicines);
      
      setStats({
        pendingOrders: ordersRes.data.data.pagination?.total || ordersRes.data.data.orders.length,
        pendingPrescriptions: prescriptionsRes.data.data.pagination?.total || 0,
        lowStockCount: lowStockRes.data.data.count || 0,
        todayDispensed: 0
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
          <h1>Pharmacist Dashboard</h1>
          <p>Manage orders, prescriptions, and inventory</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon orange"><FiShoppingCart /></div>
            <div className="stat-details">
              <div className="stat-value">{stats.pendingOrders}</div>
              <div className="stat-label">Pending Orders</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue"><FiFileText /></div>
            <div className="stat-details">
              <div className="stat-value">{stats.pendingPrescriptions}</div>
              <div className="stat-label">Pending Prescriptions</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red"><FiAlertCircle /></div>
            <div className="stat-details">
              <div className="stat-value">{stats.lowStockCount}</div>
              <div className="stat-label">Low Stock Items</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green"><FiCheckCircle /></div>
            <div className="stat-details">
              <div className="stat-value">{stats.todayDispensed}</div>
              <div className="stat-label">Dispensed Today</div>
            </div>
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
                          <td>{order.user?.name || 'N/A'}</td>
                          <td>{order.items?.length || 0} items</td>
                          <td>
                            <span className="badge badge-warning">{order.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-secondary text-center">No pending orders! 🎉</p>
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

export default PharmacistDashboard;
