import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

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

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'FITFUSION Customer';
  const email = user?.email || 'N/A';

  return (
    <div className="py-8 sm:py-16">
      <PageContainer maxWidth="md">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-brand-accentLight border border-brand-accent/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Authenticated Customer Account
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
              {displayName}
            </h1>
            <p className="text-xs font-mono text-neutral-500 bg-neutral-100 inline-block px-3 py-1 rounded-full">
              {email}
            </p>
          </div>

          {/* Authenticated Account Overview Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto text-left">
            <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="text-[11px] font-bold text-neutral-800">Saved Measurements</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">Profile: Slim / Standard</div>
            </div>
            <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="text-[11px] font-bold text-neutral-800">Delivery Address</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">Primary address linked</div>
            </div>
            <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="text-[11px] font-bold text-neutral-800">Cashback Wallet</div>
              <div className="text-[10px] text-brand-accent font-semibold mt-0.5">5% bespoke balance</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium max-w-md mx-auto">
            Connected to Firebase Authentication. Additional profile customization, measurement archive, and address management will be activated in Phase 3.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-neutral-100">
            <Button to="/shop" variant="secondary" size="md">
              Shop Custom Clothing
            </Button>
            <Button to="/orders" variant="outline" size="md">
              View Order History
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="md"
              disabled={loggingOut}
              className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
            >
              {loggingOut ? 'Signing Out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
