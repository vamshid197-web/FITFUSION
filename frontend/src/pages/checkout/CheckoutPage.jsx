import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { createFirestoreOrder } from '../../services/firestoreService.js';
import { recordPendingCashback, redeemCashback } from '../../services/cashbackService.js';
import { getUserAddresses, addAddress } from '../../services/addressService.js';
import { createNotification, NOTIFICATION_TYPES } from '../../services/notificationService.js';
import ProductImage from '../../components/common/ProductImage.jsx';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi NCR'
];

export default function CheckoutPage() {
  // IMPORTANT: useAuth() MUST be called before any useEffect that references user.
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const {
    items,
    subtotal,
    delivery,
    appliedCoupon,
    discount,
    total,
    clearCart,
    freePerfume,
    freePerfumeDiscount,
    appliedOffer,
    offerDiscount,
    redeemedCashback,
    setRedeemedCashback,
    cashbackWallet,
    refreshCashbackWallet,
    potentialCashback
  } = useCart();

  // Load customer cashback wallet after user is available
  useEffect(() => {
    if (user?.uid) {
      refreshCashbackWallet(user.uid);
    }
  }, [user]);

  // Customer & Shipping Form State
  // Saved Destinations State (Phase 13)
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Telangana',
    pincode: ''
  });

  // Prefill customer and saved addresses (Phase 13)
  useEffect(() => {
    async function loadSavedAddresses() {
      if (user || userProfile) {
        const savedAddr = userProfile?.savedAddress || userProfile?.deliveryAddress || {};
        let list = [];
        if (user?.uid) {
          try {
            list = await getUserAddresses(user.uid);
            setSavedAddresses(list);
          } catch (e) {
            console.warn('[Checkout] Could not load saved addresses:', e);
          }
        }

        const defaultAddr = list.length > 0 ? (list.find((a) => a.isDefault) || list[0]) : null;
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          const fullStreet = [defaultAddr.addressLine1, defaultAddr.addressLine2].filter(Boolean).join(', ');
          setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || defaultAddr.fullName || userProfile?.name || userProfile?.displayName || user?.displayName || '',
            email: prev.email || userProfile?.email || user?.email || '',
            phone: prev.phone || defaultAddr.phone || userProfile?.phone || '',
            address: fullStreet || prev.address,
            city: defaultAddr.city || prev.city,
            state: defaultAddr.state || prev.state || 'Telangana',
            pincode: defaultAddr.pincode || prev.pincode
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            fullName: prev.fullName || userProfile?.name || userProfile?.displayName || user?.displayName || '',
            email: prev.email || userProfile?.email || user?.email || '',
            phone: prev.phone || userProfile?.phone || '',
            address: prev.address || savedAddr.address || '',
            city: prev.city || savedAddr.city || '',
            state: prev.state || savedAddr.state || 'Telangana',
            pincode: prev.pincode || savedAddr.pincode || ''
          }));
        }
      }
    }
    loadSavedAddresses();
  }, [user, userProfile]);

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    const fullStreet = [addr.addressLine1, addr.addressLine2].filter(Boolean).join(', ');
    setFormData((prev) => ({
      ...prev,
      fullName: addr.fullName || prev.fullName,
      phone: addr.phone || prev.phone,
      address: fullStreet,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode
    }));
  };

  const handleSelectNewAddress = () => {
    setSelectedAddressId('new');
    setFormData((prev) => ({
      ...prev,
      address: '',
      city: '',
      state: 'Telangana',
      pincode: ''
    }));
  };

  // Payment Selection State: 'cod' | 'upi' | 'card'
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // UPI Simulation State
  const [upiTab, setUpiTab] = useState('id'); // 'id' | 'qr'
  const [upiId, setUpiId] = useState('');
  const [upiOutcome, setUpiOutcome] = useState('success'); // 'success' | 'failure'
  const [qrScanned, setQrScanned] = useState(false);

  // Card Simulation State (Strictly in-memory; NEVER stored in DB or localStorage)
  const [cardForm, setCardForm] = useState({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [cardOutcome, setCardOutcome] = useState('success'); // 'success' | 'failure'

  // Sync cardholder name if customer name changes
  useEffect(() => {
    if (formData.fullName && !cardForm.cardholderName) {
      setCardForm((prev) => ({ ...prev, cardholderName: formData.fullName }));
    }
  }, [formData.fullName]);

  // Form Validation & Submission State
  const [errors, setErrors] = useState({});
  const [orderError, setOrderError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  // Placed Order State
  const [placedOrder, setPlacedOrder] = useState(null);

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardForm((prev) => ({ ...prev, cardNumber: formatted }));
    if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: '' }));
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardForm((prev) => ({ ...prev, expiry: raw }));
    if (errors.expiry) setErrors((prev) => ({ ...prev, expiry: '' }));
  };

  // Format CVV (3 digits)
  const handleCvvChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardForm((prev) => ({ ...prev, cvv: raw }));
    if (errors.cvv) setErrors((prev) => ({ ...prev, cvv: '' }));
  };

  // Quick fill demo test card
  const handleFillTestCard = () => {
    setCardForm({
      cardholderName: formData.fullName || 'Alexander Wright',
      cardNumber: '4242 4242 4242 4242',
      expiry: '12/28',
      cvv: '888'
    });
    setErrors((prev) => ({
      ...prev,
      cardholderName: '',
      cardNumber: '',
      expiry: '',
      cvv: ''
    }));
  };

  // Validate entire checkout form including selected payment method
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

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = '10-digit Phone Number is required';
    } else if (cleanPhone.length !== 10) {
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

    const cleanPincode = formData.pincode.replace(/\D/g, '');
    if (!formData.pincode.trim()) {
      newErrors.pincode = '6-digit PIN Code is required';
    } else if (cleanPincode.length !== 6) {
      newErrors.pincode = 'Please enter a valid 6-digit PIN code';
    }

    // Payment Specific Validations (Format only - never stored!)
    if (paymentMethod === 'upi') {
      if (upiTab === 'id') {
        if (!upiId.trim()) {
          newErrors.upiId = 'Please enter a valid UPI ID (e.g. name@oksbi)';
        } else if (!upiId.includes('@')) {
          newErrors.upiId = 'UPI ID must contain "@" (e.g. yourname@upi)';
        }
      }
    } else if (paymentMethod === 'card') {
      if (!cardForm.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required';
      }
      const cleanCard = cardForm.cardNumber.replace(/\s/g, '');
      if (!cleanCard) {
        newErrors.cardNumber = '16-digit Card Number is required';
      } else if (cleanCard.length < 15) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
      }

      if (!cardForm.expiry.trim()) {
        newErrors.expiry = 'Expiry is required';
      } else if (!/^\d{2}\/\d{2}$/.test(cardForm.expiry)) {
        newErrors.expiry = 'Use MM/YY format';
      }

      if (!cardForm.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else if (cardForm.cvv.length < 3) {
        newErrors.cvv = '3-4 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Order Placement & Payment Flow
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderError('');

    if (items.length === 0) {
      alert('Your cart is empty. Please add garments before checking out.');
      navigate('/shop');
      return;
    }

    if (!validateForm()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    // 1. Determine Payment Simulation Outcome & Latency
    if (paymentMethod === 'cod') {
      setProcessingStatus('Placing your order...');
    } else if (paymentMethod === 'upi') {
      setProcessingStatus('Verifying UPI payment...');
    } else if (paymentMethod === 'card') {
      setProcessingStatus('Processing card payment...');
    }

    // Realistic delay for payment gateway interaction
    const simulatedDelay = paymentMethod === 'cod' ? 600 : 1200;
    await new Promise((resolve) => setTimeout(resolve, simulatedDelay));

    // 2. Evaluate simulated failure state
    if (paymentMethod === 'upi' && upiOutcome === 'failure') {
      setSubmitting(false);
      setProcessingStatus('');
      setOrderError(
        'UPI Payment Failed (Demo): The payment was not completed. No amount was charged. Please try again or select Cash on Delivery.'
      );
      if (user?.uid) {
        createNotification({
          userId: user.uid,
          type: NOTIFICATION_TYPES.PAYMENT_FAILED,
          title: 'UPI Payment Simulation Failed',
          message: 'Simulated UPI bank authorization timed out or was rejected. No funds were debited.'
        }).catch(() => {});
      }
      window.scrollTo({ top: 50, behavior: 'smooth' });
      return;
    }

    if (paymentMethod === 'card' && cardOutcome === 'failure') {
      setSubmitting(false);
      setProcessingStatus('');
      setOrderError(
        'Card Payment Declined (Demo): The card was not authorized. No amount was charged. Please try again or choose Cash on Delivery.'
      );
      if (user?.uid) {
        createNotification({
          userId: user.uid,
          type: NOTIFICATION_TYPES.PAYMENT_FAILED,
          title: 'Card Authorization Declined',
          message: 'Simulated card authorization declined by issuing bank. No funds were debited.'
        }).catch(() => {});
      }
      window.scrollTo({ top: 50, behavior: 'smooth' });
      return;
    }

    // 3. Prepare Safe Order Payload
    try {
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const orderId = `FF-2026-${randomSuffix}`;
      const nowIso = new Date().toISOString();

      let safePaymentMethod = 'Cash on Delivery';
      let safePaymentStatus = 'Pending';
      let safePaymentReference = 'COD-DOORSTEP';

      if (paymentMethod === 'cod') {
        safePaymentMethod = 'Cash on Delivery';
        safePaymentStatus = 'Pending';
        safePaymentReference = `COD-VERIFY-${Math.floor(10000 + Math.random() * 90000)}`;
      } else if (paymentMethod === 'upi') {
        safePaymentMethod = 'UPI (Demo)';
        safePaymentStatus = 'Paid';
        safePaymentReference = `UPI-SIM-${Math.floor(100000 + Math.random() * 900000)}`;
      } else if (paymentMethod === 'card') {
        const last4 = cardForm.cardNumber.replace(/\s/g, '').slice(-4) || '4242';
        safePaymentMethod = 'Credit / Debit Card (Demo)';
        safePaymentStatus = 'Paid';
        safePaymentReference = `CARD-SIM-${last4}`;
      }

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
        paymentMethod: safePaymentMethod,
        paymentStatus: safePaymentStatus,
        paymentReference: safePaymentReference,
        items: [
          ...items,
          ...(freePerfume ? [{
            id: `promo-fragrance-${freePerfume.id || 'free'}`,
            productId: freePerfume.id || 'promo-perfume',
            productName: `Free Perfume Gift: ${freePerfume.name}`,
            isPromotionalFree: true,
            isPerfumeGift: true,
            quantity: 1,
            normalPrice: freePerfume.originalPrice || 499,
            promotionalDiscount: freePerfume.originalPrice || 499,
            itemPrice: 0,
            totalItemPrice: 0,
            size: 'Standard 50ml Bottle',
            fit: 'N/A',
            promotionReason: 'Free Perfume (Order subtotal >= ₹3,999)',
            perfumeNotes: freePerfume.notes || freePerfume.description || 'Promotional fragrance'
          }] : [])
        ],
        freePerfume: freePerfume ? {
          id: freePerfume.id,
          name: freePerfume.name,
          normalPrice: freePerfume.originalPrice || 499,
          promotionalDiscount: freePerfume.originalPrice || 499,
          finalPrice: 0,
          reason: 'Free Perfume (Cart >= ₹3,999)'
        } : null,
        subtotal: Number(subtotal) || 0,
        delivery: Number(delivery) || 0,
        discount: Number(discount) || 0,
        couponCode: appliedCoupon?.code || null,
        coupon: appliedCoupon?.code || null,
        total: Number(total) || 0,
        pricing: {
          subtotal: Number(subtotal) || 0,
          delivery: Number(delivery) || 0,
          discount: Number(discount) || 0,
          offerDiscount: Number(offerDiscount) || 0,
          cashbackRedeemed: Number(redeemedCashback) || 0,
          total: Number(total) || 0
        },
        appliedOffer: appliedOffer ? {
          id: appliedOffer.id,
          code: appliedOffer.code,
          name: appliedOffer.name,
          discountType: appliedOffer.discountType,
          discountValue: appliedOffer.discountValue,
          discountAmount: Number(offerDiscount) || 0
        } : null,
        cashbackRedeemed: Number(redeemedCashback) || 0,
        cashbackToEarn: Number(potentialCashback) || 0,
        status: 'Order Confirmed',
        orderStatus: 'Order Confirmed',
        tailoringStatus: 'Processing'
      };

      // 4. Persist to Cloud Firestore (Safe metadata only, no card numbers)
      if (user?.uid) {
        try {
          await createFirestoreOrder(newOrder, user.uid);
        } catch (firestoreErr) {
          console.warn('[CheckoutPage] Firestore order creation warning:', firestoreErr);
        }
      }

      // Phase 16: Handle wallet cashback transactions
      if (user?.uid) {
        try {
          if (redeemedCashback > 0) {
            await redeemCashback({
              userId: user.uid,
              orderId: newOrder.id,
              amount: redeemedCashback
            });
          }
          if (potentialCashback > 0) {
            await recordPendingCashback({
              userId: user.uid,
              orderId: newOrder.id,
              cashbackAmount: potentialCashback,
              description: `Cashback for Order #${newOrder.id} (Unlocks on delivery)`
            });
          }
          await refreshCashbackWallet(user.uid);
        } catch (walletErr) {
          console.warn('[CheckoutPage] Cashback processing warning:', walletErr);
        }
      }

      // 5. Persist to local cache for offline resilience
      try {
        const existingOrdersRaw = localStorage.getItem('fitfusion_orders');
        const existingOrders = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
        const updatedOrders = [newOrder, ...existingOrders];
        localStorage.setItem('fitfusion_orders', JSON.stringify(updatedOrders));
      } catch (storageErr) {
        console.warn('[CheckoutPage] LocalStorage save warning:', storageErr);
      }

      // 5b. Phase 10 In-App Notifications (Customer & Admin)
      if (user?.uid) {
        // Customer Order Confirmation Notification
        createNotification({
          userId: user.uid,
          type: NOTIFICATION_TYPES.ORDER_CREATED,
          title: 'Order Confirmed',
          message: `Your order ${orderId} has been placed successfully.`,
          orderId: orderId,
          metadata: { total: Number(total) || 0, itemsCount: items.length }
        }).catch((err) => console.warn('[CheckoutPage] Order notification warning:', err));

        // Customer Payment Notification
        if (safePaymentStatus === 'Paid') {
          createNotification({
            userId: user.uid,
            type: NOTIFICATION_TYPES.PAYMENT_SUCCESS,
            title: 'Payment Successful',
            message: `Payment of ₹${Number(total || 0).toLocaleString('en-IN')} for order ${orderId} via ${safePaymentMethod} was verified successfully.`,
            orderId: orderId,
            metadata: { paymentMethod: safePaymentMethod, paymentReference: safePaymentReference }
          }).catch((err) => console.warn('[CheckoutPage] Payment notification warning:', err));
        } else {
          createNotification({
            userId: user.uid,
            type: NOTIFICATION_TYPES.PAYMENT_PENDING,
            title: 'Payment Pending (COD)',
            message: `Cash on Delivery confirmed for order ${orderId}. Total ₹${Number(total || 0).toLocaleString('en-IN')} will be collected upon delivery.`,
            orderId: orderId,
            metadata: { paymentMethod: safePaymentMethod, paymentReference: safePaymentReference }
          }).catch((err) => console.warn('[CheckoutPage] Payment pending notification warning:', err));
        }
      }

      // Admin Order Alert
      createNotification({
        userId: 'admin',
        type: NOTIFICATION_TYPES.ORDER_CREATED,
        title: 'New Order Received',
        message: `Order ${orderId} placed by ${formData.fullName.trim()} (₹${Number(total || 0).toLocaleString('en-IN')}) via ${safePaymentMethod}.`,
        orderId: orderId,
        metadata: { customerName: formData.fullName.trim(), total: Number(total) || 0 }
      }).catch((err) => console.warn('[CheckoutPage] Admin alert warning:', err));

      // 6. Clear shopping cart & transition to confirmation plaque
      clearCart();
      setPlacedOrder(newOrder);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to create order:', err);
      setOrderError('Unable to place your order. Please try again.');
    } finally {
      setSubmitting(false);
      setProcessingStatus('');
    }
  };

  // Handle Printable Receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  // =========================================================================
  // VIEW: ORDER CONFIRMATION
  // =========================================================================
  if (placedOrder) {
    const isPaid = placedOrder.paymentStatus === 'Paid';

    return (
      <div className="py-10 sm:py-16 bg-neutral-50/70 min-h-screen">
        <PageContainer maxWidth="md">
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-12 shadow-sm space-y-8 animate-fadeIn">
            {/* Top Success Header */}
            <div className="text-center space-y-3">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl ${
                isPaid
                  ? 'bg-emerald-50 border-2 border-emerald-500/30 text-emerald-600'
                  : 'bg-amber-50 border-2 border-amber-500/30 text-amber-600'
              }`}>
                ✓
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Order Confirmed
                </span>
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  isPaid
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  Payment: {placedOrder.paymentStatus}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
                Thank You for Your Order!
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
                {isPaid
                  ? 'Your payment was successful. Your customized garment is being prepared.'
                  : 'Your order is confirmed. Payment will be collected in cash upon delivery.'}
              </p>
            </div>

            {/* Order Reference */}
            <div className="p-5 rounded-2xl bg-brand-dark text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent block">
                  Order Reference
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-white">
                  #{placedOrder.id}
                </span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  Placed on {placedOrder.formattedDate || placedOrder.date}
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                  Payment Reference
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-neutral-800 px-2.5 py-1 rounded-md inline-block mt-0.5 border border-neutral-700">
                  {placedOrder.paymentReference || 'N/A'}
                </span>
              </div>
            </div>

            {/* Customer & Delivery Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                <span className="font-bold text-neutral-400 uppercase tracking-wider text-[10px] block">
                  Customer Details
                </span>
                <div className="font-bold text-brand-dark text-sm">{placedOrder.customer.fullName}</div>
                <div className="text-neutral-600">{placedOrder.customer.email}</div>
                <div className="text-neutral-600">+91 {placedOrder.customer.phone}</div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                <span className="font-bold text-neutral-400 uppercase tracking-wider text-[10px] block">
                  Delivery Address
                </span>
                <div className="text-neutral-800 font-medium leading-relaxed">
                  {placedOrder.deliveryAddress.address}
                </div>
                <div className="text-neutral-900 font-bold">
                  {[placedOrder.deliveryAddress.city, placedOrder.deliveryAddress.state].filter(Boolean).join(', ')} - {placedOrder.deliveryAddress.pincode}
                </div>
                <div className="pt-1 text-[11px] text-neutral-500">
                  <strong>Mode:</strong> {placedOrder.paymentMethod}
                </div>
              </div>
            </div>

            {/* Order Items List */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                Ordered Items ({placedOrder.items.length})
              </h3>

              <div className="space-y-3">
                {placedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-neutral-200 bg-white flex flex-col sm:flex-row items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-14 h-16 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 relative">
                        <ProductImage
                          src={item.productImage || item.image}
                          alt={item.productName}
                          category={item.category}
                          tintColor={item.selectedColor?.hex || item.color?.hex}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-brand-dark">
                          {item.productName} &times; {item.quantity}
                        </div>
                        <div className="text-neutral-600">
                          {item.selectedFabric?.name || item.fabric?.name} &bull; {item.selectedColor?.name || item.color?.name} &bull; Size {item.size} ({item.fit} Fit)
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Style: {item.collar} Collar &bull; {item.cuff} Cuff &bull; {item.buttons} Buttons
                          {item.monogram ? ` • Monogram: "${item.monogram.text || item.monogram}"` : ''}
                        </div>
                        {item.selectedPerfume && (
                          <div className="text-[11px] text-brand-accent font-semibold flex items-center gap-1">
                            <span>✨</span> Fragrance: {item.selectedPerfume.name} (+₹{item.selectedPerfume.price || item.perfumePrice || 0})
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:text-right font-black text-sm text-brand-dark shrink-0">
                      ₹{Number(item.totalItemPrice || item.itemPrice || 0) * (item.quantity || 1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Accounting Breakdown */}
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
                  <span>Discount {placedOrder.couponCode ? `(${placedOrder.couponCode})` : ''}:</span>
                  <span>-₹{placedOrder.discount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline font-black text-base text-brand-dark">
                <span>Total {isPaid ? 'Paid' : 'Payable on Delivery'}:</span>
                <span className="text-xl text-brand-accent">₹{placedOrder.total}</span>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
              <span className="text-xl">📍</span>
              <div>
                <span className="font-bold text-sm block">What Happens Next?</span>
                <p className="mt-0.5 text-amber-900 leading-relaxed">
                  Your order is confirmed. You can track the status of your order from the My Orders page.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-neutral-100">
              <Button
                to={`/orders/${placedOrder.id || placedOrder.orderId}`}
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto shadow-md font-bold"
              >
                Track Order &rarr;
              </Button>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="px-4 py-2.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold shadow-xs transition-colors"
              >
                🖨️ Print Receipt
              </button>
              <Button to="/orders" variant="outline" size="lg" className="w-full sm:w-auto">
                My Orders
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

  // =========================================================================
  // VIEW: EMPTY CART CHECKOUT GUARD
  // =========================================================================
  if (items.length === 0) {
    return (
      <div className="py-12 sm:py-20 bg-neutral-50/50 min-h-[75vh] flex items-center">
        <PageContainer maxWidth="md">
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-12 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl text-amber-700">
              🛍️
            </div>
            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-brand-dark">Checkout Cart is Empty</h2>
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

  // =========================================================================
  // VIEW: CHECKOUT FORM & PAYMENT SELECTION
  // =========================================================================
  return (
    <div className="py-8 sm:py-12 bg-neutral-50/50 min-h-screen">
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
            Checkout
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
            Complete Your Order
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600">
            Enter your delivery details, select a payment method, and place your order.
          </p>
        </div>

        {/* Global Error Banner */}
        {orderError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{orderError}</span>
            </div>
            <button
              type="button"
              onClick={() => setOrderError('')}
              className="text-xs text-rose-600 hover:text-rose-900 font-bold ml-2"
            >
              &times;
            </button>
          </div>
        )}

        {/* Checkout Main Form */}
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Customer Particulars, Delivery & Payment */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Customer Information Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4">
              <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">
                    Step 1
                  </span>
                  <h2 className="text-base font-bold text-brand-dark">Your Information</h2>
                </div>
                <span className="text-[11px] text-neutral-400">Contact Details</span>
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
                    helperText="Used for courier delivery alerts"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4">
              <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">
                    Step 2
                  </span>
                  <h2 className="text-base font-bold text-brand-dark">Delivery Address</h2>
                </div>
                <span className="text-[11px] text-neutral-400">All India Delivery</span>
              </div>

              {/* Saved Address Quick Selector (Phase 13) */}
              {savedAddresses.length > 0 && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Saved Addresses:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-brand-dark text-white border-brand-dark shadow-xs'
                              : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                          }`}
                        >
                          <span>{addr.label === 'Work' ? '🏢' : addr.label === 'Other' ? '📍' : '🏡'}</span>
                          <span>{addr.label || 'Home'}</span>
                          {addr.isDefault && <span className="text-[10px] opacity-80">(Default)</span>}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={handleSelectNewAddress}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        selectedAddressId === 'new'
                          ? 'bg-brand-dark text-white border-brand-dark shadow-xs'
                          : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      + New Address
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Street / House / Apartment Address"
                  id="address"
                  name="address"
                  type="text"
                  placeholder="e.g. 42 MG Road, 4th Floor, Jubilee Hills"
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
                    placeholder="Hyderabad"
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
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:border-brand-accent bg-white text-neutral-800"
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
                    placeholder="500033"
                    value={formData.pincode}
                    onChange={handleChange}
                    error={errors.pincode}
                    required
                  />
                </div>

                {user && (
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-neutral-600 pt-1">
                    <input
                      type="checkbox"
                      checked={saveAddressToAccount}
                      onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                      className="rounded border-neutral-300 text-brand-dark focus:ring-brand-accent"
                    />
                    <span>Save this address to my account for future orders</span>
                  </label>
                )}
              </div>
            </div>

            {/* 3. Payment Method Selector Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">
                    Step 3
                  </span>
                  <h2 className="text-base font-bold text-brand-dark">Payment Method</h2>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Demo Mode
                </span>
              </div>

              {/* Payment Methods Accordion Options */}
              <div className="space-y-3">
                {/* OPTION 1: Cash on Delivery */}
                <div
                  className={`rounded-xl border transition-all overflow-hidden ${
                    paymentMethod === 'cod'
                      ? 'border-brand-accent ring-2 ring-brand-accent/20 bg-white'
                      : 'border-neutral-200 bg-neutral-50/50 hover:bg-white'
                  }`}
                >
                  <label className="p-4 flex items-center justify-between cursor-pointer select-none">
                    <div className="flex items-center gap-3.5">
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
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Pay cash or UPI on doorstep arrival after verifying your tailored garment.
                        </p>
                      </div>
                    </div>
                    <span className="text-xl">💵</span>
                  </label>

                  {paymentMethod === 'cod' && (
                    <div className="p-4 bg-amber-50/50 border-t border-amber-100 text-xs text-amber-950 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <span>✓</span>
                        <span>No advance payment needed today.</span>
                      </div>
                      <p className="text-[11px] text-amber-900 leading-relaxed">
                        Your order will be placed with <strong>Payment Status: Pending</strong>. You will pay <strong>₹{total}</strong> in cash upon delivery.
                      </p>
                    </div>
                  )}
                </div>

                {/* OPTION 2: UPI (GPay / PhonePe / Paytm / BHIM) */}
                <div
                  className={`rounded-xl border transition-all overflow-hidden ${
                    paymentMethod === 'upi'
                      ? 'border-brand-accent ring-2 ring-brand-accent/20 bg-white'
                      : 'border-neutral-200 bg-neutral-50/50 hover:bg-white'
                  }`}
                >
                  <label className="p-4 flex items-center justify-between cursor-pointer select-none">
                    <div className="flex items-center gap-3.5">
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
                          <span>UPI Instant Transfer</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            GPay / PhonePe / Paytm
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Direct instant payment simulation via UPI Virtual Payment Address (VPA) or QR code.
                        </p>
                      </div>
                    </div>
                    <span className="text-xl">📱</span>
                  </label>

                  {paymentMethod === 'upi' && (
                    <div className="p-4 bg-neutral-50 border-t border-neutral-200 space-y-4">
                      {/* Sub-tabs: UPI ID vs QR */}
                      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
                        <button
                          type="button"
                          onClick={() => setUpiTab('id')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            upiTab === 'id'
                              ? 'bg-brand-dark text-white'
                              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                          }`}
                        >
                          Enter UPI ID / VPA
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiTab('qr')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            upiTab === 'qr'
                              ? 'bg-brand-dark text-white'
                              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                          }`}
                        >
                          Scan Dynamic QR
                        </button>
                      </div>

                      {upiTab === 'id' ? (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                            Virtual Payment Address (VPA)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. yourname@oksbi"
                            value={upiId}
                            onChange={(e) => {
                              setUpiId(e.target.value);
                              if (errors.upiId) setErrors((prev) => ({ ...prev, upiId: '' }));
                            }}
                            className="w-full px-3.5 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-brand-accent focus:border-brand-accent bg-white font-mono"
                          />
                          {errors.upiId && (
                            <p className="text-[11px] text-red-600 font-semibold">{errors.upiId}</p>
                          )}
                          <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                            <span className="text-neutral-500">Quick suffixes:</span>
                            {['@oksbi', '@okhdfcbank', '@paytm', '@ybl'].map((suf) => (
                              <button
                                key={suf}
                                type="button"
                                onClick={() => setUpiId((prev) => (prev.split('@')[0] || 'client') + suf)}
                                className="px-2 py-0.5 rounded bg-white border border-neutral-300 hover:border-brand-accent font-mono text-neutral-700"
                              >
                                {suf}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-white rounded-xl border border-neutral-200 text-center space-y-3">
                          <div className="w-36 h-36 mx-auto bg-neutral-900 rounded-xl p-2.5 flex flex-col items-center justify-center text-white relative shadow-sm">
                            <div className="w-full h-full border-2 border-dashed border-amber-400 rounded-lg flex flex-col items-center justify-center p-2 text-center">
                              <span className="text-2xl">📱</span>
                              <span className="text-[9px] font-mono text-amber-300 mt-1">UPI://FITFUSION</span>
                              <span className="text-[11px] font-black text-white">₹{total}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-neutral-500">
                            Scan with Google Pay, PhonePe, Paytm, or BHIM.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setQrScanned(true);
                              setUpiId('scan.verified@upi');
                            }}
                            className="text-xs font-bold text-brand-accent hover:underline"
                          >
                            {qrScanned ? '✓ QR Verified (Ready to Pay)' : '⚡ Simulate App Scan'}
                          </button>
                        </div>
                      )}

                      {/* Demo Outcome Selector */}
                      <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-xs">
                        <span className="text-neutral-600 font-semibold">Demo Simulation Mode:</span>
                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name="upiOutcome"
                              value="success"
                              checked={upiOutcome === 'success'}
                              onChange={() => setUpiOutcome('success')}
                              className="accent-emerald-600"
                            />
                            <span className="text-emerald-700 font-bold text-[11px]">Authorize (Success)</span>
                          </label>
                          <label className="inline-flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name="upiOutcome"
                              value="failure"
                              checked={upiOutcome === 'failure'}
                              onChange={() => setUpiOutcome('failure')}
                              className="accent-rose-600"
                            />
                            <span className="text-rose-700 font-bold text-[11px]">Simulate Timeout (Fail)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* OPTION 3: Credit / Debit Card */}
                <div
                  className={`rounded-xl border transition-all overflow-hidden ${
                    paymentMethod === 'card'
                      ? 'border-brand-accent ring-2 ring-brand-accent/20 bg-white'
                      : 'border-neutral-200 bg-neutral-50/50 hover:bg-white'
                  }`}
                >
                  <label className="p-4 flex items-center justify-between cursor-pointer select-none">
                    <div className="flex items-center gap-3.5">
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
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                            Visa / Mastercard / RuPay
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Simulated 3D-Secure card payment (Zero financial storage).
                        </p>
                      </div>
                    </div>
                    <span className="text-xl">💳</span>
                  </label>

                  {paymentMethod === 'card' && (
                    <div className="p-4 bg-neutral-50 border-t border-neutral-200 space-y-3.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-neutral-700">Card Credentials (Demo)</span>
                        <button
                          type="button"
                          onClick={handleFillTestCard}
                          className="text-[11px] font-bold text-brand-accent hover:underline"
                        >
                          Fill Safe Test Card &rarr;
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1">
                          Name on Card
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Alexander Wright"
                          value={cardForm.cardholderName}
                          onChange={(e) => {
                            setCardForm({ ...cardForm, cardholderName: e.target.value });
                            if (errors.cardholderName) setErrors((prev) => ({ ...prev, cardholderName: '' }));
                          }}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-brand-accent bg-white"
                        />
                        {errors.cardholderName && (
                          <p className="text-[11px] text-red-600 mt-1">{errors.cardholderName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1">
                          16-Digit Card Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="4242 •••• •••• 4242"
                            value={cardForm.cardNumber}
                            onChange={handleCardNumberChange}
                            maxLength={19}
                            className="w-full pl-3.5 pr-12 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-brand-accent bg-white font-mono"
                          />
                          <span className="absolute right-3 top-2 text-sm">💳</span>
                        </div>
                        {errors.cardNumber && (
                          <p className="text-[11px] text-red-600 mt-1">{errors.cardNumber}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-neutral-600 mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardForm.expiry}
                            onChange={handleExpiryChange}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-brand-accent bg-white font-mono text-center"
                          />
                          {errors.expiry && (
                            <p className="text-[11px] text-red-600 mt-1">{errors.expiry}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-600 mb-1">
                            CVV / CVC
                          </label>
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength={4}
                            value={cardForm.cvv}
                            onChange={handleCvvChange}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-hidden focus:ring-1 focus:ring-brand-accent bg-white font-mono text-center"
                          />
                          {errors.cvv && (
                            <p className="text-[11px] text-red-600 mt-1">{errors.cvv}</p>
                          )}
                        </div>
                      </div>

                      {/* Demo Outcome Selector */}
                      <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-xs">
                        <span className="text-neutral-600 font-semibold">Demo Simulation Mode:</span>
                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name="cardOutcome"
                              value="success"
                              checked={cardOutcome === 'success'}
                              onChange={() => setCardOutcome('success')}
                              className="accent-emerald-600"
                            />
                            <span className="text-emerald-700 font-bold text-[11px]">Authorize (Success)</span>
                          </label>
                          <label className="inline-flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name="cardOutcome"
                              value="failure"
                              checked={cardOutcome === 'failure'}
                              onChange={() => setCardOutcome('failure')}
                              className="accent-rose-600"
                            />
                            <span className="text-rose-700 font-bold text-[11px]">Decline (Simulated)</span>
                          </label>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-[10px] text-emerald-900 leading-relaxed">
                        🛡️ <strong>Zero Storage Guarantee:</strong> Card number, CVV, and expiry are used only for educational in-memory format validation. They are strictly NEVER stored in Firestore or browser storage.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Submit */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">
                    Summary
                  </span>
                  <h3 className="text-base font-extrabold text-brand-dark">
                    Order Summary ({items.reduce((s, i) => s + (i.quantity || 1), 0)} items)
                  </h3>
                </div>
                <Link to="/cart" className="text-xs font-bold text-brand-accent hover:underline">
                  Edit Cart
                </Link>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item, idx) => {
                  const fabricName = item.selectedFabric?.name || item.fabric?.name || 'Selected Fabric';
                  const colorName = item.selectedColor?.name || item.color?.name || 'Custom';
                  const itemUnitPrice = Number(item.totalItemPrice || item.itemPrice || item.basePrice || 0);
                  const itemQty = Number(item.quantity) || 1;

                  return (
                    <div
                      key={item.id || idx}
                      className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-200 flex items-start gap-3 text-xs"
                    >
                      <div className="w-12 h-14 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 relative">
                        <ProductImage
                          src={item.productImage || item.image}
                          alt={item.productName}
                          category={item.category}
                          tintColor={item.selectedColor?.hex || item.color?.hex}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-brand-dark truncate">{item.productName}</div>
                        <div className="text-[11px] text-neutral-500">
                          Qty: <strong>{itemQty}</strong> &bull; Size {item.size} ({item.fit} Fit)
                        </div>
                        <div className="text-[10px] text-neutral-500 truncate">
                          {fabricName} &bull; {colorName}
                        </div>
                        {item.selectedPerfume && (
                          <div className="text-[10px] text-brand-accent font-medium truncate">
                            ✨ {item.selectedPerfume.name} (+₹{item.selectedPerfume.price || item.perfumePrice || 0})
                          </div>
                        )}
                      </div>

                      <div className="font-extrabold text-brand-dark text-right shrink-0">
                        ₹{(itemUnitPrice * itemQty).toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })}

                {freePerfume && (
                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3 text-xs">
                    <div className="w-12 h-14 rounded-lg bg-emerald-600 text-white border border-emerald-700 shrink-0 flex items-center justify-center text-xl shadow-sm">
                      🎁
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-neutral-900 truncate">Fragrance Gift: {freePerfume.name}</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">FREE</span>
                      </div>
                      <div className="text-[11px] text-neutral-600 mt-0.5">
                        Qty: <strong>1</strong> &bull; Complimentary 50ml Tier Gift
                      </div>
                      <div className="text-[10px] text-emerald-700 font-medium">
                        Standard Price: <span className="line-through text-neutral-400">₹{freePerfume.originalPrice || 499}</span> &bull; 100% Promo Discount
                      </div>
                    </div>
                    <div className="font-extrabold text-emerald-700 text-right shrink-0">
                      ₹0
                    </div>
                  </div>
                )}
              </div>

              {/* Cashback Wallet Redemption Widget */}
              {cashbackWallet.available > 0 && (
                <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 text-xs space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-950 flex items-center gap-1.5">
                      <span>💰</span>
                      <span>Cashback Wallet</span>
                    </span>
                    <span className="font-black text-purple-800">
                      ₹{cashbackWallet.available.toLocaleString('en-IN')} available
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-purple-100">
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-purple-900">
                      <input
                        type="checkbox"
                        checked={redeemedCashback > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            const maxRedeem = Math.min(
                              cashbackWallet.available,
                              Math.max(0, subtotal - offerDiscount - discount + delivery)
                            );
                            setRedeemedCashback(maxRedeem);
                          } else {
                            setRedeemedCashback(0);
                          }
                        }}
                        className="rounded border-purple-300 text-purple-700 focus:ring-purple-700 w-4 h-4"
                      />
                      <span>Redeem cashback on this order</span>
                    </label>
                    {redeemedCashback > 0 && (
                      <span className="text-xs font-black text-emerald-700">
                        -₹{redeemedCashback.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Price Calculations */}
              <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-neutral-800">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-neutral-600">
                  <span>Delivery:</span>
                  <span className="font-semibold text-neutral-800">
                    {delivery === 0 ? 'FREE' : `₹${delivery}`}
                  </span>
                </div>

{freePerfume && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <span>🎁 Fragrance Promotion:</span>
                      <span className="text-[10px] font-normal text-neutral-500">({freePerfume.name})</span>
                    </span>
                    <span>FREE (-₹{freePerfume.originalPrice || 499})</span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount {appliedCoupon?.code ? `(${appliedCoupon.code})` : ''}:</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-brand-dark text-sm">Total Amount:</span>
                    <p className="text-[10px] text-neutral-400">All charges included</p>
                  </div>
                  <span className="text-2xl font-black text-brand-accent">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>

                {potentialCashback > 0 && (
                  <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-[11px] font-semibold flex justify-between items-center mt-2 shadow-2xs">
                    <span className="flex items-center gap-1">
                      <span>✨</span>
                      <span>Cashback on Delivery:</span>
                    </span>
                    <span className="font-black text-purple-700">+₹{potentialCashback.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
                className="w-full text-base font-bold shadow-md bg-brand-dark hover:bg-neutral-800 disabled:opacity-50"
              >
                {submitting
                  ? (processingStatus || 'Placing Order...')
                  : `Place Order ₹${total.toLocaleString('en-IN')} →`}
              </Button>

              <div className="text-center pt-1">
                <Link to="/cart" className="text-xs text-neutral-500 hover:text-brand-dark underline">
                  &larr; Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </form>
      </PageContainer>
    </div>
  );
}
