import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './ClinicDashboard.css';

const ClinicOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await ordersAPI.getAll({ limit: 50 });
        setOrders(res.data.data.orders || []);
      } catch (err) {
        console.error('Failed to load orders', err);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="clinic-dashboard">
      <aside className="clinic-sidebar">
        <Sidebar />
      </aside>
      <main className="clinic-main">
        <header className="clinic-header">
          <h1>Orders</h1>
          <p>Recent orders and fulfillment</p>
        </header>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Orders</h3></div>
          <div className="card-body">
            {loading ? <p>Loading...</p> : (
              <table className="table">
                <thead><tr><th>Order ID</th><th>Patient</th><th>Status</th><th>Total</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}><td>{o._id}</td><td>{o.patient?.name || o.user?.name}</td><td>{o.status}</td><td>₹{o.total}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClinicOrders;
