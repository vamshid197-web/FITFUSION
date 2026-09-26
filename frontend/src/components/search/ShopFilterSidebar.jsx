import React, { useState } from 'react';
import StarRating from '../common/StarRating.jsx';

/**
 * Comprehensive Shop Filter Panel for Desktop Sidebar and Mobile Drawer
 */
export default function ShopFilterSidebar({
  facets = {},
  filters = {},
  onFilterChange,
  onResetAll,
  onClose,
  isMobile = false
}) {
  const {
    categories = ['All'],
    colors = [],
    fabrics = [],
    sizes = [],
    quickPriceBrackets = []
  } = facets;

  const {
    category = 'All',
    minPrice = '',
    maxPrice = '',
    color = null,
    fabric = null,
    size = null,
    rating = 'all',
    availability = 'all',
    customizableOnly = false
  } = filters;

  // Local state for custom min/max price inputs
  const [localMin, setLocalMin] = useState(minPrice !== null && minPrice !== undefined ? String(minPrice) : '');
  const [localMax, setLocalMax] = useState(maxPrice !== null && maxPrice !== undefined ? String(maxPrice) : '');

  // Apply custom numeric price inputs
  const handleApplyCustomPrice = (e) => {
    e?.preventDefault();
    const minVal = localMin.trim() !== '' ? Number(localMin) : null;
    const maxVal = localMax.trim() !== '' ? Number(localMax) : null;
    onFilterChange('minPrice', minVal);
    onFilterChange('maxPrice', maxVal);
  };

  const handleQuickPriceClick = (bracket) => {
    setLocalMin(bracket.min !== null ? String(bracket.min) : '');
    setLocalMax(bracket.max !== null ? String(bracket.max) : '');
    onFilterChange('minPrice', bracket.min);
    onFilterChange('maxPrice', bracket.max);
  };

  return (
    <div className="space-y-6 text-xs text-neutral-800">
      {/* Top Title & Reset Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <span className="text-base font-serif font-black text-brand-dark tracking-tight">
            Filters
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetAll}
            className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline focus:outline-none"
          >
            Reset All
          </button>
          {isMobile && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100 font-bold text-sm ml-2"
              aria-label="Close filters drawer"
            >
              &#10005;
            </button>
          )}
        </div>
      </div>

      {/* 1. Category Filter */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          Garment Category
        </label>
        <div className="space-y-1">
          {categories.map((cat) => {
            const isSelected = (category || 'All').toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onFilterChange('category', cat)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-brand-dark text-white font-bold shadow-xs'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span>{cat}</span>
                {isSelected && <span className="text-[10px]">&#10003;</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Price Range Filter */}
      <div className="space-y-2.5 pt-4 border-t border-neutral-100">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          Price Range (INR)
        </label>

        {/* Quick price pills */}
        <div className="grid grid-cols-2 gap-1.5">
          {quickPriceBrackets.map((bracket) => {
            const isActive =
              (bracket.min === null && (minPrice === null || minPrice === '') && bracket.max === null && (maxPrice === null || maxPrice === '')) ||
              (bracket.min !== null && Number(minPrice) === bracket.min && bracket.max !== null && Number(maxPrice) === bracket.max) ||
              (bracket.min !== null && Number(minPrice) === bracket.min && bracket.max === null && (maxPrice === null || maxPrice === ''));

            return (
              <button
                key={bracket.id}
                type="button"
                onClick={() => handleQuickPriceClick(bracket)}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold text-center border transition-all ${
                  isActive
                    ? 'bg-brand-accent/15 border-brand-accent text-brand-dark'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {bracket.label}
              </button>
            );
          })}
        </div>

        {/* Custom Min / Max inputs */}
        <form onSubmit={handleApplyCustomPrice} className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label htmlFor="custom-min-price" className="sr-only">Min Price</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-neutral-400 font-medium">₹</span>
                <input
                  id="custom-min-price"
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  className="w-full pl-6 pr-2 py-1.5 text-xs bg-neutral-50 rounded-lg border border-neutral-200 focus:outline-none focus:border-brand-accent focus:bg-white text-neutral-800"
                />
              </div>
            </div>
            <span className="text-neutral-400 font-medium">–</span>
            <div className="flex-1">
              <label htmlFor="custom-max-price" className="sr-only">Max Price</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-neutral-400 font-medium">₹</span>
                <input
                  id="custom-max-price"
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                  className="w-full pl-6 pr-2 py-1.5 text-xs bg-neutral-50 rounded-lg border border-neutral-200 focus:outline-none focus:border-brand-accent focus:bg-white text-neutral-800"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-bold transition-colors"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* 3. Colorways Palette */}
      {colors.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Color Palette
            </label>
            {color && (
              <button
                type="button"
                onClick={() => onFilterChange('color', null)}
                className="text-[10px] text-neutral-500 hover:text-neutral-800 font-bold"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
            {colors.map((c) => {
              const isSelected = color && color.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => onFilterChange('color', isSelected ? null : c.name)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                    isSelected
                      ? 'bg-brand-dark text-white border-brand-dark shadow-2xs'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                  title={c.name}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: c.hex || '#1E3A8A' }}
                  />
                  <span className="truncate max-w-[120px]">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Fabric Weaves */}
      {fabrics.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Textile & Fabric Weave
            </label>
            {fabric && (
              <button
                type="button"
                onClick={() => onFilterChange('fabric', null)}
                className="text-[10px] text-neutral-500 hover:text-neutral-800 font-bold"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1 max-h-44 overflow-y-auto pr-1">
            {fabrics.map((f) => {
              const isSelected = fabric && fabric.toLowerCase() === f.toLowerCase();
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => onFilterChange('fabric', isSelected ? null : f)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border text-left transition-all ${
                    isSelected
                      ? 'bg-brand-dark text-white border-brand-dark font-bold shadow-2xs'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Available Sizes */}
      {sizes.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Sizes
            </label>
            {size && (
              <button
                type="button"
                onClick={() => onFilterChange('size', null)}
                className="text-[10px] text-neutral-500 hover:text-neutral-800 font-bold"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => {
              const isSelected = size && String(size).toLowerCase() === String(s).toLowerCase();
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onFilterChange('size', isSelected ? null : s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-brand-dark text-white border-brand-dark shadow-2xs'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Customer Rating Filter */}
      <div className="space-y-2 pt-4 border-t border-neutral-100">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          Minimum Rating
        </label>
        <div className="space-y-1">
          {[
            { label: 'All Ratings', value: 'all' },
            { label: '4.8★ & Above', value: '4.8', rating: 4.8 },
            { label: '4.5★ & Above', value: '4.5', rating: 4.5 },
            { label: '4.0★ & Above', value: '4.0', rating: 4.0 },
            { label: '3.0★ & Above', value: '3.0', rating: 3.0 }
          ].map((r) => {
            const isSelected = String(rating) === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => onFilterChange('rating', r.value)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-amber-500 text-white font-bold shadow-xs'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {r.rating ? (
                    <StarRating rating={r.rating} size="sm" showValue={false} />
                  ) : null}
                  <span>{r.label}</span>
                </div>
                {isSelected && <span className="text-[10px]">&#10003;</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Stock Availability & Customization Checkboxes */}
      <div className="space-y-2.5 pt-4 border-t border-neutral-100">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          Preferences
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-neutral-700">
          <input
            type="checkbox"
            checked={availability === 'in-stock'}
            onChange={(e) => onFilterChange('availability', e.target.checked ? 'in-stock' : 'all')}
            className="rounded border-neutral-300 text-brand-dark focus:ring-brand-dark w-4 h-4"
          />
          <span>In Stock & Ready to Tailor</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-neutral-700">
          <input
            type="checkbox"
            checked={customizableOnly}
            onChange={(e) => onFilterChange('customizableOnly', e.target.checked)}
            className="rounded border-neutral-300 text-brand-dark focus:ring-brand-dark w-4 h-4"
          />
          <span>Customizable Silhouettes Only</span>
        </label>
      </div>

      {/* Mobile Drawer Footer CTA */}
      {isMobile && (
        <div className="pt-4 border-t border-neutral-200 flex gap-2">
          <button
            type="button"
            onClick={onResetAll}
            className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-neutral-800 shadow-md"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
}
