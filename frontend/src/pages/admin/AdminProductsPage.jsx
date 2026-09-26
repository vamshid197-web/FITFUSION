import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  toggleProductAvailability,
  updateProductStock,
  seedProductsToFirestore
} from '../../services/firestoreService.js';
import { CLOTHING_CATEGORIES, getProductStockStatus } from '../../data/mockProducts.js';
import { logAdminActivity } from '../../services/adminActivityService.js';

const AVAILABLE_SIZES_PRESET = ['XS', 'S', 'M', 'L', 'XL', '2XL', 'Custom Tailored'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchParams] = useSearchParams();
  const initialStockFilter = searchParams.get('filter') === 'low_stock' ? 'Low Stock' : 'All';
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState(initialStockFilter);

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
    compareAtPrice: '',
    badge: '',
    stock: 25,
    lowStockThreshold: 5,
    stockStatus: 'In Stock',
    featured: false,
    trending: false,
    recommended: false,
    customizationEnabled: true,
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

  
  // Phase 17: Quick Restock Handler for rapid inventory adjustment
  const handleQuickRestock = async (product, amount) => {
    const currentStock = product.stock !== undefined ? Number(product.stock) : 25;
    const newStock = Math.max(0, currentStock + amount);
    const threshold = product.lowStockThreshold !== undefined ? Number(product.lowStockThreshold) : 5;
    const computedStatus = newStock === 0 ? 'Out of Stock' : (newStock <= threshold ? 'Low Stock' : 'In Stock');

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, stock: newStock, stockStatus: computedStatus, available: newStock > 0 } : p))
    );

    try {
      await updateProductStock(product.id, newStock, threshold);
      try {
        await logAdminActivity({
          action: 'PRODUCT_STOCK_ADJUSTED',
          targetType: 'product',
          targetId: product.id,
          details: `Restocked ${amount > 0 ? '+' : ''}${amount} units for "${product.name}". New stock: ${newStock} units.`
        });
      } catch (e) {}
      setFeedback({
        type: 'success',
        message: `Updated "${product.name}" stock to ${newStock} units (${computedStatus}).`
      });
    } catch (err) {
      console.error('Failed restocking:', err);
      // Revert on error
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: currentStock, stockStatus: product.stockStatus } : p))
      );
      setFeedback({ type: 'error', message: 'Failed updating inventory.' });
    }
  };

  // Toggle availability
  const handleToggleAvailability = async (productId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      // Optimistic update
      try {
            await logAdminActivity({
              action: 'PRODUCT_UPDATED',
              targetType: 'product',
              targetId: editingProductId,
              details: `Updated product "${payload.name}". Stock: ${numStock} units (${computedStockStatus}).`
            });
          } catch(e) {}
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
      compareAtPrice: '',
      badge: '',
      stockStatus: 'In Stock',
      featured: false,
      trending: false,
      recommended: false,
      customizationEnabled: true,
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
      compareAtPrice: product.compareAtPrice !== undefined ? product.compareAtPrice : '',
      badge: product.badge || '',
      stock: product.stock !== undefined ? product.stock : 25,
      lowStockThreshold: product.lowStockThreshold !== undefined ? product.lowStockThreshold : 5,
      stockStatus: getProductStockStatus ? getProductStockStatus(product) : (product.stockStatus || 'In Stock'),
      featured: Boolean(product.featured || product.badge === 'Featured'),
      trending: Boolean(product.trending || product.badge === 'Trending'),
      recommended: Boolean(product.recommended || product.badge === 'Recommended'),
      customizationEnabled: product.customizationEnabled !== false,
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

  // Handle Save (Add or Edit) with strict validation
  const handleSaveProduct = async (e) => {
    e.preventDefault();

    // 1. Name validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      alert('Product name must contain at least 2 characters.');
      return;
    }

    // 2. Base price validation
    const numPrice = Number(formData.basePrice);
    if (!formData.basePrice || isNaN(numPrice) || numPrice <= 0) {
      alert('Please specify a valid base price greater than ₹0.');
      return;
    }

    // 3. Compare at price validation
    let numCompareAt = null;
    if (formData.compareAtPrice && formData.compareAtPrice !== '') {
      numCompareAt = Number(formData.compareAtPrice);
      if (isNaN(numCompareAt) || numCompareAt < 0) {
        alert('Compare-at price must be a valid positive number.');
        return;
      }
    }

    // 4. Description validation
    if (!formData.description.trim()) {
      alert('Product description cannot be empty.');
      return;
    }

    // Parse fabrics text into objects
    const fabrics = formData.availableFabricsText
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)
      .map((f) => ({ name: f, composition: 'Pure certified textile' }));

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

    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const numStock = Math.max(0, Number(formData.stock) || 0);
    const numThreshold = Math.max(1, Number(formData.lowStockThreshold) || 5);
    let computedStockStatus = 'In Stock';
    if (numStock === 0 || !formData.available) {
      computedStockStatus = 'Out of Stock';
    } else if (numStock <= numThreshold) {
      computedStockStatus = 'Low Stock';
    }

    const payload = {
      name: formData.name.trim(),
      slug: slug,
      category: formData.category,
      basePrice: numPrice,
      compareAtPrice: numCompareAt,
      currency: 'INR',
      badge: formData.badge.trim() || null,
      stock: numStock,
      lowStockThreshold: numThreshold,
      stockStatus: computedStockStatus,
      featured: Boolean(formData.featured),
      trending: Boolean(formData.trending),
      recommended: Boolean(formData.recommended),
      customizationEnabled: Boolean(formData.customizationEnabled),
      description: formData.description.trim(),
      shortDescription: formData.description.trim().slice(0, 90) + '...',
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
          try {
            await logAdminActivity({
              action: 'PRODUCT_CREATED',
              targetType: 'product',
              targetId: res.product.id,
              details: `Created new product "${res.product.name}" with ${numStock} units stock.`
            });
          } catch(e) {}
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


  const getStatus = (p) => getProductStockStatus ? getProductStockStatus(p) : (p.stockStatus || 'In Stock');
  const lowStockCount = products.filter((p) => getStatus(p) === 'Low Stock').length;
  const outOfStockCount = products.filter((p) => getStatus(p) === 'Out of Stock').length;
  const inStockCount = products.filter((p) => getStatus(p) === 'In Stock').length;

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    // Category
    if (categoryFilter !== 'All' && prod.category !== categoryFilter) {
      return false;
    }

    // Availability
    if (availabilityFilter === 'Active' && prod.available === false) return false;
    if (availabilityFilter === 'Disabled' && prod.available !== false) return false;

    // Stock Filter
    if (stockFilter !== 'All') {
      const s = getStatus(prod);
      if (stockFilter !== s) return false;
    }
  

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
              Configure customizable garment models, base pricing, textiles, color options, and storefront discovery tags.
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
              className="p-2 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
              title="Refresh Catalog"
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-accent' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-brand-dark text-white hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <span>+ Add Garment Model</span>
            </button>
          </div>
        </div>

        {/* Transient Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                : 'bg-red-50 border-red-200 text-red-800 font-medium'
            }`}
          >
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="font-bold hover:underline ml-4">
              Dismiss
            </button>
          </div>
        )}

        
        {/* Phase 17: Inventory Warning Alert Banner */}
        {(lowStockCount > 0 || outOfStockCount > 0) && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚠️</span>
              <div>
                <span className="font-bold text-amber-950">Inventory Notice: </span>
                <span>
                  {lowStockCount > 0 ? `${lowStockCount} bespoke garment models are low in stock (below threshold). ` : ''}
                  {outOfStockCount > 0 ? `${outOfStockCount} models are currently out of stock.` : ''}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {lowStockCount > 0 && (
                <button
                  type="button"
                  onClick={() => setStockFilter('Low Stock')}
                  className="px-3 py-1.5 bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold rounded-lg transition-colors cursor-pointer text-xs"
                >
                  View Low Stock ({lowStockCount})
                </button>
              )}
              {outOfStockCount > 0 && (
                <button
                  type="button"
                  onClick={() => setStockFilter('Out of Stock')}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg transition-colors cursor-pointer text-xs"
                >
                  View Out of Stock ({outOfStockCount})
                </button>
              )}
              {stockFilter !== 'All' && (
                <button
                  type="button"
                  onClick={() => setStockFilter('All')}
                  className="px-2.5 py-1.5 text-neutral-600 hover:text-neutral-900 font-bold text-xs"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        )}
  
        {/* Toolbar: Search & Filters */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search garments by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 rounded-lg border border-neutral-200 focus:outline-none focus:border-brand-accent focus:bg-white text-neutral-800"
            />
            <svg className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-3">
            
            {/* Stock Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-neutral-500">Inventory:</span>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-neutral-800 focus:outline-none focus:border-brand-accent font-medium"
              >
                <option value="All">All Stock ({products.length})</option>
                <option value="In Stock">In Stock ({inStockCount})</option>
                <option value="Low Stock">⚠️ Low Stock ({lowStockCount})</option>
                <option value="Out of Stock">🚫 Out of Stock ({outOfStockCount})</option>
              </select>
            </div>
  
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-neutral-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-neutral-800 focus:outline-none focus:border-brand-accent"
              >
                {CLOTHING_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-neutral-500">Status:</span>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-neutral-800 focus:outline-none focus:border-brand-accent"
              >
                <option value="All">All Garments</option>
                <option value="Active">Active Only</option>
                <option value="Disabled">Disabled Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Catalog Table */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading garment models from catalog...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              No garments found matching active filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="py-3 px-4">Garment Silhouette</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Base Price</th>
                    <th className="py-3 px-4">Inventory & Stock</th>
                    <th className="py-3 px-4">Discovery Tags</th>
                    <th className="py-3 px-4">Textiles / Colors</th>
                    <th className="py-3 px-4">Active</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/70">
                  {filteredProducts.map((product) => {
                    const fabrics = product.availableFabrics || [];
                    const colors = product.availableColors || [];
                    const isActive = product.available !== false;
                    const basePrice = Number(product.basePrice || product.price || 0);

                    return (
                      <tr key={product.id} className="hover:bg-neutral-50/60 transition-colors">
                        {/* Garment Silhouette */}
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
                        <td className="py-3 px-4">
                          <div className="font-black text-neutral-900">
                            ₹{basePrice.toLocaleString('en-IN')}
                          </div>
                          {product.compareAtPrice && product.compareAtPrice > basePrice && (
                            <div className="text-[10px] text-neutral-400 line-through">
                              ₹{Number(product.compareAtPrice).toLocaleString('en-IN')}
                            </div>
                          )}
                        </td>

                        {/* Stock Status */}
                        <td className="py-3 px-4">
                          {(() => {
                            const curStatus = getStatus(product);
                            const curStock = product.stock !== undefined ? Number(product.stock) : 25;
                            return (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    curStatus === 'In Stock'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : curStatus === 'Low Stock'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300 font-black animate-pulse'
                                      : 'bg-red-50 text-red-700 border border-red-200'
                                  }`}>
                                    {curStatus}
                                  </span>
                                  <span className="font-mono text-xs font-bold text-neutral-800">
                                    {curStock} units
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px]">
                                  <button
                                    type="button"
                                    onClick={() => handleQuickRestock(product, 5)}
                                    className="px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-emerald-100 hover:text-emerald-800 text-neutral-600 font-bold transition-colors cursor-pointer"
                                    title="Restock +5 units"
                                  >
                                    +5
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickRestock(product, 1)}
                                    className="px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold transition-colors cursor-pointer"
                                    title="Restock +1 unit"
                                  >
                                    +1
                                  </button>
                                  {curStock > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleQuickRestock(product, -1)}
                                      className="px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-red-100 hover:text-red-700 text-neutral-600 font-bold transition-colors cursor-pointer"
                                      title="Deduct 1 unit"
                                    >
                                      -1
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </td>

                        {/* Discovery Tags */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {product.featured && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700">
                                Featured
                              </span>
                            )}
                            {product.trending && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-700">
                                Trending
                              </span>
                            )}
                            {product.recommended && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700">
                                Recommended
                              </span>
                            )}
                            {!product.featured && !product.trending && !product.recommended && (
                              <span className="text-[10px] text-neutral-400">Standard</span>
                            )}
                          </div>
                        </td>

                        {/* Fabrics / Colors */}
                        <td className="py-3 px-4 text-neutral-600">
                          <div className="text-[11px]">
                            <strong className="text-neutral-800">{fabrics.length}</strong> textiles &bull; <strong className="text-neutral-800">{colors.length}</strong> shades
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {colors.slice(0, 4).map((c, i) => (
                              <span
                                key={i}
                                className="w-3 h-3 rounded-full border border-neutral-300 shadow-2xs"
                                style={{ backgroundColor: c.hex || '#1E3A8A' }}
                                title={c.name || c}
                              />
                            ))}
                            {colors.length > 4 && (
                              <span className="text-[9px] text-neutral-400 font-semibold">+{colors.length - 4}</span>
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
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors shadow-2xs"
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
                    {modalMode === 'add' ? 'Create a new customizable garment model for the catalog' : 'Update pricing, discovery tags, textiles, and available styling choices'}
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
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Base Price & Compare At Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      Base Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      placeholder="e.g. 1499"
                      className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-accent focus:bg-white text-neutral-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      Compare-at Price (₹) / MRP
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.compareAtPrice}
                      onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                      placeholder="e.g. 1999"
                      className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-accent text-neutral-900"
                    />
                  </div>
                </div>

                {/* Stock Status & Promotional Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      Stock Status
                    </label>
                    <select
                      value={formData.stockStatus}
                      onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-accent text-neutral-900"
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Made to Order">Made to Order</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      Promotional Ribbon / Badge
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

                
                {/* Phase 17: Inventory Stock & Low Stock Threshold */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      Inventory Stock (Units) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-accent text-neutral-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      Low Stock Alert Threshold
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-accent text-neutral-900"
                    />
                  </div>
                </div>

                {/* Discovery Flags */}
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <span className="block text-[11px] font-bold uppercase text-neutral-700">
                    Storefront Catalog Discovery Flags
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-neutral-700">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="rounded border-neutral-300 text-brand-accent"
                      />
                      <span>⭐ Featured</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-neutral-700">
                      <input
                        type="checkbox"
                        checked={formData.trending}
                        onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                        className="rounded border-neutral-300 text-brand-accent"
                      />
                      <span>🔥 Trending</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-neutral-700">
                      <input
                        type="checkbox"
                        checked={formData.recommended}
                        onChange={(e) => setFormData({ ...formData, recommended: e.target.checked })}
                        className="rounded border-neutral-300 text-brand-accent"
                      />
                      <span>👍 Recommended</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-neutral-700">
                      <input
                        type="checkbox"
                        checked={formData.customizationEnabled}
                        onChange={(e) => setFormData({ ...formData, customizationEnabled: e.target.checked })}
                        className="rounded border-neutral-300 text-brand-accent"
                      />
                      <span>✂ Customizable</span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                    Garment Description *
                  </label>
                  <textarea
                    rows={2}
                    required
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
                              ? 'bg-brand-dark text-white border-brand-dark shadow-2xs'
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
