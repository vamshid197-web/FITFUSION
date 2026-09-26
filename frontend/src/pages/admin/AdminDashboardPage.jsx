import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import {
  getAllOrdersForAdmin,
  getAllUsersForAdmin,
  getAdminProducts
} from '../../services/firestoreService.js';
import { getProductStockStatus } from '../../data/mockProducts.js';
import { getAllOffers } from '../../services/offerService.js';
import { getAggregateCashbackMetrics } from '../../services/cashbackService.js';
import { getAdminActivities } from '../../services/adminActivityService.js';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [cashbackStats, setCashbackStats] = useState({ totalIssued: 0, totalRedeemed: 0, totalPending: 0, totalAvailable: 0 });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Time Range Filter for Business Analytics
  const [dateRange, setDateRange] = useState('30d'); // 'today' | '7d' | '30d' | 'month' | 'all'

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [ordersRes, usersRes, prodsRes, offersList, cbStats, actsList] = await Promise.all([
        getAllOrdersForAdmin(),
        getAllUsersForAdmin(),
        getAdminProducts(),
        getAllOffers(true),
        getAggregateCashbackMetrics(),
        getAdminActivities(12)
      ]);

      if (ordersRes.success) setOrders(ordersRes.orders || []);
      if (usersRes.success) setUsers(usersRes.users || []);
      if (prodsRes.success) setProducts(prodsRes.products || []);
      setOffers(offersList || []);
      setCashbackStats(cbStats || { totalIssued: 0, totalRedeemed: 0, totalPending: 0, totalAvailable: 0 });
      setActivities(actsList || []);
    } catch (err) {
      console.error('Error loading admin dashboard metrics:', err);
      setError('Failed to fetch dashboard metrics. Please check network connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter orders by selected Date Range
  const filteredOrders = useMemo(() => {
    if (dateRange === 'all') return orders;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return orders.filter((o) => {
      const orderDate = new Date(o.createdAt || o.date || 0);
      if (isNaN(orderDate.getTime())) return true; // keep if undated

      if (dateRange === 'today') {
        return orderDate >= startOfDay;
      }
      if (dateRange === '7d') {
        const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= d7;
      }
      if (dateRange === '30d') {
        const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orderDate >= d30;
      }
      if (dateRange === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return orderDate >= startOfMonth;
      }
      return true;
    });
  }, [orders, dateRange]);

  // Inventory Status Counts from real products
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => getProductStockStatus(p) === 'Low Stock');
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter((p) => getProductStockStatus(p) === 'Out of Stock');
  }, [products]);

  // Financial Analytics Calculations from real orders
  const grossRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => {
      const s = (o.orderStatus || o.status || '').toLowerCase();
      if (s === 'cancelled') return sum;
      return sum + (Number(o.total) || Number(o.pricing?.total) || 0);
    }, 0);
  }, [filteredOrders]);

  const totalDiscounts = useMemo(() => {
    return filteredOrders.reduce((sum, o) => {
      const s = (o.orderStatus || o.status || '').toLowerCase();
      if (s === 'cancelled') return sum;
      const offerDisc = Number(o.appliedOffer?.discount || o.offerDiscount || 0);
      const couponDisc = Number(o.coupon?.discount || o.couponDiscount || 0);
      return sum + offerDisc + couponDisc;
    }, 0);
  }, [filteredOrders]);

  const totalCashbackRedeemed = useMemo(() => {
    return filteredOrders.reduce((sum, o) => {
      const s = (o.orderStatus || o.status || '').toLowerCase();
      if (s === 'cancelled') return sum;
      return sum + Number(o.cashbackRedeemed || o.redeemedCashback || 0);
    }, 0);
  }, [filteredOrders]);

  const netRevenueCollected = Math.max(0, grossRevenue - totalCashbackRedeemed);
  const validOrderCount = filteredOrders.filter((o) => (o.orderStatus || o.status || '').toLowerCase() !== 'cancelled').length;
  const averageOrderValue = validOrderCount > 0 ? Math.round(grossRevenue / validOrderCount) : 0;

  // Pipeline Status Counts
  const dispatchedOrders = orders.filter((o) => {
    const s = (o.orderStatus || o.status || '').toLowerCase();
    return s.includes('dispatch') || s.includes('transit');
  }).length;

  const deliveredOrders = orders.filter((o) => {
    const s = (o.orderStatus || o.status || '').toLowerCase();
    return s === 'delivered';
  }).length;

  const pendingOrders = orders.filter((o) => {
    const s = (o.orderStatus || o.status || '').toLowerCase();
    return s !== 'delivered' && s !== 'cancelled';
  }).length;

  const cancelledOrders = orders.filter((o) => {
    const s = (o.orderStatus || o.status || '').toLowerCase();
    return s === 'cancelled';
  }).length;

  const pipelineStages = [
    { label: 'Order Confirmed', count: orders.filter((o) => (o.orderStatus || o.status) === 'Order Confirmed').length, color: 'bg-blue-500' },
    { label: 'Fabric Cutting', count: orders.filter((o) => (o.orderStatus || o.status) === 'Fabric Cutting').length, color: 'bg-amber-500' },
    { label: 'Artisan Stitching', count: orders.filter((o) => (o.orderStatus || o.status) === 'Artisan Stitching').length, color: 'bg-indigo-500' },
    { label: 'Master QA Check', count: orders.filter((o) => (o.orderStatus || o.status) === 'Master QA Check').length, color: 'bg-purple-500' },
    { label: 'Dispatched', count: dispatchedOrders, color: 'bg-teal-500' },
    { label: 'Delivered', count: deliveredOrders, color: 'bg-emerald-500' }
  ];

  // Product Performance from actual order items
  const productPerformance = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const isCancelled = (o.orderStatus || o.status || '').toLowerCase() === 'cancelled';
      if (isCancelled) return;
      const items = o.items || [];
      items.forEach((item) => {
        const name = item.productName || item.name || 'Custom Garment';
        if (!map[name]) {
          map[name] = { name, count: 0, revenue: 0, category: item.category || 'Apparel' };
        }
        map[name].count += Number(item.quantity || 1);
        map[name].revenue += Number(item.price || item.basePrice || 0) * Number(item.quantity || 1);
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders]);

  // Category Performance
  const categoryPerformance = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const isCancelled = (o.orderStatus || o.status || '').toLowerCase() === 'cancelled';
      if (isCancelled) return;
      const items = o.items || [];
      items.forEach((item) => {
        const cat = item.category || 'Custom Apparel';
        if (!map[cat]) {
          map[cat] = { category: cat, count: 0, revenue: 0 };
        }
        map[cat].count += Number(item.quantity || 1);
        map[cat].revenue += Number(item.price || item.basePrice || 0) * Number(item.quantity || 1);
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  // Simple, Lightweight, Responsive SVG Sales Chart
  const chartData = useMemo(() => {
    const daysMap = {};
    const daysCount = dateRange === 'today' ? 1 : dateRange === '7d' ? 7 : 14;

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      daysMap[key] = { label: key, revenue: 0, orders: 0 };
    }

    filteredOrders.forEach((o) => {
      const isCancelled = (o.orderStatus || o.status || '').toLowerCase() === 'cancelled';
      if (isCancelled) return;
      const d = new Date(o.createdAt || o.date || 0);
      if (!isNaN(d.getTime())) {
        const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
        if (daysMap[key]) {
          daysMap[key].revenue += Number(o.total || o.pricing?.total || 0);
          daysMap[key].orders += 1;
        }
      }
    });

    return Object.values(daysMap);
  }, [filteredOrders, dateRange]);

  const maxChartRevenue = Math.max(...chartData.map((d) => d.revenue), 1000);

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
              <span className="text-[11px] text-neutral-400">Live Atelier Oversight</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Business & Operations Hub
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Authoritative commercial analytics, tailoring pipeline queue, inventory alerts, and loyalty management.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors shadow-xs disabled:opacity-50"
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
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-brand-dark text-white hover:bg-neutral-800 transition-colors shadow-xs"
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

        {/* Phase 17: Inventory Warning Alert Banner */}
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚠️</span>
              <div>
                <span className="font-bold text-amber-950">Inventory Restock Notice: </span>
                <span>
                  {lowStockProducts.length > 0 ? `${lowStockProducts.length} bespoke garments have reached low-stock threshold. ` : ''}
                  {outOfStockProducts.length > 0 ? `${outOfStockProducts.length} garments are currently out of stock.` : ''}
                </span>
              </div>
            </div>
            <Link
              to="/admin/products?filter=low_stock"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold rounded-lg transition-colors cursor-pointer text-xs flex-shrink-0"
            >
              <span>Inspect Low Stock ({lowStockProducts.length})</span>
              <span>&rarr;</span>
            </Link>
          </div>
        )}

        {/* Date Range Selector Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Analytics Period:
            </span>
            <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg text-xs">
              {[
                { id: 'today', label: 'Today' },
                { id: '7d', label: 'Last 7 Days' },
                { id: '30d', label: 'Last 30 Days' },
                { id: 'month', label: 'This Month' },
                { id: 'all', label: 'All Time' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setDateRange(btn.id)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    dateRange === btn.id
                      ? 'bg-white text-brand-dark shadow-2xs font-bold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-neutral-500">
            Showing metrics for <strong>{filteredOrders.length}</strong> commissions
          </div>
        </div>

        {/* 5 Financial Analytics Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* 1. Gross Revenue */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-xs space-y-1 hover:border-brand-accent/40 transition-all">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Gross Revenue</span>
              <span className="text-sm">🪙</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight font-mono">
              {loading ? <div className="h-7 w-20 bg-neutral-200 animate-pulse rounded" /> : `₹${grossRevenue.toLocaleString('en-IN')}`}
            </div>
            <p className="text-[11px] text-neutral-400">Pre-cashback volume</p>
          </div>

          {/* 2. Promotional Discounts */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-xs space-y-1 hover:border-brand-accent/40 transition-all">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Offers & Coupons</span>
              <span className="text-sm">🏷️</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-700 tracking-tight font-mono">
              {loading ? <div className="h-7 w-16 bg-neutral-200 animate-pulse rounded" /> : `-₹${totalDiscounts.toLocaleString('en-IN')}`}
            </div>
            <p className="text-[11px] text-neutral-400">Total customer savings</p>
          </div>

          {/* 3. Cashback Redeemed */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-xs space-y-1 hover:border-brand-accent/40 transition-all">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Cashback Used</span>
              <span className="text-sm">💳</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-700 tracking-tight font-mono">
              {loading ? <div className="h-7 w-16 bg-neutral-200 animate-pulse rounded" /> : `-₹${totalCashbackRedeemed.toLocaleString('en-IN')}`}
            </div>
            <p className="text-[11px] text-neutral-400">Redeemed from wallet</p>
          </div>

          {/* 4. Net Revenue */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-xs space-y-1 hover:border-brand-accent/40 transition-all">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Net Collected</span>
              <span className="text-sm">📈</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-800 tracking-tight font-mono">
              {loading ? <div className="h-7 w-20 bg-neutral-200 animate-pulse rounded" /> : `₹${netRevenueCollected.toLocaleString('en-IN')}`}
            </div>
            <p className="text-[11px] text-neutral-400">Net banking receipt</p>
          </div>

          {/* 5. AOV (Average Order Value) */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200/90 shadow-xs space-y-1 hover:border-brand-accent/40 transition-all">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Average Order</span>
              <span className="text-sm">🎯</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight font-mono">
              {loading ? <div className="h-7 w-16 bg-neutral-200 animate-pulse rounded" /> : `₹${averageOrderValue.toLocaleString('en-IN')}`}
            </div>
            <p className="text-[11px] text-neutral-400">Per valid commission</p>
          </div>
        </div>

        {/* Responsive Sales Trend Chart */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                Sales & Revenue Trajectory
              </h2>
              <p className="text-xs text-neutral-500">Day-by-day commercial volume from recorded orders</p>
            </div>
            <span className="text-xs font-bold text-neutral-600 font-mono bg-neutral-100 px-2.5 py-1 rounded-full">
              Max: ₹{maxChartRevenue.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Chart Rendering */}
          <div className="overflow-x-auto pb-1"><div className="h-44 sm:h-52 min-w-[320px] w-full pt-4 flex items-end gap-2 border-b border-neutral-200">
            {chartData.map((d, idx) => {
              const heightPercent = Math.max(6, Math.min(100, Math.round((d.revenue / maxChartRevenue) * 100)));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap z-20 pointer-events-none shadow-md">
                    <span className="font-bold">₹{d.revenue.toLocaleString('en-IN')}</span> ({d.orders} orders)
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[32px] rounded-t-md bg-gradient-to-t from-brand-dark to-brand-accent/80 group-hover:to-brand-accent transition-all cursor-pointer"
                  />
                  <span className="text-[9px] text-neutral-400 mt-2 truncate w-full text-center hidden sm:block">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        </div>
        {/* 6 Key Operational Status Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-neutral-500">Total Commissions</span>
            <div className="text-xl font-black text-neutral-900">{orders.length}</div>
            <p className="text-[10px] text-neutral-400">All registered</p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-neutral-500">Active Queue</span>
            <div className="text-xl font-black text-amber-600">{pendingOrders}</div>
            <p className="text-[10px] text-neutral-400">In production</p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-neutral-500">Delivered</span>
            <div className="text-xl font-black text-emerald-600">{deliveredOrders}</div>
            <p className="text-[10px] text-neutral-400">Fulfillment confirmed</p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-neutral-500">Garment Catalog</span>
            <div className="text-xl font-black text-brand-dark">{products.length}</div>
            <p className="text-[10px] text-neutral-400">{lowStockProducts.length} low stock</p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-neutral-500">Client Directory</span>
            <div className="text-xl font-black text-purple-700">{users.length}</div>
            <p className="text-[10px] text-neutral-400">Registered patrons</p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-neutral-500">Active Campaigns</span>
            <div className="text-xl font-black text-amber-700">{offers.filter((o) => o.active).length}</div>
            <p className="text-[10px] text-neutral-400">Storefront promotions</p>
          </div>
        </div>

        {/* Tailoring Production Pipeline Tracker */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-4">
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

        {/* Product & Category Performance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Selling Products */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                Top Tailoring Silhouettes
              </h3>
              <Link to="/admin/products" className="text-xs font-semibold text-brand-accent hover:underline">
                View All &rarr;
              </Link>
            </div>

            {productPerformance.length === 0 ? (
              <p className="text-xs text-neutral-400 italic py-6 text-center">
                No product performance data available yet.
              </p>
            ) : (
              <div className="space-y-2.5 text-xs">
                {productPerformance.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-neutral-50/70 border border-neutral-100">
                    <div>
                      <div className="font-bold text-neutral-900">{p.name}</div>
                      <div className="text-[11px] text-neutral-500">{p.category} &bull; {p.count} pieces tailored</div>
                    </div>
                    <div className="font-mono font-black text-neutral-900 text-sm">
                      ₹{p.revenue.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Performance */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                Category Commercial Performance
              </h3>
              <span className="text-[11px] text-neutral-400 font-medium">By Order Volume</span>
            </div>

            {categoryPerformance.length === 0 ? (
              <p className="text-xs text-neutral-400 italic py-6 text-center">
                No category data available yet.
              </p>
            ) : (
              <div className="space-y-2.5 text-xs">
                {categoryPerformance.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-neutral-50/70 border border-neutral-100">
                    <div>
                      <div className="font-bold text-neutral-900">{c.category}</div>
                      <div className="text-[11px] text-neutral-500">{c.count} total commissions</div>
                    </div>
                    <div className="font-mono font-black text-neutral-900 text-sm">
                      ₹{c.revenue.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Operational Activity Audit Trail */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                Atelier Operational Audit Trail
              </h3>
              <p className="text-xs text-neutral-500">Real-time record of administrative decisions and status transitions</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
              Security Audited
            </span>
          </div>

          {activities.length === 0 ? (
            <p className="text-xs text-neutral-400 italic py-6 text-center">
              No recent administrative activities recorded.
            </p>
          ) : (
            <div className="divide-y divide-neutral-100 text-xs">
              {activities.map((act) => (
                <div key={act.id} className="py-2.5 flex items-start justify-between gap-3 hover:bg-neutral-50/50">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-neutral-800 flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-neutral-100 text-neutral-700">
                        {act.action}
                      </span>
                      <span>{act.details}</span>
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      By {act.adminEmail || act.adminId}
                    </div>
                  </div>
                  <div className="text-[10px] text-neutral-400 whitespace-nowrap">
                    {new Date(act.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Management Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Link
            to="/admin/orders"
            className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs hover:border-brand-accent/40 hover:shadow-md transition-all group"
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
              Inspect bespoke measurements, advance cutting/stitching stages, and manage courier tracking.
            </p>
          </Link>

          <Link
            to="/admin/products"
            className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs hover:border-brand-accent/40 hover:shadow-md transition-all group"
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
              Update garment base pricing, add customizable silhouettes, and monitor stock availability.
            </p>
          </Link>

          <Link
            to="/admin/users"
            className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs hover:border-brand-accent/40 hover:shadow-md transition-all group"
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
              Inspect client order histories, oversee staff roles, and audit customer cashback balances.
            </p>
          </Link>

          <Link
            to="/admin/offers"
            className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs hover:border-brand-accent/40 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-brand-dark group-hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 group-hover:text-brand-accent transition-colors">
                Offers & Loyalty &rarr;
              </h3>
            </div>
            <p className="text-xs text-neutral-500">
              Configure promotional coupons, patron cashback rewards, bespoke gifts, and minimum spend tiers.
            </p>
          </Link>

          <Link
            to="/admin/reviews"
            className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs hover:border-brand-accent/40 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-brand-dark group-hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 group-hover:text-brand-accent transition-colors">
                Review Moderation &rarr;
              </h3>
            </div>
            <p className="text-xs text-neutral-500">
              Moderate craftsmanship ratings, oversee verified buyer reviews, and publish or hide public ratings.
            </p>
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
