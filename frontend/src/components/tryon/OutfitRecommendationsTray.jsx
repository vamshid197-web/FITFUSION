import React from 'react';
import ProductImage from '../common/ProductImage.jsx';
import { getProductImage } from '../../data/mockProducts.js';

export default function OutfitRecommendationsTray({
  recommendations = [],
  photoAesthetics = {},
  selectedProduct = null,
  onSelectProduct,
  activeFilters = {},
  onFilterChange,
  onBrowseAllCatalog,
  onProceedToTryOn,
  userPhoto,
  onChangePhoto,
  isCooldownActive = false,
  cooldownSeconds = 0
}) {
  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 't-shirts', label: 'T-Shirts' },
    { id: 'shirts', label: 'Shirts' },
    { id: 'hoodies', label: 'Hoodies' },
    { id: 'jackets', label: 'Jackets' },
    { id: 'dresses', label: 'Dresses' },
    { id: 'traditional wear', label: 'Traditional' },
    { id: 'jeans & pants', label: 'Pants & Jeans' }
  ];

  const styles = [
    { id: 'all', label: 'All Styles' },
    { id: 'casual', label: 'Casual' },
    { id: 'formal', label: 'Formal & Office' },
    { id: 'streetwear', label: 'Streetwear' },
    { id: 'athletic', label: 'Athletic' },
    { id: 'ethnic', label: 'Heritage Silk' }
  ];

  const occasions = [
    { id: 'all', label: 'All Occasions' },
    { id: 'everyday', label: 'Everyday Wear' },
    { id: 'office', label: 'Office & Work' },
    { id: 'evening', label: 'Evening & Parties' },
    { id: 'workout', label: 'Active & Gym' }
  ];

  const budgets = [
    { id: 'all', label: 'Any Budget' },
    { id: 'under_1000', label: 'Under ₹1,000' },
    { id: '1000_2500', label: '₹1,000 – ₹2,500' },
    { id: '2500_plus', label: '₹2,500+' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── 1. Confirmed Photo Bar with Aesthetic Analysis ────────────────── */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-4 md:p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-16 rounded-2xl overflow-hidden border border-neutral-700 bg-black shrink-0 shadow-md">
            {userPhoto ? (
              <img
                src={userPhoto}
                alt="Confirmed Try-On Subject"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                Photo
              </div>
            )}
            <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Photo Confirmed
              </span>
              <span className="text-neutral-600 text-xs">•</span>
              <span className="text-xs text-neutral-400">
                Lighting: {photoAesthetics.lightingGrade || 'Studio Balanced'}
              </span>
            </div>
            <h3 className="text-sm md:text-base font-extrabold text-white mt-0.5">
              AI Stylist Outfit Recommendations
            </h3>
            <p className="text-xs text-neutral-400">
              Personalized garment selections based on posture framing and catalog compatibility.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onChangePhoto}
          className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-all self-end md:self-auto"
        >
          ↺ Change Photo
        </button>
      </div>

      {/* ── 2. Filter Bar: Category, Style, Occasion & Budget ──────────────── */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-4 space-y-4 shadow-lg">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider shrink-0 mr-1">
            Category:
          </span>
          {categories.map((cat) => {
            const isSelected = (activeFilters.category || 'all') === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onFilterChange({ ...activeFilters, category: cat.id })}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md font-black'
                    : 'bg-neutral-950/60 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Dropdown Filters: Style, Occasion, Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-neutral-800/80">
          <div>
            <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Aesthetic Style
            </label>
            <select
              value={activeFilters.style || 'all'}
              onChange={(e) => onFilterChange({ ...activeFilters, style: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              {styles.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Occasion
            </label>
            <select
              value={activeFilters.occasion || 'all'}
              onChange={(e) => onFilterChange({ ...activeFilters, occasion: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              {occasions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Budget
            </label>
            <select
              value={activeFilters.budget || 'all'}
              onChange={(e) => onFilterChange({ ...activeFilters, budget: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              {budgets.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── 3. Recommendations Grid (Real FITFUSION Catalog Products) ─────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white">
              Curated Recommendations ({recommendations.length})
            </h3>
            <p className="text-xs text-neutral-400">
              Select any garment to preview and generate your AI virtual try-on.
            </p>
          </div>

          <button
            type="button"
            onClick={onBrowseAllCatalog}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <span>🔍</span> Browse Full Catalog
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recommendations.map((item) => {
            const prod = item.product;
            const isSelected = selectedProduct && String(selectedProduct.id) === String(prod.id);

            return (
              <div
                key={prod.id}
                onClick={() => onSelectProduct(prod)}
                className={`group cursor-pointer rounded-2xl bg-neutral-900 border transition-all overflow-hidden flex flex-col justify-between hover:scale-[1.02] shadow-lg ${
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/50 shadow-amber-500/10'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="relative aspect-[3/4] bg-neutral-950 overflow-hidden">
                  <ProductImage
                    productId={prod.id}
                    src={prod.image || getProductImage(prod)}
                    alt={prod.name}
                    fallbackCategory={prod.category}
                    aspectRatio="aspect-[3/4]"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Match Score Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-lg bg-neutral-950/85 backdrop-blur-md border border-amber-500/40 text-[10px] font-black text-amber-400 shadow-md">
                    ★ {item.matchScore}% Match
                  </div>

                  {/* 3D Model Badge */}
                  {item.has3DModel && (
                    <div className="absolute top-2.5 right-2.5 z-10 px-1.5 py-0.5 rounded-md bg-indigo-950/85 backdrop-blur-md border border-indigo-500/40 text-[9px] font-bold text-indigo-300">
                      3D READY
                    </div>
                  )}

                  {/* Active Selected Checkmark */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-amber-500/15 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-neutral-950 font-black text-lg flex items-center justify-center shadow-2xl border-2 border-white">
                        ✓
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span className="font-semibold text-neutral-300">{prod.category}</span>
                      <span className="text-amber-400 font-bold">{item.styleTag}</span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1 mt-1 group-hover:text-amber-400 transition-colors">
                      {prod.name}
                    </h4>

                    <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 italic leading-relaxed">
                      "{item.rationale}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                    <span className="text-xs font-black text-white">
                      ₹{Number(prod.basePrice || prod.price || 599).toLocaleString('en-IN')}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(prod);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-neutral-950 font-black'
                          : 'bg-neutral-800 text-neutral-300 group-hover:bg-amber-500 group-hover:text-neutral-950'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Selected Outfit Action Card (Bottom CTA) ────────────────────── */}
      {selectedProduct && (
        <div className="sticky bottom-4 z-30 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/80 rounded-3xl p-4 md:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-slideUp">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-14 h-16 rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-950 shrink-0">
              <ProductImage
                productId={selectedProduct.id}
                src={selectedProduct.image || getProductImage(selectedProduct)}
                alt={selectedProduct.name}
                fallbackCategory={selectedProduct.category}
                aspectRatio="aspect-square"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                Ready for AI Try-On
              </span>
              <h4 className="text-sm font-extrabold text-white line-clamp-1">
                {selectedProduct.name}
              </h4>
              <p className="text-xs text-neutral-400">
                ₹{Number(selectedProduct.price || 599).toLocaleString('en-IN')} • {selectedProduct.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={isCooldownActive}
              onClick={onProceedToTryOn}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-2xl ${
                isCooldownActive
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                  : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 hover:shadow-amber-500/20 active:scale-95'
              }`}
            >
              {isCooldownActive ? (
                <>⏳ Cooldown Active ({cooldownSeconds}s)</>
              ) : (
                <>✨ Generate Kolors AI Try-On &rarr;</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
