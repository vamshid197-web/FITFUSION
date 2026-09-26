import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { getUserOrders, updateUserProfile } from '../../services/firestoreService.js';
import {
  getUserSavedCustomizations,
  deleteSavedCustomization
} from '../../services/savedCustomizationService.js';
import SavedAddressesManager from '../../components/account/SavedAddressesManager.jsx';
import RecentlyViewedSection from '../../components/account/RecentlyViewedSection.jsx';
import CustomerReviewsTab from '../../components/account/CustomerReviewsTab.jsx';
import CustomerOffersAndWalletTab from '../../components/account/CustomerOffersAndWalletTab.jsx';
import { getUserReviews } from '../../services/reviewService.js';
import {
  subscribeToUserNotifications,
  countUnreadNotifications
} from '../../services/notificationService.js';

export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';

  const { user, userProfile, profileLoading, refreshProfile, logout } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Navigation State
  const [activeTab, setActiveTab] = useState(initialTab);

  // Stats & Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [userReviewsCount, setUserReviewsCount] = useState(0);

  useEffect(() => {
    async function loadUserReviewsCount() {
      if (!user?.uid) return;
      try {
        const revs = await getUserReviews(user.uid);
        setUserReviewsCount(revs.length);
      } catch (err) {
        // ignore
      }
    }
    loadUserReviewsCount();
  }, [user?.uid]);

  // Saved Bespoke Vault
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [designsLoading, setDesignsLoading] = useState(true);

  // Editable Profile Form State (strictly safe fields: Name, Phone)
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: ''
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSaveLoading, setProfileSaveLoading] = useState(false);

  // Preferences Form State
  const [preferences, setPreferences] = useState({
    measurementUnit: 'inches',
    preferredFit: 'Regular',
    orderNotifications: true,
    newsletter: true
  });
  const [prefSaveLoading, setPrefSaveLoading] = useState(false);

  // Feedback notifications
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: '' }
  const [loggingOut, setLoggingOut] = useState(false);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Populate form fields from userProfile
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        name: userProfile.name || userProfile.displayName || '',
        phone: userProfile.phone || ''
      });

      const userPrefs = userProfile.preferences || {};
      setPreferences({
        measurementUnit: userPrefs.measurementUnit || 'inches',
        preferredFit: userPrefs.preferredFit || 'Regular',
        orderNotifications: userPrefs.orderNotifications !== false,
        newsletter: Boolean(userPrefs.newsletter)
      });
    }
  }, [userProfile]);

  // Load Customer Orders
  useEffect(() => {
    async function fetchOrders() {
      if (!user?.uid) return;
      try {
        setOrdersLoading(true);
        const res = await getUserOrders(user.uid);
        if (res.success && Array.isArray(res.orders)) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.warn('[ProfilePage] Could not load orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    }
    fetchOrders();
  }, [user?.uid]);

  // Load Saved Bespoke Vault Designs
  useEffect(() => {
    async function fetchDesigns() {
      if (!user?.uid) return;
      try {
        setDesignsLoading(true);
        const list = await getUserSavedCustomizations(user.uid);
        setSavedDesigns(list);
      } catch (err) {
        console.warn('[ProfilePage] Could not load saved designs:', err);
      } finally {
        setDesignsLoading(false);
      }
    }
    fetchDesigns();
  }, [user?.uid]);

  // Notifications Subscription
  useEffect(() => {
    if (!user?.uid) return;
    const isAdmin = userProfile?.role === 'admin';
    const unsub = subscribeToUserNotifications(
      user.uid,
      (list) => {
        setUnreadNotifsCount(countUnreadNotifications(list));
      },
      isAdmin
    );
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [user?.uid, userProfile?.role]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to sign out:', err);
      setLoggingOut(false);
    }
  };

  // Save Safe Profile Details (Name, Phone only)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;

    if (!profileForm.name.trim() || profileForm.name.trim().length < 2) {
      setFeedback({ type: 'error', text: 'Full Name must be at least 2 characters.' });
      return;
    }

    const cleanPhone = profileForm.phone.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length !== 10) {
      setFeedback({ type: 'error', text: 'Mobile Number must be 10 digits.' });
      return;
    }

    setProfileSaveLoading(true);
    setFeedback(null);

    try {
      // Strictly prevent user from modifying UID, role, or authentication internals
      const safeUpdates = {
        name: profileForm.name.trim(),
        displayName: profileForm.name.trim(),
        phone: cleanPhone
      };

      const res = await updateUserProfile(user.uid, safeUpdates);
      if (res.success) {
        await refreshProfile();
        setEditingProfile(false);
        setFeedback({ type: 'success', text: 'Personal profile details updated successfully.' });
        setTimeout(() => setFeedback(null), 3500);
      } else {
        setFeedback({ type: 'error', text: 'Could not update profile in Firestore.' });
      }
    } catch (err) {
      console.error('[ProfilePage] Save profile error:', err);
      setFeedback({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setProfileSaveLoading(false);
    }
  };

  // Save Preferences
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;

    setPrefSaveLoading(true);
    setFeedback(null);

    try {
      const res = await updateUserProfile(user.uid, { preferences });
      if (res.success) {
        await refreshProfile();
        setFeedback({ type: 'success', text: 'Atelier tailoring & account preferences saved.' });
        setTimeout(() => setFeedback(null), 3500);
      } else {
        setFeedback({ type: 'error', text: 'Could not save preferences to Firestore.' });
      }
    } catch (err) {
      console.error('[ProfilePage] Save preferences error:', err);
      setFeedback({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setPrefSaveLoading(false);
    }
  };

  // Handle Quick Add to Cart for Saved Vault Customization
  const handleAddVaultToCart = (design) => {
    const cust = design.customization || {};
    const basePrice = Number(design.price || cust.price || 0);

    const cartItem = {
      id: `cart-vault-${design.id}-${Date.now()}`,
      productId: design.productId || 'custom',
      productName: design.productName || 'Bespoke Garment',
      category: 'Bespoke Couture',
      productImage: null,
      silhouetteColor: 'from-stone-100 to-amber-50',
      accentColor: '#1F2937',
      basePrice: basePrice,

      selectedFabric: cust.fabric || { name: 'Standard Milled Textile' },
      fabric: cust.fabric || { name: 'Standard Milled Textile' },
      selectedColor: cust.color || { name: 'Natural', hex: '#1F2937' },
      color: cust.color || { name: 'Natural', hex: '#1F2937' },

      selectedDesign: cust.design || { collar: 'Standard', cuff: 'Standard', buttons: 'Standard' },
      designOptions: cust.design || { collar: 'Standard', cuff: 'Standard', buttons: 'Standard' },
      collar: cust.design?.collar || 'Standard',
      cuff: cust.design?.cuff || 'Standard',
      buttons: cust.design?.buttons || 'Standard',
      monogram: cust.design?.monogram || null,

      size: cust.size || 'Custom Tailored',
      fit: cust.fit || 'Regular',
      customMeasurements: cust.measurements || {},
      measurementUnit: cust.measurementUnit || 'inches',

      selectedPerfume: cust.perfume || null,
      perfumePrice: cust.perfume ? 1200 : 0,

      itemPrice: basePrice,
      totalItemPrice: basePrice,
      quantity: 1,
      addedAt: new Date().toISOString()
    };

    addToCart(cartItem);
    setFeedback({
      type: 'success',
      text: `Added "${design.designName || design.productName}" from your Bespoke Vault to cart!`
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleDeleteVaultDesign = async (designId) => {
    if (!window.confirm('Delete this bespoke tailored configuration from your Vault?')) return;
    try {
      await deleteSavedCustomization(designId);
      setSavedDesigns((prev) => prev.filter((d) => d.id !== designId));
      setFeedback({ type: 'success', text: 'Bespoke design removed from your Vault.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Delete vault design error:', err);
    }
  };

  const displayName = profileForm.name || userProfile?.name || user?.displayName || 'Distinguished Patron';
  const displayEmail = user?.email || userProfile?.email || 'patron@fitfusion.com';
  const displayPhone = profileForm.phone || userProfile?.phone || 'Not registered';
  const memberSince = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric'
      })
    : '2026';

  const activeOrdersCount = orders.filter(
    (o) => (o.orderStatus || o.status) !== 'Delivered' && (o.orderStatus || o.status) !== 'Cancelled'
  ).length;

  const navigationTabs = [
    { id: 'profile', name: 'Profile & Identity', icon: '👤' },
    { id: 'orders', name: 'My Orders', icon: '📦', badge: activeOrdersCount > 0 ? activeOrdersCount : null },
    { id: 'wishlist', name: 'Wishlist', icon: '♥', badge: wishlist.length > 0 ? wishlist.length : null },
    { id: 'vault', name: 'Saved Bespoke Vault', icon: '💎', badge: savedDesigns.length > 0 ? savedDesigns.length : null },
    { id: 'addresses', name: 'Saved Addresses', icon: '📍' },
    { id: 'reviews', name: 'My Reviews', icon: '★', badge: userReviewsCount > 0 ? userReviewsCount : null },
    { id: 'wallet', name: 'Wallet & Offers', icon: '💰' },
    { id: 'recently-viewed', name: 'Recently Viewed', icon: '👁️' },
    { id: 'preferences', name: 'Atelier Preferences', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10">
      <PageContainer>
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-2">
            <Link to="/home" className="hover:text-brand-dark transition-colors">Home</Link>
            <span>/</span>
            <span className="text-brand-dark">Customer Account</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-black text-brand-dark tracking-tight">
                My Atelier Account
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Manage your bespoke measurements, garment orders, curated wishlist, and white-glove delivery destinations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/notifications"
                className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-xs transition-colors"
              >
                <span>🔔 Alerts</span>
                {unreadNotifsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-accent text-white">
                    {unreadNotifsCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-xs font-bold px-3.5 py-1.5 rounded-xl border border-neutral-300 text-neutral-700 hover:border-red-600 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {loggingOut ? 'Signing Out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{feedback.type === 'success' ? '✓' : '⚠'}</span>
              <span>{feedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-neutral-500 hover:text-neutral-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Grid: Sidebar Navigation + Main Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Account Navigation & Patron Badge */}
          <div className="lg:col-span-1 space-y-6">
            {/* Patron ID Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-dark text-white font-serif font-black text-lg flex items-center justify-center shadow-md">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <h2 className="font-bold text-sm text-brand-dark truncate">{displayName}</h2>
                  <p className="text-[11px] text-neutral-400 truncate">{displayEmail}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80">
                    {userProfile?.role === 'admin' ? '⚙ Atelier Director (Admin)' : '✨ Bespoke Patron'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 bg-neutral-50 rounded-lg">
                  <span className="block font-bold text-brand-dark font-mono">{orders.length}</span>
                  <span className="text-[10px] text-neutral-400">Total Orders</span>
                </div>
                <div className="p-2 bg-neutral-50 rounded-lg">
                  <span className="block font-bold text-brand-dark font-mono">{wishlist.length}</span>
                  <span className="text-[10px] text-neutral-400">Wishlist</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-2 space-y-1">
              {navigationTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all select-none ${
                      isActive
                        ? 'bg-brand-dark text-white shadow-xs'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-brand-dark'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span>{tab.icon}</span>
                      <span>{tab.name}</span>
                    </div>
                    {tab.badge !== null && tab.badge > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-brand-accent text-white'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Atelier Guarantee Badge */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1.5">
              <span className="font-bold flex items-center gap-1.5">
                <span>🛡️</span> Bespoke Atelier Guarantee
              </span>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Complimentary fitting alterations within 30 days of white-glove delivery on all custom tailored garments.
              </p>
            </div>
          </div>

          {/* Right Column: Active Tab Content */}
          <div className="lg:col-span-3">
            {/* TAB 1: Profile & Identity */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div>
                      <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
                        <span>👤</span> Personal Identity & Contact Information
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Your bespoke identity used for tailoring coordination and delivery dispatch.
                      </p>
                    </div>

                    {!editingProfile && (
                      <button
                        type="button"
                        onClick={() => setEditingProfile(true)}
                        className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-1"
                      >
                        ✏ Edit Details
                      </button>
                    )}
                  </div>

                  {editingProfile ? (
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            placeholder="Alexander Wright"
                            required
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-brand-accent"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                            Mobile Phone Number (10 Digits) *
                          </label>
                          <input
                            type="tel"
                            maxLength={10}
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '') })}
                            placeholder="9876543210"
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 font-mono focus:outline-hidden focus:ring-1 focus:ring-brand-accent"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {/* Non-editable system fields */}
                        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
                            Email Address (Verified Auth)
                          </label>
                          <span className="text-xs font-mono font-semibold text-neutral-700">{displayEmail}</span>
                          <span className="block text-[10px] text-neutral-400 mt-0.5">Managed via Firebase Auth</span>
                        </div>

                        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
                            Atelier Patron UID
                          </label>
                          <span className="text-xs font-mono font-semibold text-neutral-700 truncate block">
                            {user?.uid || 'GUEST-ID'}
                          </span>
                          <span className="block text-[10px] text-neutral-400 mt-0.5">Immutable Security Key</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-100">
                        <button
                          type="button"
                          onClick={() => setEditingProfile(false)}
                          className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={profileSaveLoading}
                          className="px-5 py-2 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-brand-accent shadow-xs disabled:opacity-50"
                        >
                          {profileSaveLoading ? 'Saving...' : 'Save Profile Changes'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Full Patron Name
                        </span>
                        <span className="font-bold text-brand-dark text-sm">{displayName}</span>
                      </div>

                      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Primary Mobile
                        </span>
                        <span className="font-mono font-bold text-neutral-800 text-sm">{displayPhone}</span>
                      </div>

                      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Registered Email
                        </span>
                        <span className="font-mono text-neutral-700">{displayEmail}</span>
                      </div>

                      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Patron Since
                        </span>
                        <span className="font-bold text-neutral-800">{memberSince}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Summary of Primary Address */}
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
                      <span>📍</span> Primary Delivery Destination
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleTabChange('addresses')}
                      className="text-xs font-bold text-brand-accent hover:underline"
                    >
                      Manage All Addresses &rarr;
                    </button>
                  </div>
                  <SavedAddressesManager />
                </div>
              </div>
            )}

            {/* TAB 2: My Orders */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div>
                      <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
                        <span>📦</span> Tailored Order History
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Track production, fabric cutting, stitching, and white-glove dispatch.
                      </p>
                    </div>
                    <Button to="/orders" variant="outline" size="sm">
                      View Full Order Dashboard &rarr;
                    </Button>
                  </div>

                  {ordersLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((n) => (
                        <div key={n} className="h-24 bg-neutral-100 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="p-8 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 text-center space-y-3">
                      <p className="text-xs text-neutral-500">
                        You have not placed any bespoke tailoring orders yet.
                      </p>
                      <Button to="/shop" variant="secondary" size="sm">
                        Start Customizing Garment &rarr;
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {orders.slice(0, 5).map((order) => {
                        const orderId = order.id || order.orderId;
                        const dateStr = order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          : 'Recently';
                        const total = Number(order.totalAmount || order.total || 0);
                        const status = order.orderStatus || order.status || 'Order Placed';
                        const paymentStatus = order.paymentStatus || (order.paymentMethod === 'Cash on Delivery' ? 'Payable on Delivery' : 'Paid');

                        return (
                          <div
                            key={orderId}
                            className="p-4 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-brand-dark">
                                  #{orderId}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                                  {dateStr}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-600 font-medium">
                                {order.items?.length || 1} tailored piece{(order.items?.length || 1) > 1 ? 's' : ''} &bull; Total: <span className="font-mono font-bold text-neutral-900">₹{total.toLocaleString('en-IN')}</span>
                              </p>
                              <div className="flex items-center gap-2 text-[11px]">
                                <span className="font-semibold text-brand-accent">Status: {status}</span>
                                <span className="text-neutral-300">&bull;</span>
                                <span className="text-neutral-500">{paymentStatus}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button to={`/orders/${orderId}`} variant="outline" size="sm" className="text-xs">
                                Track Order &rarr;
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Wishlist Preview */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div>
                      <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
                        <span>♥</span> Coveted Wishlist Pieces ({wishlist.length})
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Garments you marked for future customization and tailoring.
                      </p>
                    </div>
                    <Button to="/wishlist" variant="secondary" size="sm">
                      Open Full Wishlist Page &rarr;
                    </Button>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="p-8 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 text-center space-y-3">
                      <p className="text-xs text-neutral-500">
                        Your wishlist is empty. Save pieces you love while exploring our catalog.
                      </p>
                      <Button to="/shop" variant="outline" size="sm">
                        Browse Catalog &rarr;
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {wishlist.slice(0, 6).map((item) => {
                        const prodId = item.productId || item.id;
                        return (
                          <div
                            key={prodId}
                            className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                  {item.category}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeFromWishlist(prodId)}
                                  className="text-rose-500 hover:text-rose-700 text-xs"
                                  title="Remove"
                                >
                                  ✕
                                </button>
                              </div>
                              <h4 className="font-bold text-xs text-brand-dark mt-1 line-clamp-1">
                                {item.productName}
                              </h4>
                              <p className="text-xs font-mono font-bold text-neutral-900 mt-0.5">
                                ₹{Number(item.price || 0).toLocaleString('en-IN')}
                              </p>
                            </div>

                            <div className="pt-2 flex gap-1.5">
                              <Link
                                to={`/customize/${prodId}`}
                                className="flex-1 py-1 text-center bg-brand-dark text-white rounded-lg text-[10px] font-bold hover:bg-brand-accent transition-colors"
                              >
                                Tailor
                              </Link>
                              <Link
                                to={`/product/${prodId}`}
                                className="px-2 py-1 bg-white border border-neutral-300 rounded-lg text-[10px] font-bold text-neutral-700 hover:bg-neutral-100"
                              >
                                Details
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: Saved Bespoke Vault */}
            {activeTab === 'vault' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div>
                      <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
                        <span>💎</span> Saved Bespoke Vault ({savedDesigns.length})
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Your personalized tailoring configurations, fabrics, monograms, and sizing specifications.
                      </p>
                    </div>
                    <Button to="/saved-designs" variant="secondary" size="sm">
                      Open Dedicated Vault &rarr;
                    </Button>
                  </div>

                  {designsLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((n) => (
                        <div key={n} className="h-24 bg-neutral-100 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : savedDesigns.length === 0 ? (
                    <div className="p-8 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 text-center space-y-3">
                      <p className="text-xs text-neutral-500">
                        No saved bespoke designs in your Vault yet. Save your custom garment designs from the Customizer.
                      </p>
                      <Button to="/customize/1" variant="outline" size="sm">
                        Open Customizer &rarr;
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedDesigns.slice(0, 5).map((design) => {
                        const cust = design.customization || {};
                        const price = Number(design.price || 0);

                        return (
                          <div
                            key={design.id}
                            className="p-4 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <h4 className="font-bold text-xs text-brand-dark">
                                {design.designName || design.productName}
                              </h4>
                              <p className="text-[11px] text-neutral-500">
                                Fabric: <span className="font-semibold text-neutral-800">{cust.fabric?.name || 'Tailored'}</span> &bull; Fit: <span className="font-semibold text-neutral-800">{cust.fit || 'Regular'}</span> &bull; Collar: <span className="font-semibold text-neutral-800">{cust.design?.collar || 'Standard'}</span>
                              </p>
                              <span className="text-xs font-mono font-bold text-brand-dark">
                                ₹{price.toLocaleString('en-IN')}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                onClick={() => handleAddVaultToCart(design)}
                                variant="secondary"
                                size="sm"
                                className="text-xs font-bold"
                              >
                                + Add to Bag
                              </Button>
                              <Button
                                to={`/customize/${design.productId || '1'}?savedId=${design.id}`}
                                variant="outline"
                                size="sm"
                                className="text-xs font-bold"
                              >
                                Edit Design
                              </Button>
                              <button
                                type="button"
                                onClick={() => handleDeleteVaultDesign(design.id)}
                                className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-md"
                                title="Delete saved configuration"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Wallet & Offers (Phase 16) */}
            {activeTab === 'wallet' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                  <CustomerOffersAndWalletTab />
                </div>
              </div>
            )}

            {/* TAB 8: My Reviews (Phase 14) */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                  <CustomerReviewsTab />
                </div>
              </div>
            )}

            {/* TAB 5: Saved Addresses */}
            {activeTab === 'addresses' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                  <SavedAddressesManager />
                </div>
              </div>
            )}

            {/* TAB 6: Recently Viewed */}
            {activeTab === 'recently-viewed' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                  <RecentlyViewedSection />
                </div>
              </div>
            )}

            {/* TAB 7: Atelier Tailoring & Account Preferences */}
            {activeTab === 'preferences' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
                  <div className="pb-3 border-b border-neutral-100">
                    <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
                      <span>⚙️</span> Atelier Sizing & Account Preferences
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Tailor your personal default measuring units, fit drape preferences, and bespoke alerts.
                    </p>
                  </div>

                  <form onSubmit={handleSavePreferences} className="space-y-5">
                    {/* Measurement Unit */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-2">
                        Preferred Measurement Unit
                      </label>
                      <div className="grid grid-cols-2 gap-3 max-w-md">
                        <button
                          type="button"
                          onClick={() => setPreferences({ ...preferences, measurementUnit: 'inches' })}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            preferences.measurementUnit === 'inches'
                              ? 'bg-brand-dark text-white border-brand-dark shadow-xs'
                              : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                          }`}
                        >
                          <span className="font-bold text-xs block">Inches (in)</span>
                          <span className={`text-[10px] block mt-0.5 ${preferences.measurementUnit === 'inches' ? 'text-neutral-300' : 'text-neutral-400'}`}>
                            Atelier Savile Row standard
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreferences({ ...preferences, measurementUnit: 'cm' })}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            preferences.measurementUnit === 'cm'
                              ? 'bg-brand-dark text-white border-brand-dark shadow-xs'
                              : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                          }`}
                        >
                          <span className="font-bold text-xs block">Centimeters (cm)</span>
                          <span className={`text-[10px] block mt-0.5 ${preferences.measurementUnit === 'cm' ? 'text-neutral-300' : 'text-neutral-400'}`}>
                            Metric standard scale
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Preferred Fit */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-2">
                        Default Garment Silhouette Drape
                      </label>
                      <div className="grid grid-cols-3 gap-3 max-w-md">
                        {['Slim', 'Regular', 'Relaxed'].map((fit) => (
                          <button
                            key={fit}
                            type="button"
                            onClick={() => setPreferences({ ...preferences, preferredFit: fit })}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              preferences.preferredFit === fit
                                ? 'bg-brand-dark text-white border-brand-dark shadow-xs'
                                : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                            }`}
                          >
                            <span className="font-bold text-xs block">{fit}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notification & Communication Preferences */}
                    <div className="pt-2 border-t border-neutral-100 space-y-3">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                        Communication & Atelier Dispatch Alerts
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer select-none text-xs text-neutral-700">
                        <input
                          type="checkbox"
                          checked={preferences.orderNotifications}
                          onChange={(e) => setPreferences({ ...preferences, orderNotifications: e.target.checked })}
                          className="rounded-sm border-neutral-300 text-brand-dark focus:ring-brand-accent"
                        />
                        <span>Receive real-time order production status and white-glove shipping alerts</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer select-none text-xs text-neutral-700">
                        <input
                          type="checkbox"
                          checked={preferences.newsletter}
                          onChange={(e) => setPreferences({ ...preferences, newsletter: e.target.checked })}
                          className="rounded-sm border-neutral-300 text-brand-dark focus:ring-brand-accent"
                        />
                        <span>Curated seasonal textile drops & exclusive atelier bespoke invites</span>
                      </label>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex justify-end">
                      <button
                        type="submit"
                        disabled={prefSaveLoading}
                        className="px-5 py-2.5 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-brand-accent shadow-xs disabled:opacity-50"
                      >
                        {prefSaveLoading ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
