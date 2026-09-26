import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import StarRating from '../common/StarRating.jsx';
import Button from '../common/Button.jsx';
import {
  getUserReviews,
  updateReview,
  deleteReview
} from '../../services/reviewService.js';

export default function CustomerReviewsTab() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingReview, setEditingReview] = useState(null);
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadReviews = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const list = await getUserReviews(user.uid);
      setReviews(list);
    } catch (err) {
      console.warn('[CustomerReviewsTab] Failed to load user reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [user?.uid]);

  const handleOpenEdit = (rev) => {
    setEditingReview(rev);
    setFormRating(rev.rating || 5);
    setFormTitle(rev.title || '');
    setFormComment(rev.comment || '');
    setFormError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || formTitle.trim().length < 3) {
      setFormError('Please enter a review headline (at least 3 characters).');
      return;
    }
    if (!formComment.trim() || formComment.trim().length < 10) {
      setFormError('Please enter detailed comments (at least 10 characters).');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      await updateReview(editingReview.id, user.uid, {
        rating: formRating,
        title: formTitle,
        comment: formComment
      });

      setFeedback({ type: 'success', text: 'Review updated successfully.' });
      setEditingReview(null);
      await loadReviews();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFormError(err?.message || 'Could not update review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      await deleteReview(reviewId, user.uid);
      setFeedback({ type: 'success', text: 'Review deleted.' });
      await loadReviews();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Delete review error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
        <div>
          <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
            <span>✍️</span> My Bespoke Garment Reviews ({reviews.length})
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Craftsmanship assessments and tailoring ratings submitted from your patron account.
          </p>
        </div>
        <Button to="/orders" variant="outline" size="sm" className="text-xs font-bold">
          View Completed Orders &rarr;
        </Button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <span>{feedback.type === 'success' ? '✓' : '⚠'}</span>
          <span>{feedback.text}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-8 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-xl">
            ★
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-800">No Reviews Submitted Yet</h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              After receiving your tailored garments, share your review on any product page to help fellow patrons.
            </p>
          </div>
          <Button to="/shop" variant="secondary" size="sm" className="text-xs font-bold">
            Explore Collection &rarr;
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => {
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
                className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/product/${rev.productId}`}
                        className="font-bold text-sm text-brand-dark hover:text-brand-accent transition-colors"
                      >
                        {rev.productName || 'Bespoke Garment'} &rarr;
                      </Link>
                      {rev.verifiedPurchase && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Verified Purchase
                        </span>
                      )}
                      {rev.status === 'hidden' && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Hidden by Moderator
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-400">Reviewed on {dateStr}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <StarRating rating={rev.rating} size="sm" />
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(rev)}
                      className="text-xs font-semibold text-neutral-600 hover:text-brand-dark px-2 py-1 rounded-md hover:bg-neutral-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rev.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-2 py-1 rounded-md hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
                  <h5 className="font-bold text-xs text-brand-dark">"{rev.title}"</h5>
                  <p className="text-xs text-neutral-700 leading-relaxed">{rev.comment}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h4 className="font-serif font-black text-base text-brand-dark">
                  Edit Your Review
                </h4>
                <p className="text-xs text-neutral-500">{editingReview.productName}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
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

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Rating *
                </label>
                <div className="flex items-center gap-3">
                  <StarRating
                    rating={formRating}
                    size="lg"
                    interactive
                    onChange={(val) => setFormRating(val)}
                  />
                  <span className="text-xs font-bold text-neutral-700">{formRating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Headline / Title *
                </label>
                <input
                  type="text"
                  maxLength={80}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-brand-accent bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Comment *
                </label>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-brand-accent bg-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-brand-accent shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Update Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
