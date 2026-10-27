import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import MobileBottomNav from '../components/common/MobileBottomNav.jsx';
import ComparisonBottomBar from '../components/common/ComparisonBottomBar.jsx';
import ProductComparisonModal from '../components/common/ProductComparisonModal.jsx';

export default function CustomerLayout() {
  const location = useLocation();
  const isCustomize = location.pathname.startsWith('/customize');

  if (isCustomize) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070A13] text-neutral-100">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-dark">
      {/* Top Header */}
      <Header />

      {/* Main Content with bottom padding on mobile for MobileBottomNav */}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Floating Comparison Bottom Bar & Comparison Modal */}
      <ComparisonBottomBar />
      <ProductComparisonModal />

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}

