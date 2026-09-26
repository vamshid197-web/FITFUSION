import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import { getAllOrdersForAdmin, getAllUsersForAdmin } from '../../services/firestoreService.js';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [ordersRes, usersRes] = await Promise.all([
        getAllOrdersForAdmin(),
        getAllUsersForAdmin()
      ]);

      if (ordersRes.success) {
        setOrders(ordersRes.orders || []);
      } else {
        console.warn('Orders fetch warning:', ordersRes.error);
      }

      if (usersRes.success) {
        setUsers(usersRes.users || []);
      } else {
        console.warn('Users fetch warning:', usersRes.error);
      }
    } catch (err) {
      console.error('Error loading admin dashboard metrics:', err);
      setError('Failed to fetch dashboard metrics. Please check connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculated statistics from real Firestore records
  const totalOrders = orders.length;

  // Active / Pending orders: any order not yet Delivered or Cancelled
  const pendingOrders = orders.filter((o) => {
    const s = (o.orderStatus || o.status || '').toLowerCase();
    return s !== 'delivered' && s !== 'cancelled';
  }).length;

  // Orders in Atelier Production pipeline: Fabric Cutting, Artisan Stitching, Master QA Check
  const inProductionOrders = orders.filter((o) => {
    const s = (o.orderStatus || o.status || '').toLowerCase();
    return (
      s.includes('cutting') ||
      s.includes('stitch') ||
      s.includes('qa') ||
      s.includes('artisan')
    );
  }).length;

  // Dispatched Orders
  const dispatchedOrders = orders.filter((o) => {
    const s = (o.orderStatus || o.status || '').toLowerCase();
    return s.includes('dispatch') || s.includes('transit');
  }).length;

  // Delivered Orders
  const deliveredOrders = orders.filter((o) => {
    const s = (o.orderStatus || o.status || '').toLowerCase();
    return s === 'delivered';
  }).length;

  // Total Customers
  const totalCustomers = users.filter((u) => u.role !== 'admin').length || users.length;

  // Actual Stored Total Revenue
  const totalRevenue = orders.reduce((sum, o) => {
    const s = (o.orderStatus || o.status || '').toLowerCase();
    if (s === 'cancelled') return sum;
    const val = Number(o.total) || Number(o.pricing?.total) || 0;
    return sum + val;
  }, 0);

  // Status breakdown array for progress tracker
  const pipelineStages = [
    { label: 'Order Confirmed', count: orders.filter((o) => (o.orderStatus || o.status) === 'Order Confirmed').length, color: 'bg-blue-500' },
    { label: 'Fabric Cutting', count: orders.filter((o) => (o.orderStatus || o.status) === 'Fabric Cutting').length, color: 'bg-amber-500' },
    { label: 'Artisan Stitching', count: orders.filter((o) => (o.orderStatus || o.status) === 'Artisan Stitching').length, color: 'bg-indigo-500' },
    { label: 'Master QA Check', count: orders.filter((o) => (o.orderStatus || o.status) === 'Master QA Check').length, color: 'bg-purple-500' },
    { label: 'Dispatched', count: dispatchedOrders, color: 'bg-teal-500' },
    { label: 'Delivered', count: deliveredOrders, color: 'bg-emerald-500' }
  ];

  // Recent 6 orders
  const recentOrders = orders.slice(0, 6);

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
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">
                Executive Portal
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-neutral-400">Live Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Atelier Dashboard
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live commercial statistics, tailoring queue oversight, and bespoke commissions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => loadData(true)}
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
              <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>

            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-brand-dark text-white hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <span>Manage Orders</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => loadData()} className="font-bold underline ml-2">Retry</button>
          </div>
        )}

        {/* 6 Key Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {/* 1. Total Revenue */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-sm space-y-1.5 hover:border-brand-accent/40 transition-all">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Gross Revenue</span>
              <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              {loading ? (
                <div className="h-7 w-24 bg-neutral-200 animate-pulse rounded" />
              ) : (
                `₹${totalRevenue.toLocaleString('en-IN')}`
              )}
            </div>
            <p className="text-[11px] text-neutral-400">From stored commissions</p>
          </div>

          {/* 2. Total Orders */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-sm space-y-1.5 hover:border-brand-accent/40 transition-all">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total Orders</span>
              <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-neutral-900">
              {loading ? <div className="h-7 w-12 bg-neutral-200 animate-pulse rounded" /> : totalOrders}
            </div>
            <p className="text-[11px] text-neutral-400">All registered orders</p>
          </div>

          {/* 3. Pending Orders */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-sm space-y-1.5 hover:border-brand-accent/40 transition-all">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Active Queue</span>
              <div className="w-6 h-6 rounded-md bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600">
              {loading ? <div className="h-7 w-12 bg-neutral-200 animate-pulse rounded" /> : pendingOrders}
            </div>
            <p className="text-[11px] text-neutral-400">In fulfillment cycle</p>
          </div>

          {/* 4. In Production */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-sm space-y-1.5 hover:border-brand-accent/40 transition-all">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">In Production</span>
              <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879a3 3 0 11-4.242-4.242L10.5 10.5m0 0l-2-2" />
                </svg>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-600">
              {loading ? <div className="h-7 w-12 bg-neutral-200 animate-pulse rounded" /> : inProductionOrders}
            </div>
            <p className="text-[11px] text-neutral-400">Cutting, sewing & QA</p>
          </div>

          {/* 5. Dispatched */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-sm space-y-1.5 hover:border-brand-accent/40 transition-all">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Dispatched</span>
              <div className="w-6 h-6 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-teal-600">
              {loading ? <div className="h-7 w-12 bg-neutral-200 animate-pulse rounded" /> : dispatchedOrders}
            </div>
            <p className="text-[11px] text-neutral-400">In transit to client</p>
          </div>

          {/* 6. Total Customers */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-sm space-y-1.5 hover:border-brand-accent/40 transition-all">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Customers</span>
              <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-700">
              {loading ? <div className="h-7 w-12 bg-neutral-200 animate-pulse rounded" /> : totalCustomers}
            </div>
            <p className="text-[11px] text-neutral-400">Registered client profiles</p>
          </div>
        </div>

        {/* Tailoring Production Pipeline Tracker */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                Tailoring Lifecycle Capacity
              </h2>
              <p className="text-xs text-neutral-500">Live order allocation across atelier craft stages</p>
            </div>
            <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
              {orders.length} Commissions Monitored
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {pipelineStages.map((stage) => (
              <div key={stage.label} className="p-3 rounded-lg bg-neutral-50 border border-neutral-200/80 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${stage.color}`} />
                  <span className="text-[11px] font-medium text-neutral-600 truncate">{stage.label}</span>
                </div>
                <div className="text-lg font-black text-neutral-900">{stage.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Overview */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:px-6 flex items-center justify-between border-b border-neutral-200">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                Recent Bespoke Commissions
              </h2>
              <p className="text-xs text-neutral-500">Latest orders placed through FitFusion atelier</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1"
            >
              <span>View All ({orders.length})</span>
              <span>&rarr;</span>
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-neutral-400 space-y-2">
              <div className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Loading real-time order records...</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 space-y-2">
              <p>No orders in the database yet.</p>
              <p className="text-[11px] text-neutral-400">New client orders will populate automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-[10px] uppercase font-bold text-neutral-500 tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {recentOrders.map((order) => {
                    const status = order.orderStatus || order.status || 'Order Confirmed';
                    const clientName = order.customer?.fullName || order.customer?.name || 'Client';
                    const orderDate = order.formattedDate || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent');
                    const itemsCount = (order.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);

                    return (
                      <tr key={order.id || order.orderId} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                          {order.orderId || order.id}
                        </td>
                        <td className="py-3 px-4 font-medium text-neutral-800">
                          <div>{clientName}</div>
                          <div className="text-[10px] text-neutral-400">{order.customer?.email || 'N/A'}</div>
                        </td>
                        <td className="py-3 px-4 text-neutral-600">
                          {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                        </td>
                        <td className="py-3 px-4 font-bold text-neutral-900">
                          ₹{Number(order.total || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-500 text-[11px]">
                          {orderDate}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/admin/orders?search=${encodeURIComponent(order.orderId || order.id)}`}
                            className="inline-block px-2.5 py-1 text-[11px] font-semibold text-brand-dark bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Management Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/orders"
            className="p-5 bg-white rounded-xl border border-neutral-200 shadow-sm hover:border-brand-accent/40 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-brand-dark group-hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 group-hover:text-brand-accent transition-colors">
                Order Pipeline &rarr;
              </h3>
            </div>
            <p className="text-xs text-neutral-500">
              Inspect bespoke tailoring measurements, filter by stage, and advance status to cutting or stitching.
            </p>
          </Link>

          <Link
            to="/admin/products"
            className="p-5 bg-white rounded-xl border border-neutral-200 shadow-sm hover:border-brand-accent/40 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-brand-dark group-hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 group-hover:text-brand-accent transition-colors">
                Garment Catalog &rarr;
              </h3>
            </div>
            <p className="text-xs text-neutral-500">
              Update garment base pricing, add customizable silhouettes, and manage active textile availability.
            </p>
          </Link>

          <Link
            to="/admin/users"
            className="p-5 bg-white rounded-xl border border-neutral-200 shadow-sm hover:border-brand-accent/40 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-brand-dark group-hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 group-hover:text-brand-accent transition-colors">
                Customer Directory &rarr;
              </h3>
            </div>
            <p className="text-xs text-neutral-500">
              View registered client profiles, contact emails, order counts, and administrative staff assignments.
            </p>
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
