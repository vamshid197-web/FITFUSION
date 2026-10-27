import React from 'react';
import ProductCard from '../common/ProductCard.jsx';
import { MATCH_LEVELS, UI_LABELS } from '../../services/aiStyleSearchService.js';

/**
 * AI Style Search Result & Smart Alternatives Presentation Component
 * Compliant with Phase 22 Specifications (Sections 22, 23, 24, 26, 29, 32).
 */
export default function AiStyleSearchResult({
  searchResult,
  onSelectPrompt,
  onResetSearch
}) {
  if (!searchResult || searchResult.isQueryEmpty) {
    return null;
  }

  const {
    matchLevel,
    exactMatches = [],
    closeMatches = [],
    similarProducts = [],
    suggestedPrompts = [],
    rawQuery = ''
  } = searchResult;

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. NO GOOD MATCH LAYOUT (Section 22, 23, 24, 26, 29)
  // Layout strictly follows Section 29:
  // - We couldn't find an exact match
  // - Try another style
  // - [Suggested Prompt] pills
  // - Similar clothes you may like
  // - [Product Cards]
  // ─────────────────────────────────────────────────────────────────────────────
  if (matchLevel === MATCH_LEVELS.NO_MATCH) {
    return (
      <div className="space-y-8 animate-fadeIn" data-testid="ai-style-no-match">
        {/* Header Block: We couldn't find an exact match */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700 text-xl shadow-2xs">
            <span>&#10022;</span>
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-serif font-black text-brand-dark tracking-tight">
              We couldn&apos;t find an exact match
            </h2>
            <h3 className="text-sm sm:text-base font-bold text-amber-700 tracking-wide uppercase">
              Try another style
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600">
              We couldn&apos;t find an exact match for your request. Let&apos;s try another style.
              {rawQuery && (
                <span className="block italic text-neutral-800 font-medium mt-1">
                  &ldquo;{rawQuery}&rdquo;
                </span>
              )}
            </p>
          </div>

          {/* Section A: SUGGESTED PROMPTS (Section 23, 27, 28) */}
          <div className="pt-4 border-t border-neutral-100 max-w-2xl mx-auto space-y-3">
            <p className="text-xs font-semibold text-neutral-700">
              Try these instead:
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSelectPrompt && onSelectPrompt(prompt)}
                  className="group inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-50 hover:bg-brand-dark text-neutral-800 hover:text-white border border-neutral-200 hover:border-brand-dark rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer text-left"
                  title={`Search for "${prompt}"`}
                  aria-label={`Try suggested prompt: ${prompt}`}
                >
                  <span className="text-brand-accent group-hover:text-amber-300 font-bold">&#8226;</span>
                  <span>&ldquo;{prompt}&rdquo;</span>
                  <span className="text-neutral-400 group-hover:text-white/80 text-xs ml-1">&rarr;</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section B: SIMILAR DRESSES / CLOTHES (Section 24, 29) */}
        {similarProducts.length > 0 && (
          <div className="space-y-4" data-testid="ai-style-similar-clothes">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-neutral-200 pb-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-brand-dark tracking-tight">
                  {UI_LABELS.SIMILAR_CLOTHES}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Curated relevant clothing models available for immediate customization
                </p>
              </div>
              <span className="text-xs font-semibold text-neutral-500 whitespace-nowrap">
                {similarProducts.length} curated styles
              </span>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {similarProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. CLOSE MATCH LAYOUT (Section 26)
  // Shows "Similar options" heading, close match products, and suggested prompts
  // ─────────────────────────────────────────────────────────────────────────────
  if (matchLevel === MATCH_LEVELS.CLOSE_MATCH) {
    return (
      <div className="space-y-8 animate-fadeIn" data-testid="ai-style-close-match">
        {/* Header Block: Similar options */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-neutral-200 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-2">
              <span>&#9881;</span>
              <span>Closest Match Found</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-brand-dark tracking-tight">
              {UI_LABELS.CLOSE_MATCH}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              We couldn&apos;t find an exact match for &ldquo;{rawQuery}&rdquo;, but here are similar options from our bespoke catalog.
            </p>
          </div>
          <span className="text-xs font-semibold text-neutral-500 whitespace-nowrap">
            Showing <strong className="text-brand-dark">{closeMatches.length}</strong> styles
          </span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
          {closeMatches.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Section: Try another style with alternative prompts */}
        {suggestedPrompts.length > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {UI_LABELS.TRY_ANOTHER_STYLE}
            </h4>
            <p className="text-xs text-neutral-600">
              Refine your search with one of these suggested styles:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSelectPrompt && onSelectPrompt(prompt)}
                  className="px-3.5 py-2 bg-neutral-50 hover:bg-brand-dark text-neutral-700 hover:text-white border border-neutral-200 hover:border-brand-dark rounded-xl text-xs font-medium transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                  aria-label={`Try alternative prompt: ${prompt}`}
                >
                  <span className="text-brand-accent">&#8226;</span>
                  <span>&ldquo;{prompt}&rdquo;</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. EXACT MATCH LAYOUT (Section 26)
  // Shows "Recommended for you" heading and exact match products
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-fadeIn" data-testid="ai-style-exact-match">
      {/* Header Block: Recommended for you */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            <span>&#10003;</span>
            <span>Tailored Recommendation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-brand-dark tracking-tight">
            {UI_LABELS.EXACT_MATCH}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Hand-picked styles matching your request &ldquo;{rawQuery}&rdquo;.
          </p>
        </div>
        <span className="text-xs font-semibold text-neutral-500 whitespace-nowrap">
          <strong className="text-brand-dark font-bold">{exactMatches.length}</strong> matching styles
        </span>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
        {exactMatches.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Related Suggested Prompts strip for style exploration */}
      {suggestedPrompts.length > 0 && (
        <div className="bg-neutral-50/70 rounded-2xl border border-neutral-200/80 p-4 sm:p-5 space-y-2">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Explore related bespoke styles:
          </span>
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onSelectPrompt && onSelectPrompt(prompt)}
                className="px-3 py-1.5 bg-white hover:bg-brand-dark text-neutral-700 hover:text-white border border-neutral-200 hover:border-brand-dark rounded-lg text-xs font-medium transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                aria-label={`Explore style: ${prompt}`}
              >
                <span className="text-brand-accent">&#8226;</span>
                <span>&ldquo;{prompt}&rdquo;</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
