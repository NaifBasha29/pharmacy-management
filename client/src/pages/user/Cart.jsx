import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { useCart } from '../../context/CartContext';
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiArrowRight } from 'react-icons/fi';
import './UserDashboard.css';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();

  const subtotal = getCartTotal();
  const tax = +(subtotal * 0.18).toFixed(2);
  const shipping = subtotal > 500 ? 0 : subtotal > 0 ? 50 : 0;
  const total = +(subtotal + tax + shipping).toFixed(2);

  const handleCheckout = () => {
    if (!cart.length) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/user/checkout');
  };

  const page = { background: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem' };
  const card = { background: 'var(--bg-secondary)', borderRadius: '1rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' };
  const textPrimary = { color: 'var(--text-primary)' };
  const textSecondary = { color: 'var(--text-secondary)' };
  const accent = 'var(--primary-500)';

  if (!cart.length) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main" style={page}>
          <div style={{ maxWidth: 520, margin: '5rem auto', textAlign: 'center', ...card, padding: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛒</div>
            <h2 style={{ ...textPrimary, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Your cart is empty</h2>
            <p style={{ ...textSecondary, marginBottom: '1.5rem' }}>Browse medicines and add them to your cart to place an order.</p>
            <Link to="/user/catalog" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiShoppingCart /> Go to Catalog
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main" style={page}>
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ ...textPrimary, fontSize: '1.875rem', fontWeight: 700 }}>My Cart</h1>
            <p style={textSecondary}>Review your items and proceed to checkout</p>
          </div>
          <button className="btn btn-secondary" onClick={clearCart} style={{ background: 'var(--bg-tertiary)', color: 'var(--primary-500)', border: '1px solid var(--border-light)' }}>
            Clear Cart
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div style={{ ...card, padding: '1.25rem' }}>
            {cart.map(({ medicine, quantity }) => (
              <div key={medicine._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ width: 56, height: 56, borderRadius: '0.75rem', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>💊</div>
                <div style={{ flex: 1 }}>
                  <div style={{ ...textPrimary, fontWeight: 700 }}>{medicine.name}</div>
                  <div style={{ ...textSecondary, fontSize: '0.9rem' }}>₹{medicine.price?.toLocaleString()} per unit</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={() => updateQuantity(medicine._id, quantity - 1)} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', color: textPrimary.color, borderRadius: '0.5rem', padding: '0.35rem' }}>
                    <FiMinus />
                  </button>
                  <span style={{ ...textPrimary, minWidth: 32, textAlign: 'center' }}>{quantity}</span>
                  <button onClick={() => updateQuantity(medicine._id, quantity + 1)} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', color: textPrimary.color, borderRadius: '0.5rem', padding: '0.35rem' }}>
                    <FiPlus />
                  </button>
                </div>
                <div style={{ ...textPrimary, fontWeight: 700 }}>₹{(medicine.price * quantity).toFixed(2)}</div>
                <button onClick={() => removeFromCart(medicine._id)} style={{ background: 'transparent', border: 'none', color: '#f87171', padding: '0.25rem' }}>
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          <div style={{ ...card, padding: '1.25rem', alignSelf: 'start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '0.75rem', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
                <FiShoppingCart />
              </div>
              <h3 style={{ ...textPrimary, margin: 0 }}>Order Summary</h3>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', ...textSecondary }}>
              <span>Subtotal</span>
              <span style={textPrimary}>₹{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', ...textSecondary }}>
              <span>GST (18%)</span>
              <span style={textPrimary}>₹{tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', ...textSecondary }}>
              <span>Shipping</span>
              <span style={textPrimary}>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
            </div>
            <div style={{ height: 1, background: 'var(--border-light)', margin: '1rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ ...textPrimary, fontWeight: 700 }}>Total</span>
              <span style={{ ...textPrimary, fontWeight: 800, fontSize: '1.25rem' }}>₹{total.toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: `linear-gradient(135deg, ${accent}, #ea580c)` }}>
              Proceed to Checkout <FiArrowRight />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
