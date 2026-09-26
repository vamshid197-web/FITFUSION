import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getUserNotifications,
  subscribeToUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  formatNotificationTime,
  NOTIFICATION_TYPES
} from '../../services/notificationService.js';

export default function NotificationsPage() {
  const { user, userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Unread' | 'Orders' | 'Payments'
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  // Subscribe to notifications with real-time updates and cleanup
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUserNotifications(
      user.uid,
      (updatedList) => {
        setNotifications(updatedList || []);
        setLoading(false);
        setRefreshing(false);
      },
      isAdmin
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user?.uid, isAdmin]);

  // Clear transient feedback alert after 4s
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleManualRefresh = async () => {
    if (!user?.uid) return;
    setRefreshing(true);
    try {
      const res = await getUserNotifications(user.uid, isAdmin);
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (err) {
      console.warn('Manual refresh warning:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (notifId, e) => {
    if (e) e.stopPropagation();
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
      await markNotificationAsRead(notifId);
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.uid) return;
    const unreadCount = notifications.filter((n) => !n.read).length;
    if (unreadCount === 0) return;

    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await markAllNotificationsAsRead(user.uid, notifications);
      setFeedback({
        type: 'success',
        message: `Marked ${unreadCount} notification${unreadCount > 1 ? 's' : ''} as read.`
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Could not mark all notifications as read. Please try again.'
      });
    }
  };

  // Filtered list
  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'Unread') return !notif.read;
    if (activeFilter === 'Orders') {
      return (
        notif.orderId ||
        notif.type === NOTIFICATION_TYPES.ORDER_CREATED ||
        notif.type === NOTIFICATION_TYPES.ORDER_STATUS_UPDATED ||
        notif.type === NOTIFICATION_TYPES.TAILORING_STATUS_UPDATED ||
        notif.type === NOTIFICATION_TYPES.ORDER_DISPATCHED ||
        notif.type === NOTIFICATION_TYPES.ORDER_DELIVERED
      );
    }
    if (activeFilter === 'Payments') {
      return (
        notif.type === NOTIFICATION_TYPES.PAYMENT_SUCCESS ||
        notif.type === NOTIFICATION_TYPES.PAYMENT_FAILED ||
        notif.type === NOTIFICATION_TYPES.PAYMENT_PENDING
      );
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Icon selector based on notification category
  const renderIcon = (type, read) => {
    switch (type) {
      case NOTIFICATION_TYPES.ORDER_CREATED:
        return (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            read ? 'bg-neutral-100 text-neutral-600' : 'bg-brand-accent/15 text-brand-accent'
          }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        );
      case NOTIFICATION_TYPES.PAYMENT_SUCCESS:
        return (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            read ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-100 text-emerald-700'
          }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case NOTIFICATION_TYPES.PAYMENT_FAILED:
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case NOTIFICATION_TYPES.PAYMENT_PENDING:
        return (
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-100 text-amber-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case NOTIFICATION_TYPES.ORDER_DISPATCHED:
      case NOTIFICATION_TYPES.ORDER_DELIVERED:
        return (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            read ? 'bg-sky-50 text-sky-600' : 'bg-sky-100 text-sky-700'
          }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
        );
      case NOTIFICATION_TYPES.ORDER_STATUS_UPDATED:
      case NOTIFICATION_TYPES.TAILORING_STATUS_UPDATED:
      default:
        return (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            read ? 'bg-neutral-100 text-neutral-600' : 'bg-amber-100 text-amber-800'
          }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879a3 3 0 11-4.242-4.242L10.5 8.5" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="py-8 bg-brand-cream/40 min-h-screen">
      <PageContainer>
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-brand-dark tracking-tight">
                Notifications & Atelier Updates
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-accent text-white shadow-sm">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Live updates for your bespoke commissions, tailoring milestones, and payment confirmations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm text-xs font-semibold flex items-center gap-1.5"
              title="Refresh notifications"
              aria-label="Refresh notifications"
            >
              <svg
                className={`w-4 h-4 ${refreshing ? 'animate-spin text-brand-accent' : ''}`}
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
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Mark All as Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Transient Feedback Banner */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-xl border text-sm flex items-center justify-between animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs font-bold hover:underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-200 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {['All', 'Unread', 'Orders', 'Payments'].map((filter) => {
            const count =
              filter === 'All'
                ? notifications.length
                : filter === 'Unread'
                ? unreadCount
                : filter === 'Orders'
                ? notifications.filter((n) => n.orderId || n.type?.includes('ORDER')).length
                : notifications.filter((n) => n.type?.includes('PAYMENT')).length;

            const isActive = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-brand-dark text-white shadow-sm'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <span>{filter}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-sm">
            <div className="w-10 h-10 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-sm font-semibold text-neutral-800">Loading notifications...</div>
            <p className="text-xs text-neutral-500 mt-1">Retrieving latest tailoring and order dispatches</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-sm">
            <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h3 className="text-base font-serif font-bold text-neutral-800">
              {activeFilter === 'Unread'
                ? 'All caught up!'
                : activeFilter === 'All'
                ? 'No notifications yet'
                : `No ${activeFilter.toLowerCase()} notifications`}
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              {activeFilter === 'Unread'
                ? 'You have reviewed all your atelier updates and order status changes.'
                : 'As you commission bespoke garments, fabric allocation and tailoring updates will be logged here.'}
            </p>
            {activeFilter !== 'All' && (
              <button
                type="button"
                onClick={() => setActiveFilter('All')}
                className="mt-4 text-xs font-bold text-brand-accent hover:underline"
              >
                View all notifications
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const isUnread = !notif.read;

              return (
                <div
                  key={notif.id}
                  className={`rounded-xl border p-4 sm:p-5 transition-all relative overflow-hidden ${
                    isUnread
                      ? 'bg-amber-500/[0.04] border-amber-300/80 shadow-sm'
                      : 'bg-white border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {/* Visual Unread Left Accent Bar */}
                  {isUnread && (
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-brand-accent" />
                  )}

                  <div className="flex items-start gap-3 sm:gap-4 pl-1">
                    {/* Category Icon */}
                    {renderIcon(notif.type, notif.read)}

                    {/* Notification Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-semibold tracking-tight ${
                              isUnread ? 'text-neutral-900 font-bold' : 'text-neutral-700'
                            }`}
                          >
                            {notif.title}
                          </h4>
                          {isUnread && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-accent text-white">
                              New
                            </span>
                          )}
                        </div>

                        {/* Timestamp */}
                        <span className="text-[11px] text-neutral-400 font-medium">
                          {formatNotificationTime(notif.createdAt)}
                        </span>
                      </div>

                      {/* Message Content */}
                      <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Footer Actions: Related Order Deep-link & Mark Read */}
                      <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
                        {notif.orderId ? (
                          <Link
                            to={`/orders/${notif.orderId}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-accent hover:text-amber-800 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>View Order #{notif.orderId} & Track Tailoring</span>
                          </Link>
                        ) : (
                          <div />
                        )}

                        <div className="flex items-center gap-2 ml-auto">
                          {isUnread ? (
                            <button
                              type="button"
                              onClick={(e) => handleMarkAsRead(notif.id, e)}
                              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100"
                              title="Mark as read"
                            >
                              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Mark as read</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                              <svg className="w-3 h-3 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
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
