import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { ordersAPI, API_HOST } from '../../services/api';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchOrder(); }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await ordersAPI.getById(id);
      setOrder(res.data.data.order || res.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await ordersAPI.cancel(id);
      toast.success('Order cancelled');
      fetchOrder();
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  const resolveImage = (img) => {
    if (!img) return null;
    if (/^https?:\/\//i.test(img)) return img;
    const path = img.startsWith('/') ? img : `/${img}`;
    return `${API_HOST}${path}`;
  };

  return (
    <div className="dashboard-layout no-top-nav">
      <Sidebar />
      <main className="dashboard-main" style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}><div className="spinner" style={{ width: 48, height: 48, margin: '0 auto' }} /></div>
        ) : error ? (
          <div className="auth-error">{error}</div>
        ) : order ? (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>Order #{order.orderNumber || order._id}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{new Date(order.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-tertiary)', borderRadius: 999 }}>{order.status}</div>
                {order.status === 'pending' && <button className="btn" onClick={handleCancel} style={{ background: '#fee2e2', color: '#dc2626' }}>Cancel Order</button>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Items</h4>
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: 8, padding: '1rem' }}>
                  {order.items?.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: idx === order.items.length - 1 ? 'none' : '1px dashed var(--border-light)' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{it.medicine?.name}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>Qty: {it.quantity} × ₹{it.price}</div>
                      </div>
                      <div style={{ fontWeight: 700 }}>₹{(it.quantity * it.price).toLocaleString()}</div>
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid var(--border-light)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total</div>
                    <div style={{ fontWeight: 900 }}>₹{order.total?.toLocaleString()}</div>
                  </div>
                </div>

                {order.deliveryAddress && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ fontWeight: 700 }}>Delivery Address</h4>
                    <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 8 }}>{order.deliveryAddress}</div>
                  </div>
                )}
              </div>

              <div>
                {order.prescription && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontWeight: 700 }}>Prescription</h4>
                    <img src={resolveImage(order.prescription)} alt="Prescription" style={{ width: '100%', borderRadius: 8 }} />
                  </div>
                )}

                <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 8 }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Order Info</div>
                  <div style={{ color: 'var(--text-secondary)' }}>Payment method: {order.paymentMethod || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>No order found</div>
        )}
      </main>
    </div>
  );
};

export default OrderDetail;
