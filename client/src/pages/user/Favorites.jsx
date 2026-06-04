import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { favoritesAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => { fetchFavorites(); }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await favoritesAPI.getAll();
      setFavorites(res.data.data?.favorites || res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    try {
      await favoritesAPI.remove(id);
      toast.success('Removed');
      fetchFavorites();
    } catch (err) { toast.error('Failed'); }
  };

  const handleAdd = (medicine) => { addToCart(medicine, 1); toast.success('Added to cart'); };

  return (
    <div className="dashboard-layout no-top-nav">
      <Sidebar />
      <main className="dashboard-main" style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My <span style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Favorites</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Medicines you saved for later</p>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}><div className="spinner" style={{ width: 48, height: 48 }} /></div>
        ) : favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: 12 }}>
            <div style={{ fontSize: '3rem' }}>💖</div>
            <h3 style={{ fontWeight: 700 }}>No favorites yet</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Save medicines you like. <Link to="/user/catalog">Browse medicines</Link></p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
            {favorites.map(f => {
              const med = f.medicine || f;
              return (
                <div key={med._id} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1rem' }}>
                  <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{med.image ? <img src={med.image} alt={med.name} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : '💊'}</div>
                  <div style={{ fontWeight: 700 }}>{med.name}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>₹{med.price}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button className="btn btn-primary" onClick={() => handleAdd(med)}>Add to Cart</button>
                    <button className="btn" onClick={() => remove(med._id)} style={{ background: 'var(--bg-tertiary)' }}>Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites;
