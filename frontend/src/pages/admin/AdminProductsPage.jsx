import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/common/PageContainer.jsx';
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  toggleProductAvailability,
  seedProductsToFirestore
} from '../../services/firestoreService.js';
import { CLOTHING_CATEGORIES } from '../../data/mockProducts.js';

const AVAILABLE_SIZES_PRESET = ['XS', 'S', 'M', 'L', 'XL', '2XL', 'Custom Tailored'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingProductId, setEditingProductId] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    category: 'Shirts',
    basePrice: '',
    badge: '',
    description: '',
    availableFabricsText: '',
    availableColorsText: '',
    availableSizes: [...AVAILABLE_SIZES_PRESET],
    available: true
  });

  const loadProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await getAdminProducts();
      if (res.success) {
        setProducts(res.products || []);
      } else {
        setFeedback({ type: 'error', message: 'Could not load products: ' + (res.error?.message || 'Unknown error') });
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
      setFeedback({ type: 'error', message: 'Failed fetching product catalog.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Clear feedback after 4s
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Seed Catalog Helper
  const handleSeedCatalog = async () => {
    if (!window.confirm('Sync mock catalog models into Firestore collection?')) return;
    try {
      setSeeding(true);
      const res = await seedProductsToFirestore();
      await loadProducts(true);
      setFeedback({
        type: 'success',
        message: `Catalog synchronized to Firestore (${res.successful} garments saved).`
      });
    } catch (err) {
      console.error('Seed error:', err);
      setFeedback({ type: 'error', message: 'Failed seeding catalog.' });
    } finally {
      setSeeding(false);
    }
  };

  // Toggle availability
  const handleToggleAvailability = async (productId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, available: newStatus } : p))
      );

      const res = await toggleProductAvailability(productId, newStatus);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Garment availability set to ${newStatus ? 'Active' : 'Disabled'}.`
        });
      } else {
        throw res.error || new Error('Update failed');
      }
    } catch (err) {
      console.error('Failed toggling product:', err);
      // Revert optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, available: currentStatus } : p))
      );
      setFeedback({ type: 'error', message: 'Failed updating availability status.' });
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingProductId(null);
    setFormData({
      name: '',
      category: 'Shirts',
      basePrice: '',
      badge: '',
      description: '',
      availableFabricsText: 'Egyptian Giza Cotton, Oxford Weave, Royal Twill',
      availableColorsText: 'Crisp White (#FFFFFF), Midnight Navy (#1E3A8A), Sky Blue (#93C5FD)',
      availableSizes: [...AVAILABLE_SIZES_PRESET],
      available: true
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setModalMode('edit');
    setEditingProductId(product.id);

    // Parse fabrics to text
    const fabricsText = (product.availableFabrics || [])
      .map((f) => (typeof f === 'string' ? f : f.name))
      .join(', ');

    // Parse colors to text
    const colorsText = (product.availableColors || [])
      .map((c) => (typeof c === 'string' ? c : `${c.name} (${c.hex || '#000000'})`))
      .join(', ');

    setFormData({
      name: product.name || '',
      category: product.category || 'Shirts',
      basePrice: product.basePrice !== undefined ? product.basePrice : '',
      badge: product.badge || '',
      description: product.description || '',
      availableFabricsText: fabricsText,
      availableColorsText: colorsText,
      availableSizes: Array.isArray(product.availableSizes) && product.availableSizes.length > 0
        ? product.availableSizes
        : [...AVAILABLE_SIZES_PRESET],
      available: product.available !== false
    });
    setIsModalOpen(true);
  };

  // Handle Save (Add or Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }

    if (!formData.basePrice || isNaN(formData.basePrice)) {
      alert('Valid base price is required');
      return;
    }

    // Parse fabrics text into objects
    const fabrics = formData.availableFabricsText
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)
      .map((f) => ({ name: f, composition: 'Pure milled fabric' }));

    // Parse colors text
    const colors = formData.availableColorsText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const hexMatch = c.match(/\((#[0-9a-fA-F]{3,6})\)/);
        const name = c.replace(/\(#[0-9a-fA-F]{3,6}\)/, '').trim();
        return {
          name: name || c,
          hex: hexMatch ? hexMatch[1] : '#1E3A8A'
        };
      });

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      basePrice: Number(formData.basePrice),
      badge: formData.badge.trim() || null,
      description: formData.description.trim(),
      availableFabrics: fabrics.length > 0 ? fabrics : [{ name: 'Standard Cotton', composition: '100% Cotton' }],
      availableColors: colors.length > 0 ? colors : [{ name: 'Navy Blue', hex: '#1E3A8A' }],
      availableSizes: formData.availableSizes.length > 0 ? formData.availableSizes : ['Custom Tailored'],
      available: Boolean(formData.available)
    };

    try {
      setSavingProduct(true);

      if (modalMode === 'add') {
        const res = await createAdminProduct(payload);
        if (res.success) {
          setProducts((prev) => [res.product, ...prev]);
          setFeedback({ type: 'success', message: `Added new garment "${payload.name}" to catalog.` });
          setIsModalOpen(false);
        } else {
          throw res.error || new Error('Creation failed');
        }
      } else {
        const res = await updateAdminProduct(editingProductId, payload);
        if (res.success) {
          setProducts((prev) =>
            prev.map((p) => (p.id === editingProductId ? { ...p, ...payload, updatedAt: new Date().toISOString() } : p))
          );
          setFeedback({ type: 'success', message: `Updated garment "${payload.name}".` });
          setIsModalOpen(false);
        } else {
          throw res.error || new Error('Update failed');
        }
      }
    } catch (err) {
      console.error('Product save error:', err);
      setFeedback({ type: 'error', message: 'Failed saving product: ' + (err?.message || 'Access error') });
    } finally {
      setSavingProduct(false);
    }
  };

  // Toggle size checkbox
  const handleToggleSize = (size) => {
    setFormData((prev) => {
      const exists = prev.availableSizes.includes(size);
      if (exists) {
        return { ...prev, availableSizes: prev.availableSizes.filter((s) => s !== size) };
      } else {
        return { ...prev, availableSizes: [...prev.availableSizes, size] };
      }
    });
  };

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    // Category
    if (categoryFilter !== 'All' && prod.category !== categoryFilter) {
      return false;
    }

    // Availability
    if (availabilityFilter === 'Active' && prod.available === false) return false;
    if (availabilityFilter === 'Disabled' && prod.available !== false) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = (prod.name || '').toLowerCase().includes(q);
      const catMatch = (prod.category || '').toLowerCase().includes(q);
      const descMatch = (prod.description || '').toLowerCase().includes(q);
      if (!nameMatch && !catMatch && !descMatch) return false;
    }

    return true;
  });

  return (
    <div className="py-2 sm:py-4 space-y-6">
      <PageContainer maxWidth="full">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">
              Catalog Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Custom Garment Silhouettes
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Configure customizable garment models, base pricing, textiles, and color options.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleSeedCatalog}
              disabled={seeding}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50"
              title="Populate Firestore with initial mock models if empty"
            >
              <span>{seeding ? 'Syncing...' : 'Sync Mock Catalog'}</span>
            </button>

            <button
              type="button"
              onClick={() => loadProducts(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-accent' : 'text-neutral-500'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-brand-dark text-white hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <span>+ Add Garment</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`p-3.5 rounded-lg text-xs font-medium flex items-center justify-between shadow-sm animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="text-neutral-400 hover:text-neutral-600">
              &times;
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search garments by name, category, or description..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-neutral-50 rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-accent focus:bg-white text-neutral-900 transition-all"
              />
              <svg className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-600 text-xs"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="sm:col-span-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-neutral-50 rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-accent text-neutral-800"
              >
                {CLOTHING_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-neutral-50 rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-accent text-neutral-800"
              >
                <option value="All">All Availability ({products.length})</option>
                <option value="Active">Active Only ({products.filter((p) => p.available !== false).length})</option>
                <option value="Disabled">Disabled Only ({products.filter((p) => p.available === false).length})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table Container */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 bg-neutral-50/70 border-b border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
            <span>
              Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> garments
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-400 space-y-2">
              <div className="w-7 h-7 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Loading apparel catalog...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center space-y-2 text-xs text-neutral-500">
              <p className="font-bold text-neutral-800">No products matching filters</p>
              <p className="text-neutral-400">Click "+ Add Garment" or "Sync Mock Catalog" to populate items.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-neutral-200">
                <thead className="bg-neutral-50 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Garment Silhouette</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Base Commission</th>
                    <th className="py-3 px-4">Textile Swatches</th>
                    <th className="py-3 px-4">Colors & Swatches</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredProducts.map((product) => {
                    const isActive = product.available !== false;
                    const fabrics = product.availableFabrics || [];
                    const colors = product.availableColors || [];

                    return (
                      <tr key={product.id} className="hover:bg-neutral-50/80 transition-colors">
                        {/* Name & Badge */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 text-xs">{product.name}</span>
                            {product.badge && (
                              <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded bg-amber-100 text-amber-800">
                                {product.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-400 line-clamp-1 max-w-xs mt-0.5">
                            {product.description || 'Custom tailored architecture'}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700">
                            {product.category}
                          </span>
                        </td>

                        {/* Base Price */}
                        <td className="py-3 px-4 font-black text-neutral-900">
                          ₹{Number(product.basePrice || 0).toLocaleString('en-IN')}
                        </td>

                        {/* Fabrics */}
                        <td className="py-3 px-4 text-neutral-600">
                          <span className="font-semibold text-neutral-800">{fabrics.length}</span> textiles
                          <div className="text-[10px] text-neutral-400 truncate max-w-[140px]">
                            {fabrics.map((f) => f.name || f).join(', ')}
                          </div>
                        </td>

                        {/* Colors */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {colors.slice(0, 5).map((c, i) => (
                              <span
                                key={i}
                                className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-xs"
                                style={{ backgroundColor: c.hex || '#1E3A8A' }}
                                title={c.name || c}
                              />
                            ))}
                            {colors.length > 5 && (
                              <span className="text-[10px] text-neutral-400">+{colors.length - 5}</span>
                            )}
                          </div>
                        </td>

                        {/* Active Toggle */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(product.id, isActive)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200'
                            }`}
                          >
                            {isActive ? '● Active' : '○ Disabled'}
                          </button>
                        </td>

                        {/* Edit Action */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(product)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add / Edit Garment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-5 my-8">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900">
                    {modalMode === 'add' ? 'Add New Garment Silhouette' : 'Edit Garment Details'}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {modalMode === 'add' ? 'Create a new customizable garment model for the catalog' : 'Update pricing, textiles, and available styling choices'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                {/* Name & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      Garment Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Royal Oxford Bespoke Shirt"
                      className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-accent focus:bg-white text-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-accent text-neutral-900"
                    >
                      {CLOTHING_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Base Price & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      Base Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      placeholder="e.g. 2499"
                      className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-accent focus:bg-white text-neutral-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      Promotional Badge
                    </label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="Featured, Trending, Luxury..."
                      className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-accent text-neutral-900"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                    Garment Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Bespoke tailoring architectural notes..."
                    className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-accent focus:bg-white text-neutral-900"
                  />
                </div>

                {/* Available Fabrics Text */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                    Available Fabrics (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.availableFabricsText}
                    onChange={(e) => setFormData({ ...formData, availableFabricsText: e.target.value })}
                    placeholder="Egyptian Giza Cotton, Oxford Weave, Royal Twill"
                    className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-accent text-neutral-900"
                  />
                  <span className="text-[10px] text-neutral-400">Separate multiple textile options with commas</span>
                </div>

                {/* Available Colors Text */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                    Available Colors (Format: Name (#HEX), comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.availableColorsText}
                    onChange={(e) => setFormData({ ...formData, availableColorsText: e.target.value })}
                    placeholder="Crisp White (#FFFFFF), Midnight Navy (#1E3A8A), Sky Blue (#93C5FD)"
                    className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-accent text-neutral-900"
                  />
                  <span className="text-[10px] text-neutral-400">Include hex color code in parentheses for visual swatches</span>
                </div>

                {/* Available Sizes Checkboxes */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1.5">
                    Available Sizes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SIZES_PRESET.map((size) => {
                      const selected = formData.availableSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleToggleSize(size)}
                          className={`px-3 py-1 rounded-md text-xs font-semibold border transition-all ${
                            selected
                              ? 'bg-brand-dark text-white border-brand-dark'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Availability Toggle */}
                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-neutral-900">Garment Active Status</div>
                    <div className="text-[10px] text-neutral-500">Allow customers to view and customize in storefront</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Actions */}
                <div className="pt-4 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 font-semibold hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="px-5 py-2 rounded-lg bg-brand-dark text-white font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    {savingProduct ? 'Saving...' : modalMode === 'add' ? 'Create Garment' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
