import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';

export default function CartPage() {
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
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              FITFUSION
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
              Shopping Cart
            </h1>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">
              Your bespoke garment orders, custom fabric choices, tailor measurements, and perfume pairings will be staged here.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium max-w-md mx-auto">
            Coming in the next development phase: Live cart state management, promo code validation, and dynamic subtotal calculation.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-neutral-100">
            <Button to="/shop" variant="secondary" size="md">
              Explore Clothing Collection
            </Button>
            <Button to="/home" variant="outline" size="md">
              Return Home
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
