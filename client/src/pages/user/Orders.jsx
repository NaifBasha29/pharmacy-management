
import { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import { FiPackage, FiClock, FiCheckCircle, FiXCircle, FiTruck, FiEye, FiShoppingBag, FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [expandedOrder, setExpandedOrder] = useState(null);
    
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await ordersAPI.getAll();
            setOrders(response.data.data.orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getFilteredOrders = () => {
        if (activeTab === 'all') return orders;
        if (activeTab === 'active') return orders.filter(o => ['pending', 'confirmed', 'processing', 'dispatched'].includes(o.status));
        if (activeTab === 'completed') return orders.filter(o => o.status === 'delivered');
        if (activeTab === 'cancelled') return orders.filter(o => o.status === 'cancelled');
        return orders;
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        
        try {
            await ordersAPI.cancel(orderId);
            toast.success('Order cancelled successfully');
            fetchOrders();
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('Failed to cancel order');
        }
    };

    const filteredOrders = getFilteredOrders();

    // Styles
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
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
        },
        subtitle: {
            color: '#64748b',
            fontSize: '1rem'
        },
        tabs: {
            display: 'inline-flex',
            background: 'white',
            borderRadius: '0.75rem',
            padding: '0.375rem',
            gap: '0.25rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        },
        tab: (active) => ({
            padding: '0.625rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: active ? '#2563eb' : '#64748b',
            background: active ? '#eff6ff' : 'transparent',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textTransform: 'capitalize'
        }),
        orderCard: {
            background: 'white',
            borderRadius: '1rem',
            marginBottom: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.04)',
            overflow: 'hidden'
        },
        orderHeader: {
            padding: '1.25rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s'
        },
        orderInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        orderIcon: {
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
            fontSize: '1.25rem'
        },
        orderId: {
            fontSize: '1rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '0.25rem'
        },
        orderMeta: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.875rem',
            color: '#64748b'
        },
        badge: (status) => {
            const colors = {
                pending: { bg: '#fef3c7', color: '#d97706' },
                confirmed: { bg: '#dbeafe', color: '#2563eb' },
                processing: { bg: '#e0e7ff', color: '#4f46e5' },
                dispatched: { bg: '#fae8ff', color: '#a855f7' },
                delivered: { bg: '#dcfce7', color: '#16a34a' },
                cancelled: { bg: '#fee2e2', color: '#dc2626' }
            };
            const c = colors[status] || { bg: '#f1f5f9', color: '#64748b' };
            return {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                borderRadius: '9999px',
                background: c.bg,
                color: c.color
            };
        },
        orderActions: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        },
        btn: {
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            transition: 'all 0.2s'
        },
        btnCancel: {
            background: '#fee2e2',
            color: '#dc2626'
        },
        btnExpand: {
            background: '#f1f5f9',
            color: '#475569'
        },
        orderDetails: (expanded) => ({
            maxHeight: expanded ? '500px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease',
            background: '#f8fafc',
            borderTop: expanded ? '1px solid #e5e7eb' : 'none'
        }),
        detailsInner: {
            padding: '1.5rem'
        },
        itemsTitle: {
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        itemsList: {
            background: 'white',
            borderRadius: '0.75rem',
            padding: '1rem',
            border: '1px solid #e5e7eb'
        },
        item: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 0',
            borderBottom: '1px dashed #e5e7eb'
        },
        itemInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        },
        itemIcon: {
            width: '40px',
            height: '40px',
            background: '#f1f5f9',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem'
        },
        itemName: {
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '0.125rem'
        },
        itemQty: {
            fontSize: '0.75rem',
            color: '#64748b'
        },
        itemPrice: {
            fontWeight: '700',
            color: '#1e293b'
        },
        totalRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '2px solid #e5e7eb'
        },
        emptyState: {
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        },
        emptyIcon: {
            width: '80px',
            height: '80px',
            background: '#f1f5f9',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2.5rem'
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <FiClock />;
            case 'confirmed':
            case 'delivered': return <FiCheckCircle />;
            case 'processing': return <FiPackage />;
            case 'dispatched': return <FiTruck />;
            case 'cancelled': return <FiXCircle />;
            default: return <FiPackage />;
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main" style={styles.page}>
                {/* Header */}
                <div style={styles.header}>
                    <h1 style={styles.title}>
                        My <span style={styles.gradientText}>Orders</span>
                    </h1>
                    <p style={styles.subtitle}>Track and manage your purchase history</p>
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                    {['all', 'active', 'completed', 'cancelled'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={styles.tab(activeTab === tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                        <div className="spinner" style={{ width: 48, height: 48, marginBottom: '1rem' }} />
                        <p style={{ color: '#64748b', fontWeight: 500 }}>Loading orders...</p>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <div>
                        {filteredOrders.map(order => (
                            <div key={order._id} style={styles.orderCard}>
                                <div 
                                    style={styles.orderHeader}
                                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                >
                                    <div style={styles.orderInfo}>
                                        <div style={styles.orderIcon}>
                                            <FiShoppingBag />
                                        </div>
                                        <div>
                                            <div style={styles.orderId}>Order #{order.orderNumber}</div>
                                            <div style={styles.orderMeta}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <FiCalendar size={14} />
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </span>
                                                <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                                    ₹{order.total?.toLocaleString()}
                                                </span>
                                                <span style={styles.badge(order.status)}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={styles.orderActions}>
                                        {order.status === 'pending' && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleCancelOrder(order._id); }}
                                                style={{ ...styles.btn, ...styles.btnCancel }}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button style={{ ...styles.btn, ...styles.btnExpand }}>
                                            {expandedOrder === order._id ? <FiChevronUp /> : <FiChevronDown />}
                                            Details
                                        </button>
                                    </div>
                                </div>

                                <div style={styles.orderDetails(expandedOrder === order._id)}>
                                    <div style={styles.detailsInner}>
                                        <div style={styles.itemsTitle}>
                                            <FiPackage /> Order Items
                                        </div>
                                        <div style={styles.itemsList}>
                                            {order.items?.map((item, index) => (
                                                <div key={index} style={{ ...styles.item, borderBottom: index === order.items.length - 1 ? 'none' : '1px dashed #e5e7eb' }}>
                                                    <div style={styles.itemInfo}>
                                                        <div style={styles.itemIcon}>💊</div>
                                                        <div>
                                                            <div style={styles.itemName}>{item.medicine?.name}</div>
                                                            <div style={styles.itemQty}>Qty: {item.quantity} × ₹{item.price}</div>
                                                        </div>
                                                    </div>
                                                    <div style={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString()}</div>
                                                </div>
                                            ))}
                                            <div style={styles.totalRow}>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>Order Total</span>
                                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>₹{order.total?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📦</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                            No orders found
                        </h3>
                        <p style={{ color: '#64748b' }}>
                            {activeTab !== 'all' ? `You have no ${activeTab} orders` : "You haven't placed any orders yet"}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Orders;
