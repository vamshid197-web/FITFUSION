import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/common/PageContainer.jsx';
import { getAllUsersForAdmin, getAllOrdersForAdmin } from '../../services/firestoreService.js';
import { getCashbackWallet, adjustCustomerCashbackAdmin } from '../../services/cashbackService.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [feedback, setFeedback] = useState(null);


  const { user: currentAdmin } = useAuth();
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientWallet, setClientWallet] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const handleSelectClient = async (client) => {
    setSelectedClient(client);
    setAdjAmount('');
    setAdjReason('');
    const uid = client.uid || client.id;
    if (uid) {
      try {
        setLoadingWallet(true);
        const w = await getCashbackWallet(uid);
        setClientWallet(w);
      } catch (err) {
        console.warn('Error loading client wallet:', err);
      } finally {
        setLoadingWallet(false);
      }
    }
  };

  const handleApplyCashbackAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;
    const uid = selectedClient.uid || selectedClient.id;
    const numAmt = Number(adjAmount);
    if (!numAmt || isNaN(numAmt)) {
      alert('Please specify a valid non-zero adjustment amount (positive to grant, negative to deduct).');
      return;
    }
    if (!adjReason.trim()) {
      alert('Please enter a mandatory audit reason explaining this adjustment.');
      return;
    }

    try {
      setAdjusting(true);
      const res = await adjustCustomerCashbackAdmin({
        userId: uid,
        amount: numAmt,
        reason: adjReason.trim(),
        adminId: currentAdmin?.uid || 'admin',
        adminEmail: currentAdmin?.email || 'admin@fitfusion.com'
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Successfully adjusted cashback for ${selectedClient.name || 'Client'}: ${numAmt > 0 ? '+' : ''}₹${numAmt}.`
        });
        const updated = await getCashbackWallet(uid);
        setClientWallet(updated);
        setAdjAmount('');
        setAdjReason('');
      } else {
        alert(res.error || 'Adjustment failed');
      }
    } catch (err) {
      alert('Adjustment error: ' + (err?.message || 'Access error'));
    } finally {
      setAdjusting(false);
    }
  };

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [usersRes, ordersRes] = await Promise.all([
        getAllUsersForAdmin(),
        getAllOrdersForAdmin()
      ]);

      if (usersRes.success) {
        setUsers(usersRes.users || []);
      } else {
        setFeedback({ type: 'error', message: 'Failed fetching users: ' + (usersRes.error?.message || 'Access error') });
      }

      if (ordersRes.success) {
        setOrders(ordersRes.orders || []);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
      setFeedback({ type: 'error', message: 'Network error loading client profiles.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute metrics per user based on real orders
  const getUserStats = (userId, userEmail) => {
    const userOrders = orders.filter(
      (o) => o.userId === userId || (userEmail && o.customer?.email?.toLowerCase() === userEmail.toLowerCase())
    );
    const orderCount = userOrders.length;
    const totalSpent = userOrders.reduce((sum, o) => {
      if ((o.orderStatus || o.status || '').toLowerCase() === 'cancelled') return sum;
      return sum + (Number(o.total) || 0);
    }, 0);
    return { orderCount, totalSpent };
  };

  // Metrics overview
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const customerCount = users.filter((u) => u.role !== 'admin').length;

  // Filtered Users
  const filteredUsers = users.filter((user) => {
    if (roleFilter !== 'All') {
      if (roleFilter === 'admin' && user.role !== 'admin') return false;
      if (roleFilter === 'customer' && user.role === 'admin') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = (user.name || user.displayName || '').toLowerCase().includes(q);
      const emailMatch = (user.email || '').toLowerCase().includes(q);
      const phoneMatch = (user.phone || '').toLowerCase().includes(q);
      const uidMatch = (user.uid || user.id || '').toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !phoneMatch && !uidMatch) return false;
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
              Client Relations
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Customer Directory
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Oversight of client profiles, commission activity, and administrative staff assignments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadData(true)}
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
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div className="p-3.5 rounded-lg text-xs font-medium bg-red-50 border border-red-200 text-red-800 flex items-center justify-between">
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="text-neutral-400 hover:text-neutral-600">
              &times;
            </button>
          </div>
        )}

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Total Accounts
            </span>
            <div className="text-2xl font-black text-neutral-900">
              {loading ? <div className="h-7 w-12 bg-neutral-200 animate-pulse rounded" /> : totalUsers}
            </div>
            <p className="text-[11px] text-neutral-400">All authenticated Firestore profiles</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Bespoke Clients
            </span>
            <div className="text-2xl font-black text-purple-700">
              {loading ? <div className="h-7 w-12 bg-neutral-200 animate-pulse rounded" /> : customerCount}
            </div>
            <p className="text-[11px] text-neutral-400">Registered retail customers</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Administrators
            </span>
            <div className="text-2xl font-black text-amber-600">
              {loading ? <div className="h-7 w-12 bg-neutral-200 animate-pulse rounded" /> : adminCount}
            </div>
            <p className="text-[11px] text-neutral-400">Elevated administrative privileges</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers by name, email, phone, or UID..."
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

            <div className="sm:col-span-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-neutral-50 rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-accent text-neutral-800"
              >
                <option value="All">All Roles ({users.length})</option>
                <option value="customer">Customers Only ({customerCount})</option>
                <option value="admin">Administrators Only ({adminCount})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table Container */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 bg-neutral-50/70 border-b border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
            <span>
              Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> registered accounts
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-400 space-y-2">
              <div className="w-7 h-7 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Loading user directory...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center space-y-2 text-xs text-neutral-500">
              <p className="font-bold text-neutral-800">No accounts matching search criteria</p>
              <p className="text-neutral-400">Try broadening your search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-xs divide-y divide-neutral-200">
                <thead className="bg-neutral-50 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Client Identity</th>
                    <th className="py-3 px-4">Contact Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Commissions</th>
                    <th className="py-3 px-4">Gross Spend</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredUsers.map((client) => {
                    const isAdmin = client.role === 'admin';
                    const initials = (client.name || client.email || 'C')[0].toUpperCase();
                    const stats = getUserStats(client.uid || client.id, client.email);
                    const joinDate = client.createdAt
                      ? new Date(client.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'N/A';

                    return (
                      <tr key={client.id || client.uid} className="hover:bg-neutral-50/80 transition-colors">
                        {/* Avatar & Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                                isAdmin
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                              }`}
                            >
                              {initials}
                            </div>
                            <div>
                              <div className="font-semibold text-neutral-900">
                                {client.name || client.displayName || 'FitFusion User'}
                              </div>
                              <div className="text-[10px] text-neutral-400 font-mono">
                                UID: {(client.uid || client.id || '').slice(0, 10)}...
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3 px-4 text-neutral-700 font-medium">
                          {client.email || 'N/A'}
                        </td>

                        {/* Phone */}
                        <td className="py-3 px-4 text-neutral-600 font-mono text-[11px]">
                          {client.phone || <span className="text-neutral-400 italic">Not set</span>}
                        </td>

                        {/* Role Badge */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider uppercase ${
                              isAdmin
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                            }`}
                          >
                            {isAdmin ? 'Administrator' : 'Customer'}
                          </span>
                        </td>

                        {/* Order Count */}
                        <td className="py-3 px-4 text-neutral-700">
                          <span className="font-bold text-neutral-900">{stats.orderCount}</span> orders
                        </td>

                        {/* Gross Spend */}
                        <td className="py-3 px-4 font-bold text-neutral-900">
                          ₹{stats.totalSpent.toLocaleString('en-IN')}
                        </td>

                        {/* Registered Date */}
                        <td className="py-3 px-4 text-neutral-500 text-[11px]">
                          {joinDate}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleSelectClient(client)}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-neutral-100 hover:bg-neutral-800 hover:text-white text-neutral-700 transition-colors shadow-2xs cursor-pointer"
                          >
                            Inspect Profile &rarr;
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

        
      {/* Customer Profile & History Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-3xl w-full p-6 space-y-6 my-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-dark text-white flex items-center justify-center text-lg font-black font-serif">
                  {(selectedClient.name || selectedClient.email || 'C')[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">
                    {selectedClient.name || selectedClient.displayName || 'Bespoke Client'}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {selectedClient.email} &bull; {selectedClient.phone || 'No phone set'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Client Lifetime Metrics */}
            {(() => {
              const uid = selectedClient.uid || selectedClient.id;
              const clientOrders = orders.filter(
                (o) => o.userId === uid || (selectedClient.email && o.customer?.email?.toLowerCase() === selectedClient.email.toLowerCase())
              );
              const grossSpent = clientOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
              const avgSpend = clientOrders.length > 0 ? Math.round(grossSpent / clientOrders.length) : 0;

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Total Orders</div>
                      <div className="text-xl font-black text-neutral-900">{clientOrders.length}</div>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Lifetime Spend</div>
                      <div className="text-xl font-black text-neutral-900">₹{grossSpent.toLocaleString('en-IN')}</div>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Average Order</div>
                      <div className="text-xl font-black text-neutral-900">₹{avgSpend.toLocaleString('en-IN')}</div>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Available Wallet</div>
                      <div className="text-xl font-black text-emerald-900">
                        {loadingWallet ? '...' : `₹${(clientWallet?.available || 0).toLocaleString('en-IN')}`}
                      </div>
                    </div>
                  </div>

                  {/* Auditable Cashback Adjustment Section */}
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wider">
                        <span>💳</span> Auditable Atelier Wallet Adjustment
                      </h4>
                      <span className="text-[10px] text-amber-800 font-medium">
                        Pending delivery: ₹{(clientWallet?.pending || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <form onSubmit={handleApplyCashbackAdjustment} className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-bold text-neutral-600 mb-0.5">
                          Amount (₹) [+ grant / - deduct]
                        </label>
                        <input
                          type="number"
                          required
                          value={adjAmount}
                          onChange={(e) => setAdjAmount(e.target.value)}
                          placeholder="e.g. 250 or -100"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-300 font-mono text-xs focus:outline-none focus:border-brand-accent text-neutral-900 font-bold"
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <label className="block text-[10px] font-bold text-neutral-600 mb-0.5">
                          Mandatory Audit Reason *
                        </label>
                        <input
                          type="text"
                          required
                          value={adjReason}
                          onChange={(e) => setAdjReason(e.target.value)}
                          placeholder="e.g. Good-will tailoring credit / dispute resolution"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-300 text-xs focus:outline-none focus:border-brand-accent text-neutral-900"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-end">
                        <button
                          type="submit"
                          disabled={adjusting}
                          className="w-full py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {adjusting ? 'Saving...' : 'Apply'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Order History Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      Bespoke Commissions History ({clientOrders.length})
                    </h4>
                    {clientOrders.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic py-4 text-center bg-neutral-50 rounded-xl">
                        No orders recorded for this client yet.
                      </p>
                    ) : (
                      <div className="rounded-xl border border-neutral-200 overflow-hidden text-xs">
                        <table className="w-full min-w-[500px] text-left divide-y divide-neutral-200">
                          <thead className="bg-neutral-50 text-[10px] font-bold uppercase text-neutral-500">
                            <tr>
                              <th className="py-2 px-3">Order ID</th>
                              <th className="py-2 px-3">Date</th>
                              <th className="py-2 px-3">Stage / Status</th>
                              <th className="py-2 px-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {clientOrders.map((ord) => (
                              <tr key={ord.id || ord.orderId} className="hover:bg-neutral-50">
                                <td className="py-2 px-3 font-mono font-bold text-neutral-900">
                                  #{ord.orderId || ord.id}
                                </td>
                                <td className="py-2 px-3 text-neutral-500 text-[11px]">
                                  {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                                </td>
                                <td className="py-2 px-3">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800">
                                    {ord.orderStatus || ord.status || 'Confirmed'}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right font-black font-mono text-neutral-900">
                                  ₹{Number(ord.total || 0).toLocaleString('en-IN')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

        {/* Security & Data Safety Callout */}
        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start gap-3 text-xs text-neutral-500">
          <svg className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <div className="font-bold text-neutral-700">Zero-Credential Exposure Guarantee</div>
            <p className="mt-0.5 leading-relaxed">
              Customer authentication secrets, salt hashes, and passwords are protected by Firebase Auth and are never stored in Firestore documents. Admin oversight is strictly restricted to customer service contact information and commission history.
            </p>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
