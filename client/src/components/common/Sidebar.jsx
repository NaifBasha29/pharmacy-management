import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  FiHome, FiUsers, FiPackage, FiShoppingCart, FiFileText,
  FiSettings, FiLogOut, FiMenu, FiX, FiBell, FiActivity,
  FiClipboard, FiAlertCircle, FiTruck, FiHeart, FiHelpCircle
} from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import './Sidebar.css';
import logo from '../../../assets/logo.png';

const Sidebar = () => {
  const { user, logout, isAdmin, isPharmacist, isUser } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    // AuthContext now handles redirect to landing page
  };

  const adminLinks = [
    { path: '/admin', icon: <FiHome />, label: 'Dashboard' },
    { path: '/admin/clinics', icon: <FiHeart />, label: 'Clinics' },
    { path: '/admin/inventory', icon: <FiPackage />, label: 'Inventory' },
    { path: '/admin/prescriptions', icon: <FiClipboard />, label: 'Prescriptions' },
    { path: '/admin/orders', icon: <FiShoppingCart />, label: 'Orders' },
    { path: '/admin/reports', icon: <FiActivity />, label: 'Reports' },
    { path: '/admin/audit-logs', icon: <FiFileText />, label: 'Compliance' },
    { path: '/admin/support', icon: <FiHelpCircle />, label: 'Support' },
    { path: '/admin/settings', icon: <FiSettings />, label: 'Settings' }
  ];

  const pharmacistLinks = [
    { path: '/pharmacist', icon: <FiHome />, label: 'Dashboard' },
    { path: '/pharmacist/patients', icon: <FiHeart />, label: 'Patients' }
  ];

  const userLinks = [
    { path: '/user', icon: <FiHome />, label: 'Dashboard' },
    { path: '/user/catalog', icon: <FiPackage />, label: 'Medicine Catalog' },
    { path: '/user/orders', icon: <FiShoppingCart />, label: 'My Orders' },
    { path: '/user/prescriptions', icon: <FiFileText />, label: 'Prescriptions' },
    { path: '/user/profile', icon: <FiUsers />, label: 'Profile' },
    { path: '/user/support', icon: <FiHelpCircle />, label: 'Support' }
  ];

  const links = isAdmin ? adminLinks : isPharmacist ? pharmacistLinks : userLinks;

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileOpen(false)} />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="RxHub" className="logo-icon" />
            {isOpen && <span className="logo-text">RxHub</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {isOpen && (
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setIsMobileOpen(false)}
            >
              <span className="nav-icon">{link.icon}</span>
              {isOpen && <span className="nav-label">{link.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className={`video-call-controls ${!isOpen ? 'collapsed' : ''}`} style={{ padding: '0 0.5rem 0.5rem' }}>
            <ThemeToggle className={!isOpen ? 'w-full' : ''} />
          </div>

          <button className="nav-link notification-btn">
            <span className="nav-icon">
              <FiBell />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </span>
            {isOpen && <span className="nav-label">Notifications</span>}
          </button>

          <button className="nav-link logout-btn" onClick={handleLogout}>
            <span className="nav-icon"><FiLogOut /></span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;





