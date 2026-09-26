import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import { getAllOrdersForAdmin, updateOrderStatus } from '../../services/firestoreService.js';
import { unlockDeliveredCashback } from '../../services/cashbackService.js';
import { createNotification, NOTIFICATION_TYPES } from '../../services/notificationService.js';
import { logAdminActivity } from '../../services/adminActivityService.js';

export const ORDER_STATUSES = [
  'Order Confirmed',
  'Fabric Cutting',
  'Artisan Stitching',
  'Master QA Check',
  'Dispatched',
  'Delivered',
  'Cancelled'
];

export const TAILORING_LIFECYCLE_MAPPING = {
  'Order Confirmed': 'Pattern Drafting & Fabric Allocation',
  'Fabric Cutting': 'Textile Allocation & Laser Fabric Cutting',
  'Artisan Stitching': 'Hand-stitched by Master Atelier Artisan',
  'Master QA Check': 'Final Quality & Dimensional Audit',
  'Dispatched': 'Packaged in Luxury Box & Dispatched to Courier',
  'Delivered': 'Delivered to Client & Fitting Confirmed',
  'Cancelled': 'Order Cancelled & Production Halted'
};

export default function AdminOrdersPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Status updating state
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  const loadOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await getAllOrdersForAdmin();
      if (res.success) {
        setOrders(res.orders || []);
      } else {
        setFeedback({ type: 'error', message: 'Could not load orders: ' + (res.error?.message || 'Unknown error') });
      }
    } catch (err) {
      console.error('Failed fetching orders:', err);
      setFeedback({ type: 'error', message: 'Network error fetching orders' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Clear feedback after 4 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Handle status update
  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    const targetOrder = orders.find((o) => (o.id || o.orderId) === orderId);
    const oldPaymentStatus = targetOrder?.paymentStatus;

    try {
      setUpdatingOrderId(orderId);
      const res = await updateOrderStatus(orderId, {
        paymentStatus: newPaymentStatus
      });
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => {
            if ((o.id || o.orderId) === orderId) {
              return { ...o, paymentStatus: newPaymentStatus };
            }
            return o;
          })
        );
        setFeedback({
          type: 'success',
          message: `Order #${orderId} payment status updated to "${newPaymentStatus}"`
        });
        try {
          logAdminActivity({
            action: 'ORDER_PAYMENT_UPDATED',
            targetType: 'order',
            targetId: orderId,
            details: `Order #${orderId} payment marked as "${newPaymentStatus}".`
          });
        } catch(e) {}

        // Phase 10: Customer Payment Notification Trigger
        if (targetOrder?.userId && oldPaymentStatus !== newPaymentStatus) {
          createNotification({
            userId: targetOrder.userId,
            type: newPaymentStatus === 'Paid' ? NOTIFICATION_TYPES.PAYMENT_SUCCESS : NOTIFICATION_TYPES.GENERAL,
            title: `Payment Status: ${newPaymentStatus}`,
            message: `The payment status for your bespoke commission #${orderId} was updated to "${newPaymentStatus}" by atelier administration.`,
            orderId: orderId,
            metadata: { paymentStatus: newPaymentStatus }
          }).catch((err) => console.warn('[AdminOrdersPage] Customer payment notification error:', err));
        }
      } else {
        setFeedback({
          type: 'error',
          message: `Failed to update payment status for #${orderId}`
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Could not update payment status in Firestore'
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const targetOrder = orders.find((o) => (o.id || o.orderId) === orderId);
    const oldStatus = targetOrder?.orderStatus || targetOrder?.status;
    const recommendedTailoring = TAILORING_LIFECYCLE_MAPPING[newStatus] || newStatus;

    try {
      setUpdatingOrderId(orderId);

      // Call Firestore Service
      const res = await updateOrderStatus(orderId, {
        orderStatus: newStatus,
        status: newStatus,
        tailoringStatus: recommendedTailoring
      });

      if (res.success) {
        // Optimistically update local state immediately
        setOrders((prev) =>
          prev.map((o) => {
            if ((o.id || o.orderId) === orderId) {
              return {
                ...o,
                orderStatus: newStatus,
                status: newStatus,
                tailoringStatus: recommendedTailoring,
                updatedAt: new Date().toISOString()
              };
            }
            return o;
          })
        );

        setFeedback({
          type: 'success',
          message: `Order #${orderId} status advanced to "${newStatus}"`
        });
        try {
          logAdminActivity({
            action: 'ORDER_STATUS_UPDATED',
            targetType: 'order',
            targetId: orderId,
            details: `Order #${orderId} status advanced from "${oldStatus}" to "${newStatus}". Stage: ${recommendedTailoring}.`
          });
        } catch(e) {}

        // Phase 10: Customer Order Status & Tailoring Notification Trigger
        if (targetOrder?.userId && oldStatus !== newStatus) {
          const notifType =
            newStatus === 'Dispatched'
              ? NOTIFICATION_TYPES.ORDER_DISPATCHED
              : newStatus === 'Delivered'
              ? NOTIFICATION_TYPES.ORDER_DELIVERED
              : NOTIFICATION_TYPES.ORDER_STATUS_UPDATED;

          createNotification({
            userId: targetOrder.userId,
            type: notifType,
            title: `Order Status: ${newStatus}`,
            message: `Your bespoke commission #${orderId} has progressed to "${newStatus}". Stage: ${recommendedTailoring}.`,
            orderId: orderId,
            metadata: { orderStatus: newStatus, tailoringStatus: recommendedTailoring }
          }).catch((err) => console.warn('[AdminOrdersPage] Customer status notification error:', err));

          // Phase 16: Automatically unlock pending cashback when marked as Delivered
          if (newStatus === 'Delivered') {
            unlockDeliveredCashback({
              userId: targetOrder.userId,
              orderId: orderId
            }).catch((cbErr) => console.warn('[AdminOrdersPage] Cashback unlock error:', cbErr));
          }
        }
      } else {
        throw res.error || new Error('Update failed');
      }
    } catch (err) {
      console.error('Order status update failed:', err);
      setFeedback({
        type: 'error',
        message: `Failed to update Order #${orderId}: ${err?.message || 'Access error'}`
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filter & Search logic
  const filteredOrders = orders.filter((order) => {
    // 1. Status Filter
    if (statusFilter !== 'All') {
      const s = (order.orderStatus || order.status || '').toLowerCase();
      if (s !== statusFilter.toLowerCase()) return false;
    }

    // 2. Search Query (orderId, customer name, email, phone)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const idMatch = (order.orderId || order.id || '').toLowerCase().includes(q);
      const nameMatch = (order.customer?.fullName || order.customer?.name || '').toLowerCase().includes(q);
      const emailMatch = (order.customer?.email || '').toLowerCase().includes(q);
      const phoneMatch = (order.customer?.phone || '').toLowerCase().includes(q);
      if (!idMatch && !nameMatch && !emailMatch && !phoneMatch) {
        return false;
      }
    }

    return true;
  });

  // Sort logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0);
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt || a.date || 0) - new Date(b.createdAt || b.date || 0);
    }
    if (sortBy === 'highest') {
      return (Number(b.total) || 0) - (Number(a.total) || 0);
    }
    if (sortBy === 'lowest') {
      return (Number(a.total) || 0) - (Number(b.total) || 0);
    }
    return 0;
  });

  const getStatusBadge = (status = '') => {
    const s = status.toLowerCase();
    if (s.includes('deliver')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (s.includes('dispatch')) return 'bg-teal-100 text-teal-800 border-teal-200';
    if (s.includes('qa')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (s.includes('stitch')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (s.includes('cutting')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (s.includes('cancel')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="py-2 sm:py-4 space-y-6">
      <PageContainer maxWidth="full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">
              Tailoring Operations
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Order Management Pipeline
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Inspect bespoke measurements, manage tailoring lifecycle, and update client delivery status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadOrders(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-accent' : 'text-neutral-500'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{refreshing ? 'Refreshing...' : 'Refresh Orders'}</span>
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
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-neutral-400 hover:text-neutral-600">
              &times;
            </button>
          </div>
        )}

        {/* Search & Filter Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-6 lg:col-span-5 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID, client name, email, or phone..."
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

            {/* Status Filter Dropdown */}
            <div className="sm:col-span-3 lg:col-span-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-neutral-50 rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-accent text-neutral-800"
              >
                <option value="All">All Statuses ({orders.length})</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status} ({orders.filter((o) => (o.orderStatus || o.status) === status).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="sm:col-span-3 lg:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-neutral-50 rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-accent text-neutral-800"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="highest">Sort: Highest Total</option>
                <option value="lowest">Sort: Lowest Total</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1">
            <span className="text-[10px] font-bold uppercase text-neutral-400 pr-1">Filter:</span>
            {['All', ...ORDER_STATUSES].map((status) => {
              const active = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-brand-dark text-white font-bold'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Table Container */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 bg-neutral-50/70 border-b border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
            <span>
              Showing <strong>{sortedOrders.length}</strong> of <strong>{orders.length}</strong> orders
            </span>
            {statusFilter !== 'All' || searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('All');
                  setSearchQuery('');
                }}
                className="text-brand-accent hover:underline font-semibold"
              >
                Reset Filters
              </button>
            ) : null}
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-400 space-y-2">
              <div className="w-7 h-7 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Loading bespoke order database...</p>
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-neutral-800">No orders matching criteria</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Try adjusting your search keywords or switching the status filter back to 'All'.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs divide-y divide-neutral-200">
                <thead className="bg-neutral-50 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-4">Client Contact</th>
                    <th className="py-3 px-4">Bespoke Items</th>
                    <th className="py-3 px-4">Commission Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 min-w-[180px]">Tailoring Stage & Status</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {sortedOrders.map((order) => {
                    const orderId = order.orderId || order.id;
                    const isExpanded = expandedOrderId === orderId;
                    const isUpdating = updatingOrderId === orderId;
                    const currentStatus = order.orderStatus || order.status || 'Order Confirmed';
                    const clientName = order.customer?.fullName || order.customer?.name || 'Client';
                    const clientEmail = order.customer?.email || 'N/A';
                    const clientPhone = order.customer?.phone || 'N/A';
                    const orderDate = order.formattedDate || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent');
                    const items = order.items || [];
                    const itemsCount = items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);

                    return (
                      <React.Fragment key={orderId}>
                        <tr className={`hover:bg-neutral-50/80 transition-colors ${isExpanded ? 'bg-amber-50/30' : ''}`}>
                          {/* Order ID & Date */}
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-neutral-900 text-xs">
                              {orderId}
                            </div>
                            <div className="text-[10px] text-neutral-500 mt-0.5">{orderDate}</div>
                          </td>

                          {/* Client */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-neutral-900">{clientName}</div>
                            <div className="text-[10px] text-neutral-500">{clientEmail}</div>
                            {clientPhone !== 'N/A' && (
                              <div className="text-[10px] text-neutral-400 font-mono">{clientPhone}</div>
                            )}
                          </td>

                          {/* Items Summary */}
                          <td className="py-3 px-4 text-neutral-700">
                            <div className="font-medium">
                              {itemsCount} {itemsCount === 1 ? 'Garment' : 'Garments'}
                            </div>
                            <div className="text-[10px] text-neutral-400 truncate max-w-[160px]">
                              {items.map((i) => i.productName || i.name).join(', ') || 'Custom apparel'}
                            </div>
                          </td>

                          {/* Total */}
                          <td className="py-3 px-4">
                            <div className="font-black text-neutral-900 text-xs">
                              ₹{Number(order.total || 0).toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-neutral-400">
                              Subtotal: ₹{Number(order.subtotal || order.total || 0).toLocaleString('en-IN')}
                            </div>
                          </td>

                          {/* Payment */}
                          <td className="py-3 px-4 text-neutral-700">
                            <div className="text-[11px] font-bold text-neutral-900">{order.paymentMethod || 'COD'}</div>
                            {order.paymentStatus === 'Paid' ? (
                              <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ✓ Paid
                              </span>
                            ) : (
                              <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                ⏳ Pending
                              </span>
                            )}
                          </td>

                          {/* Status Management Dropdown */}
                          <td className="py-3 px-4">
                            <div className="space-y-1.5">
                              <div className="relative">
                                <select
                                  disabled={isUpdating}
                                  value={currentStatus}
                                  onChange={(e) => handleStatusChange(orderId, e.target.value)}
                                  className={`w-full py-1 px-2.5 text-xs font-semibold rounded-md border focus:outline-none transition-all cursor-pointer ${getStatusBadge(currentStatus)} ${
                                    isUpdating ? 'opacity-50 pointer-events-none' : ''
                                  }`}
                                >
                                  {ORDER_STATUSES.map((st) => (
                                    <option key={st} value={st} className="bg-white text-neutral-900 font-normal">
                                      {st}
                                    </option>
                                  ))}
                                </select>
                                {isUpdating && (
                                  <div className="absolute right-2 top-2">
                                    <div className="w-3 h-3 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
                                  </div>
                                )}
                              </div>
                              <div className="text-[10px] text-neutral-500 truncate" title={order.tailoringStatus || TAILORING_LIFECYCLE_MAPPING[currentStatus]}>
                                {order.tailoringStatus || TAILORING_LIFECYCLE_MAPPING[currentStatus]}
                              </div>
                            </div>
                          </td>

                          {/* Expand Details Action */}
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setExpandedOrderId(isExpanded ? null : orderId)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                isExpanded
                                  ? 'bg-brand-dark text-white border-brand-dark'
                                  : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                              }`}
                            >
                              {isExpanded ? 'Hide ▲' : 'Inspect ▼'}
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Bespoke Details Accordion */}
                        {isExpanded && (
                          <tr className="bg-neutral-50/90 border-b border-neutral-200">
                            <td colSpan={7} className="p-4 sm:p-6 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* 1. Client & Delivery Details */}
                                <div className="p-4 bg-white rounded-lg border border-neutral-200 space-y-2">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                    Delivery Address
                                  </div>
                                  <div className="space-y-1 text-xs text-neutral-800">
                                    <div className="font-bold text-neutral-900">{clientName}</div>
                                    <div>{order.deliveryAddress?.address || order.shippingAddress?.address || 'Address on file'}</div>
                                    <div>
                                      {[
                                        order.deliveryAddress?.city || order.shippingAddress?.city,
                                        order.deliveryAddress?.state || order.shippingAddress?.state,
                                        order.deliveryAddress?.pincode || order.shippingAddress?.pincode
                                      ].filter(Boolean).join(', ')}
                                    </div>
                                    <div className="text-neutral-500 pt-1">
                                      Email: <span className="font-medium text-neutral-800">{clientEmail}</span>
                                    </div>
                                    <div className="text-neutral-500">
                                      Phone: <span className="font-medium text-neutral-800">{clientPhone}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* 2. Payment & Accounting */}
                                <div className="p-4 bg-white rounded-lg border border-neutral-200 space-y-2">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                    Accounting & Pricing
                                  </div>
                                  <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between text-neutral-600">
                                      <span>Garment Subtotal:</span>
                                      <span>₹{Number(order.subtotal || order.total || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-600">
                                      <span>White-Glove Delivery:</span>
                                      <span>{Number(order.delivery) ? `₹${order.delivery}` : 'Complimentary'}</span>
                                    </div>
                                    {Number(order.discount) > 0 && (
                                      <div className="flex justify-between text-emerald-600 font-medium">
                                        <span>Discount / Coupon:</span>
                                        <span>-₹{Number(order.discount).toLocaleString('en-IN')}</span>
                                      </div>
                                    )}
                                    <div className="pt-2 border-t border-neutral-200 flex justify-between font-black text-neutral-900 text-sm">
                                      <span>Total Charged:</span>
                                      <span>₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="text-[10px] text-neutral-500 pt-1 space-y-1">
                                      <div>
                                        Payment Method: <span className="font-semibold text-neutral-800">{order.paymentMethod}</span>
                                      </div>
                                      {order.paymentReference && (
                                        <div>
                                          Ref: <span className="font-mono text-neutral-700">{order.paymentReference}</span>
                                        </div>
                                      )}
                                      <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
                                        <span>Status: <strong className={order.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-800'}>{order.paymentStatus || 'Pending'}</strong></span>
                                        {order.paymentStatus !== 'Paid' ? (
                                          <button
                                            type="button"
                                            onClick={() => handlePaymentStatusChange(orderId, 'Paid')}
                                            disabled={isUpdating}
                                            className="px-2.5 py-1 text-[10px] font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors"
                                          >
                                            ✓ Mark as Paid
                                          </button>
                                        ) : (
                                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                            Payment Verified
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* 3. Atelier Timestamps */}
                                <div className="p-4 bg-white rounded-lg border border-neutral-200 space-y-2">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                    Atelier Timestamps
                                  </div>
                                  <div className="space-y-1 text-xs text-neutral-600">
                                    <div>
                                      Commission Created:
                                      <div className="font-medium text-neutral-900">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'N/A'}
                                      </div>
                                    </div>
                                    <div className="pt-1">
                                      Last Stage Update:
                                      <div className="font-medium text-neutral-900">
                                        {order.updatedAt ? new Date(order.updatedAt).toLocaleString('en-IN') : 'N/A'}
                                      </div>
                                    </div>
                                    <div className="pt-1">
                                      Current Tailoring Status:
                                      <div className="font-semibold text-brand-accent">
                                        {order.tailoringStatus || TAILORING_LIFECYCLE_MAPPING[currentStatus]}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Custom Garments Specifications */}
                              <div className="p-4 bg-white rounded-lg border border-neutral-200 space-y-3">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                  Custom Tailored Garments ({items.length})
                                </div>

                                <div className="space-y-3">
                                  {items.map((item, idx) => (
                                    <div
                                      key={item.cartItemId || idx}
                                      className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                    >
                                      <div className="space-y-1">
                                        <div className="font-bold text-neutral-900 text-sm">
                                          {item.productName || item.name || 'Bespoke Garment'}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-600">
                                          {item.fabric && (
                                            <div>
                                              <span className="text-neutral-400">Fabric:</span>{' '}
                                              <strong className="text-neutral-800">{item.fabric.name || item.fabric}</strong>
                                            </div>
                                          )}
                                          {item.color && (
                                            <div className="flex items-center gap-1">
                                              <span className="text-neutral-400">Color:</span>
                                              {item.color.hex && (
                                                <span
                                                  className="w-2.5 h-2.5 rounded-full border border-neutral-300 inline-block"
                                                  style={{ backgroundColor: item.color.hex }}
                                                />
                                              )}
                                              <strong className="text-neutral-800">{item.color.name || item.color}</strong>
                                            </div>
                                          )}
                                          {item.size && (
                                            <div>
                                              <span className="text-neutral-400">Size:</span>{' '}
                                              <strong className="text-neutral-800">{item.size}</strong>
                                            </div>
                                          )}
                                          {item.collar && (
                                            <div>
                                              <span className="text-neutral-400">Collar:</span>{' '}
                                              <strong className="text-neutral-800">{item.collar}</strong>
                                            </div>
                                          )}
                                          {item.cuff && (
                                            <div>
                                              <span className="text-neutral-400">Cuff:</span>{' '}
                                              <strong className="text-neutral-800">{item.cuff}</strong>
                                            </div>
                                          )}
                                        </div>

                                        {/* Paired Fragrance recommendation */}
                                        {item.fragrance && (
                                          <div className="text-[11px] text-brand-accent flex items-center gap-1 mt-1">
                                            <span>&#10024; Paired Fragrance:</span>
                                            <strong>{item.fragrance.name || item.fragrance}</strong>
                                          </div>
                                        )}
                                      </div>

                                      <div className="sm:text-right flex-shrink-0">
                                        <div className="font-black text-neutral-900 text-sm">
                                          ₹{Number(item.totalItemPrice || item.price || 0).toLocaleString('en-IN')}
                                        </div>
                                        <div className="text-[10px] text-neutral-400">
                                          Qty: {item.quantity || 1}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
