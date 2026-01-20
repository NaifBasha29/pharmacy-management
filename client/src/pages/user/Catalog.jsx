
import { useState, useEffect } from 'react';
import { medicinesAPI, categoriesAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import Sidebar from '../../components/common/Sidebar';
import { FiSearch, FiFilter, FiShoppingCart, FiPlus, FiMinus, FiTag, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Catalog = () => {
    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        minPrice: '',
        maxPrice: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        pages: 1
    });

    const { addToCart } = useCart();

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchMedicines();
    }, [filters, pagination.page]);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            setCategories(response.data.data.categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: filters.search,
                category: filters.category,
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice
            };
            
            Object.keys(params).forEach(key => params[key] === '' && delete params[key]);

            const response = await medicinesAPI.getAll(params);
            setMedicines(response.data.data.medicines);
            setPagination(prev => ({
                ...prev,
                total: response.data.data.pagination.total,
                pages: response.data.data.pagination.pages
            }));
        } catch (error) {
            console.error('Error fetching medicines:', error);
            toast.error('Failed to load medicines');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleAddToCart = (medicine) => {
        addToCart(medicine, 1);
        toast.success(`Added ${medicine.name} to cart`);
    };

    // Inline styles
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
            background: 'linear-gradient(135deg, #10b981, #059669)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
        },
        subtitle: {
            color: '#64748b',
            fontSize: '1rem'
        },
        filterPanel: {
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.04)'
        },
        filterGrid: {
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '1rem',
            alignItems: 'end'
        },
        label: {
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
        },
        inputWrapper: {
            position: 'relative'
        },
        inputIcon: {
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
            fontSize: '1.125rem'
        },
        input: {
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 2.5rem',
            fontSize: '0.9375rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            outline: 'none',
            transition: 'all 0.2s',
            background: '#f9fafb'
        },
        inputNoIcon: {
            width: '100%',
            padding: '0.75rem 1rem',
            fontSize: '0.9375rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            outline: 'none',
            transition: 'all 0.2s',
            background: '#f9fafb'
        },
        select: {
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 2.5rem',
            fontSize: '0.9375rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            outline: 'none',
            background: '#f9fafb',
            cursor: 'pointer',
            appearance: 'none'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem'
        },
        card: {
            background: 'white',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease'
        },
        cardImage: {
            height: '180px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
        },
        cardBody: {
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            flex: 1
        },
        categoryBadge: {
            display: 'inline-block',
            fontSize: '0.7rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0.25rem 0.625rem',
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            color: '#2563eb',
            borderRadius: '9999px',
            marginBottom: '0.75rem'
        },
        cardTitle: {
            fontSize: '1.0625rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '0.5rem',
            lineHeight: '1.3'
        },
        cardDesc: {
            fontSize: '0.875rem',
            color: '#64748b',
            marginBottom: '1rem',
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.5'
        },
        cardFooter: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9'
        },
        price: {
            fontSize: '1.375rem',
            fontWeight: '800',
            color: '#0f172a'
        },
        addBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.625rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'white',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none',
            borderRadius: '0.625rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 6px rgba(16,185,129,0.3)'
        },
        addBtnDisabled: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.625rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#9ca3af',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '0.625rem',
            cursor: 'not-allowed'
        },
        lowStockBadge: {
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            fontSize: '0.6875rem',
            fontWeight: '700',
            padding: '0.25rem 0.625rem',
            borderRadius: '9999px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
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
        },
        pagination: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.75rem',
            marginTop: '2.5rem'
        },
        pageBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.625rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.625rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
        },
        pageBtnDisabled: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.625rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#9ca3af',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '0.625rem',
            cursor: 'not-allowed'
        },
        pageInfo: {
            padding: '0.625rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.625rem'
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main" style={styles.page}>
                {/* Header */}
                <div style={styles.header}>
                    <h1 style={styles.title}>
                        Medicine <span style={styles.gradientText}>Catalog</span>
                    </h1>
                    <p style={styles.subtitle}>Browse and shop for medicines you need</p>
                </div>

                {/* Filters */}
                <div style={styles.filterPanel}>
                    <div style={styles.filterGrid}>
                        <div>
                            <label style={styles.label}>Search</label>
                            <div style={styles.inputWrapper}>
                                <FiSearch style={styles.inputIcon} />
                                <input
                                    type="text"
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Search medicines..."
                                    style={styles.input}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label style={styles.label}>Category</label>
                            <div style={styles.inputWrapper}>
                                <FiTag style={styles.inputIcon} />
                                <select
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                    style={styles.select}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={styles.label}>Min Price</label>
                            <input
                                type="number"
                                name="minPrice"
                                value={filters.minPrice}
                                onChange={handleFilterChange}
                                placeholder="₹0"
                                style={styles.inputNoIcon}
                            />
                        </div>

                        <div>
                            <label style={styles.label}>Max Price</label>
                            <input
                                type="number"
                                name="maxPrice"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                                placeholder="₹10000"
                                style={styles.inputNoIcon}
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                        <div className="spinner" style={{ width: 48, height: 48, marginBottom: '1rem' }} />
                        <p style={{ color: '#64748b', fontWeight: 500 }}>Loading catalog...</p>
                    </div>
                ) : medicines.length > 0 ? (
                    <>
                        <div style={styles.grid}>
                            {medicines.map(medicine => (
                                <div key={medicine._id} style={styles.card}>
                                    <div style={styles.cardImage}>
                                        {medicine.image ? (
                                            <img 
                                                src={medicine.image} 
                                                alt={medicine.name} 
                                                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }}
                                            />
                                        ) : (
                                            <span style={{ fontSize: '4rem', opacity: 0.5 }}>💊</span>
                                        )}
                                        {medicine.stock <= 10 && medicine.stock > 0 && (
                                            <span style={styles.lowStockBadge}>Low Stock</span>
                                        )}
                                        {medicine.stock === 0 && (
                                            <span style={{ ...styles.lowStockBadge, background: '#6b7280' }}>Out of Stock</span>
                                        )}
                                    </div>
                                    
                                    <div style={styles.cardBody}>
                                        <span style={styles.categoryBadge}>
                                            {medicine.category?.name || 'General'}
                                        </span>
                                        
                                        <h3 style={styles.cardTitle}>{medicine.name}</h3>
                                        
                                        <p style={styles.cardDesc}>
                                            {medicine.description || 'No description available'}
                                        </p>
                                        
                                        <div style={styles.cardFooter}>
                                            <span style={styles.price}>₹{medicine.price}</span>
                                            
                                            <button
                                                onClick={() => handleAddToCart(medicine)}
                                                disabled={medicine.stock === 0}
                                                style={medicine.stock > 0 ? styles.addBtn : styles.addBtnDisabled}
                                            >
                                                <FiShoppingCart />
                                                {medicine.stock > 0 ? 'Add' : 'Out'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div style={styles.pagination}>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    style={pagination.page === 1 ? styles.pageBtnDisabled : styles.pageBtn}
                                >
                                    <FiChevronLeft /> Previous
                                </button>
                                <span style={styles.pageInfo}>
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page === pagination.pages}
                                    style={pagination.page === pagination.pages ? styles.pageBtnDisabled : styles.pageBtn}
                                >
                                    Next <FiChevronRight />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>🔍</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                            No medicines found
                        </h3>
                        <p style={{ color: '#64748b' }}>
                            Try adjusting your search or filter criteria
                        </p>
                    </div>
                )}
            </main>

            <style>{`
                @media (max-width: 1280px) {
                    .dashboard-main > div:nth-child(3) { grid-template-columns: repeat(3, 1fr) !important; }
                }
                @media (max-width: 1024px) {
                    .dashboard-main > div:nth-child(2) > div:first-child { grid-template-columns: 1fr 1fr !important; }
                    .dashboard-main > div:nth-child(3) { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 640px) {
                    .dashboard-main > div:nth-child(2) > div:first-child { grid-template-columns: 1fr !important; }
                    .dashboard-main > div:nth-child(3) { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default Catalog;
