import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import CustomizationSummary from '../../components/customization/CustomizationSummary.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import {
  getUserSavedCustomizations,
  deleteSavedCustomization
} from '../../services/savedCustomizationService.js';

export default function SavedDesignsPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadSavedDesigns();
  }, [user]);

  const loadSavedDesigns = async () => {
    setLoading(true);
    try {
      const data = await getUserSavedCustomizations(user?.uid || 'anonymous');
      setDesigns(data);
    } catch (err) {
      console.error('Failed to load saved customizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this bespoke design from your atelier vault?')) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteSavedCustomization(id);
      setDesigns((prev) => prev.filter((d) => d.id !== id));
      setFeedback({ type: 'success', message: 'Design removed from saved atelier collection.' });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to remove design. Please try again.' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (design) => {
    navigate(`/customize/${design.productId || 'p1'}`, {
      state: {
        editConfig: {
          ...design.customization,
          price: design.price,
          savedDesignId: design.id
        },
        initialStep: 1
      }
    });
  };

  const handleAddToCart = (design) => {
    const cust = design.customization || {};
    const cartItem = {
      id: `cart-saved-${design.id}-${Date.now()}`,
      productId: design.productId,
      productName: design.productName,
      category: cust.category || 'Custom Apparel',
      productImage: cust.productImage || null,
      silhouetteColor: cust.silhouetteColor || 'from-stone-800 to-neutral-900',
      basePrice: cust.basePrice || design.price,
      selectedFabric: cust.fabric,
      selectedColor: cust.color,
      selectedDesign: cust.design || {},
      collar: cust.design?.collar,
      cuff: cust.design?.cuff,
      buttons: cust.buttons?.name || cust.design?.buttons,
      monogram: cust.monogram?.text || cust.design?.monogram,
      size: cust.size || 'M',
      customMeasurements: cust.measurements || {},
      measurementUnit: cust.measurementUnit || 'in',
      fit: cust.fit || 'Regular',
      selectedPerfume: cust.perfume || null,
      perfumePrice: cust.perfume?.price || 0,
      itemPrice: design.price,
      totalItemPrice: design.price,
      quantity: 1,
      customization: cust,
      addedAt: new Date().toISOString()
    };

    addToCart(cartItem);
    setFeedback({
      type: 'success',
      message: `"${design.designName || design.productName}" added to your bag!`
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  const formatPrice = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  const formatDate = (iso) => {
    if (!iso) return 'Recent';
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-brand-cream min-h-screen">
      <PageContainer>
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-neutral-200 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1.5">
              <Link to="/home" className="hover:text-brand-dark transition-colors">Home</Link>
              <span>/</span>
              <Link to="/profile" className="hover:text-brand-dark transition-colors">Account</Link>
              <span>/</span>
              <span className="text-brand-accent font-semibold">Saved Designs</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
                Bespoke Design Vault
              </h1>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-accentLight text-brand-accent border border-brand-accent/20">
                {designs.length} {designs.length === 1 ? 'Design' : 'Designs'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Your personalized clothing blueprints, textiles, monograms, and custom tailor specifications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button to="/shop" variant="secondary" size="sm" className="text-xs">
              + New Custom Design
            </Button>
          </div>
        </div>

        {/* Status Toast */}
        {feedback && (
          <div
            className={`p-4 rounded-xl mb-6 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{feedback.type === 'success' ? '✨' : '⚠️'}</span>
              <span>{feedback.message}</span>
            </div>
            {feedback.type === 'success' && (
              <Link to="/cart" className="underline font-bold hover:text-emerald-900 ml-4">
                View Bag &rarr;
              </Link>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-neutral-500 font-medium">Opening your bespoke atelier vault...</p>
          </div>
        ) : designs.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-neutral-200 p-10 sm:p-16 text-center shadow-sm space-y-6 max-w-xl mx-auto">
            <div className="w-20 h-20 mx-auto rounded-full bg-brand-accentLight border border-brand-accent/30 flex items-center justify-center text-3xl">
              📐
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                Vault Empty
              </span>
              <h2 className="text-2xl font-bold text-brand-dark">
                No Saved Custom Designs Yet
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                When customizing garments in our studio, you can save your tailored specifications, fabric choices, and monograms here for easy reordering and future styling.
              </p>
            </div>
            <div className="pt-2">
              <Button to="/shop" variant="secondary" size="md">
                Browse Apparel Collection &rarr;
              </Button>
            </div>
          </div>
        ) : (
          /* Designs Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => {
              const cust = design.customization || {};
              const colorVal = cust.color?.value || cust.color?.hex || '#1F2937';

              return (
                <div
                  key={design.id}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  {/* Card Header & Swatch preview */}
                  <div className="p-5 border-b border-neutral-100 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                          <span>Saved on {formatDate(design.createdAt)}</span>
                        </div>
                        <h3 className="font-extrabold text-base text-brand-dark mt-0.5 line-clamp-1">
                          {design.designName || design.productName}
                        </h3>
                        <span className="text-xs text-neutral-500 font-medium">
                          {design.productName}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-brand-dark block">
                          {formatPrice(design.price)}
                        </span>
                        <span className="text-[10px] text-neutral-400 block uppercase">
                          Tailored Spec
                        </span>
                      </div>
                    </div>

                    {/* Visual Color & Fabric Pill */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs">
                        <span
                          className="w-3 h-3 rounded-full border border-neutral-400 shrink-0"
                          style={{ backgroundColor: colorVal }}
                        />
                        <span className="font-medium text-neutral-700 truncate max-w-[100px]">
                          {cust.color?.name || 'Classic'}
                        </span>
                      </div>
                      <div className="px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs text-neutral-700 font-medium truncate">
                        {cust.fabric?.name || 'Cotton'}
                      </div>
                      <div className="px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs text-neutral-700 font-medium">
                        {cust.fit || 'Regular'} Fit
                      </div>
                    </div>
                  </div>

                  {/* Summary Component Body */}
                  <div className="p-5 flex-1 bg-neutral-950">
                    <CustomizationSummary
                      product={{ name: design.productName }}
                      customization={cust}
                      price={design.price}
                      compact={true}
                      showPricing={false}
                    />
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(design.id)}
                      disabled={deletingId === design.id}
                      className="text-xs text-neutral-500 hover:text-red-600 font-medium transition px-2 py-1.5 rounded hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === design.id ? 'Deleting...' : 'Delete'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(design)}
                        className="px-3 py-1.5 text-xs font-bold text-neutral-700 hover:text-brand-dark bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition shadow-xs"
                      >
                        Customize &rarr;
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(design)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-brand-dark hover:bg-black rounded-lg transition shadow-xs"
                      >
                        Add to Bag
                      </button>
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
