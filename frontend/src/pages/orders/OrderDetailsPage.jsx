import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getOrderById,
  subscribeToOrder,
  ORDER_TRACKING_STAGES,
  TAILORING_LIFECYCLE_MAPPING
} from '../../services/firestoreService.js';
import ProductImage from '../../components/common/ProductImage.jsx';

// Progress percentage mapping for visual bar
const STAGE_PROGRESS = {
  'Order Confirmed': 16,
  'Fabric Cutting': 35,
  'Artisan Stitching': 58,
  'Master QA Check': 78,
  'Dispatched': 92,
  'Delivered': 100,
  'Cancelled': 0
};

// Friendly step descriptions for customers
const STAGE_CUSTOMER_NOTES = {
  'Order Confirmed': 'Your order has been received and verified. Fabrics are allocated and preparations have started.',
  'Fabric Cutting': 'Your fabric has been carefully measured and cut according to your selected fit.',
  'Artisan Stitching': 'Your clothing is currently being assembled and tailored with care.',
  'Master QA Check': 'Final inspection of measurements, seams, monogram, and structural quality.',
  'Dispatched': 'Hand-pressed, packaged, and dispatched with courier for delivery.',
  'Delivered': 'Garment delivered to your registered shipping address. Fitting guarantee activated.'
};

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Fetch order data
  const fetchOrder = async (isManualRefresh = false) => {
    if (!orderId) return;

    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMessage('');
    setIsUnauthorized(false);

    try {
      const res = await getOrderById(orderId, user?.uid);

      if (res.success && res.order) {
        const fetchedOrder = res.order;

        // Security check: Customer can only view their own order unless Admin
        const isAdmin = userProfile?.role === 'admin';
        const orderOwnerId = fetchedOrder.userId;

        if (orderOwnerId && user?.uid && orderOwnerId !== user.uid && !isAdmin) {
          setIsUnauthorized(true);
          setOrder(null);
        } else {
          setOrder(fetchedOrder);
        }
      } else {
        setErrorMessage('Unable to locate this order. It may have been archived or entered incorrectly.');
        setOrder(null);
      }
    } catch (err) {
      console.warn('[OrderDetailsPage] Error loading order:', err);
      setErrorMessage('Unable to load your order details right now. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Attach real-time listener for live tailoring status updates
    const unsubscribe = subscribeToOrder(
      orderId,
      (liveOrder) => {
        if (liveOrder) {
          const isAdmin = userProfile?.role === 'admin';
          if (!liveOrder.userId || liveOrder.userId === user?.uid || isAdmin) {
            setOrder(liveOrder);
          }
        }
      },
      (err) => {
        console.warn('[OrderDetailsPage] Realtime sync error:', err);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [orderId, user, userProfile]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Determine stage progress
  const currentStatus = order?.orderStatus || order?.status || 'Order Confirmed';
  const isCancelled = currentStatus === 'Cancelled';
  const currentStageIndex = ORDER_TRACKING_STAGES.indexOf(currentStatus);
  const progressPercent = isCancelled ? 0 : (STAGE_PROGRESS[currentStatus] || 16);

  // Delivery status notice
  const getDeliveryEstimateText = () => {
    if (isCancelled) return 'Production cancelled & shipment voided.';
    if (currentStatus === 'Delivered') return 'Package delivered successfully.';
    if (currentStatus === 'Dispatched') return 'Dispatched via Express Courier • In transit to your address.';
    return 'Delivery estimate will be available once your order is dispatched.';
  };

  return (
    <div className="py-8 sm:py-12 bg-neutral-50/60 min-h-screen">
      <PageContainer maxWidth="lg">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500 mb-6 pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Link to="/home" className="hover:text-brand-dark transition-colors">Home</Link>
            <span>/</span>
            <Link to="/orders" className="hover:text-brand-dark transition-colors">Orders</Link>
            <span>/</span>
            <span className="text-brand-dark font-mono font-bold">
              {orderId || 'Order Details'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchOrder(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
              title="Refresh order status from Cloud Firestore"
            >
              <svg
                className={`w-3.5 h-3.5 text-neutral-500 ${refreshing ? 'animate-spin text-brand-accent' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{refreshing ? 'Refreshing...' : 'Refresh Status'}</span>
            </button>

            <Button to="/orders" variant="outline" size="sm">
              &larr; Back to My Orders
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 bg-white rounded-2xl border border-neutral-200 shadow-sm text-center max-w-md mx-auto p-8 space-y-4">
            <div className="w-10 h-10 mx-auto border-3 border-brand-accent border-t-transparent rounded-full animate-spin" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-brand-dark">Loading your order details...</h2>
              <p className="text-xs text-neutral-500">
                Retrieving tailoring specifications and tracking metrics from Cloud Firestore
              </p>
            </div>
          </div>
        ) : isUnauthorized ? (
          /* Unauthorized Order State */
          <div className="py-16 bg-white rounded-2xl border border-red-200 shadow-sm text-center max-w-md mx-auto p-8 space-y-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 text-2xl">
              🔒
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-brand-dark">Access Restricted</h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                You do not have permission to view this order. Please sign in with the account that placed it.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Button to="/orders" variant="primary" size="md">
                View My Orders
              </Button>
              <Button to="/shop" variant="outline" size="md">
                Explore Shop
              </Button>
            </div>
          </div>
        ) : errorMessage || !order ? (
          /* Error / Order Not Found State */
          <div className="py-16 bg-white rounded-2xl border border-neutral-200 shadow-sm text-center max-w-md mx-auto p-8 space-y-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 text-2xl">
              📦
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-brand-dark">Order Not Found</h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {errorMessage || 'We could not find an order matching this reference ID.'}
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Button to="/orders" variant="primary" size="md">
                Return to Orders
              </Button>
              <Button to="/shop" variant="outline" size="md">
                Start New Garment
              </Button>
            </div>
          </div>
        ) : (
          /* Main Order Tracking & Details Content */
          <div className="space-y-8">
            {/* 1. HERO TRACKING STATUS CARD */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                      Custom Tailored Order
                    </span>
                    <span className="text-xs text-neutral-400">•</span>
                    <span className="text-xs text-neutral-500">
                      Placed on {formatDate(order.createdAt || order.date)}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight flex items-center gap-3">
                    <span>Order #{order.orderId || order.id}</span>
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Badge */}
                  {isCancelled ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Order Cancelled
                    </span>
                  ) : currentStatus === 'Delivered' ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Delivered & Fitted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      {currentStatus}
                    </span>
                  )}

                  {/* Payment Badge */}
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                    {order.paymentMethod || 'Cash on Delivery'} ({order.paymentStatus || 'Confirmed'})
                  </span>
                </div>
              </div>

              {/* Progress Bar (Overall) */}
              {!isCancelled && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-neutral-500 uppercase tracking-wider">
                      Tailoring Progression: {currentStatus}
                    </span>
                    <span className="text-brand-accent font-extrabold font-mono">
                      {progressPercent}% Complete
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/80">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-brand-accent to-emerald-500 transition-all duration-700 ease-out rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Cancelled Banner */}
              {isCancelled && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <div className="font-bold text-sm">This order has been cancelled</div>
                    <p className="mt-0.5 text-rose-700">
                      Production was cancelled. If this cancellation was made in error or you require assistance, please contact FitFusion customer support.
                    </p>
                  </div>
                </div>
              )}

              {/* Visual Lifecycle Timeline */}
              {!isCancelled && (
                <div className="pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-5">
                    Tailoring & Delivery Timeline
                  </h3>

                  {/* Desktop Horizontal Stepper */}
                  <div className="hidden lg:grid grid-cols-6 gap-2 relative">
                    {ORDER_TRACKING_STAGES.map((stageName, index) => {
                      const isCompleted = currentStageIndex > index;
                      const isCurrent = currentStageIndex === index;
                      const isUpcoming = currentStageIndex < index;

                      return (
                        <div key={stageName} className="flex flex-col items-center text-center relative group">
                          {/* Step Connector Line */}
                          {index < ORDER_TRACKING_STAGES.length - 1 && (
                            <div
                              className={`absolute top-4 left-1/2 w-full h-0.5 z-0 ${
                                currentStageIndex > index
                                  ? 'bg-emerald-500'
                                  : 'bg-neutral-200'
                              }`}
                            />
                          )}

                          {/* Node Icon */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold relative z-10 transition-all duration-200 ${
                              isCompleted
                                ? 'bg-emerald-500 text-white shadow-sm ring-4 ring-emerald-50'
                                : isCurrent
                                ? 'bg-brand-accent text-white shadow-md ring-4 ring-brand-accent/20 animate-pulse'
                                : 'bg-white border-2 border-neutral-300 text-neutral-400'
                            }`}
                          >
                            {isCompleted ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : isCurrent ? (
                              <span className="w-2.5 h-2.5 rounded-full bg-white" />
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>

                          {/* Step Labels */}
                          <div className="mt-3 space-y-0.5 px-1">
                            <span
                              className={`text-xs font-bold block leading-tight ${
                                isCurrent
                                  ? 'text-brand-accent'
                                  : isCompleted
                                  ? 'text-neutral-800'
                                  : 'text-neutral-400'
                              }`}
                            >
                              {stageName}
                            </span>
                            <span className="text-[10px] text-neutral-500 block">
                              {isCurrent ? 'Current Stage' : isCompleted ? 'Completed' : 'Upcoming'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile / Tablet Vertical Timeline */}
                  <div className="lg:hidden space-y-4 relative pl-3">
                    {/* Vertical Connecting Line */}
                    <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-neutral-200" />

                    {ORDER_TRACKING_STAGES.map((stageName, index) => {
                      const isCompleted = currentStageIndex > index;
                      const isCurrent = currentStageIndex === index;
                      const isUpcoming = currentStageIndex < index;

                      return (
                        <div key={stageName} className="flex items-start gap-4 relative z-10">
                          {/* Node Icon */}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                              isCompleted
                                ? 'bg-emerald-500 text-white ring-4 ring-emerald-50'
                                : isCurrent
                                ? 'bg-brand-accent text-white ring-4 ring-brand-accent/20 animate-pulse'
                                : 'bg-white border-2 border-neutral-300 text-neutral-400'
                            }`}
                          >
                            {isCompleted ? (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : isCurrent ? (
                              <span className="w-2 h-2 rounded-full bg-white" />
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>

                          {/* Text Card */}
                          <div
                            className={`flex-1 p-3 rounded-xl border transition-all ${
                              isCurrent
                                ? 'bg-amber-50/60 border-amber-200 text-brand-dark shadow-xs'
                                : isCompleted
                                ? 'bg-white border-neutral-200 text-neutral-800'
                                : 'bg-neutral-50/50 border-neutral-200/70 text-neutral-400'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold">{stageName}</span>
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                  isCurrent
                                    ? 'bg-brand-accent text-white'
                                    : isCompleted
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-neutral-100 text-neutral-500'
                                }`}
                              >
                                {isCurrent ? 'Active Now' : isCompleted ? 'Finished' : 'Pending'}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-600 mt-1">
                              {STAGE_CUSTOMER_NOTES[stageName]}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery Estimation Box */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🚚</span>
                  <div>
                    <span className="font-bold text-neutral-800 block">Delivery Estimate</span>
                    <span className="text-neutral-600">{getDeliveryEstimateText()}</span>
                  </div>
                </div>
                <div className="text-neutral-500 text-[11px] sm:text-right">
                  <strong>Latest Update:</strong> {formatDate(order.updatedAt || order.createdAt || order.date)}
                </div>
              </div>
            </div>

            {/* 2. ORDER DETAILS & SPECIFICATIONS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Customized Apparel Garments */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent block">
                        Order Items
                      </span>
                      <h2 className="text-lg font-bold text-brand-dark">
                        Ordered Clothing ({order.items?.length || 0})
                      </h2>
                    </div>
                    <span className="text-xs text-neutral-500">
                      Custom tailored to your specifications
                    </span>
                  </div>

                  {/* Garment Cards */}
                  <div className="space-y-5">
                    {order.items?.map((item, idx) => {
                      const fabricName =
                        item.selectedFabric?.name ||
                        item.fabric?.name ||
                        (typeof item.fabric === 'string' ? item.fabric : 'Certified Premium Textile');
                      const fabricComp =
                        item.selectedFabric?.composition || item.fabric?.composition || '100% Quality Fabric';
                      const colorName =
                        item.selectedColor?.name ||
                        item.color?.name ||
                        (typeof item.color === 'string' ? item.color : 'Classic');
                      const colorHex = item.selectedColor?.hex || item.color?.hex || '#1F2937';

                      const collarStyle = item.collar || item.design?.collar || item.designOptions?.collar || 'Standard';
                      const cuffStyle = item.cuff || item.design?.cuff || item.designOptions?.cuff || 'Standard';
                      const buttonsStyle = item.buttons || item.design?.buttons || item.designOptions?.buttons || 'Standard';
                      const monogram = item.monogram?.text || (typeof item.monogram === 'string' ? item.monogram : null);

                      const perfumeItem = item.selectedPerfume || item.perfume;
                      const itemUnitPrice = Number(item.totalItemPrice || item.itemPrice || item.basePrice || 0);
                      const itemQuantity = Number(item.quantity) || 1;
                      const garmentSubtotal = itemUnitPrice * itemQuantity;

                      return (
                        <div
                          key={item.cartItemId || idx}
                          className="bg-neutral-50/60 rounded-xl border border-neutral-200 p-5 space-y-4 transition-all hover:border-neutral-300"
                        >
                          {/* Garment Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex items-start gap-3.5">
                              {/* Garment Silhouette / Image */}
                              <div className="w-16 h-20 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 relative shadow-2xs">
                                <ProductImage
                                  src={item.productImage || item.image}
                                  alt={item.productName}
                                  category={item.category}
                                  tintColor={colorHex}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent bg-brand-accentLight/60 px-2 py-0.5 rounded">
                                  {item.category || 'Tailored Apparel'}
                                </span>
                                <h3 className="text-base font-extrabold text-brand-dark mt-1">
                                  {item.productName || 'Custom Clothing'}
                                </h3>
                                <div className="text-xs text-neutral-500 mt-0.5">
                                  Qty: <strong className="text-neutral-800">{itemQuantity}</strong> &times; ₹{itemUnitPrice.toLocaleString('en-IN')}
                                </div>
                              </div>
                            </div>

                            <div className="text-right sm:text-right">
                              <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                                Garment Total
                              </span>
                              <span className="text-lg font-black text-brand-dark">
                                ₹{garmentSubtotal.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* Bespoke Specification Details Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-neutral-200/70 text-xs">
                            {/* Fabric & Color */}
                            <div className="p-3 bg-white rounded-lg border border-neutral-200/80 space-y-1">
                              <span className="font-bold text-neutral-400 text-[10px] uppercase tracking-wider block">
                                Fabric & Shade
                              </span>
                              <div className="font-bold text-brand-dark flex items-center gap-2">
                                <span>{fabricName}</span>
                              </div>
                              <div className="text-neutral-500 text-[11px]">{fabricComp}</div>
                              <div className="flex items-center gap-1.5 pt-1">
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-neutral-300"
                                  style={{ backgroundColor: colorHex }}
                                />
                                <span className="font-medium text-neutral-700">{colorName}</span>
                              </div>
                            </div>

                            {/* Architectural Design & Monogram */}
                            <div className="p-3 bg-white rounded-lg border border-neutral-200/80 space-y-1">
                              <span className="font-bold text-neutral-400 text-[10px] uppercase tracking-wider block">
                                Styling Architecture
                              </span>
                              <div className="text-neutral-700">
                                <strong>Collar:</strong> {collarStyle}
                              </div>
                              <div className="text-neutral-700">
                                <strong>Cuff:</strong> {cuffStyle} • <strong>Buttons:</strong> {buttonsStyle}
                              </div>
                              {monogram && (
                                <div className="pt-1 text-brand-accent font-bold text-[11px] flex items-center gap-1">
                                  <span>✍️ Monogram:</span>
                                  <span className="font-mono bg-brand-accentLight px-1.5 py-0.5 rounded border border-brand-accent/20">
                                    "{monogram}"
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Fit & Measurements */}
                            <div className="p-3 bg-white rounded-lg border border-neutral-200/80 space-y-1 sm:col-span-2">
                              <span className="font-bold text-neutral-400 text-[10px] uppercase tracking-wider block">
                                Sizing & Precision Tailoring
                              </span>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-neutral-700">
                                <div>
                                  <strong>Size:</strong> {item.size || 'Custom Tailored'}
                                </div>
                                <div>
                                  <strong>Fit Silhouette:</strong> {item.fit || 'Regular'} Fit
                                </div>
                                <div>
                                  <strong>Unit:</strong> {item.measurementUnit || 'inches'}
                                </div>
                              </div>

                              {item.customMeasurements && Object.keys(item.customMeasurements).length > 0 && (
                                <div className="mt-2 pt-2 border-t border-neutral-100">
                                  <span className="text-[10px] font-bold uppercase text-neutral-400 block mb-1">
                                    Client Body Measurements:
                                  </span>
                                  <div className="flex flex-wrap gap-2 text-[11px]">
                                    {Object.entries(item.customMeasurements)
                                      .filter(([_, val]) => val)
                                      .map(([metric, val]) => (
                                        <span
                                          key={metric}
                                          className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded font-mono border border-neutral-200"
                                        >
                                          {metric}: <strong>{val} {item.measurementUnit || 'in'}</strong>
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Fragrance Pairing */}
                            {perfumeItem && (
                              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/80 sm:col-span-2 space-y-1">
                                <span className="font-bold text-amber-900 text-[10px] uppercase tracking-wider block flex items-center gap-1">
                                  <span>✨</span> Paired Luxury Fragrance
                                </span>
                                <div className="flex items-center justify-between">
                                  <div className="font-bold text-brand-dark">
                                    {perfumeItem.name || 'FitFusion Bespoke Scent'}
                                  </div>
                                  <div className="text-brand-accent font-extrabold text-xs">
                                    +₹{Number(perfumeItem.price || item.perfumePrice || 0).toLocaleString('en-IN')}
                                  </div>
                                </div>
                                {perfumeItem.notes && (
                                  <div className="text-[11px] text-amber-800/80">
                                    Notes: {perfumeItem.notes}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Customer, Delivery, & Pricing Breakdown */}
              <div className="lg:col-span-4 space-y-6">
                {/* Customer Information Card */}
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Client Information
                  </h3>
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-brand-dark text-sm">
                      {order.customer?.fullName || order.customer?.name || userProfile?.name || 'Customer'}
                    </div>
                    <div className="text-neutral-600 flex items-center gap-1.5">
                      <span>✉️</span>
                      <span>{order.customer?.email || user?.email || 'N/A'}</span>
                    </div>
                    <div className="text-neutral-600 flex items-center gap-1.5">
                      <span>📞</span>
                      <span>+91 {order.customer?.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address Card */}
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Delivery Destination
                  </h3>
                  <div className="space-y-1 text-xs text-neutral-700">
                    <div className="font-bold text-brand-dark">
                      {order.customer?.fullName || 'Registered Shipping Address'}
                    </div>
                    <p className="leading-relaxed">
                      {order.deliveryAddress?.address || order.shippingAddress?.address || 'Standard Delivery Address'}
                    </p>
                    <p className="font-medium text-neutral-800">
                      {[
                        order.deliveryAddress?.city || order.shippingAddress?.city,
                        order.deliveryAddress?.state || order.shippingAddress?.state,
                        order.deliveryAddress?.pincode || order.shippingAddress?.pincode
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>

                {/* Pricing & Billing Card */}
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Payment & Invoice Summary
                  </h3>

                  <div className="space-y-2.5 text-xs text-neutral-600">
                    <div className="flex justify-between">
                      <span>Garments Subtotal:</span>
                      <span className="font-semibold text-neutral-800">
                        ₹{(order.pricing?.subtotal ?? order.subtotal ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {(order.pricing?.discount || order.discount) > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>
                          Discount {order.couponCode || order.coupon ? `(${order.couponCode || order.coupon})` : ''}:
                        </span>
                        <span>
                          -₹{(order.pricing?.discount ?? order.discount ?? 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Delivery:</span>
                      <span className="font-semibold text-neutral-800">
                        {(order.pricing?.delivery ?? order.delivery ?? 0) === 0
                          ? 'FREE'
                          : `₹${order.pricing?.delivery ?? order.delivery}`}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-brand-dark">Final Amount Paid:</span>
                      <span className="text-xl font-black text-brand-accent">
                        ₹{(order.pricing?.total ?? order.total ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 text-xs space-y-2">
                    <div className="flex justify-between items-center text-neutral-600">
                      <span>Payment Method:</span>
                      <strong className="text-neutral-800">{order.paymentMethod || 'Cash on Delivery'}</strong>
                    </div>

                    <div className="flex justify-between items-center text-neutral-600">
                      <span>Payment Status:</span>
                      {order.paymentStatus === 'Paid' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✓ Paid
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          ⏳ Pending
                        </span>
                      )}
                    </div>

                    {order.paymentReference && (
                      <div className="flex justify-between items-center text-neutral-600">
                        <span>Transaction Ref:</span>
                        <span className="font-mono text-[11px] text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                          {order.paymentReference}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="w-full py-1.5 px-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <span>🖨️</span>
                        <span>Print Official Invoice</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-neutral-400 leading-tight pt-1">
                      🛡️ Safe Educational Demo: No financial credentials or card data are stored in cloud records.
                    </p>
                  </div>
                </div>

                {/* Support Card */}
                <div className="p-4 rounded-xl bg-neutral-100/80 border border-neutral-200 text-xs space-y-2 text-neutral-600">
                  <div className="font-bold text-neutral-800 flex items-center gap-1.5">
                    <span>💬</span> Need Assistance?
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Have questions regarding your order status or delivery schedule? Our customer support team is here to help.
                  </p>
                  <Button to="/orders" variant="outline" size="sm" className="w-full mt-1">
                    View Other Orders
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
