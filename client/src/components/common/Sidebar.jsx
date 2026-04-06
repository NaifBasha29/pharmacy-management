import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import {
  FiHome,
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiFileText,
  FiTrendingUp,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiActivity,
  FiClipboard,
  FiAlertCircle,
  FiTruck,
  FiHeart,
  FiHelpCircle,
  FiCrosshair, // Using an icon instead of logo for now
} from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";
import "./Sidebar.css";
import logo from "../../../assets/logo.png";

const Sidebar = () => {
  const { user, logout, isAdmin, isPharmacist, isUser } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  // Sidebar open state: controls visual open (hover or pinned)
  const [isOpen, setIsOpen] = useState(false);
  // When true the sidebar stays open (pin). Clicking the toggle pins/unpins.
  const [isPinned, setIsPinned] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const asideRef = useRef(null);
  const leaveTimeoutRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    // AuthContext now handles redirect to landing page
  };

  // Hover handlers: expand on enter, collapse on leave (unless pinned)
  const handleMouseEnter = () => {
    // Don't trigger hover on small screens
    if (typeof window !== "undefined" && window.innerWidth < 769) return;
    if (isMobileOpen) return;
    clearTimeout(leaveTimeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (typeof window !== "undefined" && window.innerWidth < 769) return;
    if (isMobileOpen) return;
    if (isPinned) return;
    leaveTimeoutRef.current = setTimeout(() => setIsOpen(false), 220);
  };

  useEffect(() => {
    return () => clearTimeout(leaveTimeoutRef.current);
  }, []);

  // Keep sidebar open on keyboard focus within the sidebar, and collapse when focus leaves
  useEffect(() => {
    const node = asideRef.current;
    if (!node) return;

    const onFocusIn = () => {
      if (typeof window !== "undefined" && window.innerWidth < 769) return;
      if (isMobileOpen) return;
      clearTimeout(leaveTimeoutRef.current);
      setIsOpen(true);
    };

    const onFocusOut = () => {
      if (typeof window !== "undefined" && window.innerWidth < 769) return;
      if (isMobileOpen) return;
      if (isPinned) return;
      leaveTimeoutRef.current = setTimeout(() => setIsOpen(false), 220);
    };

    node.addEventListener("focusin", onFocusIn);
    node.addEventListener("focusout", onFocusOut);
    return () => {
      node.removeEventListener("focusin", onFocusIn);
      node.removeEventListener("focusout", onFocusOut);
    };
  }, [isPinned, isMobileOpen]);

  const adminLinks = [
    { path: "/admin", icon: <FiHome />, label: "Dashboard" },
    { path: "/admin/clinics", icon: <FiHeart />, label: "Clinics" },
    { path: "/admin/inventory", icon: <FiPackage />, label: "Inventory" },
    {
      path: "/admin/prescriptions",
      icon: <FiClipboard />,
      label: "Prescriptions",
    },
    { path: "/admin/orders", icon: <FiShoppingCart />, label: "Orders" },
    { path: "/admin/reports", icon: <FiActivity />, label: "Reports" },
    { path: "/admin/audit-logs", icon: <FiFileText />, label: "Compliance" },
    { path: "/admin/support", icon: <FiHelpCircle />, label: "Support" },
    { path: "/admin/settings", icon: <FiSettings />, label: "Settings" },
  ];

  const pharmacistLinks = [
    { path: "/pharmacist", icon: <FiHome />, label: "Dashboard" },
    { path: "/pharmacist/inventory", icon: <FiPackage />, label: "Inventory" },
    { path: "/pharmacist/orders", icon: <FiShoppingCart />, label: "Orders" },
    {
      path: "/pharmacist/prescriptions",
      icon: <FiClipboard />,
      label: "Prescriptions",
    },
    {
      path: "/pharmacist/ai-drug-check",
      icon: <FiActivity />,
      label: "AI Drug Check",
    },
    { path: "/pharmacist/billing", icon: <FiFileText />, label: "Billing" },
    { path: "/pharmacist/reports", icon: <FiTrendingUp />, label: "Reports" },
    { path: "/pharmacist/patients", icon: <FiUsers />, label: "Patients" },
  ];

  const userLinks = [
    { path: "/user", icon: <FiHome />, label: "Dashboard" },
    { path: "/user/catalog", icon: <FiPackage />, label: "Medicine Catalog" },
    { path: "/user/cart", icon: <FiShoppingCart />, label: "My Cart" },
    { path: "/user/orders", icon: <FiShoppingCart />, label: "My Orders" },
    {
      path: "/user/prescriptions",
      icon: <FiFileText />,
      label: "Prescriptions",
    },
    { path: "/user/profile", icon: <FiUsers />, label: "Profile" },
    { path: "/user/support", icon: <FiHelpCircle />, label: "Support" },
  ];

  const links = isAdmin
    ? adminLinks
    : isPharmacist
      ? pharmacistLinks
      : userLinks;

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
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        ref={asideRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={() => {
          if (!isPinned) setIsOpen(true);
        }}
        onBlur={() => {
          if (!isPinned) setIsOpen(false);
        }}
        className={`sidebar ${isOpen ? "open" : "collapsed"} ${isPinned ? "pinned" : ""} ${isMobileOpen ? "mobile-open" : ""} ${isAdmin ? "theme-admin" : ""}`}
        tabIndex={-1}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="RxPlus" className="brand-logo-img" />
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
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
              className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
              onClick={() => setIsMobileOpen(false)}
            >
              <span className="nav-icon">{link.icon}</span>
              {isOpen && <span className="nav-label">{link.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div
            className={`video-call-controls ${!isOpen ? "collapsed" : ""}`}
            style={{ padding: "0 0.5rem 0.5rem" }}
          >
            {/* When collapsed, ThemeToggle gets full width utility to center and size correctly */}
            <ThemeToggle className={!isOpen ? "w-full" : ""} />
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
            <span className="nav-icon">
              <FiLogOut />
            </span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
