import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const navigate = useNavigate();

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
    { name: 'My Orders', path: '/orders' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      {/* Top announcement strip */}
      <div className="bg-brand-dark text-white text-[11px] py-1.5 px-4 text-center font-medium tracking-wide">
        <span>Bespoke Fashion Tailoring | Complimentary Perfume Recommendation With Every Custom Outfit</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex-shrink-0">
            <Logo to="/home" showTagline={false} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-brand-accent ${
                    isActive ? 'text-brand-accent font-semibold' : 'text-neutral-700'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center relative flex-1 max-w-xs"
          >
            <input
              type="text"
              placeholder="Search custom apparel, fabrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-neutral-100/90 rounded-full border border-neutral-200 focus:outline-none focus:border-brand-accent focus:bg-white text-neutral-800 transition-all"
            />
            <svg
              className="w-3.5 h-3.5 text-neutral-400 absolute left-3 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </form>

          {/* Action icons (Cart, Profile, Auth) */}
          <div className="flex items-center gap-3">
            {/* Cart link */}
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
              <span className="absolute top-1 right-1 w-4 h-4 bg-brand-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Profile link */}
            <Link
              to="/profile"
              className="hidden sm:inline-flex p-2 text-neutral-700 hover:text-brand-dark transition-colors rounded-full hover:bg-neutral-100"
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
                  {user.displayName || user.email?.split('@')[0]}
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
              className="md:hidden p-2 text-neutral-700 hover:text-brand-dark rounded-md focus:outline-none"
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
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-5 space-y-3 animate-fadeIn">
          {user && (
            <div className="px-3 py-2 bg-neutral-50 rounded-lg text-xs font-medium text-neutral-700 flex justify-between items-center">
              <span>Signed in as <strong>{user.displayName || user.email}</strong></span>
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

          <form onSubmit={handleSearchSubmit} className="relative mb-2">
            <input
              type="text"
              placeholder="Search custom clothes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-100 rounded-lg border border-neutral-200 focus:outline-none focus:border-brand-accent text-neutral-800"
            />
            <svg
              className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>

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
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Profile & Measurements
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-xs font-medium text-neutral-400 hover:text-neutral-600"
            >
              Admin Portal
            </Link>

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
