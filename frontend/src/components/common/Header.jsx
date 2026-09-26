import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import {
  subscribeToUserNotifications,
  countUnreadNotifications
} from '../../services/notificationService.js';
import SearchAutocomplete from '../search/SearchAutocomplete.jsx';
import { MOCK_PRODUCTS } from '../../data/mockProducts.js';
import { getProductsFromFirestore } from '../../services/firestoreService.js';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, userProfile, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [catalogProducts, setCatalogProducts] = useState(MOCK_PRODUCTS);

  useEffect(() => {
    let isMounted = true;
    getProductsFromFirestore()
      .then((res) => {
        if (isMounted && res.success && res.products?.length > 0) {
          setCatalogProducts(res.products);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setUnreadNotifsCount(0);
      return;
    }
    const isAdmin = userProfile?.role === 'admin';
    const unsubscribe = subscribeToUserNotifications(
      user.uid,
      (list) => {
        setUnreadNotifsCount(countUnreadNotifications(list));
      },
      isAdmin
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user?.uid, userProfile?.role]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Shop Catalog', path: '/shop' },
    { name: 'Customizer', path: '/customize/1' },
    { name: 'Saved Designs', path: '/saved-designs' },
    { name: 'My Orders', path: '/orders' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      {/* Top announcement strip */}
      <div className="bg-brand-dark text-white text-[11px] py-1.5 px-4 text-center font-medium tracking-wide">
        <span>Bespoke Fashion Tailoring | Complimentary Perfume Recommendation With Every Custom Outfit</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo brand */}
          <div className="flex-shrink-0">
            <Logo to="/home" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-xs font-bold tracking-wide transition-colors uppercase ${
                    isActive ? 'text-brand-accent' : 'text-neutral-700 hover:text-brand-dark'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Search Bar - Desktop with Autocomplete */}
          <div className="hidden md:flex items-center relative max-w-xs w-full">
            <SearchAutocomplete
              products={catalogProducts}
              size="sm"
              placeholder="Search garments, fabrics..."
              className="w-full"
            />
          </div>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2 text-neutral-700 hover:text-rose-600 transition-colors rounded-full hover:bg-neutral-100"
              title="Bespoke Wishlist"
              aria-label="Bespoke Wishlist"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-xs animate-scaleIn">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Notifications Link */}
            {user && (
              <Link
                to="/notifications"
                className="relative p-2 text-neutral-700 hover:text-brand-dark transition-colors rounded-full hover:bg-neutral-100"
                title="Notifications"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-brand-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-xs">
                    {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative p-2 text-neutral-700 hover:text-brand-dark transition-colors rounded-full hover:bg-neutral-100"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {totalItemsCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-brand-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-xs">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* Profile Link */}
            <Link
              to="/profile"
              className="p-2 text-neutral-700 hover:text-brand-dark transition-colors rounded-full hover:bg-neutral-100"
              title="My Account"
              aria-label="My Account"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Link>

            {/* User Greeting & Sign Out OR Sign In button */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-xs font-semibold text-neutral-800">
                  {userProfile?.name || user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-semibold px-3 py-1.5 rounded-md border border-neutral-300 text-neutral-700 hover:border-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-semibold px-3 py-1.5 rounded-md border border-neutral-300 text-neutral-800 hover:border-brand-dark hover:bg-neutral-900 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden min-h-[44px] min-w-[44px] p-2.5 text-neutral-700 hover:text-brand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/50 inline-flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-5 space-y-3 animate-fadeIn">
          {user && (
            <div className="px-3 py-2 bg-neutral-50 rounded-lg text-xs font-medium text-neutral-700 flex justify-between items-center">
              <span>Signed in as <strong>{userProfile?.name || user.displayName || user.email}</strong></span>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-red-600 font-bold hover:underline"
              >
                Sign Out
              </button>
            </div>
          )}

          <div className="relative mb-3">
            <SearchAutocomplete
              products={catalogProducts}
              size="md"
              placeholder="Search custom clothes..."
              className="w-full"
              onSearch={(val) => {
                setMobileMenuOpen(false);
                if (val?.trim()) navigate(`/shop?search=${encodeURIComponent(val.trim())}`);
              }}
            />
          </div>

          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'bg-neutral-100 text-brand-accent font-semibold'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-600 fill-current shrink-0" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                <span>My Wishlist</span>
              </div>
              {wishlistCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              My Account & Measurements
            </Link>

            {user && (
              <Link
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50 flex items-center justify-between"
              >
                <span>Notifications & Alerts</span>
                {unreadNotifsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-accent text-white">
                    {unreadNotifsCount} new
                  </span>
                )}
              </Link>
            )}

            {/* Admin link only for authorized admin role */}
            {userProfile?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <span className="flex items-center gap-2"><svg className="w-4 h-4 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg><span>Admin Console</span></span>
              </Link>
            )}

            {!user && (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 block text-center py-2 px-4 rounded-lg bg-brand-dark text-white text-xs font-bold"
              >
                Sign In to Account
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
