import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FiHome, FiUsers, FiPackage, FiShoppingCart, FiFileText,
    FiSettings, FiLogOut, FiActivity, FiClipboard, FiHeart
} from 'react-icons/fi';
import './TopNav.css';

const TopNav = () => {
    const { user, logout, isAdmin, isPharmacist, isUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
    };

    const adminLinks = [
        { path: '/admin', icon: <FiHome />, label: 'Dashboard' },
        { path: '/admin/clinics', icon: <FiHeart />, label: 'Clinics' },
        { path: '/admin/inventory', icon: <FiPackage />, label: 'Inventory' },
        { path: '/admin/orders', icon: <FiShoppingCart />, label: 'Orders' },
        { path: '/admin/reports', icon: <FiActivity />, label: 'Reports' },
        { path: '/admin/settings', icon: <FiSettings />, label: 'Settings' }
    ];

    const pharmacistLinks = [
        { path: '/pharmacist', icon: <FiHome />, label: 'Dashboard' },
        { path: '/pharmacist/dispensing', icon: <FiClipboard />, label: 'Dispensing' },
        { path: '/pharmacist/prescriptions', icon: <FiFileText />, label: 'Prescriptions' },
        { path: '/pharmacist/patients', icon: <FiHeart />, label: 'Patients' }
    ];

    const userLinks = [
        { path: '/user', icon: <FiHome />, label: 'Dashboard' },
        { path: '/user/catalog', icon: <FiPackage />, label: 'Catalog' },
        { path: '/user/orders', icon: <FiShoppingCart />, label: 'Orders' },
        { path: '/user/profile', icon: <FiUsers />, label: 'Profile' }
    ];

    const links = isAdmin ? adminLinks : isPharmacist ? pharmacistLinks : userLinks;
    const brandName = isAdmin ? 'Pharma Admin' : isPharmacist ? 'Pharmacist' : 'RxHub';

    // Check if current path starts with a link path (for nested routes)
    const isActiveLink = (path) => {
        if (path === '/admin' || path === '/pharmacist' || path === '/user') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <header className="top-nav">
            <div className="top-nav-container">
                {/* Center: Navigation Links */}
                <nav className="top-nav-links">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-item ${isActiveLink(link.path) ? 'active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right: User */}
                <div className="top-nav-user">
                    <span className="user-name">{user?.name || 'Super Admin'}</span>
                    <div className="user-avatar" onClick={handleLogout} title="Logout">
                        {user?.name?.charAt(0).toUpperCase() || 'SA'}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNav;





