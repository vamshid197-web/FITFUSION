import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { getUserOrders, updateUserProfile } from '../../services/firestoreService.js';
import SavedAddressesManager from '../../components/account/SavedAddressesManager.jsx';
import { auth, storage } from '../../services/firebase.js';
import { updateProfile, updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getCashbackWallet } from '../../services/cashbackService.js';
import {
  getUserSavedCustomizations,
  deleteSavedCustomization
} from '../../services/savedCustomizationService.js';
import SavedDesignCard from '../../components/customization/SavedDesignCard.jsx';
import RecentlyViewedSection from '../../components/account/RecentlyViewedSection.jsx';

export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'edit-profile';

  const { user, userProfile, profileLoading, refreshProfile, logout } = useAuth();
  const { wishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Active section state
  const [activeTab, setActiveTab] = useState(initialTab);

  // Saved designs state
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [designsLoading, setDesignsLoading] = useState(false);
  const [deletingDesignId, setDeletingDesignId] = useState(null);

  // Orders summary state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Wallet state
  const [wallet, setWallet] = useState({ available: 0, pending: 0 });

  // Edit Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    photoURL: ''
  });
  const [profileSaveLoading, setProfileSaveLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // File upload state for profile photo
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    offersAndDiscounts: true,
    productRecommendations: true
  });
  const [notifSaving, setNotifSaving] = useState(false);

  // Change Password State
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmailLoading, setResetEmailLoading] = useState(false);

  // Feedback banner state: { type: 'success' | 'error' | 'info', text: '' }
  const [feedback, setFeedback] = useState(null);

  // Logout confirmation modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    if (tabId === 'orders') {
      navigate('/orders');
      return;
    }
    if (tabId === 'wishlist') {
      navigate('/wishlist');
      return;
    }
    if (tabId === 'logout') {
      setShowLogoutModal(true);
      return;
    }

    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    setFeedback(null);
  };

  // Load saved custom designs
  const loadSavedDesigns = async () => {
    setDesignsLoading(true);
    try {
      const data = await getUserSavedCustomizations(user?.uid || 'anonymous');
      setSavedDesigns(data);
    } catch (err) {
      console.warn('[ProfilePage] Failed to load saved designs:', err);
    } finally {
      setDesignsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedDesigns();
  }, [user]);

  const handleDeleteSavedDesign = async (id) => {
    if (!window.confirm('Are you sure you want to remove this saved custom design?')) {
      return;
    }
    setDeletingDesignId(id);
    try {
      await deleteSavedCustomization(id);
      setSavedDesigns((prev) => prev.filter((d) => d.id !== id));
      setFeedback({ type: 'success', text: 'Design removed successfully.' });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to remove design. Please try again.' });
    } finally {
      setDeletingDesignId(null);
    }
  };

  const handleEditSavedDesign = (design) => {
    navigate(`/customize/${design.productId || '1'}`, {
      state: {
        editConfig: {
          ...design.customization,
          price: design.totalPrice || design.price,
          savedDesignId: design.id
        },
        initialStep: 1
      }
    });
  };

  const handleAddToCartSavedDesign = (design) => {
    const cust = design.customization || {};
    const price = Number(design.totalPrice || design.price || 0);

    const cartItem = {
      id: `cart-saved-${design.id}-${Date.now()}`,
      productId: design.productId,
      productName: design.productName,
      category: cust.category || 'Custom Apparel',
      productImage: design.productImage || cust.productImage || null,
      basePrice: price,
      selectedFabric: cust.fabric,
      fabric: cust.fabric,
      selectedColor: cust.color,
      color: cust.color,
      selectedDesign: cust.design || {},
      collar: cust.design?.collar,
      cuff: cust.design?.cuff,
      buttons: cust.buttons?.name || cust.design?.buttons,
      size: design.size || cust.size || 'M',
      customMeasurements: design.customMeasurements || cust.measurements || {},
      measurementUnit: cust.measurementUnit || 'in',
      fit: design.fit || cust.fit || 'Regular',
      itemPrice: price,
      totalItemPrice: price,
      quantity: 1,
      customization: cust,
      addedAt: new Date().toISOString()
    };

    addToCart(cartItem);
    setFeedback({
      type: 'success',
      text: `"${design.productName}" added to your bag!`
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Populate form fields from userProfile and user auth
  useEffect(() => {
    if (userProfile || user) {
      setProfileForm({
        name: userProfile?.name || user?.displayName || '',
        phone: userProfile?.phone || '',
        photoURL: userProfile?.photoURL || user?.photoURL || ''
      });

      const userNotifs = userProfile?.preferences?.notifications || {};
      setNotifications({
        orderUpdates: userNotifs.orderUpdates !== false,
        offersAndDiscounts: userNotifs.offersAndDiscounts !== false,
        productRecommendations: userNotifs.productRecommendations !== false
      });
    }
  }, [userProfile, user]);

  // Clean up object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (filePreview && filePreview.startsWith('blob:')) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  // Load customer orders for badge count and summary
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
        console.warn('[ProfilePage] Failed to fetch orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    }
    fetchOrders();
  }, [user?.uid]);

  // Load wallet balance
  useEffect(() => {
    async function fetchWallet() {
      if (!user?.uid) return;
      try {
        const w = await getCashbackWallet(user.uid);
        setWallet(w);
      } catch (err) {
        // ignore
      }
    }
    fetchWallet();
  }, [user?.uid]);

  // Handle Logout
  const handleConfirmLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out:', err);
      setFeedback({ type: 'error', text: 'Failed to sign out. Please try again.' });
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  // Handle Direct Device File Selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image MIME type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setFeedback({ type: 'error', text: 'Please select a valid image file (JPG, PNG, or WEBP).' });
      return;
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFeedback({ type: 'error', text: 'Image file size must be under 5MB.' });
      return;
    }

    // Clean up previous blob URL if any
    if (filePreview && filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }

    const preview = URL.createObjectURL(file);
    setSelectedFile(file);
    setFilePreview(preview);
    setAvatarError(false);
    setFeedback({ type: 'info', text: 'Image ready to save. Click "Save Changes" to update your profile photo.' });
  };

  const handleRemovePhoto = () => {
    if (filePreview && filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
    setSelectedFile(null);
    setFilePreview(null);
    setProfileForm((prev) => ({ ...prev, photoURL: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFeedback({ type: 'info', text: 'Photo removed. Click "Save Changes" to confirm.' });
  };

  // 1. SAVE PROFILE (Full Name, Phone Number, Profile Photo)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;

    if (!profileForm.name.trim() || profileForm.name.trim().length < 2) {
      setFeedback({ type: 'error', text: 'Full Name must be at least 2 characters.' });
      return;
    }

    const cleanPhone = profileForm.phone.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length !== 10) {
      setFeedback({ type: 'error', text: 'Please enter a valid 10-digit mobile number.' });
      return;
    }

    setProfileSaveLoading(true);
    setFeedback(null);

    let finalPhotoURL = profileForm.photoURL;

    // If user uploaded a new file from device, upload to Firebase Storage
    if (selectedFile) {
      try {
        const storagePath = `profilePhotos/${user.uid}/profile_${Date.now()}.jpg`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, selectedFile, {
          contentType: selectedFile.type
        });
        finalPhotoURL = await getDownloadURL(storageRef);
      } catch (storageErr) {
        console.warn('[ProfilePage] Firebase Storage upload warning:', storageErr);
        // If Cloud Storage is not yet enabled/provisioned in the console
        if (storageErr?.code === 'storage/unknown' || storageErr?.code === 'storage/unauthorized' || storageErr?.code === 'storage/bucket-not-found') {
          setFeedback({
            type: 'error',
            text: 'Notice: Cloud Storage bucket is not yet provisioned in the Firebase project console. Profile name and phone were saved, but image storage requires enabling Storage in the Firebase Console.'
          });
        } else {
          setFeedback({
            type: 'error',
            text: `Image upload note: ${storageErr?.message || 'Could not upload image to storage'}. Profile details were saved.`
          });
        }
      }
    }

    try {
      // 1. Update display name and photo in auth if present
      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, {
            displayName: profileForm.name.trim(),
            photoURL: finalPhotoURL || null
          });
        } catch (authErr) {
          console.warn('[ProfilePage] Auth profile update warning:', authErr);
        }
      }

      // 2. Update user profile document without storing raw base64 data
      const updates = {
        name: profileForm.name.trim(),
        displayName: profileForm.name.trim(),
        phone: cleanPhone,
        photoURL: finalPhotoURL || ''
      };

      const res = await updateUserProfile(user.uid, updates);
      if (res.success) {
        await refreshProfile();
        setSelectedFile(null);
        setFilePreview(null);
        setAvatarError(false);
        setProfileForm((prev) => ({ ...prev, photoURL: finalPhotoURL }));
        if (!feedback) {
          setFeedback({ type: 'success', text: 'Profile details saved successfully.' });
          setTimeout(() => setFeedback(null), 4000);
        }
      } else {
        setFeedback({ type: 'error', text: 'Could not save profile changes. Please try again.' });
      }
    } catch (err) {
      console.error('[ProfilePage] Error saving profile:', err);
      setFeedback({ type: 'error', text: 'An unexpected error occurred while saving profile.' });
    } finally {
      setProfileSaveLoading(false);
    }
  };

  // Reset profile form to current saved state
  const handleCancelProfileEdit = () => {
    if (filePreview && filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setProfileForm({
      name: userProfile?.name || user?.displayName || '',
      phone: userProfile?.phone || '',
      photoURL: userProfile?.photoURL || user?.photoURL || ''
    });
    setFeedback(null);
  };

  // 2. TOGGLE NOTIFICATION SETTING
  const handleToggleNotification = async (key) => {
    if (!user?.uid) return;
    const updated = {
      ...notifications,
      [key]: !notifications[key]
    };
    setNotifications(updated);
    setNotifSaving(true);

    try {
      await updateUserProfile(user.uid, {
        preferences: {
          ...(userProfile?.preferences || {}),
          notifications: updated
        }
      });
      await refreshProfile();
      setFeedback({ type: 'success', text: 'Notification preferences updated.' });
      setTimeout(() => setFeedback(null), 2500);
    } catch (err) {
      console.error('[ProfilePage] Notification update error:', err);
      setFeedback({ type: 'error', text: 'Failed to update notification settings.' });
    } finally {
      setNotifSaving(false);
    }
  };

  // 3. CHANGE PASSWORD
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setFeedback({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedback({ type: 'error', text: 'New password and confirmation password do not match.' });
      return;
    }

    setPasswordLoading(true);
    setFeedback(null);
    setResetEmailSent(false);

    try {
      await updatePassword(auth.currentUser, passwordForm.newPassword);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setFeedback({ type: 'success', text: 'Password has been changed successfully!' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error('[ProfilePage] Change password error:', err);
      if (err.code === 'auth/requires-recent-login') {
        setFeedback({
          type: 'error',
          text: 'For security, changing password requires a recent login. Please log in again, or send a reset link to your email below.'
        });
      } else if (err.code === 'auth/weak-password') {
        setFeedback({ type: 'error', text: 'The chosen password is too weak. Please choose a stronger password.' });
      } else {
        setFeedback({ type: 'error', text: err.message || 'Failed to update password. Please try again.' });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    try {
      setResetEmailLoading(true);
      await sendPasswordResetEmail(auth, user.email);
      setResetEmailSent(true);
      setFeedback({ type: 'success', text: `A password reset link has been sent to ${user.email}.` });
    } catch (err) {
      console.error('[ProfilePage] Reset email error:', err);
      setFeedback({ type: 'error', text: 'Could not send reset email. Please try again.' });
    } finally {
      setResetEmailLoading(false);
    }
  };

  // Header display details
  const displayName = profileForm.name || userProfile?.name || user?.displayName || 'FitFusion Customer';
  const displayEmail = user?.email || userProfile?.email || 'customer@fitfusion.com';
  const displayPhone = profileForm.phone || userProfile?.phone || '';
  const currentAvatarSrc = filePreview || profileForm.photoURL || userProfile?.photoURL || user?.photoURL || '';

  // User initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'FF';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Clearly visible account options
  const accountOptions = [
    { id: 'orders', label: 'My Orders', icon: '📦', badge: orders.length > 0 ? orders.length : null },
    { id: 'wishlist', label: 'My Wishlist', icon: '♥', badge: wishlist.length > 0 ? wishlist.length : null },
    { id: 'my-designs', label: 'My Designs', icon: '🎨', badge: savedDesigns.length > 0 ? savedDesigns.length : null },
    { id: 'recently-viewed', label: 'Recently Viewed', icon: '👁️', badge: null },
    { id: 'addresses', label: 'Saved Addresses', icon: '📍', badge: null },
    { id: 'edit-profile', label: 'Edit Profile', icon: '👤', badge: null },
    { id: 'notifications', label: 'Notifications', icon: '🔔', badge: null },
    { id: 'change-password', label: 'Change Password', icon: '🔒', badge: null },
    { id: 'payment-methods', label: 'Payment Methods', icon: '💳', badge: null },
    { id: 'logout', label: 'Logout', icon: '🚪', badge: null, isDanger: true }
  ];

  return (
    <div className="min-h-screen bg-neutral-50/50 py-8 sm:py-12">
      <PageContainer>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-neutral-500">
            <li>
              <Link to="/home" className="hover:text-brand-dark transition-colors">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-neutral-800 font-semibold" aria-current="page">Account</li>
          </ol>
        </nav>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            role="alert"
            className={`mb-6 p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xs transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : feedback.type === 'info'
                ? 'bg-blue-50 text-blue-900 border-blue-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">
                {feedback.type === 'success' ? '✓' : feedback.type === 'info' ? 'ℹ' : '⚠️'}
              </span>
              <span>{feedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-neutral-500 hover:text-neutral-800 p-1"
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {/* PROFILE HEADER: Summary Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Profile Avatar / Photo */}
              <div className="relative shrink-0">
                {currentAvatarSrc && !avatarError ? (
                  <img
                    src={currentAvatarSrc}
                    alt={displayName}
                    onError={() => setAvatarError(true)}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-brand-accent/40 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-brand-dark via-neutral-800 to-brand-accent text-white font-serif font-black text-xl sm:text-2xl flex items-center justify-center shadow-sm select-none">
                    {getInitials(displayName)}
                  </div>
                )}
              </div>

              {/* User Identity Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-brand-dark leading-tight">
                    {displayName}
                  </h1>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 flex items-center gap-1.5 font-medium">
                  <span>✉</span>
                  <span>{displayEmail}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Verified
                  </span>
                </p>

                <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                  <span>📞</span>
                  <span>{displayPhone ? `+91 ${displayPhone}` : 'No phone number added'}</span>
                </p>
              </div>
            </div>

            {/* Quick Action Button: Edit Profile */}
            <div className="flex items-center gap-3 self-start sm:self-center">
              <button
                type="button"
                onClick={() => handleTabChange('edit-profile')}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                  activeTab === 'edit-profile'
                    ? 'bg-brand-dark text-white border-brand-dark shadow-xs'
                    : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400'
                }`}
              >
                ✏️ Edit Profile
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-neutral-100">
            <Link
              to="/orders"
              className="p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors text-center"
            >
              <span className="block text-base sm:text-lg font-bold text-brand-dark font-mono">
                {ordersLoading ? '...' : orders.length}
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">Total Orders</span>
            </Link>

            <Link
              to="/wishlist"
              className="p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors text-center"
            >
              <span className="block text-base sm:text-lg font-bold text-brand-dark font-mono">
                {wishlist.length}
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">Wishlist Items</span>
            </Link>

            <button
              type="button"
              onClick={() => handleTabChange('payment-methods')}
              className="p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors text-center"
            >
              <span className="block text-base sm:text-lg font-bold text-brand-accent font-mono">
                ₹{wallet.available.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">Wallet Balance</span>
            </button>
          </div>
        </div>

        {/* ACCOUNT DASHBOARD: Options on Left | Selected Section on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Account Options Menu */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-3 space-y-1">
              <h2 className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Account Settings
              </h2>

              {accountOptions.map((opt) => {
                const isActive = activeTab === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleTabChange(opt.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                      isActive
                        ? 'bg-brand-dark text-white shadow-xs'
                        : opt.isDanger
                        ? 'text-rose-600 hover:bg-rose-50'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-brand-dark'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{opt.icon}</span>
                      <span>{opt.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {opt.badge !== null && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-brand-accent text-white'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      <span className={`text-xs ${isActive ? 'text-white/70' : 'text-neutral-400'}`}>
                        &rarr;
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Need Help Card */}
            <div className="p-4 rounded-2xl bg-neutral-100/70 border border-neutral-200 text-xs text-neutral-600 space-y-2">
              <span className="font-bold text-brand-dark flex items-center gap-1.5">
                <span>💬</span> Customer Support
              </span>
              <p className="text-[11px] leading-relaxed text-neutral-500">
                Have questions about your order, sizing, or account? Reach out to support@fitfusion.com anytime.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Selected Section Content */}
          <div className="lg:col-span-8">
            {/* 1. EDIT PROFILE SECTION */}
            {activeTab === 'edit-profile' && (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="pb-4 border-b border-neutral-100">
                  <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                    <span>👤</span> Edit Profile
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Update your full name, mobile number, and profile picture.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* DIRECT DEVICE PROFILE PHOTO UPLOAD */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-neutral-700">
                      Profile Photo
                    </label>

                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    <div className="flex items-center gap-5">
                      {/* Avatar preview */}
                      <div className="relative shrink-0">
                        {currentAvatarSrc && !avatarError ? (
                          <img
                            src={currentAvatarSrc}
                            alt="Profile Avatar"
                            onError={() => setAvatarError(true)}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-brand-accent/40 shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-brand-dark via-neutral-800 to-brand-accent text-white font-serif font-black text-xl sm:text-2xl flex items-center justify-center shadow-sm select-none">
                            {getInitials(displayName)}
                          </div>
                        )}
                      </div>

                      {/* Device upload buttons */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-bold text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 transition-colors shadow-2xs"
                          >
                            {currentAvatarSrc ? 'Change Photo' : 'Upload Photo'}
                          </button>

                          {currentAvatarSrc && (
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                            >
                              Remove Photo
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          Upload directly from your device (JPG, PNG, or WEBP, max 5MB).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-brand-accent focus:border-brand-accent"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Phone Number (10 Digits)
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-neutral-300 bg-neutral-50 text-neutral-500 text-xs font-semibold">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '') })}
                        placeholder="9876543210"
                        className="w-full px-3.5 py-2.5 text-xs rounded-r-xl border border-neutral-300 font-mono focus:outline-hidden focus:ring-1 focus:ring-brand-accent focus:border-brand-accent"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">Used for delivery alerts and order updates.</p>
                  </div>

                  {/* Read-Only Account Email (Clean label, no technical jargon) */}
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Email Address
                    </label>
                    <span className="text-xs font-mono font-semibold text-neutral-700 block">
                      {displayEmail}
                    </span>
                    <span className="block text-[11px] text-neutral-400">
                      Your email address is linked to your login account and cannot be modified directly.
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={handleCancelProfileEdit}
                      className="px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={profileSaveLoading}
                      className="px-6 py-2.5 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-brand-accent shadow-xs disabled:opacity-50 transition-colors"
                    >
                      {profileSaveLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. SAVED ADDRESSES SECTION */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="pb-4 border-b border-neutral-100">
                  <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                    <span>📍</span> Saved Addresses
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Manage delivery addresses for faster and smoother checkout.
                  </p>
                </div>
                <SavedAddressesManager />
              </div>
            )}

            {/* 3. NOTIFICATIONS SECTION */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="pb-4 border-b border-neutral-100">
                  <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                    <span>🔔</span> Notification Settings
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Control which updates and alerts you receive from FitFusion.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Toggle 1: Order Updates */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors">
                    <div className="space-y-1 pr-4">
                      <h4 className="text-xs font-bold text-brand-dark">Order Updates</h4>
                      <p className="text-[11px] text-neutral-500">
                        Receive real-time tracking, shipping confirmation, and delivery alerts via SMS & Email.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifications.orderUpdates}
                      onClick={() => handleToggleNotification('orderUpdates')}
                      disabled={notifSaving}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        notifications.orderUpdates ? 'bg-brand-dark' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          notifications.orderUpdates ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 2: Offers & Discounts */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors">
                    <div className="space-y-1 pr-4">
                      <h4 className="text-xs font-bold text-brand-dark">Offers & Discounts</h4>
                      <p className="text-[11px] text-neutral-500">
                        Get alerts about festive sales, coupon codes, and special seasonal promotions.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifications.offersAndDiscounts}
                      onClick={() => handleToggleNotification('offersAndDiscounts')}
                      disabled={notifSaving}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        notifications.offersAndDiscounts ? 'bg-brand-dark' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          notifications.offersAndDiscounts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 3: Product Recommendations */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors">
                    <div className="space-y-1 pr-4">
                      <h4 className="text-xs font-bold text-brand-dark">Product Recommendations</h4>
                      <p className="text-[11px] text-neutral-500">
                        Personalized notifications about new arrivals, popular styles, and restocked garments.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifications.productRecommendations}
                      onClick={() => handleToggleNotification('productRecommendations')}
                      disabled={notifSaving}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        notifications.productRecommendations ? 'bg-brand-dark' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          notifications.productRecommendations ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                  <span>Settings automatically saved to your account.</span>
                  <Link to="/notifications" className="text-brand-accent font-bold hover:underline">
                    View Notification History &rarr;
                  </Link>
                </div>
              </div>
            )}

            {/* 4. CHANGE PASSWORD SECTION */}
            {activeTab === 'change-password' && (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="pb-4 border-b border-neutral-100">
                  <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                    <span>🔒</span> Change Password
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Update your account password to keep your account secure.
                  </p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                  {/* Account Email Display */}
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                      Account Email
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-800">
                      {displayEmail}
                    </span>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="At least 6 characters"
                        required
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-brand-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Confirm New Password *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Repeat your new password"
                      required
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-brand-accent"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-6 py-2.5 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-brand-accent shadow-xs disabled:opacity-50 transition-colors"
                    >
                      {passwordLoading ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </div>
                </form>

                {/* Alternative: Password Reset Email option */}
                <div className="pt-4 border-t border-neutral-100 space-y-2">
                  <h4 className="text-xs font-bold text-neutral-700">Forgot your current password or having trouble?</h4>
                  <p className="text-[11px] text-neutral-500">
                    You can request a password reset email link sent directly to your registered email address.
                  </p>
                  <button
                    type="button"
                    onClick={handleSendResetEmail}
                    disabled={resetEmailLoading || resetEmailSent}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-accent hover:underline disabled:opacity-50"
                  >
                    {resetEmailLoading ? 'Sending link...' : resetEmailSent ? '✓ Reset link sent' : 'Send Password Reset Email →'}
                  </button>
                </div>
              </div>
            )}

            {/* 5. PAYMENT METHODS SECTION */}
            {activeTab === 'payment-methods' && (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="pb-4 border-b border-neutral-100">
                  <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                    <span>💳</span> Payment Methods
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Manage and view payment options available for your orders.
                  </p>
                </div>

                {/* FitFusion Wallet Balance Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-dark to-neutral-800 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">
                      FitFusion Cashback Wallet
                    </span>
                    <div className="text-2xl font-serif font-black">
                      ₹{wallet.available.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-white/80">
                      Applied automatically at checkout on eligible purchases.
                    </p>
                  </div>

                  <Link
                    to="/shop"
                    className="self-start sm:self-center px-4 py-2 rounded-xl bg-white text-brand-dark font-bold text-xs hover:bg-neutral-100 transition-colors"
                  >
                    Shop & Earn Cashback &rarr;
                  </Link>
                </div>

                {/* Accepted Payment Options */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-neutral-700">Supported Payment Methods</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start gap-3">
                      <span className="text-2xl">📱</span>
                      <div>
                        <h5 className="text-xs font-bold text-brand-dark">UPI Options</h5>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Google Pay, PhonePe, Paytm, BHIM, and any UPI QR / ID.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start gap-3">
                      <span className="text-2xl">💳</span>
                      <div>
                        <h5 className="text-xs font-bold text-brand-dark">Credit & Debit Cards</h5>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Visa, MasterCard, RuPay, Maestro, and American Express.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start gap-3">
                      <span className="text-2xl">🏦</span>
                      <div>
                        <h5 className="text-xs font-bold text-brand-dark">Net Banking</h5>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Instant access to 50+ major Indian retail banks.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start gap-3">
                      <span className="text-2xl">💵</span>
                      <div>
                        <h5 className="text-xs font-bold text-brand-dark">Cash on Delivery (COD)</h5>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          Pay by cash or UPI scanner upon doorstep delivery.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Safe Security Notice */}
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>🔒</span> Safe & Encrypted Payments
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    FitFusion never stores card numbers, CVVs, or bank account credentials. All payment transactions are encrypted end-to-end and processed through RBI-authorized payment gateways during checkout.
                  </p>
                </div>
              </div>
            )}

            {/* 6. MY DESIGNS SECTION */}
            {activeTab === 'my-designs' && (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                      <span>🎨</span> My Designs
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Your saved custom clothing designs, fabrics, and tailored specifications.
                    </p>
                  </div>
                  <Link
                    to="/shop"
                    className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-brand-dark text-white font-bold text-xs hover:bg-black transition-colors"
                  >
                    + Create New Design
                  </Link>
                </div>

                {designsLoading ? (
                  <div className="py-12 text-center text-xs text-neutral-500 space-y-2">
                    <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto" />
                    <p>Loading your saved designs...</p>
                  </div>
                ) : savedDesigns.length === 0 ? (
                  <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                    <span className="text-3xl block">🎨</span>
                    <h4 className="text-sm font-bold text-neutral-800">No Saved Designs Yet</h4>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                      Customize any garment in our shop and click "Save Design" to store it here.
                    </p>
                    <Link
                      to="/shop"
                      className="inline-block px-4 py-2 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-black transition"
                    >
                      Start Customizing &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedDesigns.map((design) => (
                      <SavedDesignCard
                        key={design.id}
                        design={design}
                        onEdit={handleEditSavedDesign}
                        onAddToCart={handleAddToCartSavedDesign}
                        onDelete={handleDeleteSavedDesign}
                        isDeleting={deletingDesignId === design.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 7. RECENTLY VIEWED SECTION */}
            {activeTab === 'recently-viewed' && (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
                <RecentlyViewedSection showClear={true} title="Recently Viewed" />
              </div>
            )}
          </div>
        </div>

        {/* LOGOUT CONFIRMATION MODAL */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-neutral-200 space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl mx-auto">
                🚪
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-brand-dark">Sign Out of FitFusion?</h3>
                <p className="text-xs text-neutral-500">
                  You will need to sign back in to view your orders, saved addresses, and tailored cart.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  disabled={loggingOut}
                  className="w-full py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  disabled={loggingOut}
                  className="w-full py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors disabled:opacity-50"
                >
                  {loggingOut ? 'Signing out...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
