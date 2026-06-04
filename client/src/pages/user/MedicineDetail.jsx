import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { medicinesAPI, favoritesAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const MedicineDetail = () => {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => { fetchMedicine(); }, [id]);

  const fetchMedicine = async () => {
    try {
      setLoading(true);
      const res = await medicinesAPI.getById(id);
      setMedicine(res.data.data.medicine || res.data.data);

      // Check favorites
      try {
        const favRes = await favoritesAPI.getAll();
        const favs = favRes.data.data?.favorites || favRes.data.data || [];
        setIsFavorite(favs.some(f => f._id === id || f.medicine?._id === id));
      } catch (err) {
        // ignore favorites errors
      }

      // Related medicines by category
      const categoryId = res.data.data.medicine?.category?._id || res.data.data.medicine?.category || res.data.data.medicine?.categoryId;
      if (categoryId) {
        const relatedRes = await medicinesAPI.getAll({ category: categoryId, limit: 4 });
        setRelated(relatedRes.data.data.medicines || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load medicine');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(medicine, 1);
    toast.success('Added to cart');
  };

  const toggleFavorite = async () => {
    try {
      if (!isFavorite) {
        await favoritesAPI.add({ medicineId: medicine._id });
        setIsFavorite(true);
        toast.success('Added to favorites');
      } else {
        await favoritesAPI.remove(medicine._id);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      }
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const styles = {
    page: { background: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem' },
    card: { background: 'var(--bg-secondary)', borderRadius: '1rem', padding: '1.5rem', display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2rem' }
  };

  return (
    <div className="dashboard-layout no-top-nav">
      <Sidebar />
      <main className="dashboard-main" style={styles.page}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="spinner" style={{ width: 48, height: 48, margin: '0 auto' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading medicine...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem' }} className="auth-error">{error}</div>
        ) : medicine ? (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{medicine.name}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>{medicine.category?.name || medicine.category}</p>
            </div>

            <div style={styles.card}>
              <div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--border-light)', background: 'var(--bg-tertiary)' }}>
                {medicine.image ? (
                  <img src={medicine.image} alt={medicine.name} style={{ width: '100%', height: 360, objectFit: 'contain', background: 'white' }} />
                ) : (
                  <div style={{ height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>💊</div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.375rem', fontWeight: 800 }}>₹{medicine.price}</div>
                    <div style={{ color: medicine.stock > 0 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 600 }}>{medicine.stock} in stock</div>
                  </div>
                  <div>
                    <button className="btn" onClick={toggleFavorite} style={{ background: isFavorite ? '#fde68a' : 'transparent', border: '1px solid var(--border-light)', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                      {isFavorite ? '♥ Favorited' : '♡ Add to Favorites'}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Description</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{medicine.description || 'No description available'}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Manufacturer</div>
                    <div style={{ fontWeight: 600 }}>{medicine.manufacturer || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Expiry</div>
                    <div style={{ fontWeight: 600 }}>{medicine.expiry || medicine.expiryDate || '-'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-primary" onClick={handleAddToCart}>Add to Cart</button>
                  <Link to="/user/catalog" className="btn" style={{ background: 'var(--bg-tertiary)' }}>Back to Catalog</Link>
                </div>
              </div>
            </div>

            {related && related.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Related Medicines</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  {related.map(m => (
                    <Link key={m._id} to={`/medicines/${m._id}`} style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{m.image ? <img src={m.image} alt={m.name} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : '💊'}</div>
                      <div style={{ fontWeight: 700 }}>{m.name}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>₹{m.price}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '2rem' }}>Medicine not found</div>
        )}
      </main>
    </div>
  );
};

export default MedicineDetail;
