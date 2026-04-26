<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { ordersAPI } from "../../services/api";
import {
  FiMapPin,
  FiCreditCard,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import toast from "react-hot-toast";
import "./UserDashboard.css";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();

  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    zipCode: user?.address?.zipCode || "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    setShippingAddress((prev) => ({
      ...prev,
      name: user?.name || prev.name,
      phone: user?.phone || prev.phone,
      street: user?.address?.street || prev.street,
      city: user?.address?.city || prev.city,
      state: user?.address?.state || prev.state,
      zipCode: user?.address?.zipCode || prev.zipCode,
    }));
  }, [user]);

  const summary = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.medicine.price * item.quantity,
      0,
    );
    const tax = +(subtotal * 0.18).toFixed(2);
    const shipping = subtotal > 500 ? 0 : subtotal > 0 ? 50 : 0;
    const total = +(subtotal + tax + shipping).toFixed(2);
    return { subtotal, tax, shipping, total };
  }, [cart]);

  const handlePlaceOrder = async () => {
    if (!cart.length) {
      toast.error("Your cart is empty");
      return;
    }

    if (
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zipCode
    ) {
      toast.error("Please complete the shipping address");
      return;
    }

    setPlacing(true);
    try {
      await ordersAPI.create({
        items: cart.map((item) => ({
          medicine: item.medicine._id,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod,
      });
      clearCart();
      toast.success("Order placed successfully");
      navigate("/user/orders");
    } catch (error) {
      const message = error.response?.data?.message || "Failed to place order";
      toast.error(message);
    } finally {
      setPlacing(false);
    }
  };

  const page = {
    background: "var(--bg-primary)",
    minHeight: "100vh",
    padding: "2rem",
  };
  const card = {
    background: "var(--bg-secondary)",
    borderRadius: "1rem",
    border: "1px solid var(--border-light)",
    boxShadow: "var(--shadow-sm)",
  };
  const textPrimary = { color: "var(--text-primary)" };
  const textSecondary = { color: "var(--text-secondary)" };
  const accent = "var(--primary-500)";

  return (
    <div className="dashboard-layout no-top-nav">
      <Sidebar />
      <main className="dashboard-main" style={page}>
        <div
          style={{
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1
              style={{ ...textPrimary, fontSize: "1.875rem", fontWeight: 700 }}
            >
              Checkout
            </h1>
            <p style={textSecondary}>
              Confirm your address, payment, and order summary
            </p>
          </div>
          <Link
            to="/user/cart"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: accent,
            }}
          >
            <FiArrowLeft /> Back to Cart
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "1.5rem",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <div style={{ ...card, padding: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <FiMapPin style={{ color: accent }} />
                <h3 style={{ ...textPrimary, margin: 0 }}>Shipping Address</h3>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      ...textSecondary,
                      display: "block",
                      marginBottom: "0.35rem",
                    }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.name}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        name: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.85rem 1rem",
                      borderRadius: "0.75rem",
                      border: "1px solid var(--border-light)",
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      ...textSecondary,
                      display: "block",
                      marginBottom: "0.35rem",
                    }}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        phone: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.85rem 1rem",
                      borderRadius: "0.75rem",
                      border: "1px solid var(--border-light)",
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label
                    style={{
                      ...textSecondary,
                      display: "block",
                      marginBottom: "0.35rem",
                    }}
                  >
                    Street
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        street: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.85rem 1rem",
                      borderRadius: "0.75rem",
                      border: "1px solid var(--border-light)",
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      ...textSecondary,
                      display: "block",
                      marginBottom: "0.35rem",
                    }}
                  >
                    City
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        city: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.85rem 1rem",
                      borderRadius: "0.75rem",
                      border: "1px solid var(--border-light)",
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      ...textSecondary,
                      display: "block",
                      marginBottom: "0.35rem",
                    }}
                  >
                    State
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        state: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.85rem 1rem",
                      borderRadius: "0.75rem",
                      border: "1px solid var(--border-light)",
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      ...textSecondary,
                      display: "block",
                      marginBottom: "0.35rem",
                    }}
                  >
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.zipCode}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        zipCode: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.85rem 1rem",
                      borderRadius: "0.75rem",
                      border: "1px solid var(--border-light)",
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ ...card, padding: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <FiCreditCard style={{ color: accent }} />
                <h3 style={{ ...textPrimary, margin: 0 }}>Payment Method</h3>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1rem",
                }}
              >
                {[
                  { id: "cod", label: "Cash on Delivery" },
                  { id: "upi", label: "UPI" },
                  { id: "card", label: "Card" },
                  { id: "netbanking", label: "Net Banking" },
                ].map((method) => (
                  <label
                    key={method.id}
                    style={{
                      border:
                        paymentMethod === method.id
                          ? `1px solid ${accent}`
                          : "1px solid var(--border-light)",
                      borderRadius: "0.75rem",
                      padding: "0.85rem",
                      cursor: "pointer",
                      background:
                        paymentMethod === method.id
                          ? "var(--bg-tertiary)"
                          : "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      style={{ accentColor: accent }}
                    />
                    {method.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div style={{ ...card, padding: "1.5rem", alignSelf: "start" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <FiCheckCircle style={{ color: accent }} />
              <h3 style={{ ...textPrimary, margin: 0 }}>Order Summary</h3>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              {cart.map(({ medicine, quantity }) => (
                <div
                  key={medicine._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ ...textPrimary }}>
                    <div style={{ fontWeight: 700 }}>{medicine.name}</div>
                    <div style={{ ...textSecondary, fontSize: "0.85rem" }}>
                      Qty {quantity}
                    </div>
                  </div>
                  <div style={{ ...textPrimary, fontWeight: 700 }}>
                    ₹{(medicine.price * quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                height: 1,
                background: "var(--border-light)",
                margin: "0.75rem 0",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                ...textSecondary,
                marginBottom: "0.5rem",
              }}
            >
              <span>Subtotal</span>
              <span style={textPrimary}>₹{summary.subtotal.toFixed(2)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                ...textSecondary,
                marginBottom: "0.5rem",
              }}
            >
              <span>GST (18%)</span>
              <span style={textPrimary}>₹{summary.tax.toFixed(2)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                ...textSecondary,
                marginBottom: "0.5rem",
              }}
            >
              <span>Shipping</span>
              <span style={textPrimary}>
                {summary.shipping === 0
                  ? "Free"
                  : `₹${summary.shipping.toFixed(2)}`}
              </span>
            </div>
            <div
              style={{
                height: 1,
                background: "var(--border-light)",
                margin: "0.75rem 0",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <span style={{ ...textPrimary, fontWeight: 700 }}>Total</span>
              <span
                style={{ ...textPrimary, fontWeight: 800, fontSize: "1.25rem" }}
              >
                ₹{summary.total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handlePlaceOrder}
              className="btn btn-primary"
              disabled={placing}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                background: `linear-gradient(135deg, ${accent}, #ea580c)`,
                opacity: placing ? 0.75 : 1,
              }}
            >
              {placing ? "Placing order..." : "Place Order"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
=======
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI } from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import { FiMapPin, FiCreditCard, FiPackage, FiCheck, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Checkout = () => {
    const { cart, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [placing, setPlacing] = useState(false);

    const addrObj = typeof user?.address === 'object' ? user?.address : {};
    const [shipping, setShipping] = useState({
        name: user?.name || '', phone: user?.phone || '',
        street: addrObj.street || '', city: addrObj.city || '',
        state: addrObj.state || '', zipCode: addrObj.zipCode || ''
    });
    const [paymentMethod, setPaymentMethod] = useState('cod');

    const subtotal = getCartTotal();
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const shipFee = subtotal >= 500 ? 0 : 50;
    const total = subtotal + tax + shipFee;

    const s = {
        page: { background: '#000000', minHeight: '100vh', padding: '2rem' },
        card: { background: '#0a0a0a', borderRadius: '1rem', overflow: 'hidden' },
        grad: { background: 'linear-gradient(135deg,#f97316,#ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
        input: { width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '0.75rem', background: '#f9fafb', outline: 'none' },
        lbl: { display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#e5e5e5', marginBottom: '0.5rem' },
        btn: { padding: '0.875rem 1.5rem', fontWeight: 600, color: 'white', background: 'linear-gradient(135deg,#f97316,#ea580c)', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', fontSize: '1rem' },
        btnSec: { padding: '0.75rem 1.5rem', fontWeight: 600, color: '#9ca3af', background: '#111', border: '1px solid #222', borderRadius: '0.75rem', cursor: 'pointer' },
    };

    const steps = [
        { n: 1, label: 'Shipping', icon: <FiMapPin /> },
        { n: 2, label: 'Payment', icon: <FiCreditCard /> },
        { n: 3, label: 'Review', icon: <FiPackage /> }
    ];

    const paymentOptions = [
        { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive' },
        { id: 'upi', label: 'UPI', desc: 'Google Pay, PhonePe, etc.' },
        { id: 'card', label: 'Credit/Debit Card', desc: 'Visa, Mastercard, RuPay' },
        { id: 'netbanking', label: 'Net Banking', desc: 'All major banks' }
    ];

    const handlePlaceOrder = async () => {
        setPlacing(true);
        try {
            await ordersAPI.create({
                items: cart.map(i => ({ medicine: i.medicine._id, quantity: i.quantity })),
                shippingAddress: shipping,
                paymentMethod
            });
            clearCart();
            toast.success('Order placed successfully!');
            navigate('/user/orders');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally { setPlacing(false); }
    };

    if (cart.length === 0) {
        navigate('/user/cart');
        return null;
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main" style={s.page}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#fff' }}><span style={s.grad}>Checkout</span></h1>
                </div>

                {/* Step Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                    {steps.map((st, i) => (
                        <div key={st.n} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.75rem', background: step >= st.n ? '#f97316' : '#111', color: step >= st.n ? '#fff' : '#666', fontWeight: 600, fontSize: '0.875rem', cursor: step > st.n ? 'pointer' : 'default' }} onClick={() => step > st.n && setStep(st.n)}>
                                {step > st.n ? <FiCheck /> : st.icon} {st.label}
                            </div>
                            {i < steps.length - 1 && <FiChevronRight style={{ color: '#333' }} />}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
                    <div style={{ ...s.card, padding: '2rem' }}>
                        {/* Step 1: Shipping */}
                        {step === 1 && (
                            <div>
                                <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiMapPin style={{ color: '#f97316' }} /> Shipping Address</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem' }}>
                                    <div><label style={s.lbl}>Full Name</label><input value={shipping.name} onChange={e => setShipping({ ...shipping, name: e.target.value })} style={s.input} required /></div>
                                    <div><label style={s.lbl}>Phone</label><input value={shipping.phone} onChange={e => setShipping({ ...shipping, phone: e.target.value })} style={s.input} required /></div>
                                    <div style={{ gridColumn: 'span 2' }}><label style={s.lbl}>Street Address</label><input value={shipping.street} onChange={e => setShipping({ ...shipping, street: e.target.value })} style={s.input} required /></div>
                                    <div><label style={s.lbl}>City</label><input value={shipping.city} onChange={e => setShipping({ ...shipping, city: e.target.value })} style={s.input} required /></div>
                                    <div><label style={s.lbl}>State</label><input value={shipping.state} onChange={e => setShipping({ ...shipping, state: e.target.value })} style={s.input} required /></div>
                                    <div><label style={s.lbl}>ZIP Code</label><input value={shipping.zipCode} onChange={e => setShipping({ ...shipping, zipCode: e.target.value })} style={s.input} required /></div>
                                </div>
                                <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                                    <button onClick={() => { if (shipping.name && shipping.phone && shipping.street && shipping.city) setStep(2); else toast.error('Please fill all required fields'); }} style={{ ...s.btn, width: 'auto', display: 'inline-flex' }}>Continue to Payment <FiChevronRight /></button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Payment */}
                        {step === 2 && (
                            <div>
                                <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiCreditCard style={{ color: '#f97316' }} /> Payment Method</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {paymentOptions.map(opt => (
                                        <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: paymentMethod === opt.id ? '#1a0f00' : '#111', border: paymentMethod === opt.id ? '2px solid #f97316' : '2px solid #222', borderRadius: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                                            <input type="radio" name="payment" value={opt.id} checked={paymentMethod === opt.id} onChange={() => setPaymentMethod(opt.id)} style={{ accentColor: '#f97316' }} />
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#fff' }}>{opt.label}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{opt.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                                    <button onClick={() => setStep(1)} style={s.btnSec}>Back</button>
                                    <button onClick={() => setStep(3)} style={{ ...s.btn, width: 'auto', display: 'inline-flex' }}>Review Order <FiChevronRight /></button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {step === 3 && (
                            <div>
                                <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiPackage style={{ color: '#f97316' }} /> Order Review</h3>
                                <div style={{ background: '#111', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontWeight: 600, color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Shipping To</h4>
                                    <p style={{ color: '#fff', fontWeight: 600 }}>{shipping.name}</p>
                                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{shipping.street}, {shipping.city}, {shipping.state} {shipping.zipCode}</p>
                                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Phone: {shipping.phone}</p>
                                </div>
                                <div style={{ background: '#111', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontWeight: 600, color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Payment</h4>
                                    <p style={{ color: '#fff', fontWeight: 600 }}>{paymentOptions.find(p => p.id === paymentMethod)?.label}</p>
                                </div>
                                <div style={{ background: '#111', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontWeight: 600, color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Items ({cart.length})</h4>
                                    {cart.map(item => (
                                        <div key={item.medicine._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #1a1a1a' }}>
                                            <span style={{ color: '#fff' }}>💊 {item.medicine.name} × {item.quantity}</span>
                                            <span style={{ color: '#fff', fontWeight: 600 }}>₹{(item.medicine.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                                    <button onClick={() => setStep(2)} style={s.btnSec}>Back</button>
                                    <button onClick={handlePlaceOrder} disabled={placing} style={{ ...s.btn, width: 'auto', display: 'inline-flex', opacity: placing ? 0.7 : 1 }}>
                                        {placing ? 'Placing Order...' : 'Place Order'} <FiCheck />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Summary */}
                    <div style={{ ...s.card, position: 'sticky', top: '2rem' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1a1a1a' }}>
                            <h3 style={{ fontWeight: 700, color: '#fff' }}>Order Summary</h3>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            {cart.map(item => (
                                <div key={item.medicine._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                                    <span style={{ color: '#9ca3af' }}>{item.medicine.name} × {item.quantity}</span>
                                    <span style={{ color: '#fff' }}>₹{(item.medicine.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                            <div style={{ borderTop: '1px solid #1a1a1a', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}><span>Subtotal</span><span style={{ color: '#fff' }}>₹{subtotal.toLocaleString()}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}><span>GST (18%)</span><span style={{ color: '#fff' }}>₹{tax.toLocaleString()}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}><span>Shipping</span><span style={{ color: shipFee === 0 ? '#16a34a' : '#fff' }}>{shipFee === 0 ? 'FREE' : `₹${shipFee}`}</span></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '2px solid #1a1a1a', marginTop: '0.75rem' }}>
                                <span style={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>Total</span>
                                <span style={{ fontWeight: 700, color: '#f97316', fontSize: '1.25rem' }}>₹{total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
>>>>>>> 8a0117a (Rebase and fixes functionality)
};

export default Checkout;
