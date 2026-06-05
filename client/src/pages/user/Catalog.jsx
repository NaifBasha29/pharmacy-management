import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { medicinesAPI, categoriesAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import AppLayout from '../../components/layout/AppLayout';
import { FiSearch, FiShoppingCart, FiPlus, FiMinus, FiTag, FiChevronLeft, FiChevronRight, FiFilter, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Catalog = () => {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', category: '', minPrice: '', maxPrice: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [quantities, setQuantities] = useState({});

  const { addToCart } = useCart();

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchMedicines(); }, [filters, pagination.page]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data.categories || []);
    } catch (e) { console.error('Categories fetch error:', e); }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: pagination.limit };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      const response = await medicinesAPI.getAll(params);
      setMedicines(response.data.data.medicines || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.data.pagination?.total || 0,
        pages: response.data.data.pagination?.pages || 1,
      }));
    } catch (e) {
      console.error('Medicines fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCategorySelect = (catId) => {
    setFilters(prev => ({ ...prev, category: prev.category === catId ? '' : catId }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const setQty = (id, delta) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }));
  };

  const handleAddToCart = (medicine) => {
    const qty = quantities[medicine._id] || 1;
    addToCart(medicine, qty);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', minPrice: '', maxPrice: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const hasFilters = !!(filters.category || filters.minPrice || filters.maxPrice);

  return (
    <AppLayout title="Medicine Catalog">
      <div className="flex h-full">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r border-gray-100 bg-white p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Clear all</button>
            )}
          </div>

          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</p>
            <div className="space-y-1">
              <button
                onClick={() => handleCategorySelect('')}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!filters.category ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => handleCategorySelect(cat._id)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors truncate ${filters.category === cat._id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price Range (₹)</p>
            <div className="space-y-2">
              <input
                type="number"
                name="minPrice"
                placeholder="Min price"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                name="maxPrice"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Search Bar */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search medicines..."
                value={filters.search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-colors bg-gray-50 focus:bg-white"
              />
            </div>
            <button
              onClick={() => setFiltersOpen(true)}
              className={`lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${hasFilters ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <FiFilter size={15} /> Filters
            </button>
          </div>

          {!loading && (
            <div className="px-4 pt-3 pb-1 flex items-center justify-between">
              <p className="text-xs text-gray-500">{pagination.total} results{filters.search ? ` for "${filters.search}"` : ''}</p>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 lg:hidden">
                  <FiX size={12} /> Clear filters
                </button>
              )}
            </div>
          )}

          <div className="p-4 pb-24 lg:pb-8">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 animate-pulse">
                    <div className="h-32 bg-gray-100 rounded-xl" />
                    <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-8 bg-gray-100 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : medicines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-4">💊</div>
                <h3 className="text-base font-semibold text-gray-800 mb-1">No medicines found</h3>
                <p className="text-sm text-gray-500 mb-5">Try adjusting your search or filters</p>
                <button onClick={clearFilters} className="text-sm bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {medicines.map(medicine => {
                  const qty = quantities[medicine._id] || 1;
                  const isOutOfStock = medicine.stock <= 0;
                  return (
                    <div key={medicine._id} className={`bg-white rounded-2xl border shadow-sm flex flex-col transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${isOutOfStock ? 'border-gray-100 opacity-75' : 'border-gray-100'}`}>
                      <div className="h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-t-2xl flex items-center justify-center relative overflow-hidden">
                        {medicine.imageUrl ? (
                          <img src={medicine.imageUrl} alt={medicine.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-5xl">💊</span>
                        )}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
                            <span className="text-white text-xs font-semibold bg-gray-900/60 px-2.5 py-1 rounded-full">Out of Stock</span>
                          </div>
                        )}
                        {medicine.requiresPrescription && (
                          <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Rx</span>
                        )}
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        {medicine.category?.name && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 mb-1">
                            <FiTag size={11} /> {medicine.category.name}
                          </span>
                        )}
                        <Link to={`/user/medicines/${medicine._id}`} className="font-semibold text-gray-900 text-sm leading-snug hover:text-blue-600 transition-colors line-clamp-2 mb-0.5">
                          {medicine.name}
                        </Link>
                        {medicine.manufacturer && (
                          <p className="text-xs text-gray-400 mb-2">{medicine.manufacturer}</p>
                        )}

                        <div className="mt-auto pt-2 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">₹{medicine.price}</span>
                            {medicine.originalPrice && medicine.originalPrice > medicine.price && (
                              <span className="text-xs text-gray-400 line-through">₹{medicine.originalPrice}</span>
                            )}
                          </div>

                          {!isOutOfStock ? (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                                <button onClick={() => setQty(medicine._id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                                  <FiMinus size={13} />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold text-gray-900">{qty}</span>
                                <button onClick={() => setQty(medicine._id, 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                                  <FiPlus size={13} />
                                </button>
                              </div>
                              <button
                                onClick={() => handleAddToCart(medicine)}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                              >
                                <FiShoppingCart size={14} /> Add
                              </button>
                            </div>
                          ) : (
                            <button disabled className="w-full bg-gray-100 text-gray-400 text-sm font-semibold py-2 rounded-xl cursor-not-allowed">
                              Out of Stock
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {pagination.pages > 1 && !loading && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronLeft size={15} /> Prev
                </button>
                <span className="text-sm text-gray-500">
                  Page <span className="font-semibold text-gray-900">{pagination.page}</span> of <span className="font-semibold text-gray-900">{pagination.pages}</span>
                </span>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next <FiChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      {filtersOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"><FiX size={18} /></button>
            </div>
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { handleCategorySelect(''); setFiltersOpen(false); }} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!filters.category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All</button>
                {categories.map(cat => (
                  <button key={cat._id} onClick={() => { handleCategorySelect(cat._id); setFiltersOpen(false); }} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filters.category === cat._id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{cat.name}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3 mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price Range (₹)</p>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" name="minPrice" placeholder="Min price" value={filters.minPrice} onChange={handleFilterChange} className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <input type="number" name="maxPrice" placeholder="Max price" value={filters.maxPrice} onChange={handleFilterChange} className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { clearFilters(); setFiltersOpen(false); }} className="py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Clear</button>
              <button onClick={() => setFiltersOpen(false)} className="py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">Apply</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Catalog;
