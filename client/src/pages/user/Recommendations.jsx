import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { aiAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const Recommendations = () => {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => { fetchRecs(); }, []);

  const fetchRecs = async () => {
    try {
      setLoading(true);
      const res = await aiAPI.recommendations();
      setRecs(res.data.data?.recommendations || res.data.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="dashboard-layout no-top-nav">
      <Sidebar />
      <main className="dashboard-main" style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>AI <span style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Recommendations</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Personalized medicine suggestions</p>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}><div className="spinner" style={{ width: 48, height: 48 }} /></div>
        ) : recs.length === 0 ? (
          <div style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: 12 }}>No recommendations yet</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
            {recs.map(r => (
              <div key={r._id || r.id || r.name} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 12 }}>
                <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.image ? <img src={r.image} alt={r.name} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : '💊'}</div>
                <div style={{ fontWeight: 700 }}>{r.name}</div>
                <div style={{ color: 'var(--text-secondary)' }}>₹{r.price}</div>
                {r.reason && <div style={{ marginTop: 8, background: 'var(--bg-tertiary)', padding: '0.25rem 0.5rem', borderRadius: 8, fontSize: 12 }}>{r.reason}</div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="btn btn-primary" onClick={() => { addToCart(r, 1); toast.success('Added to cart'); }}>Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Recommendations;
