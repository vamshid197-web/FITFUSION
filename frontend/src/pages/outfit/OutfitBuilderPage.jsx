import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import ProductImage from '../../components/common/ProductImage.jsx';
import { MOCK_PRODUCTS, getProductImage } from '../../data/mockProducts.js';
import { useCart } from '../../context/CartContext.jsx';

export default function OutfitBuilderPage() {
  const { addToCart } = useCart();

  // Outfit slots state
  const [selectedTop, setSelectedTop] = useState(() => {
    return MOCK_PRODUCTS.find((p) => p.category === 'Shirts') || null;
  });
  const [selectedBottom, setSelectedBottom] = useState(() => {
    return MOCK_PRODUCTS.find((p) => p.category === 'Jeans & Pants') || null;
  });
  const [selectedLayer, setSelectedLayer] = useState(() => {
    return MOCK_PRODUCTS.find((p) => p.category === 'Jackets') || null;
  });

  // Active step / picker tab ('top' | 'bottom' | 'layer')
  const [activeSlot, setActiveSlot] = useState('top');
  const [topSubFilter, setTopSubFilter] = useState('All');
  const [cartNotice, setCartNotice] = useState('');

  // Top products filtered by subcategory
  const topProducts = React.useMemo(() => {
    const tops = MOCK_PRODUCTS.filter((p) =>
      ['T-Shirts', 'Shirts', 'Hoodies', 'Traditional Wear'].includes(p.category)
    );
    if (topSubFilter === 'T-Shirt') return tops.filter((p) => p.category === 'T-Shirts');
    if (topSubFilter === 'Shirt') return tops.filter((p) => p.category === 'Shirts');
    if (topSubFilter === 'Hoodie') return tops.filter((p) => p.category === 'Hoodies');
    if (topSubFilter === 'Kurta') return tops.filter((p) => p.category === 'Traditional Wear');
    return tops;
  }, [topSubFilter]);

  // Bottom products
  const bottomProducts = React.useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => p.category === 'Jeans & Pants');
  }, []);

  // Layer products (Jackets / Blazers)
  const layerProducts = React.useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => p.category === 'Jackets');
  }, []);

  // Helper to add single item to bag
  const handleAddSingleToBag = (product) => {
    if (!product) return;
    const basePrice = Number(product.basePrice || product.price || 0);
    const resolvedImg = product.image || product.images?.[0] || product.thumbnail || getProductImage(product);
    const fabricObj = product.availableFabrics?.[0] || { name: 'Standard Fabric', composition: '100% Cotton' };
    const colorObj = product.availableColors?.[0] || { name: 'Natural', hex: '#1F2937' };

    const cartItem = {
      id: `cart-outfit-${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      category: product.category || 'Apparel',
      productImage: resolvedImg,
      image: resolvedImg,
      basePrice,
      selectedFabric: fabricObj,
      fabric: fabricObj,
      selectedColor: colorObj,
      color: colorObj,
      size: product.availableSizes?.[0] || 'M',
      fit: 'Regular',
      itemPrice: basePrice,
      totalItemPrice: basePrice,
      quantity: 1,
      addedAt: new Date().toISOString()
    };

    addToCart(cartItem);
    setCartNotice(`"${product.name}" added to bag.`);
    setTimeout(() => setCartNotice(''), 3500);
  };

  // Helper to add all available outfit items to bag
  const handleAddAllToBag = () => {
    const items = [selectedTop, selectedBottom, selectedLayer].filter(Boolean);
    if (items.length === 0) return;

    items.forEach((product, idx) => {
      const basePrice = Number(product.basePrice || product.price || 0);
      const resolvedImg = product.image || product.images?.[0] || product.thumbnail || getProductImage(product);
      const fabricObj = product.availableFabrics?.[0] || { name: 'Standard Fabric', composition: '100% Cotton' };
      const colorObj = product.availableColors?.[0] || { name: 'Natural', hex: '#1F2937' };

      const cartItem = {
        id: `cart-outfit-${product.id}-${Date.now()}-${idx}`,
        productId: product.id,
        productName: product.name,
        category: product.category || 'Apparel',
        productImage: resolvedImg,
        image: resolvedImg,
        basePrice,
        selectedFabric: fabricObj,
        fabric: fabricObj,
        selectedColor: colorObj,
        color: colorObj,
        size: product.availableSizes?.[0] || 'M',
        fit: 'Regular',
        itemPrice: basePrice,
        totalItemPrice: basePrice,
        quantity: 1,
        addedAt: new Date().toISOString()
      };
      addToCart(cartItem);
    });

    setCartNotice(`Added ${items.length} outfit items to your bag!`);
    setTimeout(() => setCartNotice(''), 3500);
  };

  // Total price calculation
  const topPrice = selectedTop ? Number(selectedTop.basePrice || selectedTop.price || 0) : 0;
  const bottomPrice = selectedBottom ? Number(selectedBottom.basePrice || selectedBottom.price || 0) : 0;
  const layerPrice = selectedLayer ? Number(selectedLayer.basePrice || selectedLayer.price || 0) : 0;
  const totalPrice = topPrice + bottomPrice + layerPrice;

  // Selected items list
  const selectedItems = [
    { label: 'Top', product: selectedTop, onRemove: () => setSelectedTop(null) },
    { label: 'Bottom', product: selectedBottom, onRemove: () => setSelectedBottom(null) },
    { label: 'Layer', product: selectedLayer, onRemove: () => setSelectedLayer(null) }
  ];

  return (
    <div className="py-6 sm:py-10 bg-neutral-50/50 min-h-screen space-y-8 sm:space-y-10">
      <PageContainer>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-2 text-xs text-neutral-500">
            <li>
              <Link to="/home" className="hover:text-brand-dark transition-colors">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-neutral-800 font-semibold" aria-current="page">Outfit Builder</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="bg-brand-dark text-white rounded-2xl p-6 sm:p-8 shadow-md border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
              Outfit Builder
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Build an Outfit
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Create a complete outfit from FITFUSION products. Mix and match tops, bottoms, and jackets to build your signature look.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddAllToBag}
              disabled={!selectedTop && !selectedBottom && !selectedLayer}
              className="py-3 px-6 bg-brand-accent hover:bg-brand-accentHover text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>🛍️</span>
              <span>Add All to Bag &bull; ₹{totalPrice.toLocaleString('en-IN')}</span>
            </button>
          </div>
        </div>
      </PageContainer>

      {/* Cart Feedback Notification */}
      {cartNotice && (
        <PageContainer>
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>{cartNotice}</span>
            </div>
            <Link to="/cart" className="font-bold underline text-brand-dark hover:text-brand-accent ml-2">
              View Bag &rarr;
            </Link>
          </div>
        </PageContainer>
      )}

      {/* "YOUR OUTFIT" VISUAL SHOWCASE */}
      <PageContainer>
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                <span>✨</span> Your Outfit
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Review your selected combination or change pieces below.
              </p>
            </div>

            {/* Price breakdown pill */}
            <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-700">
              {selectedTop && (
                <span>
                  {selectedTop.category}: <strong className="text-brand-dark">₹{topPrice.toLocaleString('en-IN')}</strong>
                </span>
              )}
              {selectedBottom && (
                <span>
                  Bottom: <strong className="text-brand-dark">₹{bottomPrice.toLocaleString('en-IN')}</strong>
                </span>
              )}
              {selectedLayer && (
                <span>
                  Layer: <strong className="text-brand-dark">₹{layerPrice.toLocaleString('en-IN')}</strong>
                </span>
              )}
              <span className="text-sm font-extrabold text-brand-dark border-l border-neutral-300 pl-4 font-mono">
                Total: ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* 3 Outfit Visual Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. TOP */}
            <div
              className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                activeSlot === 'top'
                  ? 'border-brand-accent ring-2 ring-brand-accent/20 bg-brand-accent/5'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                    1. TOP
                  </span>
                  {selectedTop && (
                    <button
                      type="button"
                      onClick={() => setSelectedTop(null)}
                      className="text-[11px] text-neutral-400 hover:text-rose-600 font-semibold transition"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {selectedTop ? (
                  <div className="space-y-3">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 relative">
                      <ProductImage
                        productId={selectedTop.id}
                        src={selectedTop.image || selectedTop.images?.[0] || getProductImage(selectedTop)}
                        alt={selectedTop.name}
                        category={selectedTop.category}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-white/90 text-neutral-800 shadow-2xs">
                        {selectedTop.category}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-brand-dark line-clamp-1">
                        {selectedTop.name}
                      </h3>
                      <p className="text-xs font-extrabold text-neutral-900 font-mono mt-0.5">
                        ₹{topPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setActiveSlot('top')}
                    className="aspect-[4/3] rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-neutral-100 transition"
                  >
                    <span className="text-2xl mb-1">👕</span>
                    <span className="text-xs font-bold text-neutral-700">Choose a Top</span>
                    <span className="text-[11px] text-neutral-400 mt-0.5">T-Shirt, Shirt, Hoodie, or Kurta</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-100 mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveSlot('top')}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition text-center ${
                    activeSlot === 'top'
                      ? 'bg-brand-dark text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {selectedTop ? 'Change Top' : 'Select Top'}
                </button>

                {selectedTop && (
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <Link
                      to={`/product/${selectedTop.id}`}
                      className="py-1 px-2 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-[11px] font-semibold text-center"
                    >
                      View
                    </Link>
                    <Link
                      to={`/customize/${selectedTop.id}`}
                      className="py-1 px-2 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-[11px] font-semibold text-center"
                    >
                      Customize
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleAddSingleToBag(selectedTop)}
                      className="py-1 px-2 rounded bg-neutral-800 hover:bg-neutral-900 text-white text-[11px] font-semibold text-center"
                    >
                      + Bag
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. BOTTOM */}
            <div
              className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                activeSlot === 'bottom'
                  ? 'border-brand-accent ring-2 ring-brand-accent/20 bg-brand-accent/5'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                    2. BOTTOM
                  </span>
                  {selectedBottom && (
                    <button
                      type="button"
                      onClick={() => setSelectedBottom(null)}
                      className="text-[11px] text-neutral-400 hover:text-rose-600 font-semibold transition"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {selectedBottom ? (
                  <div className="space-y-3">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 relative">
                      <ProductImage
                        productId={selectedBottom.id}
                        src={selectedBottom.image || selectedBottom.images?.[0] || getProductImage(selectedBottom)}
                        alt={selectedBottom.name}
                        category={selectedBottom.category}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-white/90 text-neutral-800 shadow-2xs">
                        {selectedBottom.category}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-brand-dark line-clamp-1">
                        {selectedBottom.name}
                      </h3>
                      <p className="text-xs font-extrabold text-neutral-900 font-mono mt-0.5">
                        ₹{bottomPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setActiveSlot('bottom')}
                    className="aspect-[4/3] rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-neutral-100 transition"
                  >
                    <span className="text-2xl mb-1">👖</span>
                    <span className="text-xs font-bold text-neutral-700">Choose Bottom</span>
                    <span className="text-[11px] text-neutral-400 mt-0.5">Jeans, Chinos, & Trousers</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-100 mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveSlot('bottom')}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition text-center ${
                    activeSlot === 'bottom'
                      ? 'bg-brand-dark text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {selectedBottom ? 'Change Bottom' : 'Select Bottom'}
                </button>

                {selectedBottom && (
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <Link
                      to={`/product/${selectedBottom.id}`}
                      className="py-1 px-2 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-[11px] font-semibold text-center"
                    >
                      View
                    </Link>
                    <Link
                      to={`/customize/${selectedBottom.id}`}
                      className="py-1 px-2 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-[11px] font-semibold text-center"
                    >
                      Customize
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleAddSingleToBag(selectedBottom)}
                      className="py-1 px-2 rounded bg-neutral-800 hover:bg-neutral-900 text-white text-[11px] font-semibold text-center"
                    >
                      + Bag
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. OPTIONAL LAYER */}
            <div
              className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                activeSlot === 'layer'
                  ? 'border-brand-accent ring-2 ring-brand-accent/20 bg-brand-accent/5'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                    3. LAYER (OPTIONAL)
                  </span>
                  {selectedLayer && (
                    <button
                      type="button"
                      onClick={() => setSelectedLayer(null)}
                      className="text-[11px] text-neutral-400 hover:text-rose-600 font-semibold transition"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {selectedLayer ? (
                  <div className="space-y-3">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 relative">
                      <ProductImage
                        productId={selectedLayer.id}
                        src={selectedLayer.image || selectedLayer.images?.[0] || getProductImage(selectedLayer)}
                        alt={selectedLayer.name}
                        category={selectedLayer.category}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-white/90 text-neutral-800 shadow-2xs">
                        {selectedLayer.category}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-brand-dark line-clamp-1">
                        {selectedLayer.name}
                      </h3>
                      <p className="text-xs font-extrabold text-neutral-900 font-mono mt-0.5">
                        ₹{layerPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setActiveSlot('layer')}
                    className="aspect-[4/3] rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-neutral-100 transition"
                  >
                    <span className="text-2xl mb-1">🧥</span>
                    <span className="text-xs font-bold text-neutral-700">Choose a Layer</span>
                    <span className="text-[11px] text-neutral-400 mt-0.5">Jacket, Blazer, or Coat</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-100 mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveSlot('layer')}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition text-center ${
                    activeSlot === 'layer'
                      ? 'bg-brand-dark text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {selectedLayer ? 'Change Layer' : 'Select Layer'}
                </button>

                {selectedLayer && (
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <Link
                      to={`/product/${selectedLayer.id}`}
                      className="py-1 px-2 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-[11px] font-semibold text-center"
                    >
                      View
                    </Link>
                    <Link
                      to={`/customize/${selectedLayer.id}`}
                      className="py-1 px-2 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-[11px] font-semibold text-center"
                    >
                      Customize
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleAddSingleToBag(selectedLayer)}
                      className="py-1 px-2 rounded bg-neutral-800 hover:bg-neutral-900 text-white text-[11px] font-semibold text-center"
                    >
                      + Bag
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* CATALOG SELECTION PANEL */}
      <PageContainer>
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Slot Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSlot('top')}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition ${
                  activeSlot === 'top'
                    ? 'bg-brand-dark text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                1. Select Top ({topProducts.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveSlot('bottom')}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition ${
                  activeSlot === 'bottom'
                    ? 'bg-brand-dark text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                2. Select Bottom ({bottomProducts.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveSlot('layer')}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition ${
                  activeSlot === 'layer'
                    ? 'bg-brand-dark text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                3. Select Layer ({layerProducts.length})
              </button>
            </div>

            {/* Sub-filters if Top is active */}
            {activeSlot === 'top' && (
              <div className="flex flex-wrap items-center gap-1.5">
                {['All', 'T-Shirt', 'Shirt', 'Hoodie', 'Kurta'].map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setTopSubFilter(sub)}
                    className={`py-1 px-2.5 rounded-lg text-xs font-semibold border transition ${
                      topSubFilter === sub
                        ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {(activeSlot === 'top'
              ? topProducts
              : activeSlot === 'bottom'
              ? bottomProducts
              : layerProducts
            ).map((product) => {
              const price = Number(product.basePrice || product.price || 0);
              const imgUrl = product.image || product.images?.[0] || product.thumbnail || getProductImage(product);
              const isSelected =
                (activeSlot === 'top' && selectedTop?.id === product.id) ||
                (activeSlot === 'bottom' && selectedBottom?.id === product.id) ||
                (activeSlot === 'layer' && selectedLayer?.id === product.id);

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-xl border overflow-hidden flex flex-col justify-between group transition-all ${
                    isSelected
                      ? 'border-brand-dark ring-2 ring-brand-dark shadow-md'
                      : 'border-neutral-200 hover:border-neutral-400 hover:shadow-sm'
                  }`}
                >
                  <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
                    <ProductImage
                      productId={product.id}
                      src={imgUrl}
                      alt={product.name}
                      category={product.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-white/95 text-neutral-800 shadow-2xs">
                      {product.category}
                    </span>
                    <span className="absolute bottom-2 left-2 text-xs font-bold text-brand-dark bg-white/95 px-2 py-0.5 rounded shadow-2xs">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-brand-dark line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                        {product.shortDescription || product.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => {
                          if (activeSlot === 'top') setSelectedTop(product);
                          else if (activeSlot === 'bottom') setSelectedBottom(product);
                          else setSelectedLayer(product);
                        }}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition text-center cursor-pointer ${
                          isSelected
                            ? 'bg-brand-dark text-white'
                            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                        }`}
                      >
                        {isSelected ? '✓ In Outfit' : `Select as ${activeSlot === 'top' ? 'Top' : activeSlot === 'bottom' ? 'Bottom' : 'Layer'}`}
                      </button>

                      <div className="grid grid-cols-2 gap-1.5">
                        <Link
                          to={`/product/${product.id}`}
                          className="py-1 px-2 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-[10px] font-semibold text-center"
                        >
                          View
                        </Link>
                        <Link
                          to={`/customize/${product.id}`}
                          className="py-1 px-2 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-[10px] font-semibold text-center"
                        >
                          Customize
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
