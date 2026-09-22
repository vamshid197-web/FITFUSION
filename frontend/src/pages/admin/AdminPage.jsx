import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';

export default function AdminPage() {
  return (
    <div className="py-6 sm:py-10">
      <PageContainer maxWidth="lg">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                FITFUSION
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
                Administration Portal
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Manage customizable silhouettes, textile inventory, fragrance catalog, and customer tailoring orders.
              </p>
            </div>

            <Button to="/home" variant="outline" size="sm">
              &larr; Return to Storefront
            </Button>
          </div>

          {/* Planned Admin Modules Mockup Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase text-neutral-400">Custom Apparel</span>
              <div className="text-2xl font-black text-neutral-900">9 Styles</div>
              <p className="text-xs text-neutral-500">Active catalog models</p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase text-neutral-400">Fabric Swatches</span>
              <div className="text-2xl font-black text-neutral-900">50+ Textiles</div>
              <p className="text-xs text-neutral-500">Milled cottons, linens, wools</p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase text-neutral-400">Tailoring Pipeline</span>
              <div className="text-2xl font-black text-brand-accent">Active Queue</div>
              <p className="text-xs text-neutral-500">Cutting & Stitching stages</p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase text-neutral-400">Fragrance Library</span>
              <div className="text-2xl font-black text-neutral-900">12 Scents</div>
              <p className="text-xs text-neutral-500">Olfactory pairings curated</p>
            </div>
          </div>

          {/* Placeholder Notice */}
          <div className="p-6 bg-white rounded-xl border border-neutral-200 shadow-sm text-center space-y-4">
            <div className="max-w-lg mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-100 px-2.5 py-1 rounded">
                Development Notice
              </span>
              <h2 className="text-lg font-bold text-neutral-900">
                Coming in the next development phase
              </h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Full CRUD management for customizable garments, fabric swatch uploaders, order status progression workflows, and promotional coupon engine.
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
