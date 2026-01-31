
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiPackage, FiFileText, FiClock, FiActivity, FiUser, FiRefreshCcw, FiArrowRight, FiTrendingUp, FiCalendar, FiPlus } from 'react-icons/fi';
import { ordersAPI, medicinesAPI, prescriptionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';

const UserDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        activePrescriptions: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [featuredMedicines, setFeaturedMedicines] = useState([]);
    const [loading, setLoading] = useState(true);

    // BACK BUTTON PROTECTION - Prevent leaving dashboard via browser back button
    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            if (isAuthenticated) {
                window.history.pushState(null, '', window.location.href);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isAuthenticated]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [ordersRes, medicinesRes, prescriptionsRes] = await Promise.all([
                ordersAPI.getAll({ limit: 5 }),
                medicinesAPI.getAll({ limit: 8, inStock: true }),
                prescriptionsAPI.getAll()
            ]);

            const orders = ordersRes.data.data.orders;
            setRecentOrders(orders);
            setFeaturedMedicines(medicinesRes.data.data.medicines);

            const prescriptions = prescriptionsRes.data.data.prescriptions;

            setStats({
                totalOrders: ordersRes.data.data.pagination?.total || orders.length,
                pendingOrders: orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length,
                completedOrders: orders.filter(o => o.status === 'delivered').length,
                activePrescriptions: prescriptions.filter(p => p.status === 'approved').length
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    // Inline styles for guaranteed rendering
    const styles = {
        page: {
            background: 'linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 50%, #faf5ff 100%)',
            minHeight: '100vh',
            padding: '2rem'
        },
        header: {
            marginBottom: '2rem'
        },
        title: {
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '0.5rem'
        },
        gradientText: {
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
        },
        subtitle: {
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.95rem'
        },
        dateBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            background: 'white',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#475569',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.25rem',
            marginBottom: '2rem'
        },
        statCard: {
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease'
        },
        statIcon: (gradient) => ({
            width: '56px',
            height: '56px',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: 'white',
            background: gradient,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            flexShrink: 0
        }),
        statValue: {
            fontSize: '2rem',
            fontWeight: '800',
            color: '#0f172a',
            lineHeight: '1'
        },
        statLabel: {
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#64748b',
            marginTop: '0.25rem'
        },
        sectionTitle: {
            fontSize: '1.125rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        quickActionsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
        },
        actionCard: {
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        },
        actionIcon: (bg) => ({
            width: '52px',
            height: '52px',
            borderRadius: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: 'white',
            background: bg,
            marginBottom: '0.75rem',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }),
        actionLabel: {
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#334155'
        },
        mainGrid: {
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '1.5rem'
        },
        card: {
            background: 'white',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.04)'
        },
        cardHeader: {
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        viewAllLink: {
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#3b82f6',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse'
        },
        th: {
            padding: '0.75rem 1.25rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#64748b',
            textAlign: 'left',
            background: '#f8fafc'
        },
        td: {
            padding: '1rem 1.25rem',
            fontSize: '0.875rem',
            color: '#334155',
            borderBottom: '1px solid #f1f5f9'
        },
        badge: (type) => {
            const colors = {
                pending: { bg: '#fef3c7', color: '#d97706' },
                processing: { bg: '#dbeafe', color: '#2563eb' },
                dispatched: { bg: '#e0e7ff', color: '#4f46e5' },
                delivered: { bg: '#dcfce7', color: '#16a34a' },
                cancelled: { bg: '#fee2e2', color: '#dc2626' }
            };
            const c = colors[type] || { bg: '#f1f5f9', color: '#64748b' };
            return {
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                borderRadius: '9999px',
                background: c.bg,
                color: c.color
            };
        },
        emptyState: {
            textAlign: 'center',
            padding: '3rem 1.5rem'
        },
        emptyIcon: {
            width: '64px',
            height: '64px',
            background: '#f1f5f9',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '1.75rem'
        },
        healthCard: {
            background: 'linear-gradient(135deg, #fff 0%, #fef2f2 100%)',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid rgba(254,202,202,0.3)',
            marginBottom: '1.5rem'
        },
        healthItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.875rem 1.25rem',
            background: 'rgba(255,255,255,0.7)',
            margin: '0 1rem',
            marginBottom: '0.5rem',
            borderRadius: '0.5rem'
        },
        buyAgainItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            transition: 'background 0.2s'
        }
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <main className="dashboard-main" style={styles.page}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="spinner" style={{ width: 48, height: 48, margin: '0 auto 1rem' }} />
                            <p style={{ color: '#64748b', fontWeight: 500 }}>Loading your dashboard...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main" style={styles.page}>
                {/* Header */}
                <div style={styles.header}>
                    <h1 style={styles.title}>
                        Welcome back, <span style={styles.gradientText}>{user?.name?.split(' ')[0]}!</span> 👋
                    </h1>
                    <p style={styles.subtitle}>
                        Here's your health overview
                        <span style={styles.dateBadge}>
                            <FiCalendar size={14} /> {today}
                        </span>
                    </p>
                </div>

                {/* Stats Grid */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon('linear-gradient(135deg, #3b82f6, #60a5fa)')}>
                            <FiShoppingCart />
                        </div>
                        <div>
                            <div style={styles.statValue}>{stats.totalOrders}</div>
                            <div style={styles.statLabel}>Total Orders</div>
                        </div>
                    </div>

                    <div style={styles.statCard}>
                        <div style={styles.statIcon('linear-gradient(135deg, #f59e0b, #fbbf24)')}>
                            <FiClock />
                        </div>
                        <div>
                            <div style={styles.statValue}>{stats.pendingOrders}</div>
                            <div style={styles.statLabel}>In Progress</div>
                        </div>
                    </div>

                    <div style={styles.statCard}>
                        <div style={styles.statIcon('linear-gradient(135deg, #10b981, #34d399)')}>
                            <FiPackage />
                        </div>
                        <div>
                            <div style={styles.statValue}>{stats.completedOrders}</div>
                            <div style={styles.statLabel}>Delivered</div>
                        </div>
                    </div>

                    <div style={styles.statCard}>
                        <div style={styles.statIcon('linear-gradient(135deg, #8b5cf6, #a78bfa)')}>
                            <FiFileText />
                        </div>
                        <div>
                            <div style={styles.statValue}>{stats.activePrescriptions}</div>
                            <div style={styles.statLabel}>Active Rx</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={styles.sectionTitle}><FiActivity /> Quick Actions</h3>
                    <div style={styles.quickActionsGrid}>
                        <Link to="/user/catalog" style={styles.actionCard}>
                            <div style={styles.actionIcon('linear-gradient(135deg, #3b82f6, #60a5fa)')}>
                                <FiPackage />
                            </div>
                            <span style={styles.actionLabel}>Browse Medicines</span>
                        </Link>
                        <Link to="/user/orders" style={styles.actionCard}>
                            <div style={styles.actionIcon('linear-gradient(135deg, #f59e0b, #fbbf24)')}>
                                <FiShoppingCart />
                            </div>
                            <span style={styles.actionLabel}>My Orders</span>
                        </Link>
                        <Link to="/user/prescriptions" style={styles.actionCard}>
                            <div style={styles.actionIcon('linear-gradient(135deg, #8b5cf6, #a78bfa)')}>
                                <FiFileText />
                            </div>
                            <span style={styles.actionLabel}>Upload Rx</span>
                        </Link>
                        <Link to="/user/profile" style={styles.actionCard}>
                            <div style={styles.actionIcon('linear-gradient(135deg, #10b981, #34d399)')}>
                                <FiUser />
                            </div>
                            <span style={styles.actionLabel}>My Profile</span>
                        </Link>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div style={styles.mainGrid}>
                    {/* Recent Orders */}
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h3 style={{ ...styles.sectionTitle, marginBottom: 0 }}>
                                <FiClock style={{ color: '#94a3b8' }} /> Recent Orders
                            </h3>
                            <Link to="/user/orders" style={styles.viewAllLink}>
                                View All <FiArrowRight size={14} />
                            </Link>
                        </div>
                        {recentOrders.length > 0 ? (
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Order</th>
                                        <th style={styles.th}>Items</th>
                                        <th style={styles.th}>Total</th>
                                        <th style={styles.th}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.slice(0, 4).map((order) => (
                                        <tr key={order._id}>
                                            <td style={{ ...styles.td, fontWeight: 600 }}>#{order.orderNumber}</td>
                                            <td style={styles.td}>{order.items?.length || 0} items</td>
                                            <td style={{ ...styles.td, fontWeight: 600 }}>₹{order.total?.toLocaleString()}</td>
                                            <td style={styles.td}>
                                                <span style={styles.badge(order.status)}>{order.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={styles.emptyState}>
                                <div style={styles.emptyIcon}>📦</div>
                                <h4 style={{ fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>No orders yet</h4>
                                <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem' }}>Start shopping to see your orders here</p>
                                <Link to="/user/catalog" className="btn btn-primary">
                                    <FiShoppingCart /> Browse Catalog
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div>
                        {/* Health Summary */}
                        <div style={styles.healthCard}>
                            <div style={{ ...styles.cardHeader, borderBottom: '1px solid rgba(254,202,202,0.3)' }}>
                                <h3 style={{ ...styles.sectionTitle, marginBottom: 0, color: '#dc2626' }}>
                                    <FiActivity /> Health Summary
                                </h3>
                            </div>
                            <div style={{ padding: '0.5rem 0' }}>
                                <div style={styles.healthItem}>
                                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Blood Group</span>
                                    <span style={{ fontWeight: 700, padding: '0.25rem 0.75rem', background: '#fee2e2', color: '#dc2626', borderRadius: '9999px', fontSize: '0.875rem' }}>B+</span>
                                </div>
                                <div style={styles.healthItem}>
                                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Allergies</span>
                                    <span style={{ fontWeight: 600, padding: '0.25rem 0.75rem', background: '#fef3c7', color: '#d97706', borderRadius: '9999px', fontSize: '0.75rem' }}>None</span>
                                </div>
                            </div>
                            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                                <Link to="/user/profile" style={{ ...styles.viewAllLink, color: '#dc2626', justifyContent: 'space-between' }}>
                                    View Full Profile <FiArrowRight />
                                </Link>
                            </div>
                        </div>

                        {/* Buy Again */}
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h3 style={{ ...styles.sectionTitle, marginBottom: 0 }}>
                                    <FiRefreshCcw style={{ color: '#3b82f6' }} /> Buy Again
                                </h3>
                            </div>
                            <div style={{ padding: '0.5rem' }}>
                                {featuredMedicines.slice(0, 3).map((medicine) => (
                                    <div key={medicine._id} style={styles.buyAgainItem}>
                                        <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                            💊
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{medicine.name}</div>
                                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>₹{medicine.price}</div>
                                        </div>
                                        <button style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FiPlus />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding: '0.75rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                                <Link to="/user/catalog" style={{ ...styles.viewAllLink, justifyContent: 'center' }}>
                                    Browse All Medicines
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                @media (max-width: 1024px) {
                    .dashboard-main > div:nth-child(2) { grid-template-columns: repeat(2, 1fr) !important; }
                    .dashboard-main > div:nth-child(4) { grid-template-columns: repeat(2, 1fr) !important; }
                    .dashboard-main > div:last-child { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 640px) {
                    .dashboard-main > div:nth-child(2) { grid-template-columns: 1fr !important; }
                    .dashboard-main > div:nth-child(4) { grid-template-columns: repeat(2, 1fr) !important; }
                }
            `}</style>
        </div>
    );
};

export default UserDashboard;
