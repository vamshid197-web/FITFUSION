import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';

export default function OrdersPage() {
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              FITFUSION
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
              Order History & Tailoring Tracking
            </h1>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">
              Track live craftsmanship milestones: Fabric Sourcing, Pattern Cutting, Artisan Stitching, Quality Inspection, and Dispatched Delivery.
            </p>
          </div>

          {/* Planned Tailoring Milestones Visual Preview */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-left max-w-md mx-auto space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Planned Tailoring Lifecycle
            </span>
            <div className="flex items-center justify-between text-[11px] text-neutral-600 font-medium">
              <span className="text-brand-accent font-bold">1. Placed</span>
              <span>&rarr;</span>
              <span>2. Cutting</span>
              <span>&rarr;</span>
              <span>3. Stitching</span>
              <span>&rarr;</span>
              <span>4. Quality Check</span>
              <span>&rarr;</span>
              <span>5. Shipped</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium max-w-md mx-auto">
            Coming in the next development phase: Live order status tracking, digital receipts, and re-order with saved measurements.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-neutral-100">
            <Button to="/shop" variant="secondary" size="md">
              Start a Custom Order
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
