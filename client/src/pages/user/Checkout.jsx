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
};

export default Checkout;
