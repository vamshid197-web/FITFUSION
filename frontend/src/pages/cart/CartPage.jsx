import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import { useCart } from '../../context/CartContext.jsx';

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    delivery,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discount,
    total,
    demoCoupons
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);
  const [expandedItemId, setExpandedItemId] = useState(null);

  // Handle applying promo coupon
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponFeedback(null);
    const result = applyCoupon(couponInput);
    setCouponFeedback(result);
    if (result.success) {
      setCouponInput('');
    }
  };

  // Quick apply from demo coupon pills
  const handleQuickApply = (code) => {
    setCouponInput(code);
    const result = applyCoupon(code);
    setCouponFeedback(result);
  };

  // Navigate to customize page with existing configuration restored
  const handleEditCustomization = (item) => {
    navigate(`/customize/${item.productId}`, {
      state: {
        editConfig: item,
        initialStep: 1
      }
    });
  };

  // Empty cart view
  if (items.length === 0) {
    return (
      <div className="py-12 sm:py-20 bg-brand-cream min-h-[75vh] flex items-center">
        <PageContainer maxWidth="md">
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-14 shadow-sm text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-brand-accentLight border border-brand-accent/30 flex items-center justify-center text-3xl">
              🛍️
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                Bespoke Bag
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-brand-dark">
                Your cart is empty
              </h1>
              <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                You haven't added any customized apparel yet. Choose a master cloth from our catalog and personalize every detail to perfection.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Button to="/shop" variant="secondary" size="lg" className="w-full sm:w-auto shadow-sm">
                Explore Clothing Collection &rarr;
              </Button>
              <Button to="/home" variant="outline" size="lg" className="w-full sm:w-auto">
                Return Home
              </Button>
            </div>

            {/* Quality assurance badges */}
            <div className="pt-8 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-500">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-brand-accent font-bold">&#10003;</span> Guaranteed Perfect Fit
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-brand-accent font-bold">&#10003;</span> 100% Certified Textiles
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-brand-accent font-bold">&#10003;</span> Complimentary Packaging
              </div>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 bg-brand-cream min-h-screen">
      <PageContainer>
        {/* Breadcrumb & Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-neutral-200 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1.5">
              <Link to="/home" className="hover:text-brand-dark transition-colors">Home</Link>
              <span>/</span>
              <Link to="/shop" className="hover:text-brand-dark transition-colors">Shop</Link>
              <span>/</span>
              <span className="text-brand-accent font-semibold">Shopping Cart</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
              Shopping Cart ({items.reduce((s, i) => s + i.quantity, 0)} {items.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'items'})
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              to="/shop"
              variant="outline"
              size="sm"
              className="text-xs font-semibold"
            >
              &larr; Continue Shopping
            </Button>
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold text-neutral-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* 2-Column Layout: Left (Cart Items) & Right (Order Summary) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => {
              const isCustomTailored = item.size === "Custom Tailored";
              const isExpanded = expandedItemId === item.id;
              const hasCustomMetrics = item.customMeasurements && Object.values(item.customMeasurements).some(v => v !== '');

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-sm space-y-4 transition-all"
                >
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {/* Item Visual Thumbnail */}
                    <div
                      className={`w-24 h-28 sm:w-28 sm:h-32 rounded-xl bg-gradient-to-br ${
                        item.silhouetteColor || 'from-stone-100 to-amber-50'
                      } border border-neutral-200/80 p-2.5 flex flex-col justify-between shrink-0 relative`}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white text-brand-dark shadow-xs self-start">
                        {item.category || 'Apparel'}
                      </span>

                      <div className="my-auto text-center">
                        <svg
                          className="w-10 h-10 mx-auto"
                          style={{ color: item.selectedColor?.hex || '#1F2937' }}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 3v2m6-2v2M9 5H7a2 2 0 00-2 2v2l2 1v9a2 2 0 002 2h6a2 2 0 002-2v-9l2-1V7a2 2 0 00-2-2h-2m-6 0a2 2 0 002 2h2a2 2 0 002-2m-6 0h6" />
                        </svg>
                      </div>

                      <div className="text-[10px] text-center font-bold text-neutral-800 bg-white/80 rounded py-0.5 truncate">
                        {item.size} &bull; {item.fit}
                      </div>
                    </div>

                    {/* Item Information & Highlights */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-extrabold text-base sm:text-lg text-brand-dark">
                              {item.productName}
                            </h2>
                            {isCustomTailored && (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                Bespoke
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500">
                            Custom Tailored Garment &bull; Master Pattern #{item.productId}
                          </p>
                        </div>

                        {/* Price Display */}
                        <div className="sm:text-right">
                          <div className="text-lg font-black text-brand-dark">
                            ₹{(item.totalItemPrice || 0) * item.quantity}
                          </div>
                          <div className="text-xs text-neutral-400">
                            ₹{item.totalItemPrice} each
                          </div>
                        </div>
                      </div>

                      {/* Compact Key Customization Specs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                        <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                          <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Fabric</span>
                          <span className="font-bold text-brand-dark truncate block">{item.selectedFabric?.name || 'Cotton'}</span>
                        </div>

                        <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                          <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Color</span>
                          <span className="font-bold text-brand-dark flex items-center gap-1.5 truncate">
                            <span
                              style={{ backgroundColor: item.selectedColor?.hex || '#171717' }}
                              className="w-2.5 h-2.5 rounded-full border border-neutral-300 shrink-0"
                            />
                            <span className="truncate">{item.selectedColor?.name || 'Default'}</span>
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                          <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Collar / Cuff</span>
                          <span className="font-bold text-brand-dark truncate block">
                            {item.collar || 'Classic'} / {item.cuff || 'Standard'}
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                          <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Fragrance</span>
                          <span className="font-bold text-brand-accent truncate block">
                            {item.selectedPerfume ? item.selectedPerfume.name : 'None'}
                          </span>
                        </div>
                      </div>

                      {/* Expandable Full Customization Details Drawer */}
                      {isExpanded && (
                        <div className="mt-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-2 animate-fadeIn">
                          <div className="font-bold text-brand-dark text-xs uppercase tracking-wider border-b border-neutral-200 pb-1.5">
                            Complete Customization Specifications
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-neutral-700">
                            <div><strong>Fabric Composition:</strong> {item.selectedFabric?.composition || '100% Certified Textile'}</div>
                            <div><strong>Buttons:</strong> {item.buttons || 'Standard Horn'}</div>
                            <div>
                              <strong>Monogram:</strong> {item.monogram ? `"${item.monogram}" (Silk embroidered)` : 'None'}
                            </div>
                            <div><strong>Silhouette Fit:</strong> {item.fit} Fit</div>
                            <div>
                              <strong>Fragrance Pairing:</strong> {item.selectedPerfume ? `${item.selectedPerfume.name} by ${item.selectedPerfume.brand} (+₹${item.selectedPerfume.price})` : 'No fragrance selected'}
                            </div>
                          </div>

                          {hasCustomMetrics && (
                            <div className="pt-2 border-t border-neutral-200">
                              <span className="font-bold text-brand-dark block mb-1">
                                Bespoke Body Metrics ({item.measurementUnit || 'in'}):
                              </span>
                              <div className="grid grid-cols-3 gap-2 text-[11px] text-neutral-600">
                                {item.customMeasurements.neck && <span>Neck: {item.customMeasurements.neck} {item.measurementUnit}</span>}
                                {item.customMeasurements.chest && <span>Chest: {item.customMeasurements.chest} {item.measurementUnit}</span>}
                                {item.customMeasurements.waist && <span>Waist: {item.customMeasurements.waist} {item.measurementUnit}</span>}
                                {item.customMeasurements.shoulder && <span>Shoulder: {item.customMeasurements.shoulder} {item.measurementUnit}</span>}
                                {item.customMeasurements.sleeve && <span>Sleeve: {item.customMeasurements.sleeve} {item.measurementUnit}</span>}
                                {item.customMeasurements.length && <span>Length: {item.customMeasurements.length} {item.measurementUnit}</span>}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quantity Controls & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100">
                        {/* Quantity Counter */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-neutral-500">Qty:</span>
                          <div className="flex items-center border border-neutral-300 rounded-lg bg-white overflow-hidden shadow-xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="px-2.5 py-1 text-sm font-bold text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              title="Decrease quantity"
                            >
                              &minus;
                            </button>
                            <span className="px-3 py-1 text-xs font-bold text-brand-dark min-w-[28px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2.5 py-1 text-sm font-bold text-neutral-600 hover:bg-neutral-100 transition-colors"
                              title="Increase quantity"
                            >
                              &#43;
                            </button>
                          </div>
                        </div>

                        {/* Action buttons: Toggle Details, Edit Customization, Remove */}
                        <div className="flex items-center gap-3 text-xs">
                          <button
                            type="button"
                            onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                            className="font-semibold text-brand-accent hover:underline flex items-center gap-1"
                          >
                            <span>{isExpanded ? 'Hide Full Specs' : 'View Full Specs'}</span>
                            <span className="text-[10px]">{isExpanded ? '▲' : '▼'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditCustomization(item)}
                            className="font-semibold text-neutral-700 hover:text-brand-dark hover:underline"
                          >
                            Edit Customization
                          </button>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="font-semibold text-red-600 hover:text-red-700 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary & Coupon System */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-neutral-100 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">
                  Order Summary
                </span>
                <h3 className="text-xl font-black text-brand-dark">
                  Price Breakdown
                </h3>
              </div>

              {/* Price rows */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-neutral-600">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items):</span>
                  <span className="font-semibold text-brand-dark">₹{subtotal}</span>
                </div>

                <div className="flex justify-between items-center text-neutral-600">
                  <div className="flex items-center gap-1">
                    <span>Delivery & Logistics:</span>
                    {delivery === 0 && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        FREE
                      </span>
                    )}
                  </div>
                  <span className={`font-semibold ${delivery === 0 ? 'text-emerald-600' : 'text-brand-dark'}`}>
                    {delivery === 0 ? '₹0' : `₹${delivery}`}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <div className="flex items-center gap-1">
                      <span>Promo Discount ({appliedCoupon.code}):</span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-[10px] text-red-500 hover:underline ml-1"
                        title="Remove coupon"
                      >
                        (remove)
                      </button>
                    </div>
                    <span className="font-bold">-₹{discount}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline text-sm">
                  <div>
                    <span className="font-extrabold text-brand-dark text-base">Estimated Total:</span>
                    <p className="text-[11px] text-neutral-400">Inclusive of all tailoring & duties</p>
                  </div>
                  <span className="text-2xl font-black text-brand-dark">₹{total}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Button
                to="/checkout"
                variant="primary"
                size="lg"
                className="w-full text-base font-bold shadow-md bg-brand-dark hover:bg-neutral-800"
              >
                Proceed to Checkout (₹{total}) &rarr;
              </Button>

              {/* Free delivery threshold indicator */}
              <div className="text-[11px] text-neutral-500 text-center pt-2">
                {subtotal >= 1500 ? (
                  <span className="text-emerald-600 font-semibold">
                    &#10003; You have unlocked complimentary express delivery!
                  </span>
                ) : (
                  <span>
                    Add <strong>₹{1500 - subtotal}</strong> more for complimentary delivery.
                  </span>
                )}
              </div>
            </div>

            {/* Coupon / Promo Code Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">
                  College Demo Promotion
                </span>
                <h4 className="text-sm font-bold text-brand-dark">
                  Have a Promo Code?
                </h4>
              </div>

              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (e.g. FIT10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2 rounded-lg border border-neutral-300 text-xs font-semibold text-brand-dark uppercase placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  className="font-bold text-xs"
                >
                  Apply
                </Button>
              </form>

              {/* Feedback Alert */}
              {couponFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium animate-fadeIn ${
                    couponFeedback.success
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {couponFeedback.message}
                </div>
              )}

              {/* Demo Coupon Chips */}
              <div className="pt-2 border-t border-neutral-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  Click to try demo codes:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {demoCoupons.map((coupon) => (
                    <button
                      key={coupon.code}
                      type="button"
                      onClick={() => handleQuickApply(coupon.code)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border transition-colors ${
                        appliedCoupon?.code === coupon.code
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-white hover:border-neutral-300'
                      }`}
                    >
                      {coupon.code} ({coupon.type === 'percent' ? `${coupon.value}%` : `₹${coupon.value}`})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
