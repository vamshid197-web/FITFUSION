import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { getActiveOffers, validateOfferForCart } from '../../services/offerService.js';
import { FREE_PERFUME_RULES } from '../../data/promotions.js';
import { MOCK_PRODUCTS } from '../../data/mockProducts.js';
import Button from '../common/Button.jsx';
import StarRating from '../common/StarRating.jsx';

export default function SmartBudgetAssistant({ catalogProducts = [] }) {
  const {
    items,
    total,
    subtotal,
    customerBudget,
    setCustomerBudget,
    clearCustomerBudget,
    isOverBudget,
    overBudgetAmount,
    underBudgetAmount,
    replaceCartItem,
    freePerfume,
    isEligibleForFreePerfume,
    remainingForFreePerfume,
    claimFreePerfume,
    removeFreePerfume,
    appliedOffer,
    applyOffer,
    offerDiscount
  } = useCart();

  const [activeOffers, setActiveOffers] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getActiveOffers().then((res) => {
      if (isMounted) setActiveOffers(res);
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const [customBudgetInput, setCustomBudgetInput] = useState(
    customerBudget ? String(customerBudget) : ''
  );
  const [budgetFeedback, setBudgetFeedback] = useState('');

  // Alternative Replacement Confirmation Modal State
  const [replacingCandidate, setReplacingCandidate] = useState(null); // { cartItem, alternativeProduct, savings }

  const productsPool = catalogProducts.length > 0 ? catalogProducts : MOCK_PRODUCTS;

  // Handle budget input change & apply
  const handleApplyBudget = (e) => {
    e.preventDefault();
    const val = Number(customBudgetInput.replace(/\D/g, ''));
    if (!val || val <= 0) {
      setBudgetFeedback('Please enter a valid budget greater than ₹0.');
      return;
    }
    setCustomerBudget(val);
    setBudgetFeedback(`Shopping budget set to ₹${val.toLocaleString('en-IN')}.`);
    setTimeout(() => setBudgetFeedback(''), 3000);
  };

  const handleQuickBudget = (amount) => {
    setCustomBudgetInput(String(amount));
    setCustomerBudget(amount);
    setBudgetFeedback(`Budget updated to ₹${amount.toLocaleString('en-IN')}.`);
    setTimeout(() => setBudgetFeedback(''), 3000);
  };

  const handleClearBudget = () => {
    setCustomBudgetInput('');
    clearCustomerBudget();
    setBudgetFeedback('Budget tracker cleared.');
    setTimeout(() => setBudgetFeedback(''), 2500);
  };

  // Phase 16: Check if an active offer can help the customer reach their budget
  const budgetSavingOffer = useMemo(() => {
    if (!isOverBudget || appliedOffer || activeOffers.length === 0) return null;
    for (const off of activeOffers) {
      const res = validateOfferForCart({
        offer: off,
        cartItems: items,
        subtotal
      });
      if (res.eligible && res.discountAmount > 0) {
        return {
          offer: off,
          discountAmount: res.discountAmount,
          newTotal: Math.max(0, total - res.discountAmount)
        };
      }
    }
    return null;
  }, [isOverBudget, appliedOffer, activeOffers, items, subtotal, total]);

  // Find similar lower-cost recommendations for items in the cart
  const savingsRecommendations = useMemo(() => {
    if (!isOverBudget || items.length === 0) return [];

    const recs = [];

    items.forEach((cartItem) => {
      const currentPrice = Number(cartItem.itemPrice || cartItem.basePrice || cartItem.price || 0);

      // Find products in the same category with lower price, prioritizing color and fabric similarity
      const itemColor = (cartItem.selectedColor?.name || cartItem.color?.name || cartItem.color || '').toLowerCase();
      const itemFabric = (cartItem.selectedFabric?.name || cartItem.fabric?.name || cartItem.fabric || '').toLowerCase();

      const cheaperAlternatives = productsPool
        .filter((p) => {
          const altPrice = Number(p.basePrice || p.price || 0);
          return (
            String(p.id) !== String(cartItem.productId) &&
            p.category === cartItem.category &&
            altPrice < currentPrice &&
            p.available !== false
          );
        })
        .sort((a, b) => {
          // Color similarity score
          const aColors = (a.availableColors || []).map((c) => (c.name || c).toLowerCase());
          const bColors = (b.availableColors || []).map((c) => (c.name || c).toLowerCase());
          const aHasColor = itemColor && aColors.some((c) => c.includes(itemColor) || itemColor.includes(c)) ? 20 : 0;
          const bHasColor = itemColor && bColors.some((c) => c.includes(itemColor) || itemColor.includes(c)) ? 20 : 0;

          // Fabric similarity score
          const aFabrics = (a.availableFabrics || []).map((f) => (f.name || f).toLowerCase());
          const bFabrics = (b.availableFabrics || []).map((f) => (f.name || f).toLowerCase());
          const aHasFabric = itemFabric && aFabrics.some((f) => f.includes(itemFabric) || itemFabric.includes(f)) ? 10 : 0;
          const bHasFabric = itemFabric && bFabrics.some((f) => f.includes(itemFabric) || itemFabric.includes(f)) ? 10 : 0;

          const similarityA = aHasColor + aHasFabric;
          const similarityB = bHasColor + bHasFabric;

          if (similarityA !== similarityB) {
            return similarityB - similarityA; // Higher similarity first
          }

          // Then prioritize lower price
          return (a.basePrice || a.price) - (b.basePrice || b.price);
        });

      if (cheaperAlternatives.length > 0) {
        const bestAlt = cheaperAlternatives[0];
        const altPrice = Number(bestAlt.basePrice || bestAlt.price || 0);
        const qty = cartItem.quantity || 1;
        const potentialSavings = (currentPrice - altPrice) * qty;

        recs.push({
          cartItem,
          alternative: bestAlt,
          currentPrice,
          alternativePrice: altPrice,
          unitSavings: currentPrice - altPrice,
          totalSavings: potentialSavings
        });
      }
    });

    // Prioritize recommendations that give the biggest reduction
    return recs.sort((a, b) => b.totalSavings - a.totalSavings);
  }, [items, isOverBudget, productsPool]);

  // Execute replacement after customer confirmation
  const handleConfirmReplacement = () => {
    if (!replacingCandidate) return;

    const { cartItem, alternative } = replacingCandidate;
    replaceCartItem(cartItem.id, alternative);

    setBudgetFeedback(`Replaced with "${alternative.name}". Saved ₹${replacingCandidate.totalSavings.toLocaleString('en-IN')}!`);
    setReplacingCandidate(null);
    setTimeout(() => setBudgetFeedback(''), 4000);
  };

  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-5 sm:p-6 space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <h3 className="font-serif font-black text-base text-brand-dark tracking-tight">
              Smart Budget Assistant & Promotions
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Set your target wardrobe budget to receive intelligent tailoring alternatives and free gift alerts.
          </p>
        </div>

        {customerBudget && (
          <button
            type="button"
            onClick={handleClearBudget}
            className="text-[11px] font-semibold text-neutral-400 hover:text-rose-600 transition-colors self-start sm:self-auto"
          >
            Clear Target Budget
          </button>
        )}
      </div>

      {/* Budget Input & Presets */}
      <div className="space-y-3">
        <form onSubmit={handleApplyBudget} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-2.5 text-xs font-bold text-neutral-400">
              ₹
            </span>
            <input
              type="text"
              value={customBudgetInput}
              onChange={(e) => setCustomBudgetInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter Target Budget (e.g. 5,000)"
              className="w-full pl-8 pr-3.5 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-brand-accent bg-neutral-50 font-mono font-bold"
            />
          </div>

          <Button type="submit" variant="secondary" size="sm" className="text-xs font-bold whitespace-nowrap">
            Set Budget
          </Button>
        </form>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Quick Targets:
          </span>
          {[3000, 5000, 8000, 12000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleQuickBudget(amt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-all ${
                customerBudget === amt
                  ? 'bg-brand-dark text-white border-brand-dark shadow-2xs'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              ₹{amt.toLocaleString('en-IN')}
            </button>
          ))}
        </div>

        {budgetFeedback && (
          <p className="text-xs font-semibold text-brand-accent animate-fadeIn">
            {budgetFeedback}
          </p>
        )}
      </div>

      {/* Dynamic Budget Status Comparison */}
      {customerBudget ? (
        <div
          className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
            isOverBudget
              ? 'bg-amber-50/80 border-amber-300 text-amber-950'
              : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                {isOverBudget ? '⚠️ Budget Exceeded' : '✓ Within Shopping Budget'}
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/80 border border-neutral-200">
                Target: ₹{customerBudget.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-neutral-700 leading-snug">
              {isOverBudget ? (
                <>
                  Your current bag total is <span className="font-bold font-mono">₹{total.toLocaleString('en-IN')}</span>, which is{' '}
                  <span className="font-black text-rose-700 font-mono">
                    ₹{overBudgetAmount.toLocaleString('en-IN')} over your budget
                  </span>. Explore lower-cost tailored alternatives below to align with your target.
                </>
              ) : (
                <>
                  Your current bag total of <span className="font-bold font-mono">₹{total.toLocaleString('en-IN')}</span> aligns perfectly with your budget.{' '}
                  <span className="font-bold text-emerald-800 font-mono">
                    ₹{underBudgetAmount.toLocaleString('en-IN')} buffer remaining
                  </span>.
                </>
              )}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-neutral-500 block uppercase tracking-wider">Cart Total</span>
            <span className="text-lg font-black font-mono text-brand-dark">
              ₹{total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      ) : null}

      {/* Phase 16 Offer-driven Budget Assistance */}
      {isOverBudget && budgetSavingOffer && (
        <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-fadeIn">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <span>💡</span>
              <span>Reach Budget with Offer: {budgetSavingOffer.offer.name}</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              You may be able to reach your budget using this offer.
              {budgetSavingOffer.newTotal <= customerBudget ? (
                <strong className="text-emerald-800 ml-1">
                  (Estimated cart becomes ₹{budgetSavingOffer.newTotal.toLocaleString('en-IN')}, within your ₹{customerBudget.toLocaleString('en-IN')} budget!)
                </strong>
              ) : (
                <span className="text-neutral-700 ml-1">
                  (Saves ₹{budgetSavingOffer.discountAmount.toLocaleString('en-IN')})
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              applyOffer(budgetSavingOffer.offer);
              setBudgetFeedback(`Applied "${budgetSavingOffer.offer.name}". Saved ₹${budgetSavingOffer.discountAmount.toLocaleString('en-IN')}!`);
              setTimeout(() => setBudgetFeedback(''), 3000);
            }}
            className="self-start sm:self-center px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs whitespace-nowrap"
          >
            Apply Offer (-₹{budgetSavingOffer.discountAmount.toLocaleString('en-IN')})
          </button>
        </div>
      )}

      {/* Similar Lower-Cost Clothing Recommendations (When Over Budget) */}
      {isOverBudget && savingsRecommendations.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <span>✂️</span> Recommended Lower-Cost Alternatives (Suggestions Only)
            </span>
            <span className="text-[11px] text-neutral-400">
              Preserves quantity & category
            </span>
          </div>

          <div className="space-y-3">
            {savingsRecommendations.map((rec, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 hover:bg-white hover:border-neutral-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-700">
                      {rec.alternative.category}
                    </span>
                    <span className="text-xs font-semibold text-neutral-500">
                      Current: <strong className="text-neutral-800">{rec.cartItem.productName}</strong> (₹{rec.currentPrice.toLocaleString('en-IN')})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-dark">
                      Alternative: {rec.alternative.name}
                    </span>
                    <span className="text-xs font-mono font-black text-neutral-900">
                      ₹{rec.alternativePrice.toLocaleString('en-IN')}
                    </span>
                    <StarRating rating={rec.alternative.rating || 4.8} size="sm" />
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">
                      Save ₹{rec.totalSavings.toLocaleString('en-IN')} on this item
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      (Qty: {rec.cartItem.quantity || 1})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-200 shrink-0">
                  <Link
                    to={`/product/${rec.alternative.id}`}
                    className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    View Details
                  </Link>

                  <Button
                    type="button"
                    onClick={() =>
                      setReplacingCandidate({
                        cartItem: rec.cartItem,
                        alternative: rec.alternative,
                        totalSavings: rec.totalSavings
                      })
                    }
                    variant="secondary"
                    size="sm"
                    className="text-xs font-bold whitespace-nowrap shadow-2xs"
                  >
                    Replace Item &rarr;
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FREE PERFUME PROMOTION SECTION (Phase 14) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-rose-50/40 to-stone-50 border border-amber-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="text-2xl">🎁</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-brand-dark text-white shadow-2xs">
                  {FREE_PERFUME_RULES.PROMO_BADGE}
                </span>
                <span className="text-xs font-bold text-neutral-700">
                  Complimentary Luxury Fragrance Commission
                </span>
              </div>
              <h4 className="text-sm font-serif font-black text-brand-dark mt-0.5">
                Orders Above ₹{FREE_PERFUME_RULES.THRESHOLD.toLocaleString('en-IN')} Receive 1 Free Luxury Fragrance
              </h4>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-neutral-500 block">Subtotal</span>
            <span className="text-sm font-black font-mono text-brand-dark">
              ₹{subtotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Progress or Qualified Banner */}
        {isEligibleForFreePerfume ? (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Your bag qualifies! Choose 1 complimentary luxury perfume below at ₹0.</span>
            </div>
            {freePerfume && (
              <span className="text-[11px] font-mono text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
                1 of 1 Claimed
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-600">
              <span>
                Add <strong className="text-brand-dark font-mono">₹{remainingForFreePerfume.toLocaleString('en-IN')}</strong> more to claim a free fragrance
              </span>
              <span className="font-mono text-[11px] font-bold">
                {Math.min(100, Math.round((subtotal / FREE_PERFUME_RULES.THRESHOLD) * 100))}%
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-accent rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (subtotal / FREE_PERFUME_RULES.THRESHOLD) * 100)}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Free Perfume Carousel / Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {FREE_PERFUME_RULES.ELIGIBLE_PERFUMES.map((perfume) => {
            const isClaimed = freePerfume && freePerfume.id === perfume.id;

            return (
              <div
                key={perfume.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${
                  isClaimed
                    ? 'bg-white border-emerald-500 ring-2 ring-emerald-400/40 shadow-xs'
                    : 'bg-white/80 border-neutral-200 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{perfume.icon}</span>
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 line-through block font-mono">
                        ₹{perfume.normalPrice}
                      </span>
                      <span className="text-xs font-black text-emerald-700 font-mono">
                        FREE
                      </span>
                    </div>
                  </div>

                  <h5 className="font-bold text-xs text-brand-dark mt-1">
                    {perfume.name}
                  </h5>
                  <span className="text-[10px] text-neutral-400 block mb-1">
                    {perfume.brand} &bull; {perfume.fragranceFamily}
                  </span>
                  <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                    {perfume.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-100">
                  {isClaimed ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <span>✓</span> Claimed
                      </span>
                      <button
                        type="button"
                        onClick={removeFreePerfume}
                        className="text-[11px] text-rose-600 hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!isEligibleForFreePerfume}
                      onClick={() => claimFreePerfume(perfume)}
                      className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                        isEligibleForFreePerfume
                          ? 'bg-brand-dark text-white hover:bg-brand-accent shadow-2xs'
                          : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                      }`}
                    >
                      {isEligibleForFreePerfume ? '+ Claim Free Perfume' : 'Unlock at ₹3,999'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Replacement Confirmation Dialog Modal */}
      {replacingCandidate && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h4 className="font-serif font-black text-base text-brand-dark">
                Confirm Smart Item Replacement
              </h4>
              <button
                type="button"
                onClick={() => setReplacingCandidate(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-700">
              <p>
                You are replacing <strong className="text-brand-dark">{replacingCandidate.cartItem.productName}</strong> with lower-cost alternative <strong className="text-brand-dark">{replacingCandidate.alternative.name}</strong>.
              </p>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Current Unit Price:</span>
                  <span className="font-mono font-bold">₹{replacingCandidate.cartItem.itemPrice || replacingCandidate.cartItem.basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Alternative Unit Price:</span>
                  <span className="font-mono font-bold text-brand-dark">₹{replacingCandidate.alternative.basePrice}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-200 text-emerald-800 font-bold">
                  <span>Total Cart Savings:</span>
                  <span className="font-mono font-black text-sm">Save ₹{replacingCandidate.totalSavings.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-[11px] text-neutral-500 leading-relaxed">
                ℹ Note: Your quantity ({replacingCandidate.cartItem.quantity || 1}) will be preserved. Any incompatible bespoke embroidery or collar specifications will be reset to the alternative's certified foundation.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setReplacingCandidate(null)}
                className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Cancel & Keep Current
              </button>
              <button
                type="button"
                onClick={handleConfirmReplacement}
                className="px-5 py-2 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-brand-accent shadow-xs"
              >
                Confirm Replacement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
