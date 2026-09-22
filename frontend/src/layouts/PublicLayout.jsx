import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Logo from '../components/common/Logo.jsx';
import Footer from '../components/common/Footer.jsx';
import Button from '../components/common/Button.jsx';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-dark">
      {/* Public Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo to="/" showTagline={false} />

          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-neutral-700">
            <Link to="/home" className="hover:text-brand-accent transition-colors">
              Home
            </Link>
            <Link to="/shop" className="hover:text-brand-accent transition-colors">
              Collection
            </Link>
            <Link to="/customize/1" className="hover:text-brand-accent transition-colors">
              How It Works
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-semibold text-neutral-700 hover:text-brand-accent px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Button to="/shop" variant="secondary" size="sm">
              Explore Shop
            </Button>
          </div>
        </div>
      </header>

      {/* Main Public View */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
