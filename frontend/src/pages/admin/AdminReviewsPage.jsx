import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import StarRating from '../../components/common/StarRating.jsx';
import Button from '../../components/common/Button.jsx';
import {
  getAllReviewsForAdmin,
  moderateReview,
  deleteReview
} from '../../services/reviewService.js';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'published' | 'hidden'
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadAllReviews = async () => {
    try {
      setLoading(true);
      const list = await getAllReviewsForAdmin();
      setReviews(list);
    } catch (err) {
      console.warn('[AdminReviewsPage] Could not load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllReviews();
  }, []);

  // Filtered & Searched Reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      if (filterStatus === 'published' && rev.status !== 'published') return false;
      if (filterStatus === 'hidden' && rev.status !== 'hidden') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const prod = (rev.productName || '').toLowerCase();
        const user = (rev.userDisplayName || '').toLowerCase();
        const title = (rev.title || '').toLowerCase();
        const comment = (rev.comment || '').toLowerCase();
        return prod.includes(q) || user.includes(q) || title.includes(q) || comment.includes(q);
      }
      return true;
    });
  }, [reviews, filterStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    const published = reviews.filter((r) => r.status === 'published' || !r.status).length;
    const hidden = reviews.filter((r) => r.status === 'hidden').length;
    const verified = reviews.filter((r) => r.verifiedPurchase).length;

    const avg = total > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / total).toFixed(1)
      : '5.0';

    return { total, published, hidden, verified, avg };
  }, [reviews]);

  const handleToggleStatus = async (review) => {
    const newStatus = review.status === 'hidden' ? 'published' : 'hidden';
    try {
      setActionLoadingId(review.id);
      await moderateReview(review.id, newStatus);
      try {
        logAdminActivity({
          action: 'REVIEW_MODERATED',
          targetType: 'review',
          targetId: review.id,
          details: `Review for "${review.productName || 'Garment'}" set to ${newStatus.toUpperCase()}.`
        });
      } catch(e) {}
      setFeedback({
        type: 'success',
        text: `Review status changed to "${newStatus.toUpperCase()}".`
      });
      await loadAllReviews();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      console.error('Moderation error:', err);
      setFeedback({ type: 'error', text: 'Failed to update review status.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  
  const handleFlagReview = async (review) => {
    try {
      setActionLoadingId(review.id);
      await moderateReview(review.id, 'flagged');
      setFeedback({
        type: 'success',
        text: 'Review marked as FLAGGED for investigation.'
      });
      try {
        logAdminActivity({
          action: 'REVIEW_FLAGGED',
          targetType: 'review',
          targetId: review.id,
          details: `Review for "${review.productName || 'Garment'}" was FLAGGED for review.`
        });
      } catch(e) {}
      await loadAllReviews();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to flag review.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to permanently delete this review as administrator?')) {
      return;
    }

    try {
      setActionLoadingId(reviewId);
      await deleteReview(reviewId, null, true);
      setFeedback({ type: 'success', text: 'Review permanently purged.' });
      await loadAllReviews();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="py-8 bg-neutral-50/50 min-h-screen">
      <PageContainer>
        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-2">
            <Link to="/admin" className="hover:text-brand-dark transition-colors">Admin Console</Link>
            <span>/</span>
            <span className="text-brand-dark">Review Moderation</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-black text-brand-dark tracking-tight">
                Customer Reviews & Moderation
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Oversee customer craftsmanship feedback, verify buyer credentials, and moderate public visibility.
              </p>
            </div>

            <Button
              type="button"
              onClick={loadAllReviews}
              variant="outline"
              size="sm"
              className="text-xs font-bold"
            >
              🔄 Refresh List
            </Button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <span>{feedback.text}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-neutral-500 hover:text-neutral-900"
            >
              ✕
            </button>
          </div>
        )}

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              Total Reviews
            </span>
            <span className="text-2xl font-black text-brand-dark font-mono">{stats.total}</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
              Published & Public
            </span>
            <span className="text-2xl font-black text-emerald-700 font-mono">{stats.published}</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
              Hidden / Moderated
            </span>
            <span className="text-2xl font-black text-amber-700 font-mono">{stats.hidden}</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent block">
              Verified Purchases
            </span>
            <span className="text-2xl font-black text-brand-accent font-mono">{stats.verified}</span>
          </div>
        </div>

        {/* Filters & Search Row */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'All Reviews' },
              { id: 'published', label: 'Published' },
              { id: 'hidden', label: 'Hidden' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === tab.id
                    ? 'bg-brand-dark text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72 relative">
            <input
              type="text"
              placeholder="Search by patron, piece, or headline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-1.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:border-brand-accent bg-neutral-50"
            />
          </div>
        </div>

        {/* Reviews Table / Cards */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-neutral-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-dashed border-neutral-300 text-center space-y-2">
            <p className="text-sm font-bold text-neutral-600">No reviews found matching criteria.</p>
            <p className="text-xs text-neutral-400">Customer feedback will appear here as reviews are submitted.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((rev) => {
              const isHidden = rev.status === 'hidden';
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
                  className={`p-5 rounded-2xl border shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isHidden
                      ? 'bg-amber-50/40 border-amber-200/80 opacity-90'
                      : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/product/${rev.productId}`}
                        className="font-bold text-sm text-brand-dark hover:text-brand-accent"
                      >
                        {rev.productName || 'Bespoke Garment'} &rarr;
                      </Link>

                      <span className="text-neutral-300">&bull;</span>
                      <span className="text-xs font-semibold text-neutral-700">
                        {rev.userDisplayName || 'Patron'}
                      </span>

                      {rev.verifiedPurchase && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Verified Buyer
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isHidden
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        {isHidden ? 'Hidden' : 'Published'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <StarRating rating={rev.rating} size="sm" />
                      <span className="text-xs font-bold text-neutral-900">"{rev.title}"</span>
                      <span className="text-[11px] text-neutral-400">({dateStr})</span>
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed pr-4">
                      {rev.comment}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100 shrink-0">
                    <button
                      type="button"
                      disabled={actionLoadingId === rev.id}
                      onClick={() => handleToggleStatus(rev)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all disabled:opacity-50 ${
                        isHidden
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600 shadow-xs'
                          : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-300'
                      }`}
                    >
                      {isHidden ? '✓ Publish Review' : '👁️ Hide Review'}
                    </button>

                    <button
                      type="button"
                      disabled={actionLoadingId === rev.id}
                      onClick={() => handleDelete(rev.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 transition-colors disabled:opacity-50"
                    >
                      Purge
                    </button>
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
