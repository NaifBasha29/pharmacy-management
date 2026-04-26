import { Link, useNavigate } from 'react-router-dom';
<<<<<<< HEAD
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
      <div className="dashboard-layout no-top-nav">
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
    <div className="dashboard-layout no-top-nav">
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
            <button onClick={handleCheckout} className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: `linear-gradient(135deg, ${accent}, var(--primary-600))` }}>
              Proceed to Checkout <FiArrowRight />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
=======
import { useCart } from '../../context/CartContext';
import Sidebar from '../../components/common/Sidebar';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowRight, FiPackage } from 'react-icons/fi';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
    const navigate = useNavigate();

    const subtotal = getCartTotal();
    const taxRate = 0.18;
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const shipping = subtotal >= 500 ? 0 : subtotal > 0 ? 50 : 0;
    const total = subtotal + tax + shipping;

    const s = {
        page: { background: '#000000', minHeight: '100vh', padding: '2rem' },
        card: { background: '#0a0a0a', borderRadius: '1rem', overflow: 'hidden' },
        grad: { background: 'linear-gradient(135deg,#f97316,#ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
        btn: { padding: '0.75rem 1.5rem', fontWeight: 600, color: 'white', background: 'linear-gradient(135deg,#f97316,#ea580c)', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', fontSize: '1rem' },
    };

    if (cart.length === 0) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <main className="dashboard-main" style={s.page}>
                    <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
                        <div style={{ width: 100, height: 100, background: '#111', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', fontSize: '3rem' }}>🛒</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>Your cart is empty</h2>
                        <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>Browse our catalog and add medicines to your cart</p>
                        <Link to="/user/catalog" style={{ ...s.btn, width: 'auto', display: 'inline-flex', textDecoration: 'none' }}>
                            <FiPackage /> Browse Catalog
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main" style={s.page}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#fff' }}>My <span style={s.grad}>Cart</span></h1>
                    <p style={{ color: '#9ca3af' }}>{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
                    {/* Cart Items */}
                    <div style={s.card}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiShoppingCart style={{ color: '#f97316' }} /> Cart Items</h3>
                            <button onClick={clearCart} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>Clear All</button>
                        </div>
                        <div style={{ padding: '1rem 1.5rem' }}>
                            {cart.map((item, idx) => (
                                <div key={item.medicine._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', borderBottom: idx < cart.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                                    <div style={{ width: 56, height: 56, background: '#111', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', flexShrink: 0 }}>💊</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.medicine.name}</div>
                                        <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>₹{item.medicine.price} per unit</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#111', borderRadius: '0.5rem', padding: '0.25rem' }}>
                                        <button onClick={() => updateQuantity(item.medicine._id, item.quantity - 1)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', borderRadius: '0.375rem' }}><FiMinus size={14} /></button>
                                        <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.medicine._id, item.quantity + 1)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', borderRadius: '0.375rem' }}><FiPlus size={14} /></button>
                                    </div>
                                    <div style={{ fontWeight: 700, color: '#fff', minWidth: 80, textAlign: 'right' }}>₹{(item.medicine.price * item.quantity).toLocaleString()}</div>
                                    <button onClick={() => removeFromCart(item.medicine._id)} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a0a0a', border: 'none', borderRadius: '0.5rem', color: '#ef4444', cursor: 'pointer', flexShrink: 0 }}><FiTrash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div style={{ ...s.card, position: 'sticky', top: '2rem' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1a1a1a' }}>
                            <h3 style={{ fontWeight: 700, color: '#fff' }}>Order Summary</h3>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#9ca3af' }}>
                                <span>Subtotal</span><span style={{ color: '#fff', fontWeight: 600 }}>₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#9ca3af' }}>
                                <span>GST (18%)</span><span style={{ color: '#fff', fontWeight: 600 }}>₹{tax.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#9ca3af' }}>
                                <span>Shipping</span>
                                <span style={{ color: shipping === 0 ? '#16a34a' : '#fff', fontWeight: 600 }}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                            </div>
                            {shipping > 0 && <p style={{ fontSize: '0.75rem', color: '#f97316', marginBottom: '1rem' }}>Add ₹{(500 - subtotal).toFixed(0)} more for free shipping</p>}
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '2px solid #1a1a1a', marginBottom: '1.5rem' }}>
                                <span style={{ fontWeight: 700, color: '#fff', fontSize: '1.125rem' }}>Total</span>
                                <span style={{ fontWeight: 700, color: '#f97316', fontSize: '1.25rem' }}>₹{total.toLocaleString()}</span>
                            </div>
                            <button onClick={() => navigate('/user/checkout')} style={s.btn}>Proceed to Checkout <FiArrowRight /></button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
>>>>>>> 8a0117a (Rebase and fixes functionality)
};

export default Cart;
