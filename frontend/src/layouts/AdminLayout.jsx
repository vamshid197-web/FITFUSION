import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-900">
      {/* Admin Top Header */}
      <header className="bg-brand-dark text-white px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <div className="brightness-125">
            <Logo to="/admin" showTagline={false} />
          </div>
          <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
            Admin Console
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            to="/home"
            className="text-neutral-300 hover:text-white transition-colors underline underline-offset-4"
          >
            &larr; Exit to Storefront
          </Link>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-neutral-200 py-4 px-6 text-center text-xs text-neutral-500">
        FITFUSION Administrative Management Framework &bull; Phase 1 Placeholder
      </footer>
    </div>
  );
}
