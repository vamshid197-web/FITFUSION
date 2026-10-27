import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import SavedDesignCard from '../../components/customization/SavedDesignCard.jsx';
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
    if (!window.confirm('Are you sure you want to remove this saved custom design?')) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteSavedCustomization(id);
      setDesigns((prev) => prev.filter((d) => d.id !== id));
      setFeedback({ type: 'success', message: 'Design removed successfully.' });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to remove design. Please try again.' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (design) => {
    navigate(`/customize/${design.productId || '1'}`, {
      state: {
        editConfig: {
          ...design.customization,
          price: design.totalPrice || design.price,
          savedDesignId: design.id
        },
        initialStep: 1
      }
    });
  };

  const handleAddToCart = (design) => {
    const cust = design.customization || {};
    const price = Number(design.totalPrice || design.price || 0);

    const cartItem = {
      id: `cart-saved-${design.id}-${Date.now()}`,
      productId: design.productId,
      productName: design.productName,
      category: cust.category || 'Custom Apparel',
      productImage: design.productImage || cust.productImage || null,
      basePrice: price,
      selectedFabric: cust.fabric,
      fabric: cust.fabric,
      selectedColor: cust.color,
      color: cust.color,
      selectedDesign: cust.design || {},
      collar: cust.design?.collar,
      cuff: cust.design?.cuff,
      buttons: cust.buttons?.name || cust.design?.buttons,
      size: design.size || cust.size || 'M',
      customMeasurements: design.customMeasurements || cust.measurements || {},
      measurementUnit: cust.measurementUnit || 'in',
      fit: design.fit || cust.fit || 'Regular',
      itemPrice: price,
      totalItemPrice: price,
      quantity: 1,
      customization: cust,
      addedAt: new Date().toISOString()
    };

    addToCart(cartItem);
    setFeedback({
      type: 'success',
      message: `"${design.productName}" added to your bag!`
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="py-8 sm:py-12 bg-neutral-50/50 min-h-screen">
      <PageContainer>
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-neutral-200 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1.5">
              <Link to="/home" className="hover:text-brand-dark transition-colors">Home</Link>
              <span>/</span>
              <Link to="/profile" className="hover:text-brand-dark transition-colors">Account</Link>
              <span>/</span>
              <span className="text-brand-accent font-semibold">My Designs</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
                My Designs
              </h1>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-accentLight text-brand-accent border border-brand-accent/20">
                {designs.length} {designs.length === 1 ? 'Design' : 'Designs'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Your saved custom clothing configurations, fabrics, and tailored measurements.
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
            className={`p-4 rounded-xl mb-6 text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{feedback.type === 'success' ? '✓' : '⚠️'}</span>
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
            <p className="text-xs text-neutral-500 font-medium">Loading your saved designs...</p>
          </div>
        ) : designs.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-neutral-200 p-10 sm:p-16 text-center shadow-xs space-y-5 max-w-xl mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-3xl">
              🎨
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-brand-dark">
                No Saved Custom Designs Yet
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                When customizing garments in our studio, click "Save Design" to save your choices here for quick editing and reordering.
              </p>
            </div>
            <div className="pt-2">
              <Button to="/shop" variant="secondary" size="md">
                Browse Collection &rarr;
              </Button>
            </div>
          </div>
        ) : (
          /* Designs Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <SavedDesignCard
                key={design.id}
                design={design}
                onEdit={handleEdit}
                onAddToCart={handleAddToCart}
                onDelete={handleDelete}
                isDeleting={deletingId === design.id}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
