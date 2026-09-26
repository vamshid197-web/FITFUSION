import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getUserOrders,
  ORDER_TRACKING_STAGES,
  TAILORING_LIFECYCLE_MAPPING
} from '../../services/firestoreService.js';
import ProductImage from '../../components/common/ProductImage.jsx';

// Progress percentage calculation
const STAGE_PROGRESS = {
  'Order Confirmed': { step: 1, percent: 16, label: 'Pattern Drafting & Allocation' },
  'Fabric Cutting': { step: 2, percent: 35, label: 'Precision Textile Cutting' },
  'Artisan Stitching': { step: 3, percent: 58, label: 'Handcrafted Assembly' },
  'Master QA Check': { step: 4, percent: 78, label: 'Quality Inspection' },
  'Dispatched': { step: 5, percent: 92, label: 'Dispatched to Courier' },
  'Delivered': { step: 6, percent: 100, label: 'Delivered & Fitted' },
  'Cancelled': { step: 0, percent: 0, label: 'Order Cancelled' }
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadOrders = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorNotice('');

    let firestoreOrders = [];
    let firestoreFailed = false;

    // 1. If authenticated, fetch from Cloud Firestore
    if (user?.uid) {
      try {
        const res = await getUserOrders(user.uid);
        if (res.success && Array.isArray(res.orders)) {
          firestoreOrders = res.orders;
        } else {
          firestoreFailed = true;
        }
      } catch (err) {
        console.warn('[OrdersPage] Error querying Firestore:', err);
        firestoreFailed = true;
      }
    }

    // 2. Load cached / local orders from localStorage
    let localOrders = [];
    try {
      const saved = localStorage.getItem('fitfusion_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          localOrders = parsed.filter(o => user?.uid ? o.userId === user.uid : (!o.userId || o.userId === 'guest'));
        }
      }
    } catch (err) {
      console.warn('[OrdersPage] Failed to parse localStorage orders:', err);
    }

    if (firestoreFailed) {
      setErrorNotice('Unable to reach cloud database right now. Displaying locally cached orders.');
    }

    // 3. Merge orders (Firestore prioritized, local fallback appended without duplicates)
    const seenIds = new Set();
    const combined = [];

    firestoreOrders.forEach(o => {
      const id = o.orderId || o.id || o.orderNumber;
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        combined.push(o);
      }
    });

    localOrders.forEach(o => {
      const id = o.orderId || o.id || o.orderNumber;
      if (id && !seenIds.has(id)) {
        seenIds.add(id);
        combined.push(o);
      }
    });

    // Sort newest first
    combined.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.date || 0).getTime();
      const timeB = new Date(b.createdAt || b.date || 0).getTime();
      return timeB - timeA;
    });

    setOrders(combined);
    if (combined.length > 0 && !expandedOrderId) {
      setExpandedOrderId(combined[0].orderId || combined[0].id || combined[0].orderNumber);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const toggleExpand = (orderId) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Filtered orders based on search query and status filter
  const filteredOrders = orders.filter((order) => {
    const orderId = (order.orderId || order.id || order.orderNumber || '').toLowerCase();
    const currentStatus = (order.orderStatus || order.status || 'Order Confirmed').toLowerCase();

    // Status filter
    if (statusFilter === 'In Progress') {
      if (currentStatus === 'delivered' || currentStatus === 'cancelled') return false;
    } else if (statusFilter === 'Delivered') {
      if (currentStatus !== 'delivered') return false;
    } else if (statusFilter === 'Cancelled') {
      if (currentStatus !== 'cancelled') return false;
    }

    // Search query matching orderId or garment names
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();

    if (orderId.includes(query)) return true;

    // Check items
    const hasMatchingItem = (order.items || []).some((item) =>
      (item.productName || '').toLowerCase().includes(query) ||
      (item.category || '').toLowerCase().includes(query) ||
      (item.fabric?.name || item.selectedFabric?.name || '').toLowerCase().includes(query)
    );

    return hasMatchingItem;
  });

  return (
    <div className="py-8 sm:py-12 bg-neutral-50/50 min-h-screen">
      <PageContainer maxWidth="lg">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                FITFUSION
              </span>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs text-neutral-500 font-medium">
                {orders.length} Total {orders.length === 1 ? 'Order' : 'Orders'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight mt-1">
              My Orders
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Track your orders, view order details, and check delivery status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadOrders(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
              title="Refresh orders from Cloud Firestore"
            >
              <svg
                className={`w-3.5 h-3.5 text-neutral-500 ${refreshing ? 'animate-spin text-brand-accent' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <Button to="/shop" variant="secondary" size="sm">
              + New Customization
            </Button>
          </div>
        </div>

        {/* Temporary warning/notice if Firestore fails gracefully */}
        {errorNotice && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{errorNotice}</span>
            </div>
            <span className="text-[10px] font-bold uppercase bg-amber-200/70 px-2 py-0.5 rounded">
              Local Cache
            </span>
          </div>
        )}

        {/* Filter & Search Bar */}
        {!loading && orders.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID or garment..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-accent focus:border-brand-accent"
              />
              <svg
                className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-xs text-neutral-400 hover:text-neutral-600"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['All', 'In Progress', 'Delivered', 'Cancelled'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setStatusFilter(filterOption)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === filterOption
                      ? 'bg-brand-dark text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {filterOption}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="mt-12 p-12 bg-white rounded-2xl border border-neutral-200 text-center space-y-4 max-w-md mx-auto shadow-sm">
            <div className="w-8 h-8 mx-auto border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-brand-dark">Loading your orders...</h3>
              <p className="text-xs text-neutral-500">Fetching your order history</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="mt-8 bg-white rounded-2xl border border-neutral-200 p-10 sm:p-16 text-center shadow-sm space-y-5 max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-accentLight border border-brand-accent/20 flex items-center justify-center text-brand-accent">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-brand-dark">No Orders Placed Yet</h2>
              <p className="text-sm text-neutral-500">
                You haven't placed any orders yet. Browse our catalog and customize a garment.
              </p>
            </div>
            <div className="pt-3">
              <Button to="/shop" variant="primary" size="md">
                Browse Collection &rarr;
              </Button>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Filter Mismatch State */
          <div className="mt-8 bg-white rounded-2xl border border-neutral-200 p-10 text-center space-y-3 max-w-md mx-auto">
            <div className="text-2xl">🔍</div>
            <h3 className="text-base font-bold text-brand-dark">No Matching Orders</h3>
            <p className="text-xs text-neutral-500">
              No orders found matching "{searchQuery}" with filter "{statusFilter}".
            </p>
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
              className="text-xs text-brand-accent font-bold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* Orders List */
          <div className="mt-8 space-y-6">
            {filteredOrders.map((order) => {
              const currentOrderId = order.orderId || order.id || order.orderNumber;
              const isExpanded = expandedOrderId === currentOrderId;
              const itemCount = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
              const orderTotal = order.pricing?.total ?? order.total ?? 0;
              const orderSubtotal = order.pricing?.subtotal ?? order.subtotal ?? 0;
              const orderDiscount = order.pricing?.discount ?? order.discount ?? 0;
              const orderDelivery = order.pricing?.delivery ?? order.delivery ?? 0;
              const orderDate = order.createdAt || order.date;
              const currentStatus = order.orderStatus || order.status || 'Order Confirmed';
              const isCancelled = currentStatus === 'Cancelled';
              const stageInfo = STAGE_PROGRESS[currentStatus] || { step: 1, percent: 16, label: currentStatus };

              return (
                <div
                  key={currentOrderId}
                  className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden transition-all duration-200 hover:border-neutral-300"
                >
                  {/* Order Card Header Summary */}
                  <div className="p-5 sm:p-6 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-100">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Order Number
                        </span>
                        <Link
                          to={`/orders/${currentOrderId}`}
                          className="text-base font-extrabold text-brand-dark font-mono hover:text-brand-accent transition-colors"
                        >
                          #{currentOrderId}
                        </Link>
                      </div>

                      <div className="hidden sm:block h-8 w-px bg-neutral-200" />

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Placed On
                        </span>
                        <span className="text-xs font-semibold text-neutral-700">
                          {formatDate(orderDate)}
                        </span>
                      </div>

                      <div className="hidden sm:block h-8 w-px bg-neutral-200" />

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Garments
                        </span>
                        <span className="text-xs font-semibold text-neutral-700">
                          {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                        </span>
                      </div>

                      <div className="hidden sm:block h-8 w-px bg-neutral-200" />

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Total Amount
                        </span>
                        <span className="text-base font-black text-brand-dark">
                          ₹{orderTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Status & Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                      {/* Status Badge */}
                      {isCancelled ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Cancelled
                        </span>
                      ) : currentStatus === 'Delivered' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Delivered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          {currentStatus}
                        </span>
                      )}

                      {/* Payment Status Badge */}
                      {order.paymentStatus === 'Paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span>✓</span> Paid ({order.paymentMethod ? (order.paymentMethod.includes('UPI') ? 'UPI' : order.paymentMethod.includes('Card') ? 'Card' : 'Paid') : 'Paid'})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <span>⏳</span> Pending ({order.paymentMethod ? (order.paymentMethod.includes('COD') || order.paymentMethod.includes('Cash') ? 'COD' : order.paymentMethod) : 'COD'})
                        </span>
                      )}

                      {/* Primary "Track Order" Button */}
                      <Link
                        to={`/orders/${currentOrderId}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-dark hover:bg-brand-accent text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        <span>Track Order</span>
                        <span>&rarr;</span>
                      </Link>

                      {/* Quick Inspect Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(currentOrderId)}
                        aria-label="Toggle quick view"
                        className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-brand-dark hover:border-neutral-300 transition-colors"
                        title={isExpanded ? 'Collapse quick view' : 'Expand quick view'}
                      >
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Mini Progress Bar on Card */}
                  {!isCancelled && (
                    <div className="px-5 sm:px-6 py-2.5 bg-neutral-50/70 border-b border-neutral-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <span className="font-bold text-neutral-800">
                          {currentStatus === 'Delivered' ? 'Completed' : `Stage ${stageInfo.step} of 6`}:
                        </span>
                        <span className="truncate max-w-[200px] sm:max-w-xs">{stageInfo.label}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-20 sm:w-28 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-accent rounded-full transition-all duration-500"
                            style={{ width: `${stageInfo.percent}%` }}
                          />
                        </div>
                        <span className="font-bold text-brand-dark font-mono">{stageInfo.percent}%</span>
                      </div>
                    </div>
                  )}

                  {/* Expanded Quick Inspection Section */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 bg-neutral-50/30 space-y-6">
                      {/* Tracking Deep Link Banner */}
                      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-base">📍</span>
                          <div>
                            <span className="font-bold text-amber-950">Detailed Order Tracking Available</span>
                            <p className="text-[11px] text-amber-800">
                              View complete 6-stage timeline, tailoring notes, delivery estimates, and full garment anatomy.
                            </p>
                          </div>
                        </div>
                        <Link
                          to={`/orders/${currentOrderId}`}
                          className="shrink-0 inline-flex items-center gap-1 font-bold text-brand-accent hover:underline text-xs"
                        >
                          <span>Open Live Tracking Page</span>
                          <span>&rarr;</span>
                        </Link>
                      </div>

                      {/* Garment Items Quick List */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Ordered Garments ({order.items?.length || 0})
                        </h4>

                        {order.items?.map((item, idx) => {
                          const fabricName =
                            item.selectedFabric?.name ||
                            item.fabric?.name ||
                            (typeof item.fabric === 'string' ? item.fabric : 'Selected Fabric');
                          const colorName =
                            item.selectedColor?.name ||
                            item.color?.name ||
                            (typeof item.color === 'string' ? item.color : 'Custom');
                          const collarStyle = item.collar || item.design?.collar || item.designOptions?.collar || 'Standard';
                          const cuffStyle = item.cuff || item.design?.cuff || item.designOptions?.cuff || 'Standard';
                          const buttonsStyle = item.buttons || item.design?.buttons || item.designOptions?.buttons || 'Standard';
                          const monogramText = item.monogram?.text || (typeof item.monogram === 'string' ? item.monogram : null);
                          const perfumeItem = item.selectedPerfume || item.perfume;
                          const unitPrice = item.totalItemPrice || item.itemPrice || item.price || 0;
                          const itemQty = item.quantity || 1;

                          return (
                            <div
                              key={item.cartItemId || idx}
                              className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 flex flex-col md:flex-row gap-4 justify-between"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-16 h-20 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 relative">
                                  <ProductImage
                                    src={item.productImage || item.image}
                                    alt={item.productName}
                                    category={item.category}
                                    tintColor={item.selectedColor?.hex || item.color?.hex}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">
                                    {item.category || 'Custom Apparel'}
                                  </span>
                                  <h5 className="text-sm font-bold text-brand-dark">
                                    {item.productName}
                                  </h5>
                                  <div className="text-xs text-neutral-600 space-y-0.5 pt-0.5">
                                    <p>
                                      <strong>Fabric:</strong> {fabricName} &bull;{' '}
                                      <strong>Color:</strong> {colorName}
                                    </p>
                                    <p>
                                      <strong>Style:</strong> {collarStyle} Collar, {cuffStyle} Cuff, {buttonsStyle} Buttons
                                    </p>
                                    <p>
                                      <strong>Fit:</strong> {item.fit || 'Regular'} &bull;{' '}
                                      <strong>Size:</strong> {item.size || 'Custom Tailored'}
                                      {monogramText && (
                                        <span> &bull; <strong>Monogram:</strong> "{monogramText}"</span>
                                      )}
                                    </p>

                                    {perfumeItem && (
                                      <p className="text-brand-accent font-semibold flex items-center gap-1 mt-1 text-[11px]">
                                        <span>✨</span> Perfume: {perfumeItem.name} (+₹{perfumeItem.price || 0})
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-neutral-100">
                                <span className="text-xs text-neutral-500">
                                  Qty: <strong className="text-neutral-800">{itemQty}</strong> &times; ₹{unitPrice.toLocaleString('en-IN')}
                                </span>
                                <span className="text-sm font-extrabold text-brand-dark mt-0.5">
                                  ₹{(unitPrice * itemQty).toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pricing and Action Footer */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-neutral-200">
                        <Link
                          to={`/orders/${currentOrderId}`}
                          className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-1"
                        >
                          <span>Full Invoice & Tracking Timeline &rarr;</span>
                        </Link>

                        <div className="bg-white rounded-xl border border-neutral-200 p-3 w-full sm:w-auto sm:min-w-[240px] text-xs space-y-1.5 ml-auto">
                          <div className="flex justify-between text-neutral-600">
                            <span>Subtotal:</span>
                            <span className="font-semibold">₹{orderSubtotal.toLocaleString('en-IN')}</span>
                          </div>
                          {orderDiscount > 0 && (
                            <div className="flex justify-between text-emerald-600 font-semibold">
                              <span>Discount:</span>
                              <span>-₹{orderDiscount.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-neutral-600">
                            <span>Delivery:</span>
                            <span className="font-semibold">
                              {orderDelivery === 0 ? 'FREE' : `₹${orderDelivery}`}
                            </span>
                          </div>
                          <div className="border-t border-neutral-200 pt-1.5 flex justify-between text-xs font-extrabold text-brand-dark">
                            <span>Total Paid:</span>
                            <span className="text-brand-accent text-sm">₹{orderTotal.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
