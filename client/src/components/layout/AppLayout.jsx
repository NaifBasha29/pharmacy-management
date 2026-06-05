import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  FiHome, FiPackage, FiShoppingCart, FiFileText, FiUser,
  FiSettings, FiLogOut, FiMenu, FiX, FiBell, FiSearch,
  FiHeart, FiActivity, FiClipboard, FiTrendingUp, FiHelpCircle,
  FiUsers, FiCpu, FiBarChart2, FiShield, FiDollarSign,
} from 'react-icons/fi';
import { MdMedication } from 'react-icons/md';

const navConfig = {
  admin: [
    { path: '/admin', icon: FiHome, label: 'Dashboard', exact: true },
    { path: '/admin/inventory', icon: FiPackage, label: 'Inventory' },
    { path: '/admin/orders', icon: FiShoppingCart, label: 'Orders' },
    { path: '/admin/clinics', icon: FiHeart, label: 'Clinics' },
    { path: '/admin/prescriptions', icon: FiClipboard, label: 'Prescriptions' },
    { path: '/admin/reports', icon: FiTrendingUp, label: 'Reports' },
    { path: '/admin/audit-logs', icon: FiShield, label: 'Compliance' },
    { path: '/admin/support', icon: FiHelpCircle, label: 'Support' },
    { path: '/admin/settings', icon: FiSettings, label: 'Settings' },
  ],
  pharmacist: [
    { path: '/pharmacist', icon: FiHome, label: 'Dashboard', exact: true },
    { path: '/pharmacist/inventory', icon: FiPackage, label: 'Inventory' },
    { path: '/pharmacist/orders', icon: FiShoppingCart, label: 'Orders' },
    { path: '/pharmacist/prescriptions', icon: FiClipboard, label: 'Prescriptions' },
    { path: '/pharmacist/patients', icon: FiUsers, label: 'Patients' },
    { path: '/pharmacist/ai-drug-check', icon: FiCpu, label: 'AI Drug Check' },
    { path: '/pharmacist/billing', icon: FiDollarSign, label: 'Billing' },
    { path: '/pharmacist/reports', icon: FiBarChart2, label: 'Reports' },
  ],
  user: [
    { path: '/user', icon: FiHome, label: 'Home', exact: true, mobileShow: true },
    { path: '/user/catalog', icon: FiPackage, label: 'Medicines', mobileShow: true },
    { path: '/user/cart', icon: FiShoppingCart, label: 'Cart', mobileShow: true, cartBadge: true },
    { path: '/user/orders', icon: FiFileText, label: 'Orders', mobileShow: true },
    { path: '/user/prescriptions', icon: FiClipboard, label: 'Prescriptions' },
    { path: '/favorites', icon: FiHeart, label: 'Favorites' },
    { path: '/medicine-cabinet', icon: MdMedication || FiPackage, label: 'Cabinet' },
    { path: '/symptom-checker', icon: FiActivity, label: 'Symptom Checker' },
    { path: '/chatbot', icon: FiCpu, label: 'AI Chat' },
    { path: '/user/profile', icon: FiUser, label: 'Profile', mobileShow: true },
    { path: '/user/support', icon: FiHelpCircle, label: 'Support' },
  ],
  clinic_admin: [
    { path: '/clinic', icon: FiHome, label: 'Dashboard', exact: true },
    { path: '/clinic/patients', icon: FiUsers, label: 'Patients' },
    { path: '/clinic/medicines', icon: FiPackage, label: 'Medicines' },
    { path: '/clinic/orders', icon: FiShoppingCart, label: 'Orders' },
    { path: '/clinic/staff', icon: FiUsers, label: 'Staff' },
    { path: '/clinic/settings', icon: FiSettings, label: 'Settings' },
  ],
};

const roleColors = {
  admin: { sidebar: 'from-slate-900 to-slate-800', accent: '#3b82f6', accentBg: 'rgba(59,130,246,0.15)' },
  pharmacist: { sidebar: 'from-blue-900 to-blue-800', accent: '#34d399', accentBg: 'rgba(52,211,153,0.15)' },
  user: { sidebar: 'from-white to-gray-50', accent: '#2563eb', accentBg: 'rgba(37,99,235,0.08)' },
  clinic_admin: { sidebar: 'from-purple-900 to-purple-800', accent: '#a78bfa', accentBg: 'rgba(167,139,250,0.15)' },
};

