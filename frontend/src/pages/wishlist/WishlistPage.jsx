import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import ProductImage from '../../components/common/ProductImage.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export default function WishlistPage() {
  const { wishlist, loading, removeFromWishlist, refreshWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: '' }
  const [removingId, setRemovingId] = useState(null);

  const handleRemove = async (productId, productName) => {
    try {
      setRemovingId(productId);
      await removeFromWishlist(productId);
      setFeedback({
        type: 'success',
        text: `"${productName || 'Garment'}" removed from your bespoke wishlist.`
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Failed to remove item:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleQuickAddToCart = (item) => {
    const prodId = item.productId || item.id;
    const basePrice = Number(item.price || item.basePrice || 0);

    const cartItem = {
      id: `cart-${prodId}-${Date.now()}`,
      productId: prodId,
      productName: item.productName || item.name || 'Bespoke Garment',
      category: item.category || 'Custom Apparel',
      productImage: item.productImage || null,
      silhouetteColor: item.silhouetteColor || 'from-stone-100 to-amber-50',
      accentColor: '#1F2937',
      basePrice: basePrice,

      selectedFabric: { name: 'Standard Milled Textile', composition: 'Bespoke Certified' },
      fabric: { name: 'Standard Milled Textile', composition: 'Bespoke Certified' },
      selectedColor: { name: 'Natural', hex: '#1F2937' },
      color: { name: 'Natural', hex: '#1F2937' },

      selectedDesign: { collar: 'Standard', cuff: 'Standard', buttons: 'Standard', monogram: null },
      designOptions: { collar: 'Standard', cuff: 'Standard', buttons: 'Standard', monogram: null },
      collar: 'Standard',
      cuff: 'Standard',
      buttons: 'Standard',
      monogram: null,

      size: 'M',
      fit: 'Regular',
      customMeasurements: {},
      measurementUnit: 'inches',

      selectedPerfume: null,
      perfumePrice: 0,

      itemPrice: basePrice,
      totalItemPrice: basePrice,
      quantity: 1,
      addedAt: new Date().toISOString()
    };

    addToCart(cartItem);
    setFeedback({
      type: 'success',
      text: `Added "${cartItem.productName}" foundation to bag! `
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10">
      <PageContainer>
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-2">
            <Link to="/home" className="hover:text-brand-dark transition-colors">Home</Link>
            <span>/</span>
            <Link to="/profile" className="hover:text-brand-dark transition-colors">Account</Link>
            <span>/</span>
            <span className="text-brand-dark">Wishlist</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-black text-brand-dark tracking-tight flex items-center gap-3">
                <span>My Wishlist</span>
                <span className="text-sm font-sans font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                  {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
                </span>
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Save your favorite items here. Revisit anytime or move them directly to your cart.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button to="/shop" variant="outline" size="sm">
                Continue Shopping &rarr;
              </Button>
            </div>
          </div>
        </div>

        {/* Global Action Feedback Alert */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{feedback.type === 'success' ? '✓' : '⚠'}</span>
              <span>{feedback.text}</span>
            </div>
            <Link to="/cart" className="underline font-bold hover:text-emerald-700">
              View Bag
            </Link>
          </div>
        )}

        {/* Content States */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-neutral-200 p-6 animate-pulse space-y-4"
              >
                <div className="aspect-[4/3] bg-neutral-100 rounded-xl" />
                <div className="h-4 bg-neutral-100 rounded-sm w-3/4" />
                <div className="h-3 bg-neutral-100 rounded-sm w-1/2" />
                <div className="h-8 bg-neutral-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-12 sm:p-16 text-center max-w-xl mx-auto my-8 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-serif font-black text-brand-dark">
                Your Wishlist is Empty
              </h2>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                Save pieces you love while browsing our collection. Tailor fabrics, silhouettes, and monograms when you are ready.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button to="/shop" variant="secondary" size="md" className="w-full sm:w-auto shadow-md">
                Browse Catalog &rarr;
              </Button>
              <Button to="/customize/1" variant="outline" size="md" className="w-full sm:w-auto">
                Open Customizer
              </Button>
            </div>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {wishlist.map((item) => {
              const prodId = item.productId || item.id;
              const price = Number(item.price || 0);
              const compareAt = item.compareAtPrice ? Number(item.compareAtPrice) : null;
              const formattedDate = item.addedAt
                ? new Date(item.addedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                : 'Recently';

              return (
                <div
                  key={prodId}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
                >
                  {/* Top Visual Area */}
                  <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                    <Link to={`/product/${prodId}`} className="block w-full h-full group-hover:scale-105 transition-transform duration-500">
                      <ProductImage
                        src={item.productImage || item.image || item.thumbnail}
                        productId={prodId}
                        alt={item.productName || item.name}
                        category={item.category}
                        colorImages={item.colorImages}
                        aspectRatio="aspect-[4/3]"
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Category Badge & Remove Button */}
                    <div className="absolute top-3 inset-x-3 flex justify-between items-start z-10 pointer-events-none">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 text-neutral-800 shadow-xs border border-neutral-200/50 pointer-events-auto">
                        {item.category || 'Apparel'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(prodId, item.productName)}
                        disabled={removingId === prodId}
                        aria-label={`Remove ${item.productName} from wishlist`}
                        title="Remove from Wishlist"
                        className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-rose-500 hover:text-rose-700 hover:bg-white border border-neutral-200/80 shadow-xs flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 pointer-events-auto"
                      >
                        <svg className="w-4 h-4 fill-rose-500" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                    </div>

                    {/* Added Date Stamp */}
                    <div className="absolute bottom-2.5 inset-x-3 z-10 flex items-center justify-between text-[11px] text-white font-medium bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                      <span>Saved {formattedDate}</span>
                      <span className="text-emerald-300 font-bold">
                        {item.available !== false ? '● In Stock' : '○ Made to Order'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content & CTAs */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <Link to={`/product/${prodId}`}>
                        <h3 className="font-serif font-black text-brand-dark text-base hover:text-brand-accent transition-colors line-clamp-1">
                          {item.productName}
                        </h3>
                      </Link>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-base font-bold text-neutral-900 font-mono">
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        {compareAt && compareAt > price && (
                          <span className="text-xs text-neutral-400 line-through font-mono">
                            ₹{compareAt.toLocaleString('en-IN')}
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-400 font-medium">
                          (incl. bespoke tailoring)
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2 border-t border-neutral-100">
                      {item.customizable !== false ? (
                        <Button
                          to={`/customize/${prodId}`}
                          variant="secondary"
                          size="sm"
                          className="w-full font-bold shadow-xs text-xs"
                        >
                          Personalize & Tailor &rarr;
                        </Button>
                      ) : (
                        <Button
                          to={`/product/${prodId}`}
                          variant="secondary"
                          size="sm"
                          className="w-full font-bold shadow-xs text-xs"
                        >
                          View Garment Details &rarr;
                        </Button>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          onClick={() => handleQuickAddToCart(item)}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs font-semibold"
                        >
                          + Add to Bag
                        </Button>
                        <Button
                          to={`/product/${prodId}`}
                          variant="outline"
                          size="sm"
                          className="w-full text-xs font-semibold"
                        >
                          Inspect
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
