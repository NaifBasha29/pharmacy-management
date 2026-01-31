import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    FaUsers, FaPills, FaClipboardList, FaChartLine,
    FaCog, FaSignOutAlt, FaStore, FaUserMd
} from 'react-icons/fa';
import './ClinicDashboard.css';

const ClinicDashboard = () => {
    const { user, logout, isAuthenticated } = useAuth();

    // BACK BUTTON PROTECTION - Prevent leaving dashboard via browser back button
    useEffect(() => {
        // Push a state to detect back navigation
        window.history.pushState(null, '', window.location.href);

        const handlePopState = (event) => {
            // When back button is pressed, push state again to stay on dashboard
            if (isAuthenticated) {
                window.history.pushState(null, '', window.location.href);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isAuthenticated]);

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="clinic-dashboard">
            {/* Sidebar */}
            <aside className="clinic-sidebar">
                <div className="sidebar-header">
                    <div className="clinic-logo">
                        {user?.logo ? (
                            <img src={user.logo} alt={user.name} />
                        ) : (
                            <FaStore className="default-logo-icon" />
                        )}
                    </div>
                    <div className="clinic-info">
                        <h2>{user?.name || 'Clinic Dashboard'}</h2>
                        <span className="clinic-code">{user?.clinicCode}</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/clinic" className="nav-item active">
                        <FaChartLine />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/clinic/patients" className="nav-item">
                        <FaUsers />
                        <span>Patients</span>
                    </Link>
                    <Link to="/clinic/medicines" className="nav-item">
                        <FaPills />
                        <span>Medicines</span>
                    </Link>
                    <Link to="/clinic/orders" className="nav-item">
                        <FaClipboardList />
                        <span>Orders</span>
                    </Link>
                    <Link to="/clinic/staff" className="nav-item">
                        <FaUserMd />
                        <span>Staff</span>
                    </Link>
                    <Link to="/clinic/settings" className="nav-item">
                        <FaCog />
                        <span>Settings</span>
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="clinic-main">
                <header className="clinic-header">
                    <h1>Welcome back, {user?.name}!</h1>
                    <p>Manage your clinic's operations from here.</p>
                </header>

                <div className="dashboard-stats">
                    <div className="stat-card">
                        <div className="stat-icon patients">
                            <FaUsers />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">--</span>
                            <span className="stat-label">Total Patients</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon medicines">
                            <FaPills />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">--</span>
                            <span className="stat-label">Medicines</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon orders">
                            <FaClipboardList />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">--</span>
                            <span className="stat-label">Pending Orders</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon revenue">
                            <FaChartLine />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">--</span>
                            <span className="stat-label">Today's Revenue</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-content">
                    <div className="welcome-card">
                        <h2>🎉 Clinic Dashboard Ready!</h2>
                        <p>Your clinic management portal is set up. Start managing your:</p>
                        <ul>
                            <li>👥 <strong>Patients</strong> - Register and manage patient records</li>
                            <li>💊 <strong>Medicines</strong> - Track inventory and stock levels</li>
                            <li>📋 <strong>Orders</strong> - Process and fulfill prescriptions</li>
                            <li>👨‍⚕️ <strong>Staff</strong> - Manage your clinic team</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClinicDashboard;
