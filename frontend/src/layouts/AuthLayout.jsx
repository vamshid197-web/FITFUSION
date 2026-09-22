import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-brand-cream flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="flex justify-between items-center max-w-md w-full mx-auto">
        <Logo to="/" showTagline={false} />
        <Link
          to="/shop"
          className="text-xs font-medium text-neutral-500 hover:text-brand-dark transition-colors"
        >
          &larr; Back to Shop
        </Link>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md mx-auto my-8">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-neutral-200/90 shadow-sm">
          <Outlet />
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="text-center text-xs text-neutral-400">
        &copy; 2026 FITFUSION. Design It. Customize It. Wear It.
      </div>
    </div>
  );
}
