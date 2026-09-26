import React, { useState, useEffect } from 'react';
import {
  getOffers,
  saveOffer,
  deleteOffer
} from '../../services/offerService';

// Standard inline SVG icons matching FitFusion design system
const TagIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const PlusIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CoinsIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const GiftIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V4a2 2 0 112 2h-2zm0 0V4a2 2 0 10-2 2h2zm-7 4h14M5 12a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2M5 12h14" />
  </svg>
);

const SparklesIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const INITIAL_FORM = {
  id: '',
  code: '',
  title: '',
  description: '',
  type: 'flat',
  scope: 'storewide',
  discountValue: 100,
  minimumOrderValue: 999,
  applicableCategories: [],
  cashbackPercentage: 0,
  freePerfumeEligible: false,
  startAt: new Date().toISOString().split('T')[0],
  endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  active: true,
  usageLimit: 0
};

const CATEGORIES = ['Shirts', 'Suits', 'Pants', 'Ethnic', 'Casual', 'Formal', 'Sportswear'];

export default function AdminOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const data = await getOffers(true); // Include inactive
      setOffers(data);
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      ...INITIAL_FORM,
      code: 'OFFER' + Math.floor(100 + Math.random() * 900)
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (offer) => {
    setFormData({
      ...offer,
      startAt: offer.startAt ? offer.startAt.split('T')[0] : '',
      endAt: offer.endAt ? offer.endAt.split('T')[0] : '',
      applicableCategories: offer.applicableCategories || []
    });
    setIsModalOpen(true);
  };

  const handleToggleCategory = (cat) => {
    setFormData((prev) => {
      const exists = prev.applicableCategories.includes(cat);
      return {
        ...prev,
        applicableCategories: exists
          ? prev.applicableCategories.filter((c) => c !== cat)
          : [...prev.applicableCategories, cat]
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.code.trim()) {
      alert('Offer code is required.');
      return;
    }
    if (Number(formData.discountValue) < 0) {
      alert('Discount value cannot be negative.');
      return;
    }
    if (formData.type === 'percentage' && Number(formData.discountValue) > 90) {
      alert('Percentage discount cannot exceed 90%.');
      return;
    }
    if (Number(formData.minimumOrderValue) < 0) {
      alert('Minimum order value cannot be negative.');
      return;
    }
    if (formData.startAt > formData.endAt) {
      alert('Start date must be before or equal to End date.');
      return;
    }

    const payload = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      discountValue: Number(formData.discountValue),
      minimumOrderValue: Number(formData.minimumOrderValue),
      cashbackPercentage: Number(formData.cashbackPercentage || 0),
      startAt: new Date(formData.startAt + 'T00:00:00.000Z').toISOString(),
      endAt: new Date(formData.endAt + 'T23:59:59.000Z').toISOString()
    };

    const res = await saveOffer(payload);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: 'Offer "' + payload.code + '" successfully saved!'
      });
      setIsModalOpen(false);
      loadOffers();
      setTimeout(() => setFeedback(null), 3000);
    } else {
      alert('Save failed: ' + res.error);
    }
  };

  const handleToggleActive = async (offer) => {
    const updated = { ...offer, active: !offer.active };
    await saveOffer(updated);
    setOffers((prev) => prev.map((o) => (o.id === offer.id ? updated : o)));
    setFeedback({
      type: 'success',
      message: 'Offer "' + offer.code + '" is now ' + (updated.active ? 'ACTIVE' : 'INACTIVE')
    });
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleDelete = async (offerId, code) => {
    if (!window.confirm('Are you sure you want to delete offer "' + code + '"?')) return;
    const res = await deleteOffer(offerId);
    if (res.success) {
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
      setFeedback({ type: 'success', message: 'Offer deleted successfully.' });
      setTimeout(() => setFeedback(null), 2500);
    } else {
      alert('Failed to delete offer: ' + res.error);
    }
  };

  const filteredOffers = offers.filter((o) => {
    const matchesSearch =
      o.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || o.type === filterType;
    return matchesSearch && matchesType;
  });

  const activeCount = offers.filter((o) => o.active).length;
  const cashbackCount = offers.filter((o) => o.type === 'cashback').length;
  const freeGiftCount = offers.filter((o) => o.freePerfumeEligible || o.type === 'free_perfume').length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-brand-dark tracking-wide flex items-center gap-3">
            <TagIcon className="w-7 h-7 text-amber-500" />
            Offers & Loyalty Hub
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Manage promotional campaigns, customer cashback percentages, and complimentary fragrance incentives.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer text-xs sm:text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Create New Campaign
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2.5 text-xs">
          <CheckCircleIcon className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <TagIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-brand-dark">{offers.length}</div>
            <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">Total Campaigns</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircleIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700">{activeCount}</div>
            <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">Active Storefront</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <CoinsIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-brand-dark">{cashbackCount}</div>
            <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">Cashback Schemes</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <GiftIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-purple-700">{freeGiftCount}</div>
            <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">Fragrance Gifts</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-neutral-200 shadow-xs">
        <input
          type="text"
          placeholder="Search by code, title, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 px-3.5 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 text-xs focus:outline-none focus:border-brand-accent"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'percentage', 'flat', 'cashback', 'free_perfume'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={'px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ' +
                (filterType === t
                  ? 'bg-brand-dark text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200')}
            >
              {t === 'free_perfume' ? 'Fragrance' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Offers Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-400">Loading campaigns...</div>
      ) : filteredOffers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-neutral-300">
          <TagIcon className="w-10 h-10 mx-auto text-neutral-300 mb-2" />
          <h3 className="text-sm font-bold text-brand-dark">No campaigns found</h3>
          <p className="text-xs text-neutral-500 mt-1">Create a new promotion or adjust your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className={'p-5 rounded-2xl border transition-all flex flex-col justify-between ' +
                (offer.active
                  ? 'bg-white border-neutral-200 hover:border-brand-accent/50 shadow-xs'
                  : 'bg-neutral-50 border-neutral-200/80 opacity-70')}
            >
              <div>
                {/* Header with Code & Status */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-black px-2.5 py-1 rounded-md bg-neutral-100 text-brand-dark border border-neutral-200">
                    {offer.code}
                  </span>
                  <button
                    onClick={() => handleToggleActive(offer)}
                    className={'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ' +
                      (offer.active
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                        : 'bg-neutral-200 text-neutral-600 border border-neutral-300 hover:bg-neutral-300')}
                  >
                    {offer.active ? <CheckCircleIcon className="w-3 h-3 text-emerald-600" /> : <XCircleIcon className="w-3 h-3 text-neutral-500" />}
                    {offer.active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-bold text-brand-dark mb-1">{offer.title}</h3>
                <p className="text-xs text-neutral-500 line-clamp-2 mb-3 leading-relaxed">{offer.description}</p>

                {/* Offer Attributes */}
                <div className="space-y-1.5 text-xs text-neutral-600 border-t border-neutral-100 pt-3 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Reward:</span>
                    <span className="font-bold text-brand-accent">
                      {offer.type === 'percentage' && `${offer.discountValue}% OFF`}
                      {offer.type === 'flat' && `₹${offer.discountValue} FLAT OFF`}
                      {offer.type === 'cashback' && `${offer.cashbackPercentage}% CASHBACK`}
                      {offer.type === 'free_perfume' && 'COMPLIMENTARY PERFUME'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Min. Spend:</span>
                    <span className="font-mono font-medium">
                      {offer.minimumOrderValue > 0 ? `₹${offer.minimumOrderValue.toLocaleString('en-IN')}` : 'None'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Scope:</span>
                    <span className="capitalize font-medium">{offer.scope?.replace('_', ' ')}</span>
                  </div>

                  {offer.applicableCategories && offer.applicableCategories.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Categories:</span>
                      <span className="font-medium text-neutral-700 truncate max-w-[140px]">{offer.applicableCategories.join(', ')}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Validity:</span>
                    <span className="text-neutral-500">
                      {offer.endAt ? new Date(offer.endAt).toLocaleDateString('en-IN') : 'Indefinite'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
                <button
                  onClick={() => handleOpenEdit(offer)}
                  className="p-1.5 rounded-lg bg-neutral-100 text-neutral-700 hover:text-brand-dark hover:bg-neutral-200 transition-all cursor-pointer"
                  title="Edit Campaign"
                >
                  <EditIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(offer.id, offer.code)}
                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                  title="Delete Campaign"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-xl w-full p-6 space-y-5 my-8 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-amber-500" />
                {formData.id ? 'Edit Promotional Offer' : 'Create New Promotional Offer'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Promo Code (Uppercase)*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. FESTIVE500"
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 font-mono uppercase text-xs focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Campaign Title*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Royal Festive Rebate"
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Description*
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summarize the promotion terms visible to the customer..."
                  className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Offer Type*
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs focus:outline-none focus:border-brand-accent"
                  >
                    <option value="flat">Flat ₹ Discount</option>
                    <option value="percentage">Percentage (%) Discount</option>
                    <option value="cashback">Patron Cashback (%)</option>
                    <option value="free_perfume">Complimentary Fragrance Gift</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Application Scope*
                  </label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs focus:outline-none focus:border-brand-accent"
                  >
                    <option value="storewide">Storewide (All Orders)</option>
                    <option value="first_order">First Order Only</option>
                    <option value="min_cart">Minimum Cart Spend</option>
                    <option value="category">Category Specific</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {formData.type === 'percentage' ? 'Discount %' : 'Discount ₹'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.type === 'percentage' ? '90' : '50000'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Min Cart Spend (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minimumOrderValue}
                    onChange={(e) => setFormData({ ...formData, minimumOrderValue: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Cashback Reward (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.cashbackPercentage}
                    onChange={(e) => setFormData({ ...formData, cashbackPercentage: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              {/* Categories Selector */}
              {formData.scope === 'category' && (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Applicable Categories
                  </label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {CATEGORIES.map((cat) => {
                      const isSelected = formData.applicableCategories.includes(cat);
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => handleToggleCategory(cat)}
                          className={'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ' +
                            (isSelected
                              ? 'bg-brand-dark text-white font-bold'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200')}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Validity Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Valid From (Start Date)*
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startAt}
                    onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Valid Until (End Date)*
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endAt}
                    onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              {/* Free Perfume Toggle */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                <input
                  type="checkbox"
                  id="freePerfumeEligible"
                  checked={formData.freePerfumeEligible || formData.type === 'free_perfume'}
                  onChange={(e) => setFormData({ ...formData, freePerfumeEligible: e.target.checked })}
                  className="rounded border-neutral-300 text-brand-accent focus:ring-brand-accent w-4 h-4 cursor-pointer"
                />
                <label htmlFor="freePerfumeEligible" className="text-xs text-neutral-700 cursor-pointer">
                  Includes complimentary bespoke fragrance miniature (₹0) when eligible
                </label>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="activeStatus"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-neutral-300 text-brand-accent focus:ring-brand-accent w-4 h-4 cursor-pointer"
                />
                <label htmlFor="activeStatus" className="text-xs text-neutral-700 cursor-pointer">
                  Active immediately in storefront
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-neutral-200 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-brand-dark text-white text-xs font-bold hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
                >
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
