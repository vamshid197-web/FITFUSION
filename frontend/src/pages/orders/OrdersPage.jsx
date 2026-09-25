import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('fitfusion_orders') || '[]');
      if (Array.isArray(savedOrders)) {
        setOrders(savedOrders);
        if (savedOrders.length > 0) {
          setExpandedOrderId(savedOrders[0].orderId);
        }
      }
    } catch (err) {
      console.error('Failed to parse fitfusion_orders from localStorage:', err);
    }
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-neutral-50/50 min-h-screen">
      <PageContainer maxWidth="lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              FITFUSION BESPOKE
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight mt-1">
              My Bespoke Orders
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Review your customized garments, bespoke tailoring specifications, and order statuses.
            </p>
          </div>
          <Button to="/shop" variant="secondary" size="sm">
            + Start New Customization
          </Button>
        </div>

        {/* Orders List or Empty State */}
        {orders.length === 0 ? (
          <div className="mt-8 bg-white rounded-2xl border border-neutral-200 p-10 sm:p-16 text-center shadow-sm space-y-5 max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-accentLight border border-brand-accent/20 flex items-center justify-center text-brand-accent">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-brand-dark">No Orders Placed Yet</h2>
              <p className="text-sm text-neutral-500">
                You haven't commissioned any bespoke garments yet. Discover fabrics, customize designs, and pair luxury perfumes.
              </p>
            </div>
            <div className="pt-3">
              <Button to="/shop" variant="primary" size="md">
                Explore Bespoke Collection &rarr;
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.orderId;
              const itemCount = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;

              return (
                <div
                  key={order.orderId}
                  className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden transition-all duration-200 hover:border-neutral-300"
                >
                  {/* Order Card Header Summary */}
                  <div
                    onClick={() => toggleExpand(order.orderId)}
                    className="p-5 sm:p-6 cursor-pointer select-none bg-white hover:bg-neutral-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100"
                  >
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Order ID
                        </span>
                        <span className="text-base font-extrabold text-brand-dark font-mono">
                          {order.orderId}
                        </span>
                      </div>
                      <div className="hidden sm:block h-7 w-px bg-neutral-200" />
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Placed On
                        </span>
                        <span className="text-xs font-semibold text-neutral-700">
                          {formatDate(order.date)}
                        </span>
                      </div>
                      <div className="hidden sm:block h-7 w-px bg-neutral-200" />
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Items
                        </span>
                        <span className="text-xs font-semibold text-neutral-700">
                          {itemCount} {itemCount === 1 ? 'Garment' : 'Garments'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4">
                      <div className="text-right">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Total
                        </span>
                        <span className="text-lg font-extrabold text-brand-dark">
                          ₹{order.pricing?.total?.toLocaleString('en-IN') || 0}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {order.status || 'Order Confirmed'}
                        </span>

                        <button
                          type="button"
                          aria-label="Toggle order details"
                          className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-brand-dark hover:border-neutral-300 transition-colors"
                        >
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 bg-neutral-50/40 space-y-6">
                      {/* Customer & Delivery Information */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-white p-4 rounded-xl border border-neutral-200">
                        <div>
                          <span className="font-bold uppercase tracking-wider text-neutral-400 block mb-1 text-[10px]">
                            Delivery Address
                          </span>
                          <p className="font-semibold text-brand-dark">{order.customer?.fullName}</p>
                          <p className="text-neutral-600 mt-0.5">{order.shippingAddress?.address}</p>
                          <p className="text-neutral-600">
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                          </p>
                        </div>

                        <div>
                          <span className="font-bold uppercase tracking-wider text-neutral-400 block mb-1 text-[10px]">
                            Contact & Updates
                          </span>
                          <p className="text-neutral-700 font-medium">{order.customer?.email}</p>
                          <p className="text-neutral-700 font-medium mt-0.5">+91 {order.customer?.phone}</p>
                        </div>

                        <div>
                          <span className="font-bold uppercase tracking-wider text-neutral-400 block mb-1 text-[10px]">
                            Payment Method
                          </span>
                          <span className="inline-flex items-center gap-1.5 font-bold text-brand-dark capitalize">
                            {order.paymentMethod === 'cod' && 'Cash on Delivery (Verified Demo)'}
                            {order.paymentMethod === 'upi' && 'Instant UPI / QR (Frontend Demo)'}
                            {order.paymentMethod === 'card' && 'Credit / Debit Card (Frontend Demo)'}
                          </span>
                          <span className="block text-[11px] text-neutral-500 mt-1">
                            Status: <strong className="text-emerald-600">Confirmed</strong> (College Demo)
                          </span>
                        </div>
                      </div>

                      {/* Tailoring Milestone Tracker */}
                      <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
                          <span className="uppercase tracking-wider text-[10px] text-neutral-400">
                            Tailoring Lifecycle
                          </span>
                          <span className="text-brand-accent">Bespoke Crafting Active</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2 text-center text-[11px] pt-1">
                          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 font-bold text-emerald-800">
                            1. Order Confirmed
                          </div>
                          <div className="p-2 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-600 font-medium">
                            2. Fabric Cutting
                          </div>
                          <div className="p-2 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-600 font-medium">
                            3. Artisan Stitching
                          </div>
                          <div className="p-2 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-600 font-medium">
                            4. Master QA Check
                          </div>
                          <div className="p-2 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-600 font-medium">
                            5. Dispatched
                          </div>
                        </div>
                      </div>

                      {/* Garment Items List */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Ordered Bespoke Garments ({order.items?.length || 0})
                        </h3>

                        {order.items?.map((item, idx) => (
                          <div
                            key={item.cartItemId || idx}
                            className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 flex flex-col md:flex-row gap-4 justify-between"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-20 h-24 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {item.productImage ? (
                                  <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xl">👔</span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <span className="text-[11px] font-bold text-brand-accent uppercase tracking-wider">
                                  {item.category || 'Custom Apparel'}
                                </span>
                                <h4 className="text-base font-bold text-brand-dark">
                                  {item.productName}
                                </h4>
                                <div className="text-xs text-neutral-600 space-y-0.5 pt-1">
                                  <p>
                                    <strong>Fabric:</strong> {item.fabric?.name || 'Standard'} &bull;{' '}
                                    <strong>Color:</strong> {item.color?.name || 'Custom'}
                                  </p>
                                  <p>
                                    <strong>Style:</strong> {item.design?.collar || 'Standard'} Collar,{' '}
                                    {item.design?.cuff || 'Standard'} Cuff,{' '}
                                    {item.design?.buttons || 'Standard'} Buttons
                                  </p>
                                  <p>
                                    <strong>Fit:</strong> {item.fit || 'Regular'} &bull;{' '}
                                    <strong>Size:</strong> {item.size || 'Custom'}
                                    {item.monogram?.text && (
                                      <span> &bull; <strong>Monogram:</strong> "{item.monogram.text}" ({item.monogram.placement})</span>
                                    )}
                                  </p>
                                  {item.perfume && (
                                    <p className="text-brand-accent font-semibold flex items-center gap-1 mt-1">
                                      <span>🌸</span> Recommended Pairing: {item.perfume.name} (+₹{item.perfume.price || 0})
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-neutral-100">
                              <span className="text-xs text-neutral-500">
                                Qty: <strong className="text-neutral-800">{item.quantity}</strong> &times; ₹{item.totalItemPrice?.toLocaleString('en-IN')}
                              </span>
                              <span className="text-base font-extrabold text-brand-dark mt-1">
                                ₹{((item.totalItemPrice || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="bg-white rounded-xl border border-neutral-200 p-4 max-w-xs ml-auto text-xs space-y-2">
                        <div className="flex justify-between text-neutral-600">
                          <span>Subtotal:</span>
                          <span className="font-semibold">₹{order.pricing?.subtotal?.toLocaleString('en-IN') || 0}</span>
                        </div>
                        {order.pricing?.discount > 0 && (
                          <div className="flex justify-between text-emerald-600 font-semibold">
                            <span>Coupon Discount:</span>
                            <span>-₹{order.pricing.discount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-neutral-600">
                          <span>Tailored Delivery:</span>
                          <span className="font-semibold">
                            {order.pricing?.delivery === 0 ? 'FREE' : `₹${order.pricing?.delivery}`}
                          </span>
                        </div>
                        <div className="border-t border-neutral-200 pt-2 flex justify-between text-sm font-extrabold text-brand-dark">
                          <span>Total Paid:</span>
                          <span className="text-brand-accent">₹{order.pricing?.total?.toLocaleString('en-IN') || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
