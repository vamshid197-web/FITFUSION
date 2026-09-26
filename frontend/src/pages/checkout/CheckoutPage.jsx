import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { createFirestoreOrder } from '../../services/firestoreService.js';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi NCR'
];

export default function CheckoutPage() {
  const { items, subtotal, delivery, appliedCoupon, discount, total, clearCart } = useCart();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  // Form Fields State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Delhi NCR',
    pincode: ''
  });

  // Prefill email, name, and phone if authenticated
  useEffect(() => {
    if (user || userProfile) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || userProfile?.name || user?.displayName || '',
        email: prev.email || userProfile?.email || user?.email || '',
        phone: prev.phone || userProfile?.phone || ''
      }));
    }
  }, [user, userProfile]);

  // Payment Method Selection (Frontend Demo Only)
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Form Validation Errors & Submission State
  const [errors, setErrors] = useState({});
  const [orderError, setOrderError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Placed Order State (Shows Order Confirmation view upon completion)
  const [placedOrder, setPlacedOrder] = useState(null);

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate Fields
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '10-digit Phone Number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Street / House address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = '6-digit PIN Code is required';
    } else if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Please enter a valid 6-digit PIN code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Order Placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      navigate('/shop');
      return;
    }

    if (!validateForm()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setOrderError('');

    try {
      // Generate Order ID: FF-2026-XXXXXX
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const orderId = `FF-2026-${randomSuffix}`;

      const paymentLabels = {
        cod: 'Cash on Delivery (COD)',
        upi: 'UPI (GPay / PhonePe / Paytm Simulation)',
        card: 'Credit / Debit Card (Simulation)'
      };

      const nowIso = new Date().toISOString();

      const newOrder = {
        id: orderId,
        orderId: orderId,
        orderNumber: orderId,
        userId: user ? user.uid : 'guest',
        createdAt: nowIso,
        date: nowIso,
        formattedDate: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        customer: {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim()
        },
        deliveryAddress: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim()
        },
        shippingAddress: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim()
        },
        paymentMethod: paymentLabels[paymentMethod] || 'Cash on Delivery',
        paymentStatus: 'Confirmed (Demo)',
        items: [...items],
        subtotal,
        delivery,
        discount,
        couponCode: appliedCoupon?.code || null,
        coupon: appliedCoupon?.code || null,
        total,
        pricing: {
          subtotal,
          delivery,
          discount,
          total
        },
        status: 'Order Confirmed',
        orderStatus: 'Order Confirmed',
        tailoringStatus: 'Pattern Drafting & Fabric Allocation'
      };

      // 1. If user is authenticated, persist order to Cloud Firestore
      if (user?.uid) {
        try {
          await createFirestoreOrder(newOrder, user.uid);
        } catch (firestoreErr) {
          console.warn('[CheckoutPage] Firestore order creation warning:', firestoreErr);
        }
      }

      // 2. Persist order in localStorage under 'fitfusion_orders' (local cache & fallback)
      try {
        const existingOrdersRaw = localStorage.getItem('fitfusion_orders');
        const existingOrders = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
        const updatedOrders = [newOrder, ...existingOrders];
        localStorage.setItem('fitfusion_orders', JSON.stringify(updatedOrders));
      } catch (storageErr) {
        console.warn('[CheckoutPage] LocalStorage save warning:', storageErr);
      }

      // 3. Clear cart after successful order registration
      clearCart();

      // 4. Show Order Confirmation View
      setPlacedOrder(newOrder);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to create order:', err);
      setOrderError('Unable to process your bespoke order right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // STEP 11 – ORDER CONFIRMATION VIEW
  if (placedOrder) {
    return (
      <div className="py-10 sm:py-16 bg-brand-cream min-h-screen">
        <PageContainer maxWidth="md">
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-12 shadow-sm space-y-8 animate-fadeIn">
            {/* Top Success Header */}
            <div className="text-center space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-500/30 flex items-center justify-center text-3xl text-emerald-600">
                ✓
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Order Placed Successfully!
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-brand-dark">
                Thank You for Your Bespoke Order
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
                Your order has been recorded in the FITFUSION tailoring engine and persisted to Cloud Firestore. Our master tailors have been scheduled to initiate material drafting.
              </p>
            </div>

            {/* Order Reference Plaque */}
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 block">
                  Unique Order Reference
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-white">
                  {placedOrder.id}
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                  Status
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-500/30 inline-block mt-0.5">
                  &#10003; {placedOrder.status}
                </span>
              </div>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                <span className="font-bold text-neutral-400 uppercase tracking-wider text-[10px] block">
                  Customer Information
                </span>
                <div className="font-bold text-brand-dark text-sm">{placedOrder.customer.fullName}</div>
                <div className="text-neutral-600">{placedOrder.customer.email}</div>
                <div className="text-neutral-600">+91 {placedOrder.customer.phone}</div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                <span className="font-bold text-neutral-400 uppercase tracking-wider text-[10px] block">
                  Delivery Address & Payment
                </span>
                <div className="text-neutral-800 font-medium">
                  {placedOrder.deliveryAddress.address}, {placedOrder.deliveryAddress.city}, {placedOrder.deliveryAddress.state} - {placedOrder.deliveryAddress.pincode}
                </div>
                <div className="pt-1 text-neutral-600">
                  <strong>Payment:</strong> {placedOrder.paymentMethod}
                </div>
              </div>
            </div>

            {/* Ordered Items Summary */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-brand-dark">
                Tailored Garments in this Order ({placedOrder.items.length})
              </h3>

              <div className="space-y-3">
                {placedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-neutral-200 bg-white flex flex-col sm:flex-row items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-brand-dark">
                        {item.productName} &times; {item.quantity}
                      </div>
                      <div className="text-neutral-600">
                        {item.selectedFabric?.name || item.fabric?.name} &bull; {item.selectedColor?.name || item.color?.name} &bull; Size {item.size} ({item.fit} Fit)
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Architecture: {item.collar} Collar &bull; {item.cuff} Cuff &bull; {item.buttons} Buttons
                        {item.monogram ? ` • Monogram: "${item.monogram.text || item.monogram}"` : ''}
                      </div>
                      <div className="text-[11px] text-brand-accent font-semibold">
                        Fragrance: {item.selectedPerfume ? `${item.selectedPerfume.name} (+₹${item.selectedPerfume.price})` : 'No Perfume (₹0)'}
                      </div>
                    </div>

                    <div className="sm:text-right font-black text-sm text-brand-dark shrink-0">
                      ₹{item.totalItemPrice * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Breakdown */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-2">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-brand-dark">₹{placedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Delivery:</span>
                <span className="font-semibold text-brand-dark">
                  {placedOrder.delivery === 0 ? 'FREE' : `₹${placedOrder.delivery}`}
                </span>
              </div>
              {placedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({placedOrder.couponCode}):</span>
                  <span>-₹{placedOrder.discount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline font-black text-base text-brand-dark">
                <span>Total Amount Paid:</span>
                <span className="text-xl text-brand-accent">₹{placedOrder.total}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4 border-t border-neutral-100">
              <Button to="/orders" variant="secondary" size="lg" className="w-full sm:w-auto shadow-sm">
                View All Orders &rarr;
              </Button>
              <Button to="/shop" variant="outline" size="lg" className="w-full sm:w-auto">
                Continue Shopping
              </Button>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  // If cart is empty and no order placed yet
  if (items.length === 0) {
    return (
      <div className="py-12 sm:py-20 bg-brand-cream min-h-[75vh] flex items-center">
        <PageContainer maxWidth="md">
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-12 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl text-amber-700">
              🛍️
            </div>
            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-brand-dark">Checkout is Empty</h2>
              <p className="text-xs sm:text-sm text-neutral-600">
                You do not have any customized apparel in your cart to checkout.
              </p>
            </div>
            <Button to="/shop" variant="secondary" size="md">
              Browse Clothing Collection &rarr;
            </Button>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 bg-brand-cream min-h-screen">
      <PageContainer>
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
          <Link to="/home" className="hover:text-brand-dark transition-colors">Home</Link>
          <span>/</span>
          <Link to="/cart" className="hover:text-brand-dark transition-colors">Cart</Link>
          <span>/</span>
          <span className="text-neutral-800 font-semibold">Checkout</span>
        </div>

        {/* Page Header */}
        <div className="space-y-1 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            Secure Bespoke Checkout
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark">
            Complete Tailoring Commission
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600">
            Provide delivery particulars and confirm your customized apparel specifications.
          </p>
        </div>

        {/* Error notification banner if checkout fails */}
        {orderError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {orderError}
          </div>
        )}

        {/* Checkout Main Grid */}
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Delivery Form & Payment Selection */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Customer Information Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4">
              <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">
                    Step 1 of 2
                  </span>
                  <h2 className="text-base font-bold text-brand-dark">Customer Information</h2>
                </div>
                <span className="text-xs text-neutral-400">Tailoring Dispatch</span>
              </div>

              <div className="space-y-4">
                <Input
                  label="Full Name"
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="e.g. Alexander Wright"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                  />

                  <Input
                    label="10-Digit Mobile Number"
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    helperText="Required for delivery tracking"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4">
              <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">
                    Step 2 of 2
                  </span>
                  <h2 className="text-base font-bold text-brand-dark">Delivery Address</h2>
                </div>
                <span className="text-xs text-neutral-400">All India Courier</span>
              </div>

              <div className="space-y-4">
                <Input
                  label="Street / House / Apartment Address"
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Flat 402, Royal Palms, MG Road"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="City"
                    id="city"
                    name="city"
                    type="text"
                    placeholder="New Delhi"
                    value={formData.city}
                    onChange={handleChange}
                    error={errors.city}
                    required
                  />

                  <div className="space-y-1">
                    <label htmlFor="state" className="block text-xs font-semibold text-neutral-700">
                      State / UT
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-brand-accent bg-white text-neutral-800"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="6-Digit PIN Code"
                    id="pincode"
                    name="pincode"
                    type="text"
                    maxLength={6}
                    placeholder="110001"
                    value={formData.pincode}
                    onChange={handleChange}
                    error={errors.pincode}
                    required
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method Simulation Card (College Project Demo) */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4">
              <div className="border-b border-neutral-100 pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-brand-dark">Payment Method Simulation</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Safe Educational Mode
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Select payment mode. No real monetary transactions or financial credentials required.
                </p>
              </div>

              <div className="space-y-3">
                {/* Option 1: Cash on Delivery */}
                <label
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-brand-accent bg-brand-accentLight/40 ring-2 ring-brand-accent'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-brand-accent w-4 h-4"
                    />
                    <div>
                      <div className="font-bold text-sm text-brand-dark flex items-center gap-2">
                        <span>Cash on Delivery (COD)</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">Recommended</span>
                      </div>
                      <div className="text-xs text-neutral-500">
                        Pay upon doorstep arrival after inspecting tailored fit.
                      </div>
                    </div>
                  </div>
                  <span className="text-lg">💵</span>
                </label>

                {/* Option 2: UPI Simulation */}
                <label
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-brand-accent bg-brand-accentLight/40 ring-2 ring-brand-accent'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-brand-accent w-4 h-4"
                    />
                    <div>
                      <div className="font-bold text-sm text-brand-dark flex items-center gap-2">
                        <span>UPI (GPay / PhonePe / Paytm)</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600">Demo</span>
                      </div>
                      <div className="text-xs text-neutral-500">
                        Simulated UPI transaction without credential request.
                      </div>
                    </div>
                  </div>
                  <span className="text-lg">📱</span>
                </label>

                {/* Option 3: Card Simulation */}
                <label
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-brand-accent bg-brand-accentLight/40 ring-2 ring-brand-accent'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-brand-accent w-4 h-4"
                    />
                    <div>
                      <div className="font-bold text-sm text-brand-dark flex items-center gap-2">
                        <span>Credit / Debit Card</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600">Demo</span>
                      </div>
                      <div className="text-xs text-neutral-500">
                        Simulated card swipe processing without CVV or OTP request.
                      </div>
                    </div>
                  </div>
                  <span className="text-lg">💳</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order CTA */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-neutral-100 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">
                  Order Review
                </span>
                <h3 className="text-lg font-black text-brand-dark">
                  Items Summary ({items.reduce((s, i) => s + i.quantity, 0)})
                </h3>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-start gap-3 text-xs"
                  >
                    <div
                      className={`w-12 h-14 rounded-lg bg-gradient-to-br ${
                        item.silhouetteColor || 'from-stone-100 to-amber-50'
                      } border border-neutral-200 flex items-center justify-center shrink-0`}
                    >
                      <svg
                        className="w-6 h-6"
                        style={{ color: item.selectedColor?.hex || item.color?.hex || '#1F2937' }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 3v2m6-2v2M9 5H7a2 2 0 00-2 2v2l2 1v9a2 2 0 002 2h6a2 2 0 002-2v-9l2-1V7a2 2 0 00-2-2h-2m-6 0a2 2 0 002 2h2a2 2 0 002-2m-6 0h6" />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-brand-dark truncate">{item.productName}</div>
                      <div className="text-[11px] text-neutral-500">
                        Qty: {item.quantity} &bull; Size {item.size} ({item.fit})
                      </div>
                      <div className="text-[10px] text-neutral-500 truncate">
                        {item.selectedFabric?.name || item.fabric?.name} &bull; {item.collar} Collar
                      </div>
                      {item.selectedPerfume && (
                        <div className="text-[10px] text-brand-accent font-medium">
                          Scent: {item.selectedPerfume.name}
                        </div>
                      )}
                    </div>

                    <div className="font-bold text-brand-dark text-right shrink-0">
                      ₹{item.totalItemPrice * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-brand-dark">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery Charge:</span>
                  <span className="font-semibold text-brand-dark">
                    {delivery === 0 ? 'FREE' : `₹${delivery}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({appliedCoupon?.code}):</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline text-sm">
                  <div>
                    <span className="font-black text-brand-dark text-base">Final Total:</span>
                    <p className="text-[10px] text-neutral-400">All tailoring & GST included</p>
                  </div>
                  <span className="text-2xl font-black text-brand-dark">₹{total}</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
                className="w-full text-base font-bold shadow-md bg-brand-dark hover:bg-neutral-800 disabled:opacity-50"
              >
                {submitting ? 'Placing Bespoke Order...' : `Place Order (₹${total}) →`}
              </Button>

              <div className="text-center">
                <Link to="/cart" className="text-xs text-neutral-500 hover:text-brand-dark underline">
                  &larr; Return to Cart to modify items
                </Link>
              </div>
            </div>
          </div>
        </form>
      </PageContainer>
    </div>
  );
}
