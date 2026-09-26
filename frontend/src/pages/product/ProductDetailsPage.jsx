import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import { MOCK_PRODUCTS, getProductImage } from '../../data/mockProducts.js';
import { getProductById, getProductsFromFirestore } from '../../services/firestoreService.js';
import { getOffers } from '../../services/offerService.js';
import { useCart } from '../../context/CartContext.jsx';
import WishlistButton from '../../components/common/WishlistButton.jsx';
import RecentlyViewedSection from '../../components/account/RecentlyViewedSection.jsx';
import { recordRecentlyViewed } from '../../services/recentlyViewedService.js';
import StarRating from '../../components/common/StarRating.jsx';
import ProductReviewsSection from '../../components/reviews/ProductReviewsSection.jsx';
import ProductImage from '../../components/common/ProductImage.jsx';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [applicableOffers, setApplicableOffers] = useState([]);
  const [allProducts, setAllProducts] = useState(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [cartNotice, setCartNotice] = useState('');

  // Selected Options
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [liveRating, setLiveRating] = useState(null);
  const [liveReviewsCount, setLiveReviewsCount] = useState(null);

  // Load single product and catalog
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        // 1. Fetch current product
        const prodRes = await getProductById(id);
        if (isMounted) {
          if (prodRes.success && prodRes.product) {
            setProduct(prodRes.product);
            const p = prodRes.product;
            setSelectedFabric(p.availableFabrics?.[0]?.name || 'Standard Milled Textile');
            setSelectedColor(p.availableColors?.[0]?.name || 'Natural');
            setSelectedSize(p.availableSizes?.[0] || 'M');
            recordRecentlyViewed(p);
          } else {
            // Fallback to first mock product if invalid id
            setProduct(MOCK_PRODUCTS[0]);
            setSelectedFabric(MOCK_PRODUCTS[0].availableFabrics[0]?.name);
            setSelectedColor(MOCK_PRODUCTS[0].availableColors[0]?.name);
            setSelectedSize(MOCK_PRODUCTS[0].availableSizes[0]);
          }
        }

        // 2. Fetch full catalog for recommendations
        const catRes = await getProductsFromFirestore();
        if (isMounted && catRes.success && catRes.products?.length > 0) {
          setAllProducts(catRes.products);
        }
      } catch (err) {
        console.warn('[ProductDetailsPage] Error fetching product:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 bg-neutral-50/40 min-h-screen">
        <PageContainer>
          <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
            <div className="w-10 h-10 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-sm font-bold text-neutral-800">Loading clothing details...</div>
            <p className="text-xs text-neutral-500 mt-1">Loading available fabrics, colors, and design options</p>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 bg-neutral-50/40 min-h-screen">
        <PageContainer>
          <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
            <h2 className="text-xl font-serif font-bold text-neutral-900">Product Not Found</h2>
            <p className="text-xs text-neutral-500 mt-1">The requested item could not be found in our store.</p>
            <div className="mt-5">
              <Button to="/shop" variant="primary" size="sm">
                Return to Shop
              </Button>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  const basePrice = Number(product.basePrice || product.price || 0);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const isAvailable = product.available !== false && product.stockStatus !== 'Out of Stock';
  const discountPercent = compareAt && compareAt > basePrice ? Math.round(((compareAt - basePrice) / compareAt) * 100) : 0;

  // Recommendations: products in same category or featured, excluding current
  const relatedProducts = allProducts
    .filter((p) => String(p.id) !== String(product.id))
    .slice(0, 3);

  const selectedColorObj = (product.availableColors || []).find((c) => c.name === selectedColor) || null;

  const handleAddToCart = () => {
    const resolvedImg = product.image || (product.images && product.images[0]) || product.thumbnail || getProductImage(product);
    const fabricObj = (product.availableFabrics || []).find((f) => f.name === selectedFabric) || {
      name: selectedFabric,
      composition: 'High Quality Fabric'
    };
    const colorObj = selectedColorObj || {
      name: selectedColor || 'Standard',
      hex: '#1F2937'
    };

    const cartItem = {
      id: `cart-${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      category: product.category || 'Apparel',
      productImage: resolvedImg,
      image: resolvedImg,
      silhouetteColor: product.silhouetteColor || 'from-stone-100 to-amber-50',
      accentColor: product.accentColor || '#1F2937',
      basePrice: basePrice,

      // Fabric & shade
      selectedFabric: fabricObj,
      fabric: fabricObj,
      selectedColor: colorObj,
      color: colorObj,

      // Default architectural specs
      selectedDesign: {
        collar: 'Standard',
        cuff: 'Standard',
        buttons: 'Standard',
        monogram: null
      },
      designOptions: {
        collar: 'Standard',
        cuff: 'Standard',
        buttons: 'Standard',
        monogram: null
      },
      collar: 'Standard',
      cuff: 'Standard',
      buttons: 'Standard',
      monogram: null,

      // Size & fit
      size: selectedSize,
      fit: 'Regular',
      customMeasurements: {},
      measurementUnit: 'inches',

      // Fragrance
      selectedPerfume: null,
      perfumePrice: 0,

      // Pricing & quantity
      itemPrice: basePrice,
      totalItemPrice: basePrice,
      quantity: 1,
      addedAt: new Date().toISOString()
    };

    addToCart(cartItem);
    setCartNotice(`Added "${product.name}" (${selectedFabric}, ${selectedColor}, ${selectedSize}) to bag!`);
    setTimeout(() => setCartNotice(''), 5000);
  };

  return (
    <div className="py-8 sm:py-12 bg-neutral-50/40 min-h-screen space-y-12">
      <PageContainer>
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-8">
          <Link to="/home" className="hover:text-brand-dark transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-brand-dark transition-colors">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-brand-dark transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-neutral-800 font-semibold">{product.name}</span>
        </div>

        {/* Product Details Main Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-2xl border border-neutral-200 shadow-sm">
          {/* Left Column: Visual Showcase & Real Garment Preview */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square rounded-2xl bg-neutral-100 p-4 border border-neutral-200 overflow-hidden flex flex-col justify-between shadow-sm">
              {/* Badges Header */}
              <div className="flex justify-between items-center z-10">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/95 text-brand-dark shadow-xs border border-neutral-200/60 backdrop-blur-xs">
                  {product.category || 'Apparel'}
                </span>
                <div className="flex items-center gap-1.5">
                  {product.badge && (
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-brand-accent text-white shadow-xs">
                      {product.badge}
                    </span>
                  )}
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs ${
                    isAvailable ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {product.stockStatus || (isAvailable ? 'In Stock' : 'Out of Stock')}
                  </span>
                </div>
              </div>

              {/* Real Garment Image with Dynamic Tint */}
              <div className="absolute inset-0 z-0 flex items-center justify-center p-2">
                <ProductImage
                  src={product.image || product.images?.[0] || product.thumbnail || getProductImage(product)}
                  alt={product.name}
                  category={product.category}
                  tintColor={selectedColorObj?.hex || null}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              {/* Bottom Visual Notice */}
              <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl text-xs text-neutral-700 text-center border border-neutral-200/80 z-10 flex items-center justify-between shadow-2xs mt-auto">
                <span className="font-semibold text-neutral-800">
                  Selected Color: <strong className="text-brand-dark">{selectedColor}</strong>
                </span>
                <span className="text-[11px] text-neutral-500 font-medium">
                  Premium Fabric &bull; Customizable
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Garment Information & Options */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                  Custom Tailored
                </span>
                <span className="text-neutral-300">&bull;</span>
                <a
                  href="#reviews-section"
                  className="hover:opacity-80 transition-opacity"
                  title="View Customer Reviews"
                >
                  <StarRating
                    rating={liveRating !== null ? liveRating : (product.rating || 4.8)}
                    count={liveReviewsCount !== null ? liveReviewsCount : (product.reviewsCount || 0)}
                    showValue
                    size="sm"
                  />
                </a>
                <span className="text-neutral-300">&bull;</span>
                <span className="text-xs font-semibold text-neutral-500">Model #{product.id}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-black text-brand-dark tracking-tight">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-2xl sm:text-3xl font-black text-brand-dark">
                  ₹{basePrice.toLocaleString('en-IN')}
                </span>
                {compareAt && compareAt > basePrice && (
                  <>
                    <span className="text-base text-neutral-400 line-through">
                      ₹{compareAt.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
                <span className="text-xs font-normal text-neutral-500 ml-1">(Starting price)</span>
              </div>

              {/* Phase 16: Active Promotional Offers */}
              {applicableOffers.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    🏷️ Available Offer:
                  </span>
                  {applicableOffers.slice(0, 2).map((off) => (
                    <span
                      key={off.id}
                      className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-white text-stone-900 border border-amber-200 shadow-2xs"
                    >
                      <span className="text-amber-700">{off.code}</span>
                      <span className="text-stone-500 font-normal">
                        ({off.type === 'percentage' ? `${off.discountValue}% OFF` : off.type === 'cashback' ? `${off.cashbackPercentage}% Cashback` : `₹${off.discountValue} OFF`})
                      </span>
                    </span>
                  ))}
                  <span className="text-[10px] text-amber-800">Apply at checkout</span>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {product.description}
            </p>

            {/* Option 1: Available Fabrics */}
            {product.availableFabrics && product.availableFabrics.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-neutral-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark">
                  1. Choose Fabric
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {product.availableFabrics.map((fabric) => (
                    <button
                      key={fabric.name}
                      type="button"
                      onClick={() => setSelectedFabric(fabric.name)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        selectedFabric === fabric.name
                          ? 'border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent'
                          : 'border-neutral-200 bg-neutral-50/60 hover:bg-white'
                      }`}
                    >
                      <div className="font-bold text-brand-dark">{fabric.name}</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">{fabric.composition}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Option 2: Available Colors */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-neutral-100">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                    2. Choose Color
                  </label>
                  <span className="text-xs text-neutral-600 font-semibold">{selectedColor}</span>
                </div>
                <div className="flex items-center gap-3">
                  {product.availableColors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color.name)}
                      className={`group relative p-1 rounded-full border transition-all ${
                        selectedColor === color.name
                          ? 'border-brand-accent ring-2 ring-brand-accent ring-offset-2'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                      title={color.name}
                    >
                      <span
                        style={{ backgroundColor: color.hex }}
                        className="block w-6 h-6 rounded-full border border-neutral-200 shadow-2xs"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Option 3: Available Sizes */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-neutral-100">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                    3. Select Size
                  </label>
                  <span className="text-xs text-brand-accent font-semibold">Custom sizing available in customizer</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedSize === size
                          ? 'bg-brand-dark text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cart Feedback Notification */}
            {cartNotice && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center justify-between shadow-2xs animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">&#10003;</span>
                  <span>{cartNotice}</span>
                </div>
                <Link to="/cart" className="font-bold underline text-brand-dark hover:text-brand-accent shrink-0 ml-2">
                  View Bag &rarr;
                </Link>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-6 border-t border-neutral-200 space-y-3">
              <Button
                to={`/customize/${product.id}`}
                variant="secondary"
                size="lg"
                disabled={!isAvailable}
                className="w-full text-base font-bold shadow-md"
              >
                {isAvailable ? 'Customize This Garment &rarr;' : 'Garment Currently Unavailable'}
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  type="button"
                  onClick={handleAddToCart}
                  variant="outline"
                  size="md"
                  disabled={!isAvailable}
                  className="w-full text-xs font-semibold"
                >
                  Quick Add to Bag
                </Button>

                <WishlistButton
                  product={product}
                  variant="button"
                  size="md"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Related Bespoke Silhouettes */}
        {/* Product Reviews & Rating Summary - Phase 14 */}
        {product && (
          <div id="reviews-section" className="mt-16 scroll-mt-24">
            <ProductReviewsSection
              productId={product.id}
              productName={product.name}
              onRatingUpdate={(stats) => {
                if (stats && stats.reviewCount > 0) {
                  setLiveRating(stats.averageRating);
                  setLiveReviewsCount(stats.reviewCount);
                }
              }}
            />
          </div>
        )}

        {/* Recently Viewed Pieces */}
        {product && (
          <div className="mt-16">
            <RecentlyViewedSection currentProductId={product.id} />
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif font-black text-brand-dark tracking-tight">
                  You May Also Like
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  More popular styles you might like
                </p>
              </div>
              <Link to="/shop" className="text-xs font-bold text-brand-accent hover:underline">
                View all styles &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => {
                const relPrice = Number(rel.basePrice || rel.price || 0);
                return (
                  <Link
                    key={rel.id}
                    to={`/product/${rel.id}`}
                    className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
                      <ProductImage
                        src={rel.image || rel.images?.[0] || rel.thumbnail || getProductImage(rel)}
                        alt={rel.name}
                        category={rel.category}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/95 text-neutral-800 shadow-2xs">
                        {rel.category}
                      </span>
                      <div className="absolute bottom-2.5 left-2.5 text-xs font-bold text-brand-dark bg-white/95 px-2 py-0.5 rounded shadow-2xs">
                        ₹{relPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="font-bold text-xs text-neutral-900 group-hover:text-brand-accent transition-colors line-clamp-1">
                        {rel.name}
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1">
                        {rel.shortDescription || rel.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
