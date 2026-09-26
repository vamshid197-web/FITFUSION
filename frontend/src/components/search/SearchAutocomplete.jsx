import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSearchSuggestions } from '../../services/catalogFilterService.js';
import StarRating from '../common/StarRating.jsx';
import ProductImage from '../common/ProductImage.jsx';
import { getProductImage } from '../../data/mockProducts.js';

/**
 * Accessible, keyboard-friendly Search Autocomplete Component
 */
export default function SearchAutocomplete({
  value = '',
  onChange,
  onSearch,
  products = [],
  placeholder = 'Search garments, fabrics, colors...',
  className = '',
  size = 'md',
  autoFocus = false
}) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Sync external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Compute live suggestions
  const suggestions = getSearchSuggestions(products, query, 4);
  const hasSuggestions =
    isOpen &&
    query.trim().length >= 1 &&
    (suggestions.categories.length > 0 ||
      suggestions.products.length > 0 ||
      suggestions.attributes.length > 0);

  // Flattened list for keyboard arrow navigation
  const flatItems = [
    ...suggestions.categories.map((c) => ({ type: 'category', value: c, label: `Category: ${c}` })),
    ...suggestions.attributes.map((a) => ({ ...a, label: a.label })),
    ...suggestions.products.map((p) => ({ type: 'product', product: p, value: p.name, label: p.name }))
  ];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onChange) onChange(val);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsOpen(false);
    if (selectedIndex >= 0 && flatItems[selectedIndex]) {
      selectItem(flatItems[selectedIndex]);
      return;
    }
    if (onSearch) {
      onSearch(query);
    } else {
      const trimmed = query.trim();
      if (trimmed) {
        navigate(`/shop?search=${encodeURIComponent(trimmed)}`);
      }
    }
  };

  const selectItem = (item) => {
    setIsOpen(false);
    if (item.type === 'category') {
      navigate(`/shop?category=${encodeURIComponent(item.value)}`);
    } else if (item.type === 'color') {
      navigate(`/shop?color=${encodeURIComponent(item.value)}`);
    } else if (item.type === 'fabric') {
      navigate(`/shop?fabric=${encodeURIComponent(item.value)}`);
    } else if (item.type === 'product' && item.product?.id) {
      navigate(`/product/${item.product.id}`);
    } else {
      if (onSearch) onSearch(item.value);
      else navigate(`/shop?search=${encodeURIComponent(item.value)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (!hasSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && flatItems[selectedIndex]) {
        e.preventDefault();
        selectItem(flatItems[selectedIndex]);
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onChange) onChange('');
    if (onSearch) onSearch('');
    inputRef.current?.focus();
  };

  const sizeClasses = {
    sm: 'py-1.5 pl-8 pr-7 text-xs',
    md: 'py-2.5 pl-10 pr-9 text-xs sm:text-sm',
    lg: 'py-3.5 pl-12 pr-10 text-sm sm:text-base'
  }[size] || 'py-2.5 pl-10 pr-9 text-xs sm:text-sm';

  const iconSizes = {
    sm: 'w-3.5 h-3.5 left-2.5 top-2',
    md: 'w-4 h-4 left-3.5 top-3',
    lg: 'w-5 h-5 left-4 top-3.5'
  }[size] || 'w-4 h-4 left-3.5 top-3';

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleFormSubmit} className="relative w-full">
        <label htmlFor="search-autocomplete-input" className="sr-only">
          Search custom garments, fabrics, and colors
        </label>
        <input
          id="search-autocomplete-input"
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-expanded={hasSuggestions}
          aria-controls="search-suggestions-dropdown"
          className={`w-full bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-brand-accent focus:bg-white text-neutral-900 transition-colors shadow-2xs ${sizeClasses}`}
        />

        {/* Search Icon */}
        <svg
          className={`text-neutral-400 absolute pointer-events-none ${iconSizes}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-200 text-xs font-bold transition-colors"
            title="Clear search"
            aria-label="Clear search input"
          >
            &#10005;
          </button>
        )}
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {hasSuggestions && (
        <div
          id="search-suggestions-dropdown"
          role="listbox"
          className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden divide-y divide-neutral-100 max-h-96 overflow-y-auto animate-fadeIn"
        >
          {/* Matching Categories Header & Items */}
          {suggestions.categories.length > 0 && (
            <div className="p-2 bg-neutral-50/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 px-2 py-1 block">
                Departments & Categories
              </span>
              <div className="space-y-0.5 mt-1">
                {suggestions.categories.map((cat, idx) => {
                  const itemIndex = idx;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectItem({ type: 'category', value: cat })}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-brand-accent/10 text-brand-dark' : 'hover:bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-neutral-400 text-xs">&#128084;</span>
                        <span>{cat}</span>
                      </span>
                      <span className="text-[10px] text-brand-accent font-semibold">View Category &rarr;</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matching Attributes (Fabrics / Colors) */}
          {suggestions.attributes.length > 0 && (
            <div className="p-2 bg-white">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 px-2 py-1 block">
                Matching Attributes & Materials
              </span>
              <div className="space-y-0.5 mt-1">
                {suggestions.attributes.map((attr, idx) => {
                  const itemIndex = suggestions.categories.length + idx;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <button
                      key={attr.label}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectItem(attr)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-brand-accent/10 text-brand-dark' : 'hover:bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {attr.type === 'color' && attr.hex && (
                          <span
                            className="w-3 h-3 rounded-full border border-neutral-300 shadow-2xs inline-block"
                            style={{ backgroundColor: attr.hex }}
                          />
                        )}
                        {attr.type === 'fabric' && (
                          <span className="text-neutral-400 text-xs">&#129526;</span>
                        )}
                        <span>{attr.label}</span>
                      </span>
                      <span className="text-[10px] text-neutral-600">Filter by {attr.type}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matching Product Catalog Pieces */}
          {suggestions.products.length > 0 && (
            <div className="p-2 bg-white">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 px-2 py-1 block">
                Matching Bespoke Pieces
              </span>
              <div className="space-y-1 mt-1">
                {suggestions.products.map((p, idx) => {
                  const itemIndex = suggestions.categories.length + suggestions.attributes.length + idx;
                  const isSelected = selectedIndex === itemIndex;
                  const price = Number(p.basePrice || p.price || 0);

                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectItem({ type: 'product', product: p, value: p.name })}
                      className={`w-full text-left p-2 rounded-xl flex items-center gap-3 transition-colors ${
                        isSelected ? 'bg-brand-accent/10 text-brand-dark' : 'hover:bg-neutral-50 text-neutral-800'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200 relative">
                        <ProductImage
                          src={p.image || p.images?.[0] || p.thumbnail || getProductImage(p)}
                          alt={p.name}
                          category={p.category}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-neutral-900 truncate">{p.name}</div>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-0.5">
                          <span>{p.category}</span>
                          <span>&bull;</span>
                          <span className="font-semibold text-brand-dark">₹{price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <StarRating rating={p.rating || 4.8} size="sm" showValue={false} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer search all CTA */}
          <div className="p-2 bg-neutral-50 text-center">
            <button
              type="button"
              onClick={handleFormSubmit}
              className="text-xs font-bold text-brand-accent hover:underline w-full py-1 text-center"
            >
              See all results for &ldquo;{query.trim()}&rdquo; &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
