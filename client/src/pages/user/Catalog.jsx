
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

    const handleCategorySelect = (categoryId) => {
        setFilters(prev => ({ ...prev, category: prev.category === categoryId ? '' : categoryId }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleAddToCart = (medicine) => {
        addToCart(medicine, 1);
        toast.success(`Added ${medicine.name} to cart`);
    };

    // Inline styles
    const styles = {
        page: {
            background: 'var(--bg-primary)',
            minHeight: '100vh',
            padding: '2rem'
        },
        header: {
            marginBottom: '1.5rem'
        },
        title: {
            fontSize: '1.875rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
        },
        gradientText: {
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
        },
        subtitle: {
            color: 'var(--text-secondary)',
            fontSize: '1rem'
        },
        /* Search bar */
        searchBar: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-light)',
            borderRadius: '0.875rem',
            padding: '0.25rem 1.25rem',
            marginBottom: '1rem',
            transition: 'border-color 0.2s'
        },
        searchIcon: {
            color: 'var(--text-secondary)',
            fontSize: '1.125rem',
            flexShrink: 0
        },
        searchInput: {
            flex: 1,
            padding: '0.875rem 0',
            fontSize: '0.9375rem',
            color: 'var(--text-primary)',
            background: 'transparent',
            border: 'none',
            outline: 'none'
        },
        /* Filter chips row */
        chipsRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none',
        },
        chip: {
            padding: '0.5rem 1.125rem',
            fontSize: '0.8125rem',
            fontWeight: '500',
            color: 'var(--text-secondary)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: '9999px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            flexShrink: 0,
        },
        chipActive: {
            padding: '0.5rem 1.125rem',
            fontSize: '0.8125rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            border: '1px solid transparent',
            borderRadius: '9999px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(249,115,22,0.3)',
        },
        /* Price filter row */
        priceRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
        },
        priceLabel: {
            fontSize: '0.8125rem',
            fontWeight: '500',
            color: 'var(--text-secondary)',
            flexShrink: 0
        },
        priceInput: {
            width: '110px',
            padding: '0.5rem 0.75rem',
            fontSize: '0.875rem',
            color: 'var(--text-primary)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-light)',
            borderRadius: '0.5rem',
            outline: 'none',
            transition: 'border-color 0.2s',
        },
        priceDash: {
            color: 'var(--border-light)',
            fontSize: '0.875rem'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem'
        },
        card: {
            background: 'var(--bg-secondary)',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            border: '1px solid var(--bg-tertiary)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease'
        },
        cardImage: {
            height: '180px',
            background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)',
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
            background: 'rgba(249,115,22,0.15)',
            color: '#fb923c',
            borderRadius: '9999px',
            marginBottom: '0.75rem'
        },
        cardTitle: {
            fontSize: '1.0625rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
            lineHeight: '1.3'
        },
        cardDesc: {
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
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
            borderTop: '1px solid var(--border-light)'
        },
        price: {
            fontSize: '1.375rem',
            fontWeight: '800',
            color: 'var(--text-primary)'
        },
        addBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.625rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'white',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
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
            color: 'var(--text-secondary)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-light)',
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
            background: 'var(--bg-secondary)',
            borderRadius: '1rem',
            border: '1px solid var(--bg-tertiary)'
        },
        emptyIcon: {
            width: '80px',
            height: '80px',
            background: 'var(--bg-secondary)',
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
            color: 'var(--text-primary)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
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
            color: 'var(--text-secondary)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-light)',
            borderRadius: '0.625rem',
            cursor: 'not-allowed'
        },
        pageInfo: {
            padding: '0.625rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
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

                {/* Search Bar */}
                <div style={styles.searchBar}>
                    <FiSearch style={styles.searchIcon} />
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search medicines, symptoms..."
                        style={styles.searchInput}
                    />
                    {filters.search && (
                        <button
                            onClick={() => { setFilters(prev => ({ ...prev, search: '' })); setPagination(prev => ({ ...prev, page: 1 })); }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }}
                        >×</button>
                    )}
                </div>

                {/* Category Chips */}
                <div style={styles.chipsRow} className="catalog-chips-row">
                    <button
                        onClick={() => handleCategorySelect('')}
                        style={filters.category === '' ? styles.chipActive : styles.chip}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat._id}
                            onClick={() => handleCategorySelect(cat._id)}
                            style={filters.category === cat._id ? styles.chipActive : styles.chip}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Price Filters */}
                <div style={styles.priceRow}>
                    <span style={styles.priceLabel}>Price:</span>
                    <input
                        type="number"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        placeholder="Min"
                        style={styles.priceInput}
                    />
                    <span style={styles.priceDash}>—</span>
                    <input
                        type="number"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        placeholder="Max"
                        style={styles.priceInput}
                    />
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                        <div className="spinner" style={{ width: 48, height: 48, marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Loading catalog...</p>
                    </div>
                ) : medicines.length > 0 ? (
                    <>
                        <div style={styles.grid} className="catalog-grid">
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
                                            <span style={{ ...styles.lowStockBadge, background: 'var(--text-secondary)' }}>Out of Stock</span>
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
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            No medicines found
                        </h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Try adjusting your search or filter criteria
                        </p>
                    </div>
                )}
            </main>

            <style>{`
                .catalog-chips-row::-webkit-scrollbar { display: none; }
                .catalog-chips-row button:hover {
                    background: var(--border-light);
                    border-color: var(--border-light);
                    color: var(--text-primary);
                }
                @media (max-width: 1280px) {
                    .dashboard-main .catalog-grid { grid-template-columns: repeat(3, 1fr) !important; }
                }
                @media (max-width: 1024px) {
                    .dashboard-main .catalog-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 640px) {
                    .dashboard-main .catalog-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default Catalog;




