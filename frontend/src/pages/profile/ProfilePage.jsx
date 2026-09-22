import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';

export default function ProfilePage() {
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
              FITFUSION
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
              Customer Profile & Measurements
            </h1>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">
              Save bespoke measurement profiles (Formal, Casual, Relaxed), address book, fragrance favorites, and wallet cashback balances.
            </p>
          </div>

          {/* Planned Profile Domains Visual Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto text-left">
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="text-[11px] font-bold text-neutral-800">Saved Metrics</div>
              <div className="text-[10px] text-neutral-500">Chest, Neck, Inseam</div>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="text-[11px] font-bold text-neutral-800">Address Book</div>
              <div className="text-[10px] text-neutral-500">Home & Office delivery</div>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="text-[11px] font-bold text-neutral-800">Cashback Wallet</div>
              <div className="text-[10px] text-neutral-500">5% bespoke rebates</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium max-w-md mx-auto">
            Coming in the next development phase: Firebase Authentication synchronization, custom measurement profile editor, and saved address book.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-neutral-100">
            <Button to="/shop" variant="secondary" size="md">
              Shop Custom Clothing
            </Button>
            <Button to="/orders" variant="outline" size="md">
              View Order History
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
