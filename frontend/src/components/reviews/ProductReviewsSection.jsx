import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import StarRating from '../common/StarRating.jsx';
import Button from '../common/Button.jsx';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  calculateProductRatingStats,
  verifyCustomerPurchase
} from '../../services/reviewService.js';

export default function ProductReviewsSection({
  productId,
  productName = 'Bespoke Garment',
  baseRating = 4.8,
  baseReviewsCount = 0,
  onRatingCalculated
}) {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'highest' | 'lowest'

  // Purchase verification state for current user
  const [purchaseStatus, setPurchaseStatus] = useState({ isVerified: false, orderId: null });

  // Review Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: '' }

  // Form Fields
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  // Load reviews and check purchase
  const loadReviews = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const list = await getProductReviews(productId);
      setReviews(list);

      const stats = calculateProductRatingStats(list);
      if (onRatingCalculated) {
        onRatingCalculated(stats.totalReviews > 0 ? stats.averageRating : baseRating, stats.totalReviews || baseReviewsCount);
      }
    } catch (err) {
      console.warn('[ProductReviewsSection] Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  // Check if current user made a verified purchase
  useEffect(() => {
    async function checkVerification() {
      if (user?.uid && productId) {
        const res = await verifyCustomerPurchase(user.uid, productId);
        setPurchaseStatus(res);
      } else {
        setPurchaseStatus({ isVerified: false, orderId: null });
      }
    }
    checkVerification();
  }, [user?.uid, productId]);

  // Check if current user has already submitted a review
  const myReview = useMemo(() => {
    if (!user?.uid) return null;
    return reviews.find((r) => r.userId === user.uid) || null;
  }, [reviews, user?.uid]);

  // Compute live rating statistics
  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return {
        averageRating: Number(baseRating || 4.8),
        totalReviews: Number(baseReviewsCount || 0),
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        percentages: { 5: 80, 4: 15, 3: 3, 2: 1, 1: 1 }
      };
    }
    return calculateProductRatingStats(reviews);
  }, [reviews, baseRating, baseReviewsCount]);

  // Sorted reviews list
  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    if (sortBy === 'highest') {
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    if (sortBy === 'lowest') {
      return list.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    }
    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [reviews, sortBy]);

  const handleOpenWrite = () => {
    if (!user?.uid) {
      navigate('/login');
      return;
    }
    if (myReview) {
      handleOpenEdit(myReview);
      return;
    }
    setEditingReviewId(null);
    setFormData({ rating: 5, title: '', comment: '' });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (review) => {
    setEditingReviewId(review.id);
    setFormData({
      rating: review.rating || 5,
      title: review.title || '',
      comment: review.comment || ''
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || formData.title.trim().length < 3) {
      setFormError('Please enter a review headline (at least 3 characters).');
      return;
    }
    if (!formData.comment.trim() || formData.comment.trim().length < 10) {
      setFormError('Please write a detailed review (at least 10 characters).');
      return;
    }

    try {
      setSubmitting(true);
      if (editingReviewId) {
        await updateReview(editingReviewId, user.uid, formData);
        setFeedback({ type: 'success', text: 'Your review was updated successfully.' });
      } else {
        await createReview({
          productId,
          productName,
          userId: user.uid,
          userDisplayName: userProfile?.name || userProfile?.displayName || user.displayName || 'Patron',
          ...formData
        });
        setFeedback({ type: 'success', text: 'Thank you! Your bespoke garment review has been published.' });
      }

      await loadReviews();
      setShowModal(false);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFormError(err?.message || 'Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      await deleteReview(reviewId, user.uid);
      setFeedback({ type: 'success', text: 'Your review was removed.' });
      await loadReviews();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Delete review error:', err);
    }
  };

  return (
    <div className="space-y-8 pt-10 border-t border-neutral-200" id="reviews-section">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === 'success' ? '✓' : '⚠'}</span>
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-neutral-500 hover:text-neutral-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-black text-brand-dark tracking-tight flex items-center gap-3">
            <span>Patron Reviews & Ratings</span>
            <span className="text-xs font-sans font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800">
              {stats.totalReviews} {stats.totalReviews === 1 ? 'Review' : 'Reviews'}
            </span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Verified bespoke craftsmanship assessments, tailoring comfort, and fabric feedback.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleOpenWrite}
          variant="secondary"
          size="sm"
          className="shadow-xs font-bold text-xs"
        >
          {myReview ? '✏ Edit My Review' : '✍ Write a Review'}
        </Button>
      </div>

      {/* Rating Summary Breakdown Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white rounded-2xl border border-neutral-200 shadow-xs">
        {/* Overall Score */}
        <div className="flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-neutral-100 text-center space-y-2">
          <span className="text-4xl font-serif font-black text-brand-dark font-mono">
            {stats.averageRating.toFixed(1)}
          </span>
          <StarRating rating={stats.averageRating} size="lg" />
          <span className="text-xs text-neutral-500 font-medium">
            Based on {stats.totalReviews} genuine patron review{stats.totalReviews === 1 ? '' : 's'}
          </span>
          {purchaseStatus.isVerified && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 mt-1">
              ✓ Verified Buyer for this Silhouette
            </span>
          )}
        </div>

        {/* Rating Breakdown Bars */}
        <div className="md:col-span-2 flex flex-col justify-center space-y-2.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const pct = stats.percentages[star] || 0;
            const count = stats.ratingBreakdown[star] || 0;

            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-semibold text-neutral-600 flex items-center gap-1">
                  <span>{star}</span>
                  <span className="text-amber-400">★</span>
                </span>
                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-neutral-400 text-[11px]">
                  {pct}%
                </span>
                <span className="w-8 text-right font-mono text-neutral-600 font-semibold text-[11px]">
                  ({count})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Existing User Review Highlight Banner */}
      {myReview && (
        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-amber-900 flex items-center gap-1.5">
              <span>★</span> You reviewed this bespoke piece
            </span>
            <p className="text-amber-800 line-clamp-1">
              "{myReview.title}" — {myReview.comment}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenEdit(myReview)}
              className="px-3 py-1 bg-white border border-amber-300 text-amber-900 rounded-lg font-bold hover:bg-amber-100 shadow-2xs"
            >
              Edit Review
            </button>
            <button
              type="button"
              onClick={() => handleDelete(myReview.id)}
              className="px-3 py-1 bg-white border border-rose-200 text-rose-600 rounded-lg font-bold hover:bg-rose-50 shadow-2xs"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Sorting & Filter Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Showing {sortedReviews.length} Reviews
        </span>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1 bg-white border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-800 focus:outline-hidden focus:border-brand-accent"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-32 bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : sortedReviews.length === 0 ? (
        <div className="p-10 bg-white rounded-2xl border border-dashed border-neutral-300 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-xl">
            ✨
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-dark">No Patron Reviews Yet</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Be the first patron to share your experience with this bespoke garment's fit, drape, and tailoring.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleOpenWrite}
            variant="secondary"
            size="sm"
            className="text-xs font-bold"
          >
            Write the First Review &rarr;
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReviews.map((rev) => {
            const isOwner = user?.uid && rev.userId === user.uid;
            const dateStr = rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : 'Recently';

            return (
              <div
                key={rev.id}
                className="p-5 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-dark text-white font-serif font-black text-xs flex items-center justify-center shadow-xs">
                      {(rev.userDisplayName || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-brand-dark">
                          {rev.userDisplayName || 'Patron'}
                        </span>
                        {rev.verifiedPurchase && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <span>✓</span> Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-400">{dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StarRating rating={rev.rating} size="sm" />
                    {isOwner && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(rev)}
                          className="text-xs text-neutral-500 hover:text-brand-dark px-1.5 py-0.5 rounded-md hover:bg-neutral-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(rev.id)}
                          className="text-xs text-rose-500 hover:text-rose-700 px-1.5 py-0.5 rounded-md hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-brand-dark">{rev.title}</h4>
                  <p className="text-xs text-neutral-700 leading-relaxed">{rev.comment}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Submission / Edit Modal Dialog */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="font-serif font-black text-lg text-brand-dark">
                  {editingReviewId ? 'Edit Your Bespoke Review' : 'Write a Product Review'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">{productName}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Your Overall Rating *
                </label>
                <div className="flex items-center gap-3">
                  <StarRating
                    rating={formData.rating}
                    size="lg"
                    interactive
                    onChange={(val) => setFormData({ ...formData, rating: val })}
                  />
                  <span className="text-xs font-bold text-neutral-700">
                    {formData.rating} {formData.rating === 1 ? 'Star' : 'Stars'}
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Headline / Title *
                </label>
                <input
                  type="text"
                  maxLength={80}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Masterful tailoring and luxurious cotton drape"
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-brand-accent bg-white"
                />
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Your Assessment & Comments *
                </label>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Share details regarding fit comfort, seam craftsmanship, fabric quality, and how the garment wears..."
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-brand-accent bg-white"
                />
                <span className="text-[10px] text-neutral-400 text-right block mt-1">
                  {formData.comment.length} / 1000 characters
                </span>
              </div>

              {/* Verified Purchase notice */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                {purchaseStatus.isVerified ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <span>✓</span> Genuine order found ({purchaseStatus.orderId}). This review will receive a Verified Purchase badge.
                  </span>
                ) : (
                  <span className="text-neutral-500">
                    ℹ Verified Purchase badge is awarded when you have ordered this garment.
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-brand-accent shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : editingReviewId ? 'Update Review' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
