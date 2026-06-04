import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { homeMedicinesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const HomeMedicineCabinet = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [expiry, setExpiry] = useState('');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await homeMedicinesAPI.getAll();
      setItems(res.data.data?.items || res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load items');
    } finally { setLoading(false); }
  };

  const addItem = async (e) => {
    e.preventDefault();
    try {
      await homeMedicinesAPI.create({ name, quantity, expiry });
      setName(''); setQuantity(1); setExpiry('');
      fetchItems();
      toast.success('Added');
    } catch (err) { toast.error('Failed to add'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete medicine?')) return;
    try { await homeMedicinesAPI.delete(id); fetchItems(); toast.success('Deleted'); } catch (err) { toast.error('Failed'); }
  };

  const getExpiryColor = (d) => {
    if (!d) return 'text-gray-500';
    const exp = new Date(d);
    const now = new Date();
    if (exp < now) return 'text-red-500';
    const diff = (exp - now) / (1000 * 60 * 60 * 24);
    if (diff <= 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="dashboard-layout no-top-nav">
      <Sidebar />
      <main className="dashboard-main" style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Home <span style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Medicine Cabinet</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage medicines kept at home</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1rem' }}>
          <div>
            {loading ? (
              <div style={{ padding: '4rem', textAlign: 'center' }}><div className="spinner" style={{ width: 48, height: 48 }} /></div>
            ) : items.length === 0 ? (
              <div style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: 12 }}>No medicines added yet</div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {items.map(it => (
                  <div key={it._id} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{it.name}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>Qty: {it.quantity}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className={getExpiryColor(it.expiry)}>{it.expiry ? new Date(it.expiry).toLocaleDateString() : '-'}</div>
                      <button className="btn" onClick={() => remove(it._id)} style={{ marginTop: 8, background: 'var(--bg-tertiary)' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 12 }}>
            <form onSubmit={addItem}>
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>Name</label>
                <input value={name} onChange={e => setName(e.target.value)} required className="form-input" />
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>Quantity</label>
                <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min={1} className="form-input" />
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: 600 }}>Expiry Date</label>
                <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} className="form-input" />
              </div>
              <button className="btn btn-primary" type="submit">Add Medicine</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeMedicineCabinet;
