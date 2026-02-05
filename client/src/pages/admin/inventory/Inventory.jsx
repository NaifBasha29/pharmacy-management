import { useState, useEffect } from 'react';
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2, FiPackage,
    FiAlertTriangle, FiRefreshCw, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { medicinesAPI, categoriesAPI } from '../../../services/api';
import TopNav from '../../../components/common/TopNav';
import './Inventory.css';

const Inventory = () => {
    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 0 });
    const [showModal, setShowModal] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, medicine: null });
    const [deleting, setDeleting] = useState(false);
    const [stats, setStats] = useState({ total: 0, lowStock: 0, expiring: 0, outOfStock: 0 });

    const [formData, setFormData] = useState({
        name: '', genericName: '', category: '', manufacturer: '',
        dosageForm: '', strength: '', unit: '', stock: 0,
        minStockLevel: 10, price: 0, expiryDate: '', description: ''
    });

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchMedicines();
        fetchCategories();
        fetchStats();
    }, [debouncedSearch, categoryFilter, stockFilter, pagination.page]);

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const params = {
                search: debouncedSearch || undefined,
                category: categoryFilter !== 'all' ? categoryFilter : undefined,
                page: pagination.page,
                limit: pagination.limit
            };

            if (stockFilter === 'low') {
                params.lowStock = true;
            } else if (stockFilter === 'out') {
                params.outOfStock = true;
            }

            const response = await medicinesAPI.getAll(params);
            if (response.data.success) {
                setMedicines(response.data.data.medicines || response.data.data || []);
                if (response.data.data.pagination) {
                    setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch medicines:', error);
            toast.error('Failed to load medicines');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            if (response.data.success) {
                setCategories(response.data.data.categories || response.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await medicinesAPI.getStats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'number' ? (parseFloat(value) || 0) : value
        });
    };

    const resetForm = () => {
        setFormData({
            name: '', genericName: '', category: '', manufacturer: '',
            dosageForm: '', strength: '', unit: '', stock: 0,
            minStockLevel: 10, price: 0, expiryDate: '', description: ''
        });
        setSelectedMedicine(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (selectedMedicine) {
                await medicinesAPI.update(selectedMedicine._id, formData);
                toast.success('Medicine updated successfully');
            } else {
                await medicinesAPI.create(formData);
                toast.success('Medicine added successfully');
            }
            setShowModal(false);
            resetForm();
            fetchMedicines();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save medicine');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.medicine) return;

        try {
            setDeleting(true);
            await medicinesAPI.delete(deleteModal.medicine._id);
            toast.success('Medicine deleted successfully');
            setDeleteModal({ show: false, medicine: null });
            fetchMedicines();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete medicine');
        } finally {
            setDeleting(false);
        }
    };

    const openEditModal = (medicine) => {
        setSelectedMedicine(medicine);
        setFormData({
            name: medicine.name || '',
            genericName: medicine.genericName || '',
            category: medicine.category?._id || medicine.category || '',
            manufacturer: medicine.manufacturer || '',
            dosageForm: medicine.dosageForm || '',
            strength: medicine.strength || '',
            unit: medicine.unit || '',
            stock: medicine.stock || 0,
            minStockLevel: medicine.minStockLevel || 10,
            price: medicine.price || 0,
            expiryDate: medicine.expiryDate ? medicine.expiryDate.split('T')[0] : '',
            description: medicine.description || ''
        });
        setShowModal(true);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const getStockStatus = (medicine) => {
        if (medicine.stock === 0) return { class: 'out', text: 'Out of Stock' };
        if (medicine.stock <= medicine.minStockLevel) return { class: 'low', text: 'Low Stock' };
        return { class: 'ok', text: 'In Stock' };
    };

    if (loading && medicines.length === 0) {
        return (
            <div className="full-page-loading">
                <div className="spinner" />
                <p>Loading inventory...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <TopNav />
            <main className="dashboard-main">
                <div className="page-header">
                    <div className="header-content">
                        <h1>Inventory Management</h1>
                        <p>Manage medicines, stock levels, and expiry dates</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-outline" onClick={() => { fetchMedicines(); fetchStats(); }}>
                            <FiRefreshCw /> Refresh
                        </button>
                        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                            <FiPlus /> Add Medicine
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="inventory-stats">
                    <div className={`stat-box ${stockFilter === 'all' ? 'selected' : ''}`} onClick={() => setStockFilter('all')}>
                        <FiPackage className="stat-icon" />
                        <span className="stat-number">{stats.total || medicines.length}</span>
                        <span className="stat-text">Total Medicines</span>
                    </div>
                    <div className={`stat-box warning ${stockFilter === 'low' ? 'selected' : ''}`} onClick={() => setStockFilter('low')}>
                        <FiAlertTriangle className="stat-icon" />
                        <span className="stat-number">{stats.lowStock || 0}</span>
                        <span className="stat-text">Low Stock</span>
                    </div>
                    <div className={`stat-box danger ${stockFilter === 'out' ? 'selected' : ''}`} onClick={() => setStockFilter('out')}>
                        <FiAlertTriangle className="stat-icon" />
                        <span className="stat-number">{stats.outOfStock || 0}</span>
                        <span className="stat-text">Out of Stock</span>
                    </div>
                    <div className="stat-box expiring">
                        <FiAlertTriangle className="stat-icon" />
                        <span className="stat-number">{stats.expiring || 0}</span>
                        <span className="stat-text">Expiring Soon</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search medicines..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Stock Levels</option>
                            <option value="low">Low Stock</option>
                            <option value="out">Out of Stock</option>
                        </select>
                    </div>
                </div>

                {/* Medicines Table */}
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Medicine</th>
                                    <th>Category</th>
                                    <th>Stock</th>
                                    <th>Price</th>
                                    <th>Expiry</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.map((medicine) => {
                                    const stockStatus = getStockStatus(medicine);
                                    return (
                                        <tr key={medicine._id}>
                                            <td>
                                                <div className="medicine-info">
                                                    <span className="medicine-name">{medicine.name}</span>
                                                    {medicine.genericName && (
                                                        <span className="medicine-generic">{medicine.genericName}</span>
                                                    )}
                                                    {medicine.strength && (
                                                        <span className="medicine-strength">{medicine.strength}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>{medicine.category?.name || medicine.category || '-'}</td>
                                            <td>
                                                <span className={`stock-badge ${stockStatus.class}`}>
                                                    {medicine.stock} / {medicine.minStockLevel}
                                                </span>
                                            </td>
                                            <td>₹{medicine.price?.toFixed(2) || '0.00'}</td>
                                            <td>
                                                {medicine.expiryDate
                                                    ? new Date(medicine.expiryDate).toLocaleDateString()
                                                    : '-'
                                                }
                                            </td>
                                            <td>
                                                <span className={`status-badge ${stockStatus.class}`}>
                                                    {stockStatus.text}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="action-btn edit"
                                                        onClick={() => openEditModal(medicine)}
                                                        title="Edit"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => setDeleteModal({ show: true, medicine })}
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {medicines.length === 0 && !loading && (
                        <div className="empty-state">
                            <FiPackage size={48} />
                            <p>No medicines found</p>
                            <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                                Add Medicine
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                            >
                                <FiChevronLeft />
                            </button>
                            <span className="pagination-info">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                            >
                                <FiChevronRight />
                            </button>
                        </div>
                    )}
                </div>

                {/* Add/Edit Medicine Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
                        <div className="modal large" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{selectedMedicine ? 'Edit Medicine' : 'Add New Medicine'}</h2>
                                <button className="modal-close" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Medicine Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleFormChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Generic Name</label>
                                            <input
                                                type="text"
                                                name="genericName"
                                                value={formData.genericName}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Category</label>
                                            <select name="category" value={formData.category} onChange={handleFormChange}>
                                                <option value="">Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Manufacturer</label>
                                            <input
                                                type="text"
                                                name="manufacturer"
                                                value={formData.manufacturer}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Dosage Form</label>
                                            <select name="dosageForm" value={formData.dosageForm} onChange={handleFormChange}>
                                                <option value="">Select Form</option>
                                                <option value="Tablet">Tablet</option>
                                                <option value="Capsule">Capsule</option>
                                                <option value="Syrup">Syrup</option>
                                                <option value="Injection">Injection</option>
                                                <option value="Cream">Cream</option>
                                                <option value="Drops">Drops</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Strength</label>
                                            <input
                                                type="text"
                                                name="strength"
                                                value={formData.strength}
                                                onChange={handleFormChange}
                                                placeholder="e.g., 500mg"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Stock Quantity *</label>
                                            <input
                                                type="number"
                                                name="stock"
                                                value={formData.stock}
                                                onChange={handleFormChange}
                                                min="0"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Min Stock Level</label>
                                            <input
                                                type="number"
                                                name="minStockLevel"
                                                value={formData.minStockLevel}
                                                onChange={handleFormChange}
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Price (₹) *</label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleFormChange}
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Expiry Date</label>
                                            <input
                                                type="date"
                                                name="expiryDate"
                                                value={formData.expiryDate}
                                                onChange={handleFormChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleFormChange}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Saving...' : (selectedMedicine ? 'Update' : 'Add Medicine')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteModal.show && (
                    <div className="modal-overlay">
                        <div className="modal-content delete-modal">
                            <div className="modal-icon">
                                <FiAlertTriangle size={48} color="#ef4444" />
                            </div>
                            <h3>Delete Medicine?</h3>
                            <p>Are you sure you want to delete <strong>{deleteModal.medicine?.name}</strong>?</p>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setDeleteModal({ show: false, medicine: null })}
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Inventory;




