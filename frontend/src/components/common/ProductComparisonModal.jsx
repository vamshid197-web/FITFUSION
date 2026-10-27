import React from 'react';
import { Link } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import { getProductImage } from '../../data/mockProducts.js';
import { useCompare } from '../../context/CompareContext.jsx';

export default function ProductComparisonModal() {
  const { comparedProducts, removeFromCompare, clearCompare, isModalOpen, setIsModalOpen } = useCompare();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-modal-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div>
            <h3 id="compare-modal-title" className="text-base sm:text-lg font-bold text-brand-dark">
              Compare Products
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Side-by-side comparison ({comparedProducts.length} of 3 selected)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {comparedProducts.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="text-xs text-neutral-500 hover:text-rose-600 font-semibold px-2 py-1 rounded transition"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-x-auto overflow-y-auto flex-1">
          {comparedProducts.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 space-y-3">
              <span className="text-3xl block">⚖️</span>
              <p className="text-sm font-semibold">No products selected for comparison.</p>
              <p className="text-xs text-neutral-400">
                Click "Compare" on any product card in the catalog to add items here.
              </p>
            </div>
          ) : (
            <div className="min-w-[600px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-neutral-400 w-36 border-b border-neutral-200">
                      Attribute
                    </th>
                    {comparedProducts.map((p) => {
                      const imgUrl = p.image || p.images?.[0] || p.thumbnail || getProductImage(p);
                      return (
                        <th
                          key={p.id}
                          className="p-3 border-b border-neutral-200 align-top w-64 bg-neutral-50/30 rounded-t-xl"
                        >
                          <div className="space-y-2">
                            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 relative border border-neutral-200/70">
                              <ProductImage
                                productId={p.id}
                                src={imgUrl}
                                alt={p.name}
                                category={p.category}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeFromCompare(p.id)}
                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 hover:bg-white text-neutral-600 hover:text-rose-600 flex items-center justify-center text-xs font-bold shadow-xs transition"
                                title="Remove item"
                              >
                                ✕
                              </button>
                            </div>
                            <h4 className="font-bold text-xs sm:text-sm text-brand-dark line-clamp-2">
                              {p.name}
                            </h4>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100 text-xs">
                  {/* Price */}
                  <tr>
                    <td className="p-3 font-bold text-neutral-500">Price</td>
                    {comparedProducts.map((p) => {
                      const price = Number(p.basePrice || p.price || 0);
                      return (
                        <td key={p.id} className="p-3 font-extrabold text-brand-dark text-sm font-mono">
                          ₹{price.toLocaleString('en-IN')}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Category */}
                  <tr>
                    <td className="p-3 font-bold text-neutral-500">Category</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-3 text-neutral-800">
                        {p.category || 'Apparel'}
                      </td>
                    ))}
                  </tr>

                  {/* Fabric */}
                  <tr>
                    <td className="p-3 font-bold text-neutral-500">Fabric</td>
                    {comparedProducts.map((p) => {
                      const fabric = p.availableFabrics?.[0]?.name || p.fabric || 'Cotton';
                      return (
                        <td key={p.id} className="p-3 text-neutral-800">
                          {fabric}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Material */}
                  <tr>
                    <td className="p-3 font-bold text-neutral-500">Material</td>
                    {comparedProducts.map((p) => {
                      const material = p.availableFabrics?.[0]?.composition || p.material || 'Standard Milled';
                      return (
                        <td key={p.id} className="p-3 text-neutral-800">
                          {material}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Fit */}
                  <tr>
                    <td className="p-3 font-bold text-neutral-500">Fit</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-3 text-neutral-800">
                        {p.fit || 'Regular'}
                      </td>
                    ))}
                  </tr>

                  {/* Available Colors */}
                  <tr>
                    <td className="p-3 font-bold text-neutral-500">Available Colors</td>
                    {comparedProducts.map((p) => {
                      const colors = p.availableColors || [];
                      return (
                        <td key={p.id} className="p-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {colors.map((c, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-100 text-[10px] text-neutral-700"
                              >
                                {c.hex && (
                                  <span
                                    className="w-2 h-2 rounded-full border border-neutral-300"
                                    style={{ backgroundColor: c.hex }}
                                  />
                                )}
                                <span>{c.name}</span>
                              </span>
                            ))}
                            {colors.length === 0 && <span className="text-neutral-400">Standard</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Customization Available */}
                  <tr>
                    <td className="p-3 font-bold text-neutral-500">Customization</td>
                    {comparedProducts.map((p) => {
                      const isCustom = p.customizationEnabled !== false;
                      return (
                        <td key={p.id} className="p-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              isCustom
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {isCustom ? 'Yes' : 'No'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Rating if available */}
                  <tr>
                    <td className="p-3 font-bold text-neutral-500">Rating</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-3 text-neutral-800">
                        {p.rating ? (
                          <div className="flex items-center gap-1 font-semibold text-amber-800">
                            <span>★</span>
                            <span>{p.rating}</span>
                            {p.reviewsCount && (
                              <span className="text-[10px] text-neutral-400">
                                ({p.reviewsCount} reviews)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400">Not rated</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Description */}
                  <tr>
                    <td className="p-3 font-bold text-neutral-500">Description</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-3 text-neutral-600 text-[11px] leading-relaxed">
                        {p.shortDescription || p.description}
                      </td>
                    ))}
                  </tr>

                  {/* Action Buttons Row */}
                  <tr>
                    <td className="p-3 font-bold text-neutral-500">Actions</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-3">
                        <div className="space-y-1.5">
                          <Link
                            to={`/product/${p.id}`}
                            onClick={() => setIsModalOpen(false)}
                            className="block text-center py-1.5 px-3 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold transition"
                          >
                            View Product
                          </Link>

                          {p.customizationEnabled !== false ? (
                            <Link
                              to={`/customize/${p.id}`}
                              onClick={() => setIsModalOpen(false)}
                              className="block text-center py-1.5 px-3 rounded-lg bg-brand-dark hover:bg-black text-white text-xs font-bold transition shadow-2xs"
                            >
                              Customize
                            </Link>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => removeFromCompare(p.id)}
                            className="w-full text-center py-1 text-[11px] text-neutral-400 hover:text-rose-600 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
