import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * AdminRoute — Protects admin routes with role-based authorization.
 *
 * 1. While auth is loading → show spinner
 * 2. No user logged in → redirect to /login
 * 3. User logged in but role !== 'admin' → show "Access Denied"
 * 4. User logged in with role === 'admin' → render child routes
 */
export default function AdminRoute() {
  const { user, userProfile, loading, profileLoading } = useAuth();
  const location = useLocation();

  // 1. Auth session still loading
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-sm w-full p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <span className="inline-block w-3 h-3 rounded-full bg-brand-accent animate-ping" />
            <span className="font-black tracking-widest text-brand-dark uppercase text-2xl">
              FIT<span className="font-light text-brand-accent">FUSION</span>
            </span>
          </div>
          <div className="w-8 h-8 mx-auto border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-brand-dark">Verifying admin access...</h3>
            <p className="text-xs text-neutral-500">Checking your authorization level</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Not authenticated → redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authenticated but NOT admin → deny access
  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-5">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
            <span className="font-black tracking-widest text-brand-dark uppercase text-2xl">
              FIT<span className="font-light text-brand-accent">FUSION</span>
            </span>
          </div>

          <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-neutral-900">Access Denied</h2>
            <p className="text-sm text-neutral-500">
              You do not have administrator privileges to access this area.
              Contact your system administrator if you believe this is an error.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a
              href="/home"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-brand-dark text-white hover:bg-neutral-800 transition-colors"
            >
              ← Return to Store
            </a>
            <a
              href="/profile"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              My Profile
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authenticated admin → render child routes
  return <Outlet />;
}
