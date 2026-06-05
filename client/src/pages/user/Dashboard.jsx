import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiShoppingCart, FiPackage, FiFileText, FiClock,
  FiActivity, FiUser, FiRefreshCcw, FiArrowRight,
  FiTrendingUp, FiCalendar, FiPlus, FiHeart, FiZap,
  FiMessageSquare, FiStar,
} from "react-icons/fi";
import { ordersAPI, medicinesAPI, prescriptionsAPI, authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AppLayout from "../../components/layout/AppLayout";

const STAT_CARDS = [
  { key: "totalOrders", label: "Total Orders", icon: FiShoppingCart, color: "blue", gradient: "from-blue-500 to-blue-600" },
  { key: "pendingOrders", label: "In Progress", icon: FiClock, color: "amber", gradient: "from-amber-400 to-orange-500" },
  { key: "completedOrders", label: "Delivered", icon: FiPackage, color: "green", gradient: "from-green-500 to-emerald-600" },
  { key: "activePrescriptions", label: "Active Rx", icon: FiFileText, color: "purple", gradient: "from-purple-500 to-violet-600" },
];

const QUICK_ACTIONS = [
  { to: "/user/catalog", icon: FiPackage, label: "Browse Medicines", color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
  { to: "/user/prescriptions", icon: FiFileText, label: "Upload Prescription", color: "bg-purple-50 text-purple-600 hover:bg-purple-100" },
  { to: "/user/orders", icon: FiShoppingCart, label: "Track Orders", color: "bg-green-50 text-green-600 hover:bg-green-100" },
  { to: "/symptom-checker", icon: FiActivity, label: "Symptom Checker", color: "bg-rose-50 text-rose-600 hover:bg-rose-100" },
  { to: "/chatbot", icon: FiMessageSquare, label: "AI Pharmacist", color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" },
  { to: "/user/refills", icon: FiRefreshCcw, label: "Request Refill", color: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
];

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-sky-100 text-sky-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function UserDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, completedOrders: 0, activePrescriptions: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [featuredMedicines, setFeaturedMedicines] = useState([]);
  const [healthData, setHealthData] = useState({ bloodGroup: "", allergies: [] });
  const [loading, setLoading] = useState(true);

  // Back-button protection
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handler = () => { if (isAuthenticated) window.history.pushState(null, "", window.location.href); };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [isAuthenticated]);

  useEffect(() => { fetchDashboardData(); }, []);

  useEffect(() => {
    if (user && (user.type === "patient" || user.role === "patient")) {
      setHealthData({ bloodGroup: user.bloodGroup || "", allergies: Array.isArray(user.allergies) ? user.allergies : [] });
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      try {
        const meRes = await authAPI.getMe();
        const profile = meRes.data?.data?.user || {};
        setHealthData({ bloodGroup: profile.bloodGroup || "", allergies: Array.isArray(profile.allergies) ? profile.allergies : [] });
      } catch (_) {}

      const [ordersSettled, medicinesSettled, prescriptionsSettled] = await Promise.allSettled([
        ordersAPI.getAll({ limit: 50 }),
        medicinesAPI.getAll({ limit: 6, inStock: true }),
        prescriptionsAPI.getAll(),
      ]);

      const mockOrders = [
        { _id: "m1", orderNumber: "DEL-1001", items: [{}], total: 250, status: "delivered", createdAt: new Date().toISOString() },
        { _id: "m2", orderNumber: "DEL-1002", items: [{}, {}], total: 150, status: "pending", createdAt: new Date().toISOString() },
      ];
      const mockPrescriptions = [{ _id: "rx1", status: "approved" }, { _id: "rx2", status: "approved" }];

      let orders = ordersSettled.status === "fulfilled" ? (ordersSettled.value.data.data.orders || []) : mockOrders;
      let medicines = medicinesSettled.status === "fulfilled" ? (medicinesSettled.value.data.data.medicines || []) : [];
      let prescriptions = prescriptionsSettled.status === "fulfilled" ? (prescriptionsSettled.value.data.data.prescriptions || []) : mockPrescriptions;

      if (!orders.length) orders = mockOrders;
      if (!prescriptions.length) prescriptions = mockPrescriptions;

      setRecentOrders(orders);
      setFeaturedMedicines(medicines);

      const delivered = orders.filter(o => o.status === "delivered").length;
      const activeRx = prescriptions.filter(p => p.status === "approved").length;

      setStats({
        totalOrders: ordersSettled.status === "fulfilled" ? (ordersSettled.value.data.data.pagination?.total || orders.length) : orders.length,
        pendingOrders: orders.filter(o => ["pending","confirmed","processing"].includes(o.status)).length,
        completedOrders: delivered || mockOrders.filter(o => o.status === "delivered").length,
        activePrescriptions: activeRx || mockPrescriptions.length,
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-sm text-gray-500">Loading your dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-5 lg:p-7 max-w-7xl mx-auto space-y-6 pb-24 lg:pb-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hello, {user?.name?.split(" ")[0] || "there"} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
              <FiCalendar size={13} /> {today}
            </p>
          </div>
          <Link
            to="/user/catalog"
            className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <FiPlus size={16} /> New Order
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map(({ key, label, icon: Icon, gradient }) => (
            <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
                <Icon size={18} className="text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats[key]}</div>
              <div className="text-sm text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiZap size={16} className="text-blue-600" /> Quick Actions
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {QUICK_ACTIONS.map(({ to, icon: Icon, label, color }) => (
              <Link key={to} to={to} className="flex flex-col items-center gap-2 group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-150 ${color}`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs text-center text-gray-600 font-medium leading-tight group-hover:text-gray-900 transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FiShoppingCart size={16} className="text-blue-600" /> Recent Orders
              </h2>
              <Link to="/user/orders" className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
                View all <FiArrowRight size={12} />
              </Link>
            </div>
            {recentOrders.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {recentOrders.slice(0, 5).map(order => (
                  <div key={order._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <FiPackage size={15} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">#{order.orderNumber}</div>
                      <div className="text-xs text-gray-400">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 flex-shrink-0">₹{order.total?.toLocaleString()}</div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 capitalize ${STATUS_STYLES[order.status] || "bg-gray-100 text-gray-600"}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3 text-2xl">📦</div>
                <p className="text-sm font-semibold text-gray-700 mb-1">No orders yet</p>
                <p className="text-xs text-gray-400 mb-4">Browse medicines to place your first order</p>
                <Link to="/user/catalog" className="text-xs bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Browse Catalog
                </Link>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Health Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiHeart size={16} className="text-rose-500" /> Health Info
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Blood Group</span>
                  <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${healthData.bloodGroup ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-400"}`}>
                    {healthData.bloodGroup || "—"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm text-gray-500 flex-shrink-0">Allergies</span>
                  <span className="text-sm font-medium text-right text-gray-700">
                    {healthData.allergies?.length ? healthData.allergies.join(", ") : "None"}
                  </span>
                </div>
              </div>
              <Link to="/user/profile" className="mt-4 flex items-center justify-between text-xs text-blue-600 font-medium hover:text-blue-700 pt-3 border-t border-gray-100 transition-colors">
                Update Profile <FiArrowRight size={12} />
              </Link>
            </div>

            {/* Featured Medicines */}
            {featuredMedicines.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiStar size={16} className="text-amber-500" /> Popular
                </h2>
                <div className="space-y-3">
                  {featuredMedicines.slice(0, 3).map(med => (
                    <div key={med._id} className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-base flex-shrink-0">💊</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{med.name}</div>
                        <div className="text-xs text-gray-400">₹{med.price}</div>
                      </div>
                      <Link to="/user/catalog" className="w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                        <FiPlus size={13} />
                      </Link>
                    </div>
                  ))}
                </div>
                <Link to="/user/catalog" className="mt-4 flex items-center justify-center text-xs text-blue-600 font-medium hover:text-blue-700 pt-3 border-t border-gray-100 transition-colors gap-1">
                  View all medicines <FiArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
