import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';

export default function CheckoutPage() {
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
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              FITFUSION
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
              Checkout & Payment
            </h1>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">
              Secure payment gateway processing, delivery address selection, tailoring lead times, and order confirmation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium max-w-md mx-auto">
            Coming in the next development phase: Payment gateway integration, shipping address management, and order summary review.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-neutral-100">
            <Button to="/cart" variant="outline" size="md">
              &larr; Return to Cart
            </Button>
            <Button to="/shop" variant="secondary" size="md">
              Continue Shopping
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
