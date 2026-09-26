import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ProfilePage() {
  const { user, userProfile, profileLoading, logout } = useAuth();
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

  const displayName = userProfile?.name || userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'FITFUSION Customer';
  const email = user?.email || userProfile?.email || 'N/A';
  const phone = userProfile?.phone || 'Not provided';
  const role = userProfile?.role || 'Customer';
  const memberSince = userProfile?.createdAt 
    ? new Date(userProfile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : '2026';

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
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="text-xs font-mono text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
                {email}
              </span>
              {phone && phone !== 'Not provided' && (
                <span className="text-xs font-mono text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
                  {phone}
                </span>
              )}
              <span className="text-xs font-bold uppercase tracking-wider text-brand-accent bg-brand-accentLight px-2.5 py-0.5 rounded-full border border-brand-accent/20">
                {role}
              </span>
            </div>
            {profileLoading && (
              <p className="text-xs text-brand-accent animate-pulse">
                Synchronizing Firestore cloud profile...
              </p>
            )}
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
              <div className="text-[11px] font-bold text-neutral-800">Member Since</div>
              <div className="text-[10px] text-brand-accent font-semibold mt-0.5">{memberSince}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium max-w-md mx-auto">
            Connected to Cloud Firestore & Firebase Authentication. Your profile data is synchronized in real time with the cloud.
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
