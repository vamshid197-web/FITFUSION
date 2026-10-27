import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from '../common/ProductImage.jsx';
import { getProductImage } from '../../data/mockProducts.js';
import { useCart } from '../../context/CartContext.jsx';
import { getCompleteTheLookRecommendations } from '../../services/recommendationService.js';

export default function CompleteTheLookSection({ currentProduct, allProducts }) {
  const { addToCart } = useCart();
  const [addedNotice, setAddedNotice] = useState('');

  if (!currentProduct) return null;

  const recommendations = getCompleteTheLookRecommendations(currentProduct, allProducts);
  if (!recommendations || recommendations.length === 0) return null;

  const handleAddSingleToBag = (product) => {
    const basePrice = Number(product.basePrice || product.price || 0);
    const resolvedImg = product.image || product.images?.[0] || product.thumbnail || getProductImage(product);
    const fabricObj = product.availableFabrics?.[0] || { name: 'Standard Fabric', composition: '100% Cotton' };
    const colorObj = product.availableColors?.[0] || { name: 'Natural', hex: '#1F2937' };

    const cartItem = {
      id: `cart-${product.id}-${Date.now()}`,
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
    setAddedNotice(`"${product.name}" added to bag.`);
    setTimeout(() => setAddedNotice(''), 3500);
  };

  const handleAddAllToBag = () => {
    let count = 0;
    recommendations.forEach((product, idx) => {
      const basePrice = Number(product.basePrice || product.price || 0);
      const resolvedImg = product.image || product.images?.[0] || product.thumbnail || getProductImage(product);
      const fabricObj = product.availableFabrics?.[0] || { name: 'Standard Fabric', composition: '100% Cotton' };
      const colorObj = product.availableColors?.[0] || { name: 'Natural', hex: '#1F2937' };

      const cartItem = {
        id: `cart-bundle-${product.id}-${Date.now()}-${idx}`,
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
      count++;
    });

    setAddedNotice(`Added all ${count} recommended items to your bag!`);
    setTimeout(() => setAddedNotice(''), 3500);
  };

  const bundleTotal = recommendations.reduce(
    (sum, p) => sum + Number(p.basePrice || p.price || 0),
    0
  );

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header with Title and Add All button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
            Style Pairing
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-brand-dark tracking-tight mt-0.5">
            Complete the Look
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Carefully curated items from our collection that pair naturally with this {currentProduct.name}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-neutral-400 block font-medium">Bundle Price</span>
            <span className="text-sm font-extrabold text-brand-dark font-mono">
              ₹{bundleTotal.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddAllToBag}
            className="px-4 py-2 bg-brand-dark hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>🛍️</span>
            <span>Add All to Bag</span>
          </button>
        </div>
      </div>

      {/* Added to Bag Toast Notification */}
      {addedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>{addedNotice}</span>
          </div>
          <Link to="/cart" className="font-bold underline text-brand-dark hover:text-brand-accent ml-2">
            View Bag &rarr;
          </Link>
        </div>
      )}

      {/* Grid of Recommended Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {recommendations.map((rec) => {
          const recPrice = Number(rec.basePrice || rec.price || 0);
          const recImg = rec.image || rec.images?.[0] || rec.thumbnail || getProductImage(rec);

          return (
            <div
              key={rec.id}
              className="bg-neutral-50/60 rounded-xl border border-neutral-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
            >
              {/* Product Image */}
              <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
                <ProductImage
                  productId={rec.id}
                  src={recImg}
                  alt={rec.name}
                  category={rec.category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/95 text-neutral-800 shadow-2xs">
                  {rec.category}
                </span>
                <div className="absolute bottom-2.5 left-2.5 text-xs font-bold text-brand-dark bg-white/95 px-2 py-0.5 rounded shadow-2xs">
                  ₹{recPrice.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Product Info & Actions */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-brand-dark line-clamp-1">
                    {rec.name}
                  </h3>
                  <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                    {rec.shortDescription || rec.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-200/60">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/product/${rec.id}`}
                      className="py-1.5 px-3 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-semibold text-center transition"
                    >
                      View
                    </Link>

                    {rec.customizationEnabled !== false ? (
                      <Link
                        to={`/customize/${rec.id}`}
                        className="py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-semibold text-center transition"
                      >
                        Customize
                      </Link>
                    ) : (
                      <Link
                        to={`/product/${rec.id}`}
                        className="py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-semibold text-center transition"
                      >
                        Details
                      </Link>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddSingleToBag(rec)}
                    className="w-full py-1.5 px-3 rounded-lg border border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>+ Add to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
