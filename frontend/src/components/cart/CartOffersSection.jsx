import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getActiveOffers, validateOfferForCart } from '../../services/offerService.js';
import { getUserOrders } from '../../services/firestoreService.js';

/**
 * Cart Offers & Promotional Privileges Component
 */
export default function CartOffersSection() {
  const {
    items,
    subtotal,
    appliedOffer,
    applyOffer,
    removeOffer,
    offerDiscount
  } = useCart();
  const { user } = useAuth();

  const [availableOffers, setAvailableOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Load active offers and verify first-order status
  useEffect(() => {
    let isMounted = true;
    async function loadOffersData() {
      try {
        setLoading(true);
        const offers = await getActiveOffers();
        if (isMounted) setAvailableOffers(offers);

        // Check if customer is a first-time patron
        if (user?.uid) {
          const res = await getUserOrders(user.uid);
          if (isMounted && res.success) {
            const hasCompleted = (res.orders || []).some(
              (o) => o.status !== 'Cancelled'
            );
            setIsFirstOrder(!hasCompleted);
          }
        } else {
          // Guest patron: eligible for first order offer
          if (isMounted) setIsFirstOrder(true);
        }
      } catch (err) {
        console.warn('[CartOffersSection] Failed to load offers:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOffersData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleApply = (offer) => {
    const result = applyOffer(offer, isFirstOrder);
    setFeedback({
      type: result.success ? 'success' : 'error',
      message: result.message
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleRemove = () => {
    removeOffer();
    setFeedback({
      type: 'info',
      message: 'Store offer removed.'
    });
    setTimeout(() => setFeedback(null), 2500);
  };

  if (items.length === 0 || loading || availableOffers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-black shadow-2xs">
            🏷️
          </span>
          <div>
            <h3 className="text-sm font-bold text-brand-dark">
              Available Store Privileges & Offers
            </h3>
            <p className="text-[11px] text-neutral-500">
              Apply qualifying atelier savings to your commission
            </p>
          </div>
        </div>

        {appliedOffer && (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            1 Offer Applied
          </span>
        )}
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : feedback.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-neutral-100 text-neutral-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-neutral-400 hover:text-neutral-700 font-bold ml-2"
          >
            &#10005;
          </button>
        </div>
      )}

      {/* Offers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {availableOffers.map((offer) => {
          const isApplied = appliedOffer?.id === offer.id;
          const validation = validateOfferForCart({
            offer,
            cartItems: items,
            subtotal,
            isFirstOrder
          });

          return (
            <div
              key={offer.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2.5 ${
                isApplied
                  ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-300 shadow-2xs'
                  : validation.eligible
                  ? 'bg-white border-neutral-200 hover:border-brand-accent/50 shadow-2xs'
                  : 'bg-neutral-50/60 border-neutral-200 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-black tracking-wider text-brand-dark px-2 py-0.5 bg-neutral-100 rounded-md border border-neutral-200">
                    {offer.code}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      offer.discountType === 'cashback'
                        ? 'bg-purple-100 text-purple-800'
                        : offer.discountType === 'free_item'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {offer.badge || 'PROMOTION'}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-brand-dark mt-1.5 line-clamp-1">
                  {offer.name}
                </h4>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed line-clamp-2">
                  {offer.description}
                </p>
              </div>

              {/* Status and Action CTA */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                {isApplied ? (
                  <>
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      &#10003; Applied (-₹{offerDiscount.toLocaleString('en-IN')})
                    </span>
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline"
                    >
                      Remove
                    </button>
                  </>
                ) : validation.eligible ? (
                  <>
                    <span className="text-neutral-600 text-[11px]">
                      {offer.discountType === 'cashback' ? (
                        <strong className="text-purple-700 font-bold">Earn {offer.cashbackPercentage}% cashback</strong>
                      ) : (
                        <strong className="text-emerald-700 font-bold">Save ₹{validation.discountAmount.toLocaleString('en-IN')}</strong>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApply(offer)}
                      className="px-3 py-1 bg-brand-dark hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                    >
                      Apply Offer
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] text-neutral-400 italic">
                    {validation.reason || 'Not eligible for current cart'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
