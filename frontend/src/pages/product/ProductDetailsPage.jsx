import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import { MOCK_PRODUCTS } from '../../data/mockProducts.js';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];

  const [selectedColor, setSelectedColor] = useState(product.availableColors[0]?.name);
  const [selectedFabric, setSelectedFabric] = useState(product.availableFabrics[0]?.name);
  const [selectedSize, setSelectedSize] = useState(product.availableSizes[0]);
  const [cartNotice, setCartNotice] = useState('');

  const handleAddToCart = () => {
    setCartNotice(`Added "${product.name}" (${selectedFabric}, ${selectedColor}, ${selectedSize}) to cart!`);
    setTimeout(() => setCartNotice(''), 4000);
  };

  return (
    <div className="py-8 sm:py-12">
      <PageContainer>
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-8">
          <Link to="/home" className="hover:text-brand-dark">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-brand-dark">Shop</Link>
          <span>/</span>
          <span className="text-neutral-800 font-semibold">{product.name}</span>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-2xl border border-neutral-200 shadow-sm">
          {/* Left Column: Visual Showcase & Silhouette Preview */}
          <div className="lg:col-span-6 space-y-4">
            <div className={`aspect-square rounded-2xl bg-gradient-to-br ${product.silhouetteColor} p-8 flex flex-col justify-between border border-neutral-200/80 relative`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white text-brand-dark shadow-sm">
                  {product.category}
                </span>
                <span className="text-xs font-semibold text-neutral-700 bg-white/80 px-2.5 py-1 rounded-md">
                  Base Model #{product.id}
                </span>
              </div>

              {/* Large Stylized Apparel Silhouette */}
              <div className="my-auto text-center">
                <div className="w-40 h-56 mx-auto rounded-2xl bg-white/95 border border-neutral-300 shadow-md flex flex-col items-center justify-center p-6 space-y-3">
                  <svg className="w-20 h-20 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 3v2m6-2v2M9 5H7a2 2 0 00-2 2v2l2 1v9a2 2 0 002 2h6a2 2 0 002-2v-9l2-1V7a2 2 0 00-2-2h-2m-6 0a2 2 0 002 2h2a2 2 0 002-2m-6 0h6"
                    />
                  </svg>
                  <div className="text-xs font-bold text-neutral-800 text-center">{product.name}</div>
                  <div className="text-[10px] text-neutral-500">Selected: {selectedColor}</div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg text-xs text-neutral-600 text-center">
                Visual representation &bull; Full 8-step interactive 3D/canvas customizer in next step
              </div>
            </div>
          </div>

          {/* Right Column: Garment Information & Options */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                  Customizable Apparel
                </span>
                <span className="text-xs text-neutral-400">&bull;</span>
                <span className="text-xs text-amber-600 font-semibold">&#9733; {product.rating} ({product.reviewsCount} verified reviews)</span>
              </div>
              <h1 className="text-3xl font-extrabold text-brand-dark">{product.name}</h1>
              <div className="text-2xl font-black text-brand-dark mt-2">
                ${product.basePrice}
                <span className="text-xs font-normal text-neutral-500 ml-2">(Starting tailored price)</span>
              </div>
            </div>

            <p className="text-sm text-neutral-600 leading-relaxed">
              {product.description}
            </p>

            {/* Option 1: Available Fabrics */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark">
                1. Available Certified Fabrics
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {product.availableFabrics.map((fabric) => (
                  <button
                    key={fabric.name}
                    type="button"
                    onClick={() => setSelectedFabric(fabric.name)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      selectedFabric === fabric.name
                        ? 'border-brand-accent bg-brand-accentLight/60 ring-1 ring-brand-accent'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-white'
                    }`}
                  >
                    <div className="font-semibold text-brand-dark">{fabric.name}</div>
                    <div className="text-[10px] text-neutral-500">{fabric.composition}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Option 2: Available Colors */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                  2. Choose Color
                </label>
                <span className="text-xs text-neutral-500 font-medium">{selectedColor}</span>
              </div>
              <div className="flex items-center gap-3">
                {product.availableColors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    className={`group relative p-1 rounded-full border transition-all ${
                      selectedColor === color.name
                        ? 'border-brand-accent ring-2 ring-brand-accent ring-offset-1'
                        : 'border-neutral-300 hover:border-neutral-400'
                    }`}
                    title={color.name}
                  >
                    <span
                      style={{ backgroundColor: color.hex }}
                      className="block w-6 h-6 rounded-full border border-neutral-200"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Option 3: Available Sizes */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                  3. Select Size / Sizing Preference
                </label>
                <span className="text-xs text-brand-accent font-semibold">Custom sizing available</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      selectedSize === size
                        ? 'bg-brand-dark text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Cart Feedback Notification */}
            {cartNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium animate-fadeIn">
                &#10003; {cartNotice}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-6 border-t border-neutral-200 space-y-3">
              <Button
                to={`/customize/${product.id}`}
                variant="secondary"
                size="lg"
                className="w-full text-base font-bold shadow-md"
              >
                Customize This Cloth &rarr;
              </Button>

              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="lg"
                className="w-full text-sm font-semibold"
              >
                Add to Cart (Standard Specs)
              </Button>
            </div>

            {/* Guarantee badges */}
            <div className="grid grid-cols-2 gap-3 pt-3 text-[11px] text-neutral-500">
              <div className="flex items-center gap-2">
                <span className="text-brand-accent">&#10003;</span> Guaranteed Perfect Fit
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-accent">&#10003;</span> Scent Pairing Included
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