export default function AppLayout({ children, title }) {
  const { user, logout, isAdmin, isPharmacist } = useAuth();
  const { getCartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const role = user?.role || 'user';
  const links = navConfig[role] || navConfig.user;
  const colors = roleColors[role] || roleColors.user;
  const isDarkSidebar = role !== 'user';
  const cartCount = getCartCount();

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const mobileLinks = links.filter(l => l.mobileShow);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = async () => { await logout(); };

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className={`px-5 py-5 border-b ${isDarkSidebar ? 'border-white/10' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-base font-bold ${isDarkSidebar ? 'bg-white/20' : 'bg-blue-600'}`}>
            💊
          </div>
          <div>
            <div className={`font-bold text-sm ${isDarkSidebar ? 'text-white' : 'text-gray-900'}`}>PharmaCare</div>
            <div className={`text-xs capitalize ${isDarkSidebar ? 'text-white/50' : 'text-gray-400'}`}>{role.replace('_', ' ')}</div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
        {links.map(({ path, icon: Icon, label, exact, cartBadge }) => {
          const active = isActive(path, exact);
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative
                ${active
                  ? isDarkSidebar
                    ? 'bg-white/15 text-white'
                    : 'bg-blue-50 text-blue-700'
                  : isDarkSidebar
                    ? 'text-white/70 hover:bg-white/10 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <Icon size={17} className="flex-shrink-0" />
              <span className="truncate">{label}</span>
              {cartBadge && cartCount > 0 && (
                <span className="ml-auto bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
              {active && !cartBadge && (
                <span className={`ml-auto w-1.5 h-1.5 rounded-full ${isDarkSidebar ? 'bg-white' : 'bg-blue-600'}`} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className={`px-3 py-3 border-t ${isDarkSidebar ? 'border-white/10' : 'border-gray-100'}`}>
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 ${isDarkSidebar ? 'bg-white/5' : 'bg-gray-50'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isDarkSidebar ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-semibold truncate ${isDarkSidebar ? 'text-white' : 'text-gray-900'}`}>{user?.name || 'User'}</div>
            <div className={`text-xs truncate ${isDarkSidebar ? 'text-white/50' : 'text-gray-400'}`}>{user?.email || ''}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
            ${isDarkSidebar ? 'text-white/60 hover:bg-white/10 hover:text-white' : 'text-gray-500 hover:bg-red-50 hover:text-red-600'}`}
        >
          <FiLogOut size={16} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col w-60 flex-shrink-0 bg-gradient-to-b ${colors.sidebar} ${isDarkSidebar ? '' : 'border-r border-gray-200'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className={`relative flex flex-col w-64 flex-shrink-0 bg-gradient-to-b ${colors.sidebar} shadow-xl`}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center gap-3 px-4 flex-shrink-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <FiMenu size={20} />
          </button>

          {/* Page title / search area */}
          <div className="flex-1 flex items-center gap-3">
            {title && <h1 className="text-base font-semibold text-gray-900 hidden sm:block">{title}</h1>}
            {!title && (
              <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-full max-w-xs">
                <FiSearch size={15} className="text-gray-400" />
                <span className="text-sm text-gray-400">Search...</span>
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {role === 'user' && (
              <Link to="/user/cart" className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                <FiShoppingCart size={19} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            )}
            <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <FiBell size={19} />
            </button>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer ${isDarkSidebar ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Mobile Bottom Nav (user role only) */}
        {role === 'user' && (
          <nav className="lg:hidden flex-shrink-0 bg-white border-t border-gray-200 flex items-center">
            {mobileLinks.map(({ path, icon: Icon, label, exact, cartBadge }) => {
              const active = isActive(path, exact);
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 relative transition-colors
                    ${active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <div className="relative">
                    <Icon size={20} />
                    {cartBadge && cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium">{label}</span>
                  {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full" />}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
