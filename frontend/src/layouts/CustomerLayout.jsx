import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import MobileBottomNav from '../components/common/MobileBottomNav.jsx';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-dark">
      {/* Top Header */}
      <Header />

      {/* Main Content with bottom padding on mobile for MobileBottomNav */}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
