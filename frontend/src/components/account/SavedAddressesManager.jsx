import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../common/Button.jsx';
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  validateAddress
} from '../../services/addressService.js';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi NCR'
];

export default function SavedAddressesManager({ onSelectAddress, selectedAddressId }) {
  const { user, userProfile, refreshProfile } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [feedback, setFeedback] = useState(null);

  // Form State
  const initialForm = {
    fullName: userProfile?.name || userProfile?.displayName || user?.displayName || '',
    phone: userProfile?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500033',
    label: 'Home',
    isDefault: false
  };
  const [formData, setFormData] = useState(initialForm);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const list = await getUserAddresses(user?.uid || null);
      setAddresses(list);
    } catch (err) {
      console.warn('[SavedAddressesManager] Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      ...initialForm,
      fullName: userProfile?.name || userProfile?.displayName || user?.displayName || '',
      phone: userProfile?.phone || '',
      isDefault: addresses.length === 0
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingId(addr.id);
    setFormData({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || '',
      state: addr.state || 'Telangana',
      pincode: addr.pincode || '',
      label: addr.label || 'Home',
      isDefault: Boolean(addr.isDefault)
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateAddress(formData);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      setFormLoading(true);
      setFormErrors({});

      if (editingId) {
        await updateAddress(user?.uid || null, editingId, formData);
        setFeedback({ type: 'success', text: 'Delivery address updated successfully.' });
      } else {
        await addAddress(user?.uid || null, formData);
        setFeedback({ type: 'success', text: 'New delivery destination added.' });
      }

      await loadAddresses();
      if (refreshProfile) refreshProfile();
      setShowForm(false);
      setEditingId(null);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      console.error('[SavedAddressesManager] Submit error:', err);
      setFeedback({ type: 'error', text: err?.message || 'Could not save address. Please try again.' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to remove this saved delivery address?')) {
      return;
    }

    try {
      await deleteAddress(user?.uid || null, addressId);
      setFeedback({ type: 'success', text: 'Address removed from your account.' });
      await loadAddresses();
      if (refreshProfile) refreshProfile();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('[SavedAddressesManager] Delete error:', err);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(user?.uid || null, addressId);
      setFeedback({ type: 'success', text: 'Primary delivery destination updated.' });
      await loadAddresses();
      if (refreshProfile) refreshProfile();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('[SavedAddressesManager] Set default error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
        <div>
          <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
            <span>📍</span> Saved Atelier Delivery Destinations
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your home, atelier, and office delivery addresses for fast white-glove shipping.
          </p>
        </div>

        {!showForm && (
          <Button
            type="button"
            onClick={handleOpenAdd}
            variant="secondary"
            size="sm"
            className="text-xs font-bold shadow-xs whitespace-nowrap"
          >
            + Add New Address
          </Button>
        )}
      </div>

      {/* Global Feedback Alert */}
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

      {/* Add / Edit Form Modal / Card */}
      {showForm && (
        <div className="p-5 bg-neutral-50/80 rounded-2xl border border-neutral-200 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <h4 className="text-sm font-bold text-brand-dark">
              {editingId ? 'Edit Delivery Destination' : 'Add New Delivery Destination'}
            </h4>
            <span className="text-[11px] text-neutral-400 font-medium">
              Precision Indian Postal Validation
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Label selector: Home, Work, Other */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                Address Tag
              </label>
              <div className="flex items-center gap-2">
                {['Home', 'Work', 'Other'].map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setFormData({ ...formData, label: lbl })}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      formData.label === lbl
                        ? 'bg-brand-dark text-white border-brand-dark shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    {lbl === 'Home' ? '🏡 Home' : lbl === 'Work' ? '🏢 Work' : '📍 Other'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Alexander Wright"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-accent ${
                    formErrors.fullName ? 'border-rose-400 ring-1 ring-rose-300' : 'border-neutral-300'
                  }`}
                />
                {formErrors.fullName && (
                  <p className="text-[10px] text-rose-600 mt-1">{formErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  10-Digit Mobile Number *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="9876543210"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-white font-mono focus:outline-hidden focus:ring-1 focus:ring-brand-accent ${
                    formErrors.phone ? 'border-rose-400 ring-1 ring-rose-300' : 'border-neutral-300'
                  }`}
                />
                {formErrors.phone && (
                  <p className="text-[10px] text-rose-600 mt-1">{formErrors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Street Address / House / Flat / Atelier *
              </label>
              <textarea
                rows={2}
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                placeholder="42 Haute Couture Way, Flat 4B, Signature Towers"
                className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-accent ${
                  formErrors.addressLine1 ? 'border-rose-400 ring-1 ring-rose-300' : 'border-neutral-300'
                }`}
              />
              {formErrors.addressLine1 && (
                <p className="text-[10px] text-rose-600 mt-1">{formErrors.addressLine1}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Area / Colony / Landmark (Optional)
              </label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                placeholder="Near Jubilee Hills Check Post"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Hyderabad"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-accent ${
                    formErrors.city ? 'border-rose-400 ring-1 ring-rose-300' : 'border-neutral-300'
                  }`}
                />
                {formErrors.city && (
                  <p className="text-[10px] text-rose-600 mt-1">{formErrors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  State *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-brand-accent"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                  placeholder="500033"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-white font-mono focus:outline-hidden focus:ring-1 focus:ring-brand-accent ${
                    formErrors.pincode ? 'border-rose-400 ring-1 ring-rose-300' : 'border-neutral-300'
                  }`}
                />
                {formErrors.pincode && (
                  <p className="text-[10px] text-rose-600 mt-1">{formErrors.pincode}</p>
                )}
              </div>
            </div>

            <div className="pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-neutral-700">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded-sm border-neutral-300 text-brand-dark focus:ring-brand-accent"
                />
                <span>Set as my primary default delivery address</span>
              </label>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-5 py-2 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-brand-accent shadow-xs disabled:opacity-50"
              >
                {formLoading ? 'Saving Destination...' : editingId ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address Cards List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="p-8 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-xl">
            📍
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-700">No Saved Delivery Destinations</h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Save your residence or workplace address for seamless pre-filled bespoke checkout.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleOpenAdd}
            variant="secondary"
            size="sm"
            className="text-xs font-bold"
          >
            + Add First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr.id;

            return (
              <div
                key={addr.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  addr.isDefault
                    ? 'bg-amber-50/40 border-amber-300/80 shadow-xs ring-1 ring-amber-200/50'
                    : isSelected
                    ? 'bg-neutral-50 border-brand-accent shadow-sm'
                    : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200">
                        {addr.label === 'Work' ? '🏢 Work' : addr.label === 'Other' ? '📍 Other' : '🏡 Home'}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-dark text-white shadow-xs">
                          ★ Primary Default
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(addr)}
                        className="text-xs font-semibold text-neutral-600 hover:text-brand-dark px-2 py-1 rounded-md hover:bg-neutral-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(addr.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-2 py-1 rounded-md hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-neutral-700">
                    <p className="font-bold text-brand-dark text-sm">{addr.fullName}</p>
                    <p className="leading-relaxed">{addr.addressLine1}</p>
                    {addr.addressLine2 && <p className="text-neutral-500">{addr.addressLine2}</p>}
                    <p className="font-semibold text-neutral-900">
                      {[addr.city, addr.state].filter(Boolean).join(', ')} - <span className="font-mono">{addr.pincode}</span>
                    </p>
                    <p className="text-neutral-500 text-[11px] pt-1">
                      📞 Mobile: <span className="font-mono text-neutral-800 font-semibold">{addr.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                  {!addr.isDefault ? (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[11px] font-bold text-neutral-600 hover:text-brand-accent transition-colors"
                    >
                      ☆ Set as Primary Default
                    </button>
                  ) : (
                    <span className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                      <span>✓</span> Auto-prefilled at checkout
                    </span>
                  )}

                  {onSelectAddress && (
                    <Button
                      type="button"
                      onClick={() => onSelectAddress(addr)}
                      variant={isSelected ? 'secondary' : 'outline'}
                      size="sm"
                      className="text-xs font-bold"
                    >
                      {isSelected ? '✓ Selected' : 'Deliver Here'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
