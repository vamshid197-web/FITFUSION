import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';

export default function NotFoundPage() {
  return (
    <div className="py-16 sm:py-24">
      <PageContainer maxWidth="md">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-12 shadow-sm text-center space-y-5">
          <span className="text-4xl font-black text-brand-accent">404</span>
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-brand-dark">Page Not Found</h1>
            <p className="text-xs text-neutral-500">
              The bespoke page you are looking for does not exist in FITFUSION.
            </p>
          </div>
          <div className="pt-3">
            <Button to="/home" variant="primary" size="md">
              Return to Storefront
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
