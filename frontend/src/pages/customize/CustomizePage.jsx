import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import { MOCK_PRODUCTS } from '../../data/mockProducts.js';

export default function CustomizePage() {
  const { id } = useParams();
  const product = MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];

  const CUSTOMIZATION_STEPS = [
    { id: 1, title: "Fabric", description: "Select certified textile swatches and material weave." },
    { id: 2, title: "Color", description: "Choose rich colorways, pinstripes, and check patterns." },
    { id: 3, title: "Design", description: "Customize collar, cuff styles, buttons, and monograms." },
    { id: 4, title: "Size", description: "Pick standard sizes or opt for bespoke custom measurements." },
    { id: 5, title: "Custom Measurements", description: "Input neck, chest, waist, and sleeve tailoring metrics." },
    { id: 6, title: "Fit", description: "Specify silhouette drape: Slim, Regular, or Relaxed fit." },
    { id: 7, title: "Perfume", description: "Discover luxury fragrance pairings suited to this garment." },
    { id: 8, title: "Preview", description: "Inspect interactive composite preview before adding to cart." }
  ];

  const [activeStep, setActiveStep] = useState(1);

  const currentStepInfo = CUSTOMIZATION_STEPS.find((s) => s.id === activeStep);

  return (
    <div className="py-8 sm:py-12">
      <PageContainer>
        {/* Top Header bar with product overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-neutral-200 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
              <Link to="/shop" className="hover:text-brand-dark">&larr; Back to Shop</Link>
              <span>/</span>
              <Link to={`/product/${product.id}`} className="hover:text-brand-dark">{product.name}</Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
              Customize: {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Estimated Total:
            </span>
            <span className="text-xl font-bold text-brand-dark">${product.basePrice}</span>
          </div>
        </div>

        {/* 8-Step Stepper Progress Bar */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Customization Progress
            </span>
            <span className="text-xs font-semibold text-neutral-600">
              Step {activeStep} of {CUSTOMIZATION_STEPS.length}: <strong className="text-brand-dark">{currentStepInfo.title}</strong>
            </span>
          </div>

          {/* Stepper Navigation Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {CUSTOMIZATION_STEPS.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  activeStep === step.id
                    ? 'border-brand-accent bg-brand-accentLight/60 ring-2 ring-brand-accent'
                    : step.id < activeStep
                    ? 'border-neutral-300 bg-neutral-100 text-neutral-700'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-400 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    activeStep === step.id ? 'bg-brand-accent text-white' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {step.id}
                  </span>
                  {step.id < activeStep && (
                    <span className="text-brand-accent text-xs">&#10003;</span>
                  )}
                </div>
                <div className="text-xs font-semibold text-brand-dark mt-1.5 truncate">
                  {step.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Active Stage Placeholder Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-12 shadow-sm text-center max-w-3xl mx-auto space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-brand-accentLight flex items-center justify-center border border-brand-accent/30">
            <span className="text-xl font-bold text-brand-accent">{activeStep}</span>
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-accent">
              Section {activeStep} &bull; {currentStepInfo.title}
            </span>
            <h2 className="text-2xl font-extrabold text-brand-dark">
              {currentStepInfo.title} Selection Architecture
            </h2>
            <p className="text-sm text-neutral-600 max-w-lg mx-auto">
              {currentStepInfo.description}
            </p>
          </div>

          {/* Development Phase Notice */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-left max-w-md mx-auto space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              FITFUSION Phase 1 Scaffolding
            </div>
            <p className="text-xs text-amber-800">
              The live interactive {currentStepInfo.title.toLowerCase()} engine, swatch picker, measurement calculator, and 3D preview canvas will be connected in subsequent phases.
            </p>
          </div>

          {/* Stepper Navigation Controls */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-neutral-100">
            <Button
              variant="outline"
              size="sm"
              disabled={activeStep === 1}
              onClick={() => setActiveStep((prev) => Math.max(prev - 1, 1))}
            >
              &larr; Previous Step
            </Button>

            {activeStep < CUSTOMIZATION_STEPS.length ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveStep((prev) => Math.min(prev + 1, CUSTOMIZATION_STEPS.length))}
              >
                Next: {CUSTOMIZATION_STEPS[activeStep].title} &rarr;
              </Button>
            ) : (
              <Button
                to="/cart"
                variant="primary"
                size="sm"
              >
                Proceed to Cart (Phase 1 Mock) &rarr;
              </Button>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
