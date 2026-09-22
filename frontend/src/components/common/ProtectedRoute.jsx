import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Session verification loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-sm w-full p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <span className="inline-block w-3 h-3 rounded-full bg-brand-accent animate-ping" />
            <span className="font-black tracking-widest text-brand-dark uppercase text-2xl">
              FIT<span className="font-light text-brand-accent">FUSION</span>
            </span>
          </div>

          <div className="w-8 h-8 mx-auto border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-brand-dark">Checking your session...</h3>
            <p className="text-xs text-neutral-500">
              Verifying your bespoke tailoring profile
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to /login and preserve destination in location.state
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render child routes
  return <Outlet />;
}
